<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteVisitRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SiteVisitManageController extends Controller
{
    /**
     * List all site visit / tour requests.
     */
    public function index(Request $request): JsonResponse
    {
        $status = $request->query('status');
        $search = $request->query('search');

        $query = SiteVisitRequest::query()
            ->with([
                'property:id,title,locality,slug,price,purpose,type',
                'lead:id,name,phone,email,locality'
            ]);

        if ($status && $status !== 'all' && $status !== 'All') {
            $query->where('booking_status', strtolower($status));
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('visitor_name', 'like', "%{$search}%")
                    ->orWhere('visitor_phone', 'like', "%{$search}%")
                    ->orWhere('visitor_email', 'like', "%{$search}%")
                    ->orWhereHas('property', function ($pq) use ($search) {
                        $pq->where('title', 'like', "%{$search}%")
                            ->orWhere('locality', 'like', "%{$search}%");
                    });
            });
        }

        $visits = $query->orderBy('created_at', 'desc')->get();

        $statusCounts = SiteVisitRequest::selectRaw('booking_status, count(*) as count')
            ->groupBy('booking_status')
            ->pluck('count', 'booking_status');

        return response()->json([
            'success' => true,
            'data' => $visits,
            'meta' => [
                'total' => $visits->count(),
                'status_counts' => $statusCounts,
            ],
        ]);
    }

    /**
     * Update booking status (pending, confirmed, completed, cancelled).
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|string|in:pending,confirmed,completed,cancelled',
        ]);

        $visit = SiteVisitRequest::with('property', 'lead')->findOrFail($id);
        $visit->update([
            'booking_status' => $validated['status'],
        ]);

        return response()->json([
            'success' => true,
            'message' => "Tour request status updated to {$validated['status']}.",
            'data' => $visit,
        ]);
    }

    /**
     * Delete a site visit request.
     */
    public function destroy(int $id): JsonResponse
    {
        $visit = SiteVisitRequest::findOrFail($id);
        $visit->delete();

        return response()->json([
            'success' => true,
            'message' => 'Tour request removed.',
        ]);
    }
}
