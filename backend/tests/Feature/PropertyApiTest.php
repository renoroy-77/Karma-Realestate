<?php

namespace Tests\Feature;

use App\Models\Property;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PropertyApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_can_list_published_properties(): void
    {
        $response = $this->getJson('/api/properties');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => [
                        'id',
                        'title',
                        'slug',
                        'purpose',
                        'type',
                        'price',
                        'price_formatted',
                        'locality',
                    ],
                ],
                'meta' => ['total', 'current_page'],
            ]);
    }

    public function test_can_filter_properties_by_purpose_and_type(): void
    {
        $response = $this->getJson('/api/properties?purpose=sale&type=house');

        $response->assertStatus(200);
        $data = $response->json('data');

        $this->assertNotEmpty($data);
        foreach ($data as $item) {
            $this->assertEquals('sale', $item['purpose']);
            $this->assertEquals('house', $item['type']);
        }
    }

    public function test_unverified_request_has_masked_location_data(): void
    {
        $property = Property::where('slug', 'cliffside-beachfront-estate-thottada')->first();

        $response = $this->getJson("/api/properties/{$property->slug}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $property->id,
                    'is_masked' => true,
                    'address_line' => null,
                    'latitude' => null,
                    'longitude' => null,
                ],
            ]);
    }
}
