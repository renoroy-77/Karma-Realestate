<?php

namespace Tests\Feature\Security;

use App\Models\AdminUser;
use App\Models\Lead;
use App\Models\Property;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class AuthorizationMatrixTest extends TestCase
{
    use RefreshDatabase;

    protected string $adminToken;

    protected string $leadEncryptedToken;

    protected string $leadSanctumToken;

    protected Property $testProperty;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();

        // 1. Create Super Admin user & token
        $admin = AdminUser::first() ?? AdminUser::create([
            'name' => 'Admin Security Tester',
            'email' => 'sec_admin@karmarealestate.in',
            'password' => bcrypt('Admin@123456'),
            'role' => 'super_admin',
            'is_active' => true,
        ]);
        $this->adminToken = $admin->createToken('admin_sec_token')->plainTextToken;

        // 2. Create Verified Lead user & tokens (both encrypted lead token and Sanctum token)
        $lead = Lead::firstOrCreate(
            ['email' => 'lead_tester@example.com'],
            [
                'name' => 'Verified Lead Tester',
                'phone' => '+919995551234',
                'locality' => 'Kannur City',
                'status' => 'new',
                'source' => 'Website',
                'email_verified' => true,
            ]
        );

        $this->leadEncryptedToken = Crypt::encryptString(json_encode([
            'lead_id' => $lead->id,
            'email' => $lead->email,
            'created_at' => now()->timestamp,
        ]));

        $this->leadSanctumToken = $lead->createToken('lead_customer_token')->plainTextToken;

        // 3. Get or create a published property for route parameter replacement
        $this->testProperty = Property::first();
    }

    /**
     * Walk every registered admin route and verify it strictly rejects Guests and Lead Tokens.
     */
    public function test_admin_routes_strictly_reject_guest_and_lead_tokens(): void
    {
        $allRoutes = Route::getRoutes()->getRoutes();
        $testedAdminRoutes = 0;

        foreach ($allRoutes as $route) {
            $uri = $route->uri();

            // Only check api/admin routes
            if (! str_starts_with($uri, 'api/admin')) {
                continue;
            }

            // Exclude public admin login
            if ($uri === 'api/admin/login') {
                continue;
            }

            $methods = array_diff($route->methods(), ['HEAD']);
            $method = reset($methods) ?: 'GET';

            // Substitute common route parameters with valid test IDs
            $resolvedUri = str_replace(
                ['{id}', '{property}', '{mediaId}', '{docId}'],
                [(string) $this->testProperty->id, (string) $this->testProperty->id, '1', '1'],
                $uri
            );

            // 1. GUEST CALLER (No token) -> Must be rejected (401)
            auth()->forgetGuards();
            $this->flushHeaders();
            $guestRes = $this->json($method, $resolvedUri);
            $this->assertEquals(
                401,
                $guestRes->getStatusCode(),
                "SECURITY LEAK: Route [{$method} /{$uri}] allowed guest access without auth!"
            );

            // 2. LEAD CALLER WITH ENCRYPTED LEAD TOKEN -> Must NEVER be allowed into Admin area (401/403)
            auth()->forgetGuards();
            $this->flushHeaders();
            $leadRes1 = $this->withHeaders(['X-Lead-Token' => $this->leadEncryptedToken])
                ->json($method, $resolvedUri);
            $this->assertTrue(
                in_array($leadRes1->getStatusCode(), [401, 403], true),
                "SECURITY LEAK: Route [{$method} /{$uri}] allowed Encrypted Lead Token into Admin area! Status: {$leadRes1->getStatusCode()}"
            );

            // 3. LEAD CALLER WITH SANCTUM LEAD TOKEN -> Must NEVER be allowed into Admin area (401/403)
            auth()->forgetGuards();
            $this->flushHeaders();
            $leadRes2 = $this->withToken($this->leadSanctumToken)->json($method, $resolvedUri);
            $this->assertTrue(
                in_array($leadRes2->getStatusCode(), [401, 403], true),
                "SECURITY LEAK: Route [{$method} /{$uri}] allowed Sanctum Lead Token into Admin area! Status: {$leadRes2->getStatusCode()}"
            );

            // 4. ADMIN CALLER (Valid Admin Token) -> Must NOT return 401 or 403
            auth()->forgetGuards();
            $this->flushHeaders();
            $freshAdminToken = AdminUser::first()->createToken('route_test_token')->plainTextToken;
            $adminRes = $this->withToken($freshAdminToken)->json($method, $resolvedUri);
            $this->assertNotEquals(
                401,
                $adminRes->getStatusCode(),
                "Route [{$method} /{$uri}] rejected valid Admin token with 401."
            );
            $this->assertNotEquals(
                403,
                $adminRes->getStatusCode(),
                "Route [{$method} /{$uri}] rejected valid Admin token with 403."
            );

            $testedAdminRoutes++;
        }

        $this->assertGreaterThan(15, $testedAdminRoutes, 'Expected at least 15 admin routes to be dynamically audited.');
    }

    /**
     * Verify customer/public routes maintain correct access levels.
     */
    public function test_public_routes_accessible_to_guests(): void
    {
        $publicRoutes = [
            ['GET', '/api/properties'],
            ['GET', '/api/properties/'.$this->testProperty->slug],
            ['GET', '/api/settings'],
            ['GET', '/api/properties/map-pins'],
            ['GET', '/api/testimonials'],
        ];

        foreach ($publicRoutes as [$method, $uri]) {
            $res = $this->json($method, $uri);
            $this->assertEquals(
                200,
                $res->getStatusCode(),
                "Public route [{$method} {$uri}] was inaccessible to guest: Status {$res->getStatusCode()}"
            );
        }
    }
}
