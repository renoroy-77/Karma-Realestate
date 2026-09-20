<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CompareController extends Controller
{
    /**
     * Compare up to 4 properties side-by-side.
     */
    public function compare(Request $request): JsonResponse
    {
        $request->validate([
            'property_ids' => 'required|array|min:1|max:4',
            'property_ids.*' => 'integer|exists:properties,id',
        ]);

        $ids = $request->input('property_ids');

        $properties = Property::whereIn('id', $ids)
            ->published()
            ->with(['coverPhoto', 'media'])
            ->get();

        $comparison = [];
        foreach ($properties as $p) {
            $cover = $p->coverPhoto ?? $p->media->firstWhere('media_type', 'photo');

            $comparison[] = [
                'id' => $p->id,
                'title' => $p->title,
                'slug' => $p->slug,
                'purpose' => $p->purpose,
                'type' => $p->type,
                'price' => (float) $p->price,
                'price_formatted' => '₹'.number_format((float) $p->price, 0),
                'price_basis' => $p->price_basis,
                'negotiable' => (bool) $p->negotiable,
                'land_area' => $p->land_area ? (float) $p->land_area : null,
                'land_area_unit' => $p->land_area_unit,
                'building_area_sqft' => $p->building_area_sqft ? (float) $p->building_area_sqft : null,
                'bedrooms' => $p->bedrooms,
                'bathrooms' => $p->bathrooms,
                'locality' => $p->locality,
                'district' => $p->district,
                'land_classification' => $p->land_classification,
                'amenities' => $p->amenities ?? [],
                'pros' => $p->pros ?? [],
                'cons' => $p->cons ?? [],
                'cover_photo' => $cover ? $cover->medium_url : null,
            ];
        }

        return response()->json([
            'success' => true,
            'count' => count($comparison),
            'data' => $comparison,
        ]);
    }
}
