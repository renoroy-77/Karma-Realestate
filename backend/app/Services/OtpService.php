<?php

namespace App\Services;

use App\Mail\OtpMail;
use App\Models\Lead;
use App\Models\OtpVerification;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class OtpService
{
    /**
     * Generate and dispatch a 6-digit email OTP.
     */
    public function sendOtp(string $email, ?string $name = null, ?string $phone = null, ?string $locality = null): array
    {
        // 1. Normalize email
        $email = strtolower(trim($email));

        // 2. Concurrency lock to prevent duplicate simultaneous sends
        $lockKey = 'otp_send_lock_'.md5($email);
        $lock = Cache::lock($lockKey, 5);
        if (! $lock->get()) {
            throw ValidationException::withMessages([
                'email' => ['An OTP request is currently being processed. Please wait a moment.'],
            ]);
        }

        try {
            // 3. Hourly limit: Max 5 sends per hour per email
            $recentSends = OtpVerification::where('email', $email)
                ->where('created_at', '>=', now()->subHour())
                ->count();

            if ($recentSends >= 5) {
                throw ValidationException::withMessages([
                    'email' => ['Too many OTP requests. Please wait a few minutes before trying again.'],
                ]);
            }

            // 4. Check active lockout from failed attempts
            $latest = OtpVerification::where('email', $email)->latest()->first();
            if ($latest && $latest->isLocked()) {
                $secondsLeft = max(1, now()->diffInSeconds($latest->locked_until));
                throw ValidationException::withMessages([
                    'email' => ["Account temporarily locked due to failed attempts. Try again in {$secondsLeft} seconds."],
                ]);
            }

            // 5. Check 60-second cooldown between consecutive sends
            if ($latest && $latest->created_at && $latest->created_at->gt(now()->subSeconds(60))) {
                $secondsLeft = max(1, 60 - now()->diffInSeconds($latest->created_at));
                throw ValidationException::withMessages([
                    'email' => ["Please wait {$secondsLeft} seconds before requesting a new code."],
                ]);
            }

            // 6. Invalidate all previous unverified OTPs for this email (new OTP invalidates old one)
            OtpVerification::where('email', $email)
                ->where('is_verified', false)
                ->update(['expires_at' => now()->subSecond()]);

            // 7. Generate random 6-digit OTP and store SHA-256 hash
            $otp = (string) random_int(100000, 999999);
            $otpHash = hash('sha256', $otp);

            $verification = OtpVerification::create([
                'email' => $email,
                'otp_hash' => $otpHash,
                'attempts' => 0,
                'expires_at' => now()->addMinutes(10),
                'is_verified' => false,
            ]);

            // Pre-create/update lead details if provided (update, not duplicate)
            if ($name || $phone || $locality) {
                Lead::updateOrCreate(
                    ['email' => $email],
                    array_filter([
                        'name' => $name ?: 'Visitor',
                        'phone' => $phone,
                        'locality' => $locality,
                        'source' => 'otp_verify',
                    ])
                );
            }

            // 8. Send email securely (clean error on SMTP failure without locking user out)
            try {
                Mail::to($email)->send(new OtpMail($otp, $name));
            } catch (\Throwable $e) {
                Log::error("Failed sending OTP email to {$email}: ".$e->getMessage());
                // Delete the pending verification record so user is not stuck in cooldown/lockout
                $verification->delete();
                throw ValidationException::withMessages([
                    'email' => ['Unable to dispatch verification email. Please check your address or try again shortly.'],
                ]);
            }

            return [
                'success' => true,
                'message' => 'Verification code sent to your email address.',
                'expires_in_minutes' => 10,
            ];
        } finally {
            $lock->release();
        }
    }

    /**
     * Validate OTP and unlock lead.
     */
    public function verifyOtp(string $email, string $otp): array
    {
        // Normalize email and OTP
        $email = strtolower(trim($email));
        $otp = trim($otp);

        $verification = OtpVerification::where('email', $email)
            ->where('is_verified', false)
            ->latest()
            ->first();

        if (! $verification) {
            throw ValidationException::withMessages([
                'otp' => ['No active verification code found for this email. Please request a new one.'],
            ]);
        }

        if ($verification->isLocked()) {
            $secondsLeft = max(1, now()->diffInSeconds($verification->locked_until));
            throw ValidationException::withMessages([
                'otp' => ["Too many incorrect attempts. Please wait {$secondsLeft} seconds."],
            ]);
        }

        if ($verification->isExpired()) {
            throw ValidationException::withMessages([
                'otp' => ['This verification code has expired. Please request a new code.'],
            ]);
        }

        $incomingHash = hash('sha256', $otp);

        if (! hash_equals($verification->otp_hash, $incomingHash)) {
            $verification->increment('attempts');

            if ($verification->attempts >= 3) {
                $verification->update([
                    'locked_until' => now()->addSeconds(60),
                ]);
                throw ValidationException::withMessages([
                    'otp' => ['Invalid code. Max attempts exceeded. Cooldown active for 60 seconds.'],
                ]);
            }

            $remaining = 3 - $verification->attempts;
            throw ValidationException::withMessages([
                'otp' => ["Invalid verification code. {$remaining} attempt(s) remaining."],
            ]);
        }

        // Mark OTP as verified (cannot be reused)
        $verification->update(['is_verified' => true]);

        // Auto-capture / update lead record
        $lead = Lead::firstOrCreate(
            ['email' => $email],
            ['name' => 'Verified Buyer', 'source' => 'otp_verify', 'status' => 'new']
        );
        $lead->update(['email_verified' => true]);

        // Generate encrypted lead token
        $payload = [
            'lead_id' => $lead->id,
            'email' => $lead->email,
            'created_at' => now()->timestamp,
        ];
        $token = Crypt::encryptString(json_encode($payload));

        return [
            'success' => true,
            'message' => 'Email successfully verified. Property locations unlocked!',
            'lead_token' => $token,
            'lead' => [
                'id' => $lead->id,
                'name' => $lead->name,
                'email' => $lead->email,
                'phone' => $lead->phone,
            ],
        ];
    }
}
