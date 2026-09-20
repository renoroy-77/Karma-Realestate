<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\PropertyDetailResource;
use App\Http\Resources\PropertyListResource;
use App\Models\LeadPropertyView;
use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class PropertyController extends Controller
{
    /**
     * Browse and filter published properties with pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->input('per_page', 12);
        $perPage = max(1, min($perPage, 50));

        $query = Property::query()
            ->published()
            ->with(['coverPhoto', 'media'])
            ->filtered($request->all());

        $properties = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => PropertyListResource::collection($properties),
            'meta' => [
                'current_page' => $properties->currentPage(),
                'last_page' => $properties->lastPage(),
                'per_page' => $properties->perPage(),
                'total' => $properties->total(),
            ],
        ]);
    }

    /**
     * Show single property details (masked or unlocked depending on lead token).
     */
    public function show(Request $request, string $slug): JsonResponse
    {
        $property = Property::where('slug', $slug)
            ->orWhere('id', is_numeric($slug) ? (int) $slug : 0)
            ->published()
            ->with(['media', 'coverPhoto'])
            ->firstOrFail();

        // 1. IP Debounced view count increment
        $ip = $request->ip() ?: '127.0.0.1';
        $cacheKey = "property_view_{$property->id}_{$ip}";
        if (! Cache::has($cacheKey)) {
            $property->increment('view_count');
            Cache::put($cacheKey, true, now()->addHours(24));
        }

        // 2. Track lead property view if verified lead is present
        $verifiedLead = $request->attributes->get('verified_lead');
        if ($verifiedLead) {
            $leadView = LeadPropertyView::where('lead_id', $verifiedLead->id)
                ->where('property_id', $property->id)
                ->first();

            if ($leadView) {
                $leadView->increment('view_count');
                $leadView->update(['last_viewed_at' => now()]);
            } else {
                LeadPropertyView::create([
                    'lead_id' => $verifiedLead->id,
                    'property_id' => $property->id,
                    'view_count' => 1,
                    'first_viewed_at' => now(),
                    'last_viewed_at' => now(),
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'data' => new PropertyDetailResource($property),
        ]);
    }

    /**
     * Map Pins & Clustering endpoint for "Search This Area" & Google Maps.
     */
    public function mapPins(Request $request): JsonResponse
    {
        $query = Property::query()
            ->published()
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->with(['coverPhoto', 'media'])
            ->filtered($request->all());

        $properties = $query->limit(100)->get();

        $pins = [];
        foreach ($properties as $p) {
            $cover = $p->coverPhoto ?? $p->media->firstWhere('media_type', 'photo');

            $pins[] = [
                'id' => $p->id,
                'title' => $p->title,
                'slug' => $p->slug,
                'price' => (float) $p->price,
                'price_formatted' => '₹'.number_format((float) $p->price, 0),
                'purpose' => $p->purpose,
                'type' => $p->type,
                'locality' => $p->locality,
                'latitude' => (float) $p->latitude,
                'longitude' => (float) $p->longitude,
                'bedrooms' => $p->bedrooms,
                'bathrooms' => $p->bathrooms,
                'land_area' => $p->land_area ? (float) $p->land_area : null,
                'cover_photo_url' => $cover?->url,
            ];
        }

        return response()->json([
            'success' => true,
            'count' => count($pins),
            'data' => $pins,
        ]);
    }

    /**
     * Similar listings recommendations matching locality, type, or purpose.
     */
    public function similar(string $slug): JsonResponse
    {
        $current = Property::where('slug', $slug)
            ->orWhere('id', is_numeric($slug) ? (int) $slug : 0)
            ->published()
            ->firstOrFail();

        $similar = Property::query()
            ->published()
            ->where('id', '!=', $current->id)
            ->where(function ($q) use ($current) {
                $q->where('locality', $current->locality)
                    ->orWhere('type', $current->type)
                    ->orWhere('purpose', $current->purpose);
            })
            ->with(['coverPhoto', 'media'])
            ->latest()
            ->limit(8)
            ->get();

        return response()->json([
            'success' => true,
            'data' => PropertyListResource::collection($similar),
        ]);
    }
}
