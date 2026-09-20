<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\InternalRemark;
use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InternalRemarkController extends Controller
{
    /**
     * Upsert private internal remark for a property.
     */
    public function upsert(Request $request, int $id): JsonResponse
    {
        $property = Property::findOrFail($id);

        $request->validate([
            'remark' => 'required|string',
        ]);

        $remark = InternalRemark::updateOrCreate(
            ['property_id' => $property->id],
            ['remark' => $request->input('remark')]
        );

        return response()->json([
            'success' => true,
            'message' => 'Internal remark saved successfully.',
            'data' => [
                'property_id' => $property->id,
                'remark' => $remark->remark,
                'updated_at' => $remark->updated_at?->toISOString(),
            ],
        ]);
    }
}
