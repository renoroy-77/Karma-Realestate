<?php

namespace Tests\Feature;

use App\Models\AdminUser;
use App\Models\Property;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAuthAndPropertyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_admin_can_login_and_access_dashboard_stats(): void
    {
        $loginRes = $this->postJson('/api/admin/login', [
            'email' => 'admin@karmarealestate.in',
            'password' => 'KarmaAdmin@2026',
        ]);

        $loginRes->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'token',
                'admin' => ['id', 'name', 'email'],
            ]);

        $token = $loginRes->json('token');

        // Access dashboard stats
        $statsRes = $this->withToken($token)->getJson('/api/admin/dashboard/stats');

        $statsRes->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'overview' => [
                        'total_properties',
                        'active_listings',
                        'total_leads',
                        'new_leads_badge',
                    ],
                    'leads_by_status',
                    'most_viewed_properties',
                ],
            ]);
    }

    public function test_admin_can_create_property_and_upsert_remarks(): void
    {
        $admin = AdminUser::first();

        // 1. Create property
        $createRes = $this->actingAs($admin, 'sanctum')->postJson('/api/admin/properties', [
            'title' => 'Hilltop Plantation Land in Taliparamba',
            'purpose' => 'sale',
            'type' => 'land',
            'price' => 12000000,
            'price_basis' => 'total',
            'land_area' => 75,
            'land_area_unit' => 'cent',
            'locality' => 'Taliparamba',
            'district' => 'Kannur',
            'address_line' => 'Survey No 142/2, Taliparamba, Kannur',
            'status' => 'available',
        ]);

        $createRes->assertStatus(201);
        $propId = $createRes->json('data.id');

        // 2. Upsert private internal remark
        $remarkRes = $this->actingAs($admin, 'sanctum')->patchJson("/api/admin/properties/{$propId}/remarks", [
            'remark' => 'Client willing to split into two 37.5 cent plots if buyer pays survey fee.',
        ]);

        $remarkRes->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'property_id' => $propId,
                    'remark' => 'Client willing to split into two 37.5 cent plots if buyer pays survey fee.',
                ],
            ]);

        // 3. Update status
        $statusRes = $this->actingAs($admin, 'sanctum')->patchJson("/api/admin/properties/{$propId}/status", [
            'status' => 'under_negotiation',
        ]);

        $statusRes->assertStatus(200)
            ->assertJson([
                'success' => true,
                'status' => 'under_negotiation',
            ]);
    }

    public function test_unauthenticated_request_is_rejected(): void
    {
        $response = $this->getJson('/api/admin/dashboard/stats');
        $response->assertStatus(401);
    }
}
