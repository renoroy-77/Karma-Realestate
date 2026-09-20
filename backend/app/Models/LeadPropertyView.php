<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeadPropertyView extends Model
{
    use HasFactory;

    protected $table = 'lead_property_views';

    public $timestamps = false;

    protected $fillable = [
        'lead_id',
        'property_id',
        'view_count',
        'first_viewed_at',
        'last_viewed_at',
    ];

    protected function casts(): array
    {
        return [
            'view_count' => 'integer',
            'first_viewed_at' => 'datetime',
            'last_viewed_at' => 'datetime',
        ];
    }

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }
}
