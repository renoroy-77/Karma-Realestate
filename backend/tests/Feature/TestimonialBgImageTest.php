<?php

namespace Tests\Feature;

use App\Models\AdminUser;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class TestimonialBgImageTest extends TestCase
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

    public function test_admin_can_upload_testimonial_bg_image(): void
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->image('villa_bg.jpg', 1920, 1080);

        $res = $this->withToken($this->adminToken)->postJson('/api/admin/testimonials/upload-bg', [
            'bg_image' => $file,
        ]);

        $res->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertNotEmpty($res->json('url'));
    }

    public function test_admin_can_create_and_update_testimonial_with_bg_image(): void
    {
        $bgUrl = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9';

        $createRes = $this->withToken($this->adminToken)->postJson('/api/admin/testimonials', [
            'client_name' => 'Faisal Mohammed',
            'client_role' => 'NRI Business Owner',
            'content' => 'Exceptional service and transparent dealing.',
            'rating' => 5,
            'bg_image' => $bgUrl,
            'is_active' => true,
        ]);

        $createRes->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'client_name' => 'Faisal Mohammed',
                    'bg_image' => $bgUrl,
                ],
            ]);

        $testimonialId = $createRes->json('data.id');

        $updatedBgUrl = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750';
        $updateRes = $this->withToken($this->adminToken)->putJson("/api/admin/testimonials/{$testimonialId}", [
            'client_name' => 'Faisal Mohammed',
            'client_role' => 'NRI Business Owner',
            'content' => 'Exceptional service and transparent dealing.',
            'rating' => 5,
            'bg_image' => $updatedBgUrl,
            'is_active' => true,
        ]);

        $updateRes->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'bg_image' => $updatedBgUrl,
                ],
            ]);

        // Verify public home endpoint returns bg_image
        $homeRes = $this->getJson('/api/home');
        $homeRes->assertStatus(200);
        $this->assertArrayHasKey('testimonials', $homeRes->json('data'));
        $found = collect($homeRes->json('data.testimonials'))->firstWhere('id', $testimonialId);
        $this->assertNotNull($found);
        $this->assertEquals($updatedBgUrl, $found['bg_image']);
    }
}
