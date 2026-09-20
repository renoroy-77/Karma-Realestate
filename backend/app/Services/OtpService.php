<?php

namespace App\Services;

use App\Mail\OtpMail;
use App\Models\Lead;
use App\Models\OtpVerification;
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
        // 1. Rate-limit check: Max 5 sends per hour per email
        $recentSends = OtpVerification::where('email', $email)
            ->where('created_at', '>=', now()->subHour())
            ->count();

        if ($recentSends >= 5) {
            throw ValidationException::withMessages([
                'email' => ['Too many OTP requests. Please wait a few minutes before trying again.'],
            ]);
        }

        // 2. Check active lock
        $latest = OtpVerification::where('email', $email)->latest()->first();
        if ($latest && $latest->isLocked()) {
            $secondsLeft = now()->diffInSeconds($latest->locked_until);
            throw ValidationException::withMessages([
                'email' => ["Account temporarily locked due to failed attempts. Try again in {$secondsLeft} seconds."],
            ]);
        }

        // 3. Generate random 6-digit OTP
        $otp = (string) random_int(100000, 999999);
        $otpHash = hash('sha256', $otp);

        $verification = OtpVerification::create([
            'email' => $email,
            'otp_hash' => $otpHash,
            'attempts' => 0,
            'expires_at' => now()->addMinutes(10),
            'is_verified' => false,
        ]);

        // Pre-create/update lead details if provided
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

        // 4. Send email
        try {
            Mail::to($email)->send(new OtpMail($otp, $name));
        } catch (\Throwable $e) {
            Log::warning("Failed sending OTP email to {$email}: ".$e->getMessage());
            // In development or if SMTP is offline, log OTP so testing can proceed smoothly
            Log::info("DEV OTP for {$email}: {$otp}");
        }

        return [
            'success' => true,
            'message' => 'Verification code sent to your email address.',
            'expires_in_minutes' => 10,
        ];
    }

    /**
     * Validate OTP and unlock lead.
     */
    public function verifyOtp(string $email, string $otp): array
    {
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
            $secondsLeft = now()->diffInSeconds($verification->locked_until);
            throw ValidationException::withMessages([
                'otp' => ["Too many incorrect attempts. Please wait {$secondsLeft} seconds."],
            ]);
        }

        if ($verification->isExpired()) {
            throw ValidationException::withMessages([
                'otp' => ['This verification code has expired. Please request a new code.'],
            ]);
        }

        $incomingHash = hash('sha256', trim($otp));

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

        // Mark OTP as verified
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
