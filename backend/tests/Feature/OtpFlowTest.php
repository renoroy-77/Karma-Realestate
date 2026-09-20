<?php

namespace Tests\Feature;

use App\Models\OtpVerification;
use App\Models\Property;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OtpFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_can_request_otp(): void
    {
        $response = $this->postJson('/api/otp/send', [
            'email' => 'buyer@example.com',
            'name' => 'Test Buyer',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Verification code sent to your email address.',
            ]);

        $this->assertDatabaseHas('otp_verifications', [
            'email' => 'buyer@example.com',
            'is_verified' => false,
        ]);
    }

    public function test_can_verify_otp_and_unlock_property(): void
    {
        $email = 'buyer2@example.com';
        $otp = '123456';

        OtpVerification::create([
            'email' => $email,
            'otp_hash' => hash('sha256', $otp),
            'attempts' => 0,
            'expires_at' => now()->addMinutes(10),
            'is_verified' => false,
        ]);

        // 1. Verify OTP
        $verifyRes = $this->postJson('/api/otp/verify', [
            'email' => $email,
            'otp' => $otp,
        ]);

        $verifyRes->assertStatus(200)
            ->assertJson(['success' => true]);

        $leadToken = $verifyRes->json('lead_token');
        $this->assertNotEmpty($leadToken);

        // 2. Fetch property with lead token header -> should be unmasked
        $property = Property::where('slug', 'cliffside-beachfront-estate-thottada')->first();

        $propRes = $this->withHeader('X-Lead-Token', $leadToken)
            ->getJson("/api/properties/{$property->slug}");

        $propRes->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $property->id,
                    'is_masked' => false,
                    'address_line' => $property->address_line,
                ],
            ]);
    }
}
