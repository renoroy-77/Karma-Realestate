<?php

namespace Tests\Feature;

use App\Models\AdminUser;
use App\Models\SiteSetting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminCmsAndHeroBgTest extends TestCase
{
    use RefreshDatabase;

    protected string $adminToken;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();

        $admin = AdminUser::first();
        $this->adminToken = $admin->createToken('test_token')->plainTextToken;
    }

    public function test_admin_can_retrieve_and_update_cms_settings_including_hero_bg(): void
    {
        // Get settings
        $getRes = $this->withToken($this->adminToken)->getJson('/api/admin/settings');
        $getRes->assertStatus(200)
            ->assertJson(['success' => true]);

        // Update settings with hero background URL
        $testBgUrl = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c';
        $updateRes = $this->withToken($this->adminToken)->postJson('/api/admin/settings', [
            'settings' => [
                'hero_headline' => 'Discover Luxury Living in Kannur',
                'hero_subheadline' => 'Exclusive villas and beachside properties curated for NRIs.',
                'hero_announcement' => '✨ New Beachside Plots Released',
                'hero_bg_image' => $testBgUrl,
            ],
        ]);

        $updateRes->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'hero_headline' => 'Discover Luxury Living in Kannur',
                    'hero_bg_image' => $testBgUrl,
                ],
            ]);

        // Verify public endpoint provides hero_bg_image
        $publicRes = $this->getJson('/api/settings');
        $publicRes->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'hero_headline' => 'Discover Luxury Living in Kannur',
                    'hero_bg_image' => $testBgUrl,
                ],
            ]);
    }

    public function test_admin_can_upload_hero_background_photo(): void
    {
        Storage::fake('public');

        $fakeImage = UploadedFile::fake()->image('kerala_villa.webp', 1920, 1080);

        $uploadRes = $this->withToken($this->adminToken)->postJson('/api/admin/settings/upload-hero-bg', [
            'image' => $fakeImage,
        ]);

        $uploadRes->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'url',
                'message',
            ]);

        $uploadedUrl = $uploadRes->json('url');
        $this->assertNotEmpty($uploadedUrl);

        // Check that hero_bg_image is updated in SiteSetting
        $savedBg = SiteSetting::get('hero_bg_image');
        $this->assertEquals($uploadedUrl, $savedBg);

        // Check public API reflects the uploaded background photo
        $publicRes = $this->getJson('/api/settings');
        $publicRes->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'hero_bg_image' => $uploadedUrl,
                ],
            ]);
    }

    public function test_hero_background_upload_rejects_invalid_files(): void
    {
        Storage::fake('public');

        // Not an image
        $textDoc = UploadedFile::fake()->create('malicious.pdf', 500, 'application/pdf');

        $res = $this->withToken($this->adminToken)->postJson('/api/admin/settings/upload-hero-bg', [
            'image' => $textDoc,
        ]);

        $res->assertStatus(422)
            ->assertJsonValidationErrors(['image']);
    }

    public function test_admin_can_update_popular_locations_and_upload_location_photo(): void
    {
        Storage::fake('public');

        // 1. Upload a location photo
        $fakeImage = UploadedFile::fake()->image('thalassery_fort.jpg', 600, 600);

        $uploadRes = $this->withToken($this->adminToken)->postJson('/api/admin/settings/upload-location-image', [
            'image' => $fakeImage,
        ]);

        $uploadRes->assertStatus(200)
            ->assertJson(['success' => true]);
        $uploadedUrl = $uploadRes->json('url');
        $this->assertNotEmpty($uploadedUrl);

        // 2. Save popular locations
        $locations = [
            ['name' => 'Thalassery Heritage', 'image' => $uploadedUrl],
            ['name' => 'Payyanur Suburb', 'image' => 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00'],
        ];

        $saveRes = $this->withToken($this->adminToken)->postJson('/api/admin/settings', [
            'settings' => [
                'popular_locations' => $locations,
            ],
        ]);

        $saveRes->assertStatus(200)->assertJson(['success' => true]);

        // 3. Public endpoint returns updated popular locations
        $pubRes = $this->getJson('/api/settings');
        $pubRes->assertStatus(200);
        $this->assertEquals('Thalassery Heritage', $pubRes->json('data.popular_locations.0.name'));
        $this->assertEquals($uploadedUrl, $pubRes->json('data.popular_locations.0.image'));
    }
}
