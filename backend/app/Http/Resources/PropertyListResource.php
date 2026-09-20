<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PropertyListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $cover = $this->coverPhoto ?? $this->media->firstWhere('media_type', 'photo');

        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'purpose' => $this->purpose,
            'type' => $this->type,
            'price' => (float) $this->price,
            'price_basis' => $this->price_basis,
            'price_formatted' => '₹'.number_format($this->price, 0),
            'negotiable' => (bool) $this->negotiable,
            'land_area' => $this->land_area ? (float) $this->land_area : null,
            'land_area_unit' => $this->land_area_unit,
            'building_area_sqft' => $this->building_area_sqft ? (float) $this->building_area_sqft : null,
            'bedrooms' => $this->bedrooms,
            'bathrooms' => $this->bathrooms,
            'locality' => $this->locality,
            'district' => $this->district,
            'latitude' => $this->latitude ? (float) $this->latitude : null,
            'longitude' => $this->longitude ? (float) $this->longitude : null,
            'status' => $this->status,
            'is_published' => (bool) $this->is_published,
            'view_count' => (int) $this->view_count,
            'cover_photo' => $cover ? [
                'thumb_url' => $cover->thumb_url,
                'medium_url' => $cover->medium_url,
                'full_url' => $cover->full_url,
            ] : null,
            'photos_count' => $this->media->where('media_type', 'photo')->count(),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
