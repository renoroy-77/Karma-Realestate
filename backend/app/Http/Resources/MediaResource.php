<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MediaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'property_id' => $this->property_id,
            'media_type' => $this->media_type,
            'thumb_url' => $this->thumb_url,
            'medium_url' => $this->medium_url,
            'full_url' => $this->full_url,
            'video_url' => $this->video_url,
            'is_cover' => (bool) $this->is_cover,
            'sort_order' => (int) $this->sort_order,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
