<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class Property extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'properties';

    protected $fillable = [
        'title',
        'slug',
        'purpose',
        'type',
        'price',
        'price_basis',
        'negotiable',
        'land_area',
        'land_area_unit',
        'building_area_sqft',
        'bedrooms',
        'bathrooms',
        'amenities',
        'pros',
        'cons',
        'description',
        'locality',
        'district',
        'address_line',
        'latitude',
        'longitude',
        'virtual_tour_url',
        'brochure_url',
        'rera_number',
        'land_classification',
        'status',
        'is_published',
        'is_featured',
        'view_count',
        'meta_title',
        'meta_description',
        'owner_name',
        'owner_phone',
        'owner_email',
        'owner_notes',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'negotiable' => 'boolean',
            'land_area' => 'decimal:2',
            'building_area_sqft' => 'decimal:2',
            'bedrooms' => 'integer',
            'bathrooms' => 'integer',
            'amenities' => 'array',
            'pros' => 'array',
            'cons' => 'array',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'is_published' => 'boolean',
            'is_featured' => 'boolean',
            'view_count' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::saved(fn () => Cache::forget('sitemap_xml'));
        static::deleted(fn () => Cache::forget('sitemap_xml'));

        static::creating(function (Property $property) {
            if (empty($property->slug)) {
                $baseSlug = Str::slug($property->title);
                $slug = $baseSlug;
                $counter = 1;
                while (static::where('slug', $slug)->exists()) {
                    $slug = "{$baseSlug}-{$counter}";
                    $counter++;
                }
                $property->slug = $slug;
            }
        });
    }

    public function media(): HasMany
    {
        return $this->hasMany(PropertyMedia::class)->orderBy('sort_order', 'asc');
    }

    public function coverPhoto(): HasOne
    {
        return $this->hasOne(PropertyMedia::class)
            ->where('media_type', 'photo')
            ->where('is_cover', true);
    }

    public function confidentialDocuments(): HasMany
    {
        return $this->hasMany(ConfidentialDocument::class);
    }

    public function internalRemark(): HasOne
    {
        return $this->hasOne(InternalRemark::class);
    }

    public function siteVisits(): HasMany
    {
        return $this->hasMany(SiteVisitRequest::class);
    }

    public function wishlists(): HasMany
    {
        return $this->hasMany(Wishlist::class);
    }

    public function leadViews(): HasMany
    {
        return $this->hasMany(LeadPropertyView::class);
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true);
    }

    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }

    public function scopeInBounds(Builder $query, float $north, float $south, float $east, float $west): Builder
    {
        return $query->whereBetween('latitude', [$south, $north])
            ->whereBetween('longitude', [$west, $east]);
    }

    public function scopeFiltered(Builder $query, array $filters): Builder
    {
        if (! empty($filters['purpose'])) {
            $query->where('purpose', $filters['purpose']);
        }

        if (! empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (! empty($filters['price_min'])) {
            $query->where('price', '>=', (float) $filters['price_min']);
        }

        if (! empty($filters['price_max'])) {
            $query->where('price', '<=', (float) $filters['price_max']);
        }

        // Land Area filter
        $areaMin = $filters['area_min'] ?? $filters['land_area_min'] ?? null;
        if (! empty($areaMin)) {
            $query->where('land_area', '>=', (float) $areaMin);
        }

        $areaMax = $filters['area_max'] ?? $filters['land_area_max'] ?? null;
        if (! empty($areaMax)) {
            $query->where('land_area', '<=', (float) $areaMax);
        }

        // Building Area filter
        if (! empty($filters['building_area_min'])) {
            $query->where('building_area_sqft', '>=', (float) $filters['building_area_min']);
        }
        if (! empty($filters['building_area_max'])) {
            $query->where('building_area_sqft', '<=', (float) $filters['building_area_max']);
        }

        if (! empty($filters['bedrooms'])) {
            $query->where('bedrooms', '>=', (int) $filters['bedrooms']);
        }

        if (! empty($filters['bathrooms'])) {
            $query->where('bathrooms', '>=', (int) $filters['bathrooms']);
        }

        if (! empty($filters['locality'])) {
            $query->where('locality', 'like', '%'.$filters['locality'].'%');
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['is_featured'])) {
            $query->where('is_featured', filter_var($filters['is_featured'], FILTER_VALIDATE_BOOLEAN));
        }

        // Date Listed filter (today, this_week, this_month, last_30_days, or date_from / date_to)
        if (! empty($filters['date_listed'])) {
            match ($filters['date_listed']) {
                'today' => $query->whereDate('created_at', today()),
                'this_week' => $query->where('created_at', '>=', now()->startOfWeek()),
                'this_month' => $query->where('created_at', '>=', now()->startOfMonth()),
                'last_30_days' => $query->where('created_at', '>=', now()->subDays(30)),
                default => null,
            };
        }

        if (! empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (! empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        // Google Maps Bounding Box Filter (Search This Area)
        $north = $filters['north'] ?? $filters['bounds_ne_lat'] ?? null;
        $south = $filters['south'] ?? $filters['bounds_sw_lat'] ?? null;
        $east = $filters['east'] ?? $filters['bounds_ne_lng'] ?? null;
        $west = $filters['west'] ?? $filters['bounds_sw_lng'] ?? null;

        if ($north !== null && $south !== null && $east !== null && $west !== null) {
            $query->whereBetween('latitude', [(float) $south, (float) $north])
                ->whereBetween('longitude', [(float) $west, (float) $east]);
        }

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('locality', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Sorting: Area asc/desc, Price asc/desc, Newest/Latest, Views
        $sortBy = $filters['sort_by'] ?? 'newest';
        match ($sortBy) {
            'price_asc' => $query->orderBy('price', 'asc'),
            'price_desc' => $query->orderBy('price', 'desc'),
            'area_asc', 'land_area_asc' => $query->orderBy('land_area', 'asc'),
            'area_desc', 'land_area_desc' => $query->orderBy('land_area', 'desc'),
            'views' => $query->orderBy('view_count', 'desc'),
            'oldest' => $query->orderBy('created_at', 'asc'),
            default => $query->orderBy('created_at', 'desc'), // newest / latest
        };

        $query->orderByDesc('id'); // stable pagination ordering tiebreaker

        return $query;
    }

    protected function brochureUrl(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                if (empty($value)) {
                    return null;
                }
                if (str_contains($value, '/storage/')) {
                    $parts = explode('/storage/', $value);
                    return '/storage/' . end($parts);
                }
                return $value;
            },
        );
    }

    protected function virtualTourUrl(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                if (empty($value)) {
                    return null;
                }
                if (str_contains($value, '/storage/')) {
                    $parts = explode('/storage/', $value);
                    return '/storage/' . end($parts);
                }
                return $value;
            },
        );
    }
}
