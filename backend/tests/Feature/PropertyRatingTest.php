<?php

namespace Tests\Feature;

use App\Models\AdminUser;
use App\Models\Property;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PropertyRatingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_admin_can_set_and_update_custom_property_rating(): void
    {
        $admin = AdminUser::first();

        // 1. Create property with custom rating 4.9
        $createRes = $this->actingAs($admin, 'sanctum')->postJson('/api/admin/properties', [
            'title' => 'Luxury Rating Test Villa',
            'purpose' => 'sale',
            'type' => 'house',
            'price' => 12500000,
            'locality' => 'Thottada',
            'rating' => 4.9,
        ]);

        $createRes->assertStatus(201)
            ->assertJsonPath('data.rating', 4.9);

        $propertyId = $createRes->json('data.id');

        // 2. Update property rating to 4.2
        $updateRes = $this->actingAs($admin, 'sanctum')->putJson("/api/admin/properties/{$propertyId}", [
            'rating' => 4.2,
        ]);

        $updateRes->assertStatus(200)
            ->assertJsonPath('data.rating', 4.2);

        // 3. Verify public listing API includes the custom rating
        $publicRes = $this->getJson('/api/properties');
        $publicRes->assertStatus(200);

        $items = collect($publicRes->json('data'));
        $createdItem = $items->firstWhere('id', $propertyId);
        $this->assertNotNull($createdItem);
        $this->assertEquals(4.2, $createdItem['rating']);
    }

    public function test_property_rating_validation_between_1_and_5(): void
    {
        $admin = AdminUser::first();

        // Rating > 5 should fail
        $invalidRes = $this->actingAs($admin, 'sanctum')->postJson('/api/admin/properties', [
            'title' => 'Invalid Rating Villa',
            'purpose' => 'sale',
            'type' => 'house',
            'price' => 10000000,
            'locality' => 'Payyambalam',
            'rating' => 5.5,
        ]);

        $invalidRes->assertStatus(422)
            ->assertJsonValidationErrors(['rating']);
    }
}
