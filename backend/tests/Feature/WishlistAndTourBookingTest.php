<?php

namespace Tests\Feature;

use App\Models\OtpVerification;
use App\Models\Property;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WishlistAndTourBookingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    private function getVerifiedLeadToken(string $email = 'buyer.test@example.com'): string
    {
        $otp = '654321';
        OtpVerification::create([
            'email' => $email,
            'otp_hash' => hash('sha256', $otp),
            'attempts' => 0,
            'expires_at' => now()->addMinutes(15),
            'is_verified' => false,
        ]);

        $res = $this->postJson('/api/otp/verify', [
            'email' => $email,
            'otp' => $otp,
        ]);

        $res->assertStatus(200);
        return $res->json('lead_token');
    }

    public function test_can_toggle_wishlist_via_toggle_endpoint_and_retrieve_with_id(): void
    {
        $token = $this->getVerifiedLeadToken('wishlist.tester@example.com');
        $property = Property::where('is_published', true)->firstOrFail();

        // 1. Add to wishlist via /api/wishlist/toggle
        $addRes = $this->withHeader('X-Lead-Token', $token)
            ->postJson('/api/wishlist/toggle', [
                'property_id' => $property->id,
            ]);

        $addRes->assertStatus(200)
            ->assertJson([
                'success' => true,
                'is_saved' => true,
            ]);

        // 2. Fetch wishlist and ensure returned structure contains property 'id'
        $listRes = $this->withHeader('X-Lead-Token', $token)
            ->getJson('/api/wishlist');

        $listRes->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $items = $listRes->json('data');
        $this->assertNotEmpty($items);
        $this->assertEquals($property->id, $items[0]['id']);

        // 3. Toggle again to remove
        $removeRes = $this->withHeader('X-Lead-Token', $token)
            ->postJson('/api/wishlist/toggle', [
                'property_id' => $property->id,
            ]);

        $removeRes->assertStatus(200)
            ->assertJson([
                'success' => true,
                'is_saved' => false,
            ]);

        // 4. Wishlist now empty
        $listResAfter = $this->withHeader('X-Lead-Token', $token)
            ->getJson('/api/wishlist');

        $this->assertEmpty($listResAfter->json('data'));
    }

    public function test_can_schedule_tour_with_custom_date_and_04_pm_slot(): void
    {
        $token = $this->getVerifiedLeadToken('tour.buyer@example.com');
        $property = Property::where('is_published', true)->firstOrFail();

        // 1. Submit site visit via /api/site-visits
        $visitRes = $this->withHeader('X-Lead-Token', $token)
            ->postJson('/api/site-visits', [
                'property_id' => $property->id,
                'visitor_name' => 'Tour Requester',
                'visitor_email' => 'tour.buyer@example.com',
                'visitor_phone' => '9847123456',
                'preferred_date' => '2026-09-30',
                'preferred_time_slot' => '04:00 PM',
                'notes' => 'Test tour for 30/09/2026 at 04:00 PM',
            ]);

        $visitRes->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'preferred_date' => '2026-09-30',
                    'preferred_time_slot' => '04:00 PM',
                    'status' => 'pending',
                ],
            ]);

        $this->assertDatabaseHas('site_visit_requests', [
            'property_id' => $property->id,
            'preferred_date' => '2026-09-30',
            'preferred_time_slot' => '04:00 PM',
        ]);

        // 2. Submit another visit via /api/site-visit alias
        $aliasRes = $this->withHeader('X-Lead-Token', $token)
            ->postJson('/api/site-visit', [
                'property_id' => $property->id,
                'visitor_name' => 'Tour Requester Alias',
                'visitor_email' => 'tour.buyer@example.com',
                'visitor_phone' => '9847123456',
                'preferred_date' => '2026-10-01',
                'preferred_time_slot' => '04:00 PM',
            ]);

        $aliasRes->assertStatus(201)
            ->assertJson(['success' => true]);
    }
}
