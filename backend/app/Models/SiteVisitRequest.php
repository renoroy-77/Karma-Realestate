<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SiteVisitRequest extends Model
{
    use HasFactory;

    protected $table = 'site_visit_requests';

    protected $fillable = [
        'property_id',
        'lead_id',
        'visitor_name',
        'visitor_email',
        'visitor_phone',
        'preferred_date',
        'preferred_time_slot',
        'booking_status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'preferred_date' => 'date',
        ];
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }
}
