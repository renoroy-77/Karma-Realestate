<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\BookSiteVisitRequest;
use App\Mail\SiteVisitNotification;
use App\Models\Lead;
use App\Models\SiteVisitRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SiteVisitController extends Controller
{
    /**
     * Book an in-person site visit for a property.
     */
    public function book(BookSiteVisitRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // 1. Find or create lead (prefer authenticated verified lead if available)
        $lead = $request->attributes->get('verified_lead') ?? Lead::firstOrCreate(
            ['email' => $validated['visitor_email']],
            [
                'name' => $validated['visitor_name'],
                'phone' => $validated['visitor_phone'],
                'source' => 'site_visit',
                'status' => 'new',
            ]
        );

        // 2. Create site visit record
        $visit = SiteVisitRequest::create([
            'property_id' => $validated['property_id'],
            'lead_id' => $lead->id,
            'visitor_name' => $validated['visitor_name'],
            'visitor_email' => $validated['visitor_email'],
            'visitor_phone' => $validated['visitor_phone'],
            'preferred_date' => $validated['preferred_date'],
            'preferred_time_slot' => $validated['preferred_time_slot'],
            'notes' => $validated['notes'] ?? null,
            'booking_status' => 'pending',
        ]);

        $visit->load('property');

        // 3. Notify admin team
        $adminEmail = config('mail.admin_notification_email', config('mail.from.address'));
        if ($adminEmail) {
            try {
                Mail::to($adminEmail)->send(new SiteVisitNotification($visit));
            } catch (\Throwable $e) {
                Log::warning('Failed sending site visit notification email: '.$e->getMessage());
            }
        }

        $formattedDate = $visit->preferred_date instanceof \DateTimeInterface 
            ? $visit->preferred_date->format('Y-m-d') 
            : (string) $visit->preferred_date;

        return response()->json([
            'success' => true,
            'message' => 'Site visit requested successfully. Our agent will contact you shortly to confirm the appointment.',
            'data' => [
                'booking_id' => $visit->id,
                'status' => $visit->booking_status,
                'preferred_date' => $formattedDate,
                'preferred_time_slot' => $visit->preferred_time_slot,
            ],
        ], 201);
    }

    public function store(BookSiteVisitRequest $request): JsonResponse
    {
        return $this->book($request);
    }

    public function myVisits(Request $request): JsonResponse
    {
        $lead = $request->attributes->get('verified_lead');
        $visits = $lead ? $lead->siteVisits()->with('property')->get() : [];

        return response()->json([
            'success' => true,
            'data' => $visits,
        ]);
    }
}
