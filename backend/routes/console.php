<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Models\OtpVerification;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Prune expired OTP tokens older than 24 hours
Schedule::call(function () {
    OtpVerification::where('expires_at', '<', now()->subHours(24))->delete();
})->hourly()->name('prune-expired-otps');

// Prune expired Sanctum personal access tokens
Schedule::command('sanctum:prune-expired --hours=48')->daily();
