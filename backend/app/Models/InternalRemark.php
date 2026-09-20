<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InternalRemark extends Model
{
    use HasFactory;

    protected $table = 'internal_remarks';

    protected $fillable = [
        'property_id',
        'remark',
    ];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }
}
