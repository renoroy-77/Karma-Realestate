<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ConfidentialDocument;
use App\Models\Lead;
use App\Models\Property;
use App\Models\SiteVisitRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Get aggregate statistics and metrics for admin dashboard.
     */
    public function stats(Request $request): JsonResponse
    {
        $totalProperties = Property::count();
        $activeListings = Property::where('status', 'available')->where('is_published', true)->count();
        $totalLeads = Lead::count();
        $newLeadsCount = Lead::where('status', 'new')->count();

        $siteVisitsThisWeek = SiteVisitRequest::whereBetween('created_at', [
            now()->startOfWeek(),
            now()->endOfWeek(),
        ])->count();

        $totalDocuments = ConfidentialDocument::count();

        // Top 5 most viewed properties
        $mostViewed = Property::orderBy('view_count', 'desc')
            ->take(5)
            ->get(['id', 'title', 'slug', 'locality', 'price', 'view_count']);

        // Leads by pipeline status
        $leadsByStatus = Lead::selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        // Recent 5 leads
        $recentLeads = Lead::latest()->take(5)->get(['id', 'name', 'email', 'phone', 'locality', 'status', 'created_at']);

        // Upcoming 5 site visits
        $upcomingVisits = SiteVisitRequest::with('property:id,title,locality')
            ->where('preferred_date', '>=', now()->toDateString())
            ->orderBy('preferred_date', 'asc')
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
                    'confidential_documents' => $totalDocuments,
                ],
                'leads_by_status' => $leadsByStatus,
                'most_viewed_properties' => $mostViewed,
                'recent_leads' => $recentLeads,
                'upcoming_site_visits' => $upcomingVisits,
            ],
        ]);
    }
}
