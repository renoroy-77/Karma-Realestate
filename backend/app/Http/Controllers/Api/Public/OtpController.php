<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\SendOtpRequest;
use App\Http\Requests\VerifyOtpRequest;
use App\Services\OtpService;
use Illuminate\Http\JsonResponse;

class OtpController extends Controller
{
    public function __construct(
        protected OtpService $otpService
    ) {}

    /**
     * Send a 6-digit verification code to the customer's email.
     */
    public function send(SendOtpRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $result = $this->otpService->sendOtp(
            email: $validated['email'],
            name: $validated['name'] ?? null,
            phone: $validated['phone'] ?? null,
            locality: $validated['locality'] ?? null,
        );

        return response()->json($result);
    }

    /**
     * Verify the 6-digit code and issue an encrypted lead token.
     */
    public function verify(VerifyOtpRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $result = $this->otpService->verifyOtp(
            email: $validated['email'],
            otp: $validated['otp'],
        );

        return response()->json($result);
    }
}
