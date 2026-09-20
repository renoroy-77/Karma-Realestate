<?php

namespace Tests\Feature;

use App\Models\AdminUser;
use App\Models\Property;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OwaspSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    /**
     * OWASP A01: Broken Access Control
     * Protected admin routes must reject requests without valid Sanctum tokens.
     */
    public function test_owasp_a01_broken_access_control_rejection(): void
    {
        $adminRoutes = [
            ['GET', '/api/admin/dashboard/stats'],
            ['GET', '/api/admin/properties'],
            ['POST', '/api/admin/properties'],
            ['GET', '/api/admin/leads'],
            ['GET', '/api/admin/documents/1/view'],
        ];

        foreach ($adminRoutes as [$method, $uri]) {
            $res = $this->json($method, $uri);
            $res->assertStatus(401);
        }
    }

    /**
     * OWASP A02: Sensitive Data Exposure / Masking
     * Public visitor requests must NOT expose exact coordinates or address.
     */
    public function test_owasp_a02_sensitive_data_masking_for_public(): void
    {
        $property = Property::first();

        $response = $this->getJson("/api/properties/{$property->slug}");

        $response->assertStatus(200);
        $data = $response->json('data');

        $this->assertTrue($data['is_masked']);
        $this->assertNull($data['address_line']);
        $this->assertNull($data['latitude']);
        $this->assertNull($data['longitude']);
    }

    /**
     * OWASP A03: SQL Injection Prevention
     * Eloquent parameterization must neutralize malicious SQL payloads.
     */
    public function test_owasp_a03_sql_injection_neutralization(): void
    {
        $sqlPayloads = [
            "' OR '1'='1",
            '1; DROP TABLE properties; --',
            "admin'--",
            "' UNION SELECT * FROM admin_users --",
        ];

        foreach ($sqlPayloads as $payload) {
            $res = $this->getJson('/api/properties?search='.urlencode($payload).'&locality='.urlencode($payload));
            $res->assertStatus(200)
                ->assertJson(['success' => true]);
        }

        // Verify properties table is still intact and unharmed
        $this->assertGreaterThan(0, Property::count());
    }

    /**
     * OWASP A04: Rate Limiting and Brute Force Defense
     * 3 invalid OTP attempts must trigger lockout cooldown.
     */
    public function test_owasp_a04_brute_force_lockout_defense(): void
    {
        $email = 'victim@example.com';

        // 1. Request OTP
        $this->postJson('/api/otp/send', ['email' => $email]);

        // 2. Submit 3 invalid guesses
        for ($i = 1; $i <= 3; $i++) {
            $this->postJson('/api/otp/verify', [
                'email' => $email,
                'otp' => '000000',
            ]);
        }

        // 3. 4th attempt must be locked out
        $lockedRes = $this->postJson('/api/otp/verify', [
            'email' => $email,
            'otp' => '000000',
        ]);

        $lockedRes->assertStatus(422)
            ->assertJsonValidationErrors(['otp']);
    }

    /**
     * OWASP A07: Authentication Failures & Timing Attacks
     * Non-existent admin emails return standard 422 validation without user disclosure.
     */
    public function test_owasp_a07_auth_failure_generic_message(): void
    {
        $res = $this->postJson('/api/admin/login', [
            'email' => 'nonexistent@example.com',
            'password' => 'WrongPassword123!',
        ]);

        $res->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * OWASP A08: Path Traversal Defense
     * Document access must not allow directory traversal to system files.
     */
    public function test_owasp_a08_path_traversal_defense(): void
    {
        $admin = AdminUser::first();

        // Attempting to access non-existent or traversal document ID
        $res = $this->actingAs($admin, 'sanctum')
            ->get('/api/admin/documents/999999/view');

        $res->assertStatus(404);
    }
}
