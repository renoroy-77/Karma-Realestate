<?php

namespace App\Models;

use App\Enums\LeadStatus;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Sanctum\HasApiTokens;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string|null $phone
 * @property string|null $locality
 * @property string $source
 * @property LeadStatus $status
 * @property bool $email_verified
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class Lead extends Model
{
    use HasApiTokens, HasFactory;

    protected $table = 'leads';

    protected $fillable = [
        'name',
        'email',
        'phone',
        'locality',
        'source',
        'status',
        'email_verified',
    ];

    protected function casts(): array
    {
        return [
            'status' => LeadStatus::class,
            'email_verified' => 'boolean',
        ];
    }

    public function setPhoneAttribute(?string $value): void
    {
        $this->attributes['phone'] = $value ? preg_replace('/[^\d+]/', '', $value) : null;
    }

    public function activities(): HasMany
    {
        return $this->hasMany(LeadActivity::class)->orderBy('created_at', 'desc');
    }

    public function notes(): HasMany
    {
        return $this->hasMany(LeadNote::class)->orderBy('created_at', 'desc');
    }

    public function siteVisits(): HasMany
    {
        return $this->hasMany(SiteVisitRequest::class)->orderBy('created_at', 'desc');
    }

    public function siteVisitRequests(): HasMany
    {
        return $this->siteVisits();
    }

    public function wishlists(): HasMany
    {
        return $this->hasMany(Wishlist::class);
    }

    public function wishlistProperties(): BelongsToMany
    {
        return $this->belongsToMany(Property::class, 'wishlists')->withTimestamps();
    }

    public function propertyViews(): HasMany
    {
        return $this->hasMany(LeadPropertyView::class)->orderBy('last_viewed_at', 'desc');
    }

    public function viewedProperties(): BelongsToMany
    {
        return $this->belongsToMany(Property::class, 'lead_property_views')
            ->withPivot('view_count', 'first_viewed_at', 'last_viewed_at');
    }

    public function scopeFiltered(Builder $query, array $filters): Builder
    {
        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['source'])) {
            $query->where('source', $filters['source']);
        }

        if (! empty($filters['search'])) {
            $term = addcslashes($filters['search'], '%_\\');
            $digits = preg_replace('/\D+/', '', $filters['search']) ?? '';

            $query->where(function (Builder $q) use ($term, $digits) {
                $q->where('name', 'like', "%{$term}%")
                    ->orWhere('email', 'like', "%{$term}%")
                    ->orWhere('locality', 'like', "%{$term}%");
                if (strlen($digits) >= 4) {
                    $q->orWhere('phone', 'like', "%{$digits}%");
                }
            });
        }

        if (! empty($filters['property_id'])) {
            $propId = (int) $filters['property_id'];
            $query->where(function (Builder $q) use ($propId) {
                $q->whereHas('propertyViews', fn (Builder $pv) => $pv->where('property_id', $propId))
                    ->orWhereHas('wishlists', fn (Builder $wl) => $wl->where('property_id', $propId))
                    ->orWhereHas('siteVisits', fn (Builder $sv) => $sv->where('property_id', $propId));
            });
        }

        if (! empty($filters['created_from'])) {
            $query->where('created_at', '>=', Carbon::parse($filters['created_from'])->startOfDay());
        }

        if (! empty($filters['created_to'])) {
            $query->where('created_at', '<=', Carbon::parse($filters['created_to'])->endOfDay());
        }

        match ($filters['sort_by'] ?? 'newest') {
            'oldest' => $query->orderBy('created_at'),
            'name_asc' => $query->orderBy('name'),
            'name_desc' => $query->orderByDesc('name'),
            'most_viewed' => $query->orderByDesc('property_views_count'),
            default => $query->orderByDesc('created_at'),
        };

        $query->orderByDesc('id'); // stable pagination when timestamps tie

        return $query;
    }
}
