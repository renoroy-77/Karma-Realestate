<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class PropertyMedia extends Model
{
    use HasFactory;

    protected $table = 'property_media';

    protected $fillable = [
        'property_id',
        'media_type',
        'original_path',
        'thumb_path',
        'medium_path',
        'full_path',
        'video_url',
        'is_cover',
        'sort_order',
    ];

    protected $appends = [
        'thumb_url',
        'medium_url',
        'full_url',
        'video_url',
    ];

    protected function casts(): array
    {
        return [
            'is_cover' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    protected function thumbUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->thumb_path ? (str_starts_with($this->thumb_path, 'http') ? $this->thumb_path : Storage::disk('public')->url($this->thumb_path)) : null,
        );
    }

    protected function mediumUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->medium_path ? (str_starts_with($this->medium_path, 'http') ? $this->medium_path : Storage::disk('public')->url($this->medium_path)) : null,
        );
    }

    protected function fullUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->full_path ? (str_starts_with($this->full_path, 'http') ? $this->full_path : Storage::disk('public')->url($this->full_path)) : null,
        );
    }

    protected function videoUrl(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                if ($value) {
                    return str_starts_with($value, 'http') ? $value : Storage::disk('public')->url($value);
                }
                if ($this->original_path && $this->media_type === 'video') {
                    return str_starts_with($this->original_path, 'http') ? $this->original_path : Storage::disk('public')->url($this->original_path);
                }
                return null;
            },
        );
    }
}
