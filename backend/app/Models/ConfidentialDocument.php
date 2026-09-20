<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ConfidentialDocument extends Model
{
    use HasFactory;

    protected $table = 'confidential_documents';

    protected $fillable = [
        'property_id',
        'title',
        'doc_type',
        'original_filename',
        'stored_path',
        'mime_type',
        'file_size_bytes',
        'is_watermarked',
    ];

    protected function casts(): array
    {
        return [
            'file_size_bytes' => 'integer',
            'is_watermarked' => 'boolean',
        ];
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function accessLogs(): HasMany
    {
        return $this->hasMany(DocumentAccessLog::class, 'document_id')->orderBy('created_at', 'desc');
    }
}
