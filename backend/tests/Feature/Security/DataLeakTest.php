<?php

namespace Tests\Feature\Security;

use App\Models\InternalRemark;
use App\Models\Property;
use App\Models\PropertyMedia;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DataLeakTest extends TestCase
{
    use RefreshDatabase;

    protected Property $property;

    protected float $realLat = 11.874512;

    protected float $realLng = 75.370419;

    protected string $realAddress = 'Villa 42, Private Beach Road, Kannur 670001';

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();

        // Create a property with sensitive confidential data
        $this->property = Property::create([
            'title' => 'Confidential Coastal Beachfront Estate',
            'slug' => 'confidential-coastal-estate',
            'purpose' => 'Sale',
            'type' => 'house',
            'price' => 45000000,
            'price_basis' => 'total',
            'negotiable' => true,
            'land_area' => 25.5,
            'land_area_unit' => 'cent',
            'bedrooms' => 5,
            'bathrooms' => 6,
            'amenities' => ['Private Pool', 'Beach Access', 'Smart Home'],
            'pros' => ['Clear Title Deed', 'Direct Sea View', 'High Rental Yield'],
            'cons' => ['Coastal Regulation Zone 50m limit'],
            'description' => 'Ultra luxury beachfront villa in Kannur.',
            'locality' => 'Payyambalam',
            'district' => 'Kannur',
            'address_line' => $this->realAddress,
            'latitude' => $this->realLat,
            'longitude' => $this->realLng,
            'virtual_tour_url' => 'https://my.matterport.com/show/?m=confidential_tour_xyz',
            'brochure_url' => 'https://karmarealestate.in/storage/brochures/private.pdf',
            'status' => 'available',
            'is_published' => true,
            'is_featured' => true,
            'owner_name' => 'Dr. Private Landowner',
            'owner_phone' => '+919876500000',
            'owner_email' => 'private_owner@example.com',
            'owner_notes' => 'Willing to negotiate down to 4.2 Cr for cash buyer.',
        ]);

        // Add internal admin remarks
        InternalRemark::create([
            'property_id' => $this->property->id,
            'remark' => 'CONFIDENTIAL: Seller in urgent distress sale, verify encumbrance 2012.',
        ]);

        // Add media (photos and private video)
        PropertyMedia::create([
            'property_id' => $this->property->id,
            'media_type' => 'photo',
            'original_path' => 'properties/photos/cover.jpg',
            'thumb_path' => 'properties/photos/cover_thumb.jpg',
            'medium_path' => 'properties/photos/cover_med.jpg',
            'full_path' => 'properties/photos/cover.jpg',
            'is_cover' => true,
            'sort_order' => 0,
        ]);
    }

    /**
     * Unauthenticated guest requesting property detail must NEVER receive sensitive fields.
     */
    public function test_unauthenticated_request_masks_exact_address_coordinates_and_remarks(): void
    {
        $res = $this->getJson("/api/properties/{$this->property->slug}");

        $res->assertStatus(200);
        $data = $res->json('data');
        $rawContent = $res->getContent();

        // 1. Assert is_masked flag is true
        $this->assertTrue($data['is_masked'] ?? false, 'Expected is_masked to be true for unauthenticated visitor.');

        // 2. Exact address must be null
        $this->assertNull($data['address_line'], 'Exact address_line was leaked to guest!');
        $this->assertArrayNotHasKey('address_exact', $data);

        // 3. Real GPS coordinates must be null
        $this->assertNull($data['latitude'], 'Real latitude was leaked in property detail JSON!');
        $this->assertNull($data['longitude'], 'Real longitude was leaked in property detail JSON!');

        // 4. Sensitive owner and internal remark fields must NEVER exist in response
        $this->assertArrayNotHasKey('owner_name', $data, 'owner_name leaked to public!');
        $this->assertArrayNotHasKey('owner_phone', $data, 'owner_phone leaked to public!');
        $this->assertArrayNotHasKey('owner_email', $data, 'owner_email leaked to public!');
        $this->assertArrayNotHasKey('owner_notes', $data, 'owner_notes leaked to public!');
        $this->assertArrayNotHasKey('internal_remarks', $data, 'internal_remarks leaked to public!');
        $this->assertArrayNotHasKey('internal_remark', $data, 'internal_remark leaked to public!');

        // 5. Assert raw response string doesn't contain the exact street address anywhere
        $this->assertStringNotContainsString(
            $this->realAddress,
            $rawContent,
            'Exact street address string found anywhere in raw HTTP response body!'
        );

        // 6. Assert raw response string doesn't contain the exact real latitude / longitude numbers
        $this->assertStringNotContainsString(
            (string) $this->realLat,
            $rawContent,
            'Exact latitude float string found anywhere in raw HTTP response body!'
        );
        $this->assertStringNotContainsString(
            (string) $this->realLng,
            $rawContent,
            'Exact longitude float string found anywhere in raw HTTP response body!'
        );

        // 7. Internal seller notes must not be in raw body
        $this->assertStringNotContainsString(
            'distress sale',
            $rawContent,
            'Confidential internal remark leaked in HTTP response body!'
        );
    }

    /**
     * Map pins endpoint must NEVER leak exact coordinates or unmasked addresses.
     */
    public function test_map_pins_endpoint_does_not_leak_real_coordinates_or_sensitive_data(): void
    {
        $res = $this->getJson('/api/properties/map');

        $res->assertStatus(200);
        $rawContent = $res->getContent();

        // Check each returned pin
        $pins = $res->json('data') ?? [];
        $this->assertNotEmpty($pins);

        foreach ($pins as $pin) {
            // Must NOT have exact address line
            $this->assertArrayNotHasKey('address_line', $pin);
            $this->assertArrayNotHasKey('address_exact', $pin);
            $this->assertArrayNotHasKey('owner_phone', $pin);
            $this->assertArrayNotHasKey('internal_remarks', $pin);
        }

        // Exact real coordinates for our test property must NOT appear anywhere in the map response
        $this->assertStringNotContainsString(
            (string) $this->realLat,
            $rawContent,
            'Map pins response contains unmasked, exact latitude!'
        );
        $this->assertStringNotContainsString(
            (string) $this->realLng,
            $rawContent,
            'Map pins response contains unmasked, exact longitude!'
        );
    }

    /**
     * Public search/listing endpoint must NEVER leak exact addresses, coordinates, or owner details.
     */
    public function test_public_properties_listing_never_leaks_confidential_fields(): void
    {
        $res = $this->getJson('/api/properties');

        $res->assertStatus(200);
        $items = $res->json('data') ?? [];
        $this->assertNotEmpty($items);

        $raw = $res->getContent();

        foreach ($items as $item) {
            $this->assertArrayNotHasKey('address_line', $item);
            $this->assertArrayNotHasKey('owner_name', $item);
            $this->assertArrayNotHasKey('owner_phone', $item);
            $this->assertArrayNotHasKey('internal_remarks', $item);
        }

        $this->assertStringNotContainsString($this->realAddress, $raw);
        $this->assertStringNotContainsString('distress sale', $raw);
    }
}
