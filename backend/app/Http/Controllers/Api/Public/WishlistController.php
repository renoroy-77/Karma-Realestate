<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\PropertyListResource;
use App\Models\Wishlist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    /**
     * Toggle a property in or out of the lead's wishlist.
     */
    public function toggle(Request $request): JsonResponse
    {
        $request->validate([
            'property_id' => 'required|exists:properties,id',
        ]);

        $lead = $request->attributes->get('verified_lead');
        $propertyId = (int) $request->input('property_id');

        $existing = Wishlist::where('lead_id', $lead->id)
            ->where('property_id', $propertyId)
            ->first();

        if ($existing) {
            $existing->delete();

            return response()->json([
                'success' => true,
                'is_saved' => false,
                'message' => 'Property removed from saved list.',
            ]);
        }

        Wishlist::create([
            'lead_id' => $lead->id,
            'property_id' => $propertyId,
        ]);

        return response()->json([
            'success' => true,
            'is_saved' => true,
            'message' => 'Property added to saved list.',
        ]);
    }

    /**
     * Get all wishlisted properties for the authenticated lead.
     */
    public function index(Request $request): JsonResponse
    {
        $lead = $request->attributes->get('verified_lead');

        $properties = $lead->wishlistProperties()
            ->with(['coverPhoto', 'media'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => PropertyListResource::collection($properties),
        ]);
    }

    public function myWishlist(Request $request): JsonResponse
    {
        return $this->index($request);
    }
}
