<?php

namespace App\Http\Resources;

use App\Models\ConfidentialDocument;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ConfidentialDocument
 */
class DocumentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'property_id' => $this->property_id,
            'title' => $this->title,
            'doc_type' => $this->doc_type,
            'original_filename' => $this->original_filename,
            'mime_type' => $this->mime_type,
            'file_size_bytes' => (int) $this->file_size_bytes,
            'file_size_human' => round($this->file_size_bytes / 1024 / 1024, 2).' MB',
            'is_watermarked' => (bool) $this->is_watermarked,
            'access_logs_count' => $this->whenCounted('accessLogs'),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
