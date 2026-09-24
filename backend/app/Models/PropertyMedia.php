<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

/**
 * @property int $id
 * @property int $property_id
 * @property string $media_type
 * @property string|null $original_path
 * @property string|null $thumb_path
 * @property string|null $medium_path
 * @property string|null $full_path
 * @property string|null $video_url
 * @property bool $is_cover
 * @property int $sort_order
 */
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

    private function formatMediaUrl(?string $path): ?string
    {
        if (empty($path)) {
            return null;
        }

        // If it's an external URL (like Unsplash) that doesn't point to our local storage
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            if (str_contains($path, '/storage/')) {
                $parts = explode('/storage/', $path);
                return '/storage/' . end($parts);
            }
            return $path;
        }

        // Clean relative storage path
        $clean = ltrim(preg_replace('#^/?storage/#', '', $path), '/');
        return '/storage/' . $clean;
    }

    protected function thumbUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->formatMediaUrl($this->thumb_path),
        );
    }

    protected function mediumUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->formatMediaUrl($this->medium_path),
        );
    }

    protected function fullUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->formatMediaUrl($this->full_path),
        );
    }

    protected function videoUrl(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                if ($value) {
                    return $this->formatMediaUrl($value);
                }
                if ($this->original_path && $this->media_type === 'video') {
                    return $this->formatMediaUrl($this->original_path);
                }

                return null;
            },
        );
    }
}
