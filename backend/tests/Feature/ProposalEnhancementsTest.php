<?php

namespace Tests\Feature;

use App\Models\Property;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProposalEnhancementsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_homepage_feed_and_contact_submission(): void
    {
        // 1. Check Homepage Endpoint
        $homeRes = $this->getJson('/api/home');
        $homeRes->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'hero_banners',
                    'featured_properties',
                    'recently_added',
                    'browse_by_type',
                    'testimonials',
                    'contact_info',
                ],
            ]);

        // 2. Submit Contact Form
        $contactRes = $this->postJson('/api/contact', [
            'name' => 'Anil Verma',
            'email' => 'anil.verma@example.com',
            'phone' => '+91 98765 00000',
            'subject' => 'Buying villa in Kannur',
            'message' => 'I would like to inquire about beachfront estates.',
        ]);

        $contactRes->assertStatus(201)
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('contact_messages', [
            'email' => 'anil.verma@example.com',
        ]);
        $this->assertDatabaseHas('leads', [
            'email' => 'anil.verma@example.com',
        ]);
    }

    public function test_map_pins_and_bounding_box(): void
    {
        $res = $this->getJson('/api/properties/map?north=12.5&south=11.5&east=76.0&west=75.0');

        $res->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'count',
                'data' => [
                    '*' => [
                        'id',
                        'title',
                        'slug',
                        'price',
                        'latitude',
                        'longitude',
                    ],
                ],
            ]);
    }

    public function test_similar_listings_endpoint(): void
    {
        $property = Property::first();

        $res = $this->getJson("/api/properties/{$property->slug}/similar");

        $res->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data',
            ]);
    }

    public function test_area_range_and_date_listed_filters(): void
    {
        $res = $this->getJson('/api/properties?area_min=20&sort_by=area_desc&date_listed=last_30_days');

        $res->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    public function test_seo_meta_tags_and_schema_json_ld(): void
    {
        $property = Property::first();

        $res = $this->getJson("/api/properties/{$property->slug}");

        $res->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'meta_title',
                    'meta_description',
                    'json_ld' => [
                        '@context',
                        '@type',
                        'name',
                        'price',
                        'address',
                    ],
                ],
            ]);
    }
}
