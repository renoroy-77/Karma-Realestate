<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property string $email
 * @property string $otp_hash
 * @property int $attempts
 * @property Carbon|null $locked_until
 * @property Carbon $expires_at
 * @property bool $is_verified
 */
class OtpVerification extends Model
{
    use HasFactory;

    protected $table = 'otp_verifications';

    protected $fillable = [
        'email',
        'otp_hash',
        'attempts',
        'locked_until',
        'expires_at',
        'is_verified',
    ];

    protected function casts(): array
    {
        return [
            'attempts' => 'integer',
            'locked_until' => 'datetime',
            'expires_at' => 'datetime',
            'is_verified' => 'boolean',
        ];
    }

    public function isExpired(): bool
    {
        return Carbon::parse($this->expires_at)->isPast();
    }

    public function isLocked(): bool
    {
        return $this->locked_until ? Carbon::parse($this->locked_until)->isFuture() : false;
    }
}
