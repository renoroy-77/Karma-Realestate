<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\LeadStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\LeadResource;
use App\Models\Lead;
use App\Models\LeadActivity;
use App\Models\LeadNote;
use App\Models\LeadPropertyView;
use App\Models\SiteVisitRequest;
use App\Models\Wishlist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class LeadController extends Controller
{
    /**
     * List all CRM leads with filter by pipeline status, source, or search.
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'status' => ['nullable', Rule::enum(LeadStatus::class)],
            'source' => 'nullable|string|max:50',
            'search' => 'nullable|string|max:100',
            'property_id' => 'nullable|integer|exists:properties,id',
            'created_from' => 'nullable|date',
            'created_to' => 'nullable|date|after_or_equal:created_from',
            'sort_by' => 'nullable|in:newest,oldest,name_asc,name_desc,most_viewed',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $leads = Lead::query()
            ->withCount('propertyViews')
            ->filtered($filters)
            ->paginate($filters['per_page'] ?? 15);

        return response()->json([
            'success' => true,
            'data' => LeadResource::collection($leads),
            'meta' => [
                'current_page' => $leads->currentPage(),
                'last_page' => $leads->lastPage(),
                'per_page' => $leads->perPage(),
                'total' => $leads->total(),
                // dashboard counters / status tabs
                'status_counts' => Lead::query()
                    ->selectRaw('status, count(*) as total')
                    ->groupBy('status')
                    ->pluck('total', 'status'),
            ],
        ]);
    }

    /**
     * Show single lead details with timeline, notes, visits, and views.
     */
    public function show(int $id): JsonResponse
    {
        $lead = Lead::with([
            'activities.adminUser',
            'notes.adminUser',
            'propertyViews.property',
            'siteVisits.property',
            'wishlistProperties.coverPhoto',
            'wishlistProperties.media',
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => new LeadResource($lead),
        ]);
    }

    /**
     * Update lead pipeline status and record activity history atomically.
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::enum(LeadStatus::class)],
        ]);

        return DB::transaction(function () use ($validated, $request, $id) {
            $lead = Lead::lockForUpdate()->findOrFail($id);
            $previousStatus = $lead->status->value;
            $newStatus = $validated['status'];

            if ($previousStatus !== $newStatus) {
                $lead->update(['status' => $newStatus]);

                LeadActivity::create([
                    'lead_id' => $lead->id,
                    'admin_user_id' => $request->user()?->id,
                    'type' => 'status_change',
                    'from' => $previousStatus,
                    'to' => $newStatus,
                    'description' => "Status changed from {$previousStatus} to {$newStatus}",
                    'created_at' => now(),
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => "Lead stage changed to '{$newStatus}'.",
                'status' => $newStatus,
            ]);
        });
    }

    /**
     * Add a follow-up note to a lead.
     */
    public function addNote(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'note' => 'required|string|max:5000',
        ]);

        $lead = Lead::findOrFail($id);

        $note = LeadNote::create([
            'lead_id' => $lead->id,
            'admin_user_id' => $request->user()?->id,
            'note' => $request->input('note'),
        ]);

        LeadActivity::create([
            'lead_id' => $lead->id,
            'admin_user_id' => $request->user()?->id,
            'type' => 'note_added',
            'description' => 'Follow-up note: '.Str::limit($note->note, 100),
            'created_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Note added successfully.',
            'data' => [
                'id' => $note->id,
                'note' => $note->note,
                'author' => $request->user() ? $request->user()->name : 'Admin',
                'created_at' => $note->created_at?->toISOString(),
            ],
        ], 201);
    }

    /**
     * Merge two duplicate lead records into one with comprehensive FK reassignment,
     * status hierarchy resolution, and audit trail preservation.
     * Deletes duplicate BEFORE populating primary to eliminate unique index collision.
     */
    public function merge(Request $request): JsonResponse
    {
        $request->validate([
            'primary_lead_id' => 'required|integer|exists:leads,id',
            'duplicate_lead_id' => 'required|integer|exists:leads,id|different:primary_lead_id',
        ]);

        return DB::transaction(function () use ($request) {
            $primary = Lead::lockForUpdate()->findOrFail($request->primary_lead_id);
            $duplicate = Lead::lockForUpdate()->findOrFail($request->duplicate_lead_id);

            // 1. Capture fields and determine status resolution before duplicate is deleted
            $dupFields = $duplicate->only(['phone', 'locality', 'email', 'source']);
            $priStatus = $primary->status;
            $dupStatus = $duplicate->status;

            $targetStatus = ($dupStatus->priority() > $priStatus->priority()) ? $dupStatus : $priStatus;

            // 2. Move child foreign keys to primary lead
            LeadNote::where('lead_id', $duplicate->id)->update(['lead_id' => $primary->id]);
            SiteVisitRequest::where('lead_id', $duplicate->id)->update(['lead_id' => $primary->id]);
            LeadActivity::where('lead_id', $duplicate->id)->update(['lead_id' => $primary->id]);

            // Wishlists (merge unique)
            $dupWishlists = Wishlist::where('lead_id', $duplicate->id)->get();
            foreach ($dupWishlists as $wl) {
                Wishlist::firstOrCreate([
                    'lead_id' => $primary->id,
                    'property_id' => $wl->property_id,
                ]);
            }
            Wishlist::where('lead_id', $duplicate->id)->delete();

            // Property views (merge view counts and latest timestamp)
            $dupViews = LeadPropertyView::where('lead_id', $duplicate->id)->get();
            foreach ($dupViews as $v) {
                $existing = LeadPropertyView::where('lead_id', $primary->id)
                    ->where('property_id', $v->property_id)
                    ->first();

                if ($existing) {
                    $existing->increment('view_count', $v->view_count);
                    if ($v->last_viewed_at > $existing->last_viewed_at) {
                        $existing->update(['last_viewed_at' => $v->last_viewed_at]);
                    }
                } else {
                    $v->update(['lead_id' => $primary->id]);
                }
            }
            LeadPropertyView::where('lead_id', $duplicate->id)->delete();

            // 3. Record merge redirection in lead_merges table so X-Lead-Token / old references remain valid
            DB::table('lead_merges')->insert([
                'duplicate_lead_id' => $duplicate->id,
                'primary_lead_id' => $primary->id,
                'created_at' => now(),
            ]);

            // 4. Audit trail on primary lead
            LeadNote::create([
                'lead_id' => $primary->id,
                'admin_user_id' => $request->user()?->id,
                'note' => "System: Merged from lead #{$duplicate->id} ({$duplicate->name}, email: {$duplicate->email}, phone: ".($duplicate->phone ?? 'N/A').').',
            ]);

            LeadActivity::create([
                'lead_id' => $primary->id,
                'admin_user_id' => $request->user()?->id,
                'type' => 'merged',
                'from' => $priStatus->value,
                'to' => $targetStatus->value,
                'description' => "Merged duplicate lead #{$duplicate->id} ({$duplicate->name}) into this record.",
                'created_at' => now(),
            ]);

            // 5. Delete duplicate FIRST to avoid unique index collisions on phone or email
            $duplicate->delete();

            // 6. Fill primary with non-empty fields from duplicate
            foreach ($dupFields as $field => $value) {
                if (empty($primary->{$field}) && ! empty($value)) {
                    $primary->{$field} = $value;
                }
            }
            $primary->status = $targetStatus;
            $primary->save();

            $primary->load([
                'activities.adminUser',
                'notes.adminUser',
                'propertyViews.property',
                'siteVisits.property',
                'wishlistProperties.coverPhoto',
                'wishlistProperties.media',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Leads merged successfully.',
                'data' => new LeadResource($primary),
            ]);
        });
    }
}
