<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ConfidentialDocument;
use App\Models\Lead;
use App\Models\Property;
use App\Models\SiteVisitRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    /**
     * Get aggregate statistics and metrics for admin dashboard.
     */
    public function stats(Request $request): JsonResponse
    {
        try {
            $totalProperties = Property::count();
            $activeListings = Property::where('status', 'available')->where('is_published', true)->count();
            $totalLeads = Lead::count();
            $newLeadsCount = Lead::where('status', 'new')->count();

            $siteVisitsThisWeek = SiteVisitRequest::whereBetween('created_at', [
                now()->startOfWeek(),
                now()->endOfWeek(),
            ])->count();

            $totalDocuments = ConfidentialDocument::count();
            $soldCount = Property::where('status', 'sold')->count();
            $soldVolume = (float) Property::where('status', 'sold')->sum('price');
            $totalPortfolioVolume = (float) Property::where('is_published', true)->sum('price');
            $pendingVisitsCount = SiteVisitRequest::where('booking_status', 'pending')->count();
            $confirmedVisitsCount = SiteVisitRequest::where('booking_status', 'confirmed')->count();

            // Top 5 most viewed properties with full attributes
            $mostViewed = Property::with(['coverPhoto', 'media'])
                ->orderBy('view_count', 'desc')
                ->take(5)
                ->get(['id', 'title', 'slug', 'locality', 'price', 'purpose', 'type', 'status', 'view_count'])
                ->map(function ($prop) {
                    $cover = $prop->coverPhoto ?? $prop->media->first();

                    return [
                        'id' => $prop->id,
                        'title' => $prop->title,
                        'slug' => $prop->slug,
                        'locality' => $prop->locality,
                        'price' => $prop->price,
                        'purpose' => $prop->purpose,
                        'type' => $prop->type,
                        'status' => $prop->status,
                        'view_count' => $prop->view_count,
                        'thumb_url' => $cover ? ($cover->thumb_url ?: $cover->medium_url) : null,
                    ];
                });

            // Leads by pipeline status
            $leadsByStatus = Lead::selectRaw('status, count(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status');

            // Recent 5 leads with interested property information
            $recentLeads = Lead::with(['propertyViews.property:id,title,locality', 'siteVisits.property:id,title,locality'])
                ->latest()
                ->take(5)
                ->get(['id', 'name', 'email', 'phone', 'locality', 'source', 'status', 'created_at'])
                ->map(function ($lead) {
                    $latestPropTitle = $lead->siteVisits->first()?->property?->title
                        ?? $lead->propertyViews->first()?->property?->title;

                    return [
                        'id' => $lead->id,
                        'name' => $lead->name,
                        'email' => $lead->email,
                        'phone' => $lead->phone,
                        'locality' => $lead->locality,
                        'source' => $lead->source ?? 'Website',
                        'status' => $lead->status,
                        'created_at' => $lead->created_at,
                        'interested_property' => $latestPropTitle,
                    ];
                });

            // Upcoming 5 site visits (prioritize future visits)
            $today = now()->toDateString();
            $upcomingVisits = SiteVisitRequest::with('property:id,title,locality,slug')
                ->orderByRaw('CASE WHEN preferred_date >= ? THEN 0 ELSE 1 END', [$today])
                ->orderBy('preferred_date', 'asc')
                ->latest()
                ->take(5)
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'overview' => [
                        'total_properties' => $totalProperties,
                        'active_listings' => $activeListings,
                        'total_leads' => $totalLeads,
                        'new_leads_badge' => $newLeadsCount,
                        'site_visits_this_week' => $siteVisitsThisWeek,
                        'pending_site_visits' => $pendingVisitsCount,
                        'confirmed_site_visits' => $confirmedVisitsCount,
                        'confidential_documents' => $totalDocuments,
                        'sold_count' => $soldCount,
                        'sold_volume' => $soldVolume,
                        'total_portfolio_volume' => $totalPortfolioVolume,
                    ],
                    'leads_by_status' => $leadsByStatus,
                    'most_viewed_properties' => $mostViewed,
                    'recent_leads' => $recentLeads,
                    'upcoming_site_visits' => $upcomingVisits,
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('Dashboard stats fetch failed: '.$e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to calculate some dashboard analytics: '.$e->getMessage(),
                'data' => [
                    'overview' => [
                        'total_properties' => Property::count(),
                        'active_listings' => Property::where('status', 'available')->count(),
                        'total_leads' => Lead::count(),
                        'new_leads_badge' => 0,
                        'site_visits_this_week' => 0,
                        'pending_site_visits' => 0,
                        'confirmed_site_visits' => 0,
                        'confidential_documents' => 0,
                        'sold_count' => 0,
                        'sold_volume' => 0,
                        'total_portfolio_volume' => 0,
                    ],
                    'leads_by_status' => [],
                    'most_viewed_properties' => [],
                    'recent_leads' => [],
                    'upcoming_site_visits' => [],
                ],
            ], 200);
        }
    }
}
