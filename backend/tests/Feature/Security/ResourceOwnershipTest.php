<?php

namespace Tests\Feature\Security;

use App\Models\AdminUser;
use App\Models\ConfidentialDocument;
use App\Models\Property;
use App\Models\PropertyMedia;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ResourceOwnershipTest extends TestCase
{
    use RefreshDatabase;

    protected string $adminToken;

    protected Property $propertyA;

    protected Property $propertyB;

    protected PropertyMedia $mediaA;

    protected PropertyMedia $mediaB;

    protected ConfidentialDocument $docA;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();

        $admin = AdminUser::first();
        $this->adminToken = $admin->createToken('ownership_test_token')->plainTextToken;

        // Create Property A
        $this->propertyA = Property::create([
            'title' => 'Property Alpha Kannur',
            'slug' => 'property-alpha-kannur',
            'purpose' => 'Sale',
            'type' => 'house',
            'price' => 15000000,
            'locality' => 'Talap',
            'district' => 'Kannur',
            'is_published' => true,
            'status' => 'available',
        ]);

        // Create Property B
        $this->propertyB = Property::create([
            'title' => 'Property Beta Kannur',
            'slug' => 'property-beta-kannur',
            'purpose' => 'Sale',
            'type' => 'land',
            'price' => 8000000,
            'locality' => 'Payyanur',
            'district' => 'Kannur',
            'is_published' => true,
            'status' => 'available',
        ]);

        // Media on Property A
        $this->mediaA = PropertyMedia::create([
            'property_id' => $this->propertyA->id,
            'media_type' => 'photo',
            'original_path' => 'properties/photos/a.jpg',
            'thumb_path' => 'properties/photos/a_thumb.jpg',
            'medium_path' => 'properties/photos/a_med.jpg',
            'full_path' => 'properties/photos/a.jpg',
            'is_cover' => true,
            'sort_order' => 0,
        ]);

        // Media on Property B
        $this->mediaB = PropertyMedia::create([
            'property_id' => $this->propertyB->id,
            'media_type' => 'photo',
            'original_path' => 'properties/photos/b.jpg',
            'thumb_path' => 'properties/photos/b_thumb.jpg',
            'medium_path' => 'properties/photos/b_med.jpg',
            'full_path' => 'properties/photos/b.jpg',
            'is_cover' => true,
            'sort_order' => 0,
        ]);

        // Confidential document on Property A
        $this->docA = ConfidentialDocument::create([
            'property_id' => $this->propertyA->id,
            'title' => 'Alpha Title Deed 2024',
            'doc_type' => 'deed',
            'original_filename' => 'title_deed.pdf',
            'stored_path' => 'confidential/properties/a/title_deed.pdf',
            'mime_type' => 'application/pdf',
            'file_size_bytes' => 10240,
            'is_watermarked' => true,
        ]);
    }

    /**
     * Trying to reorder media on Property A using a media ID from Property B must fail.
     */
    public function test_cannot_reorder_media_using_foreign_property_media_id(): void
    {
        $res = $this->withToken($this->adminToken)->patchJson("/api/admin/properties/{$this->propertyA->id}/media/sort", [
            'items' => [
                ['id' => $this->mediaA->id, 'sort_order' => 0, 'is_cover' => true],
                ['id' => $this->mediaB->id, 'sort_order' => 1, 'is_cover' => false], // Media B belongs to Property B!
            ],
        ]);

        $res->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Cannot reorder media items belonging to a different property.',
            ]);
    }

    /**
     * Uploading media to non-existent property must return 404.
     */
    public function test_uploading_media_to_non_existent_property_returns_404(): void
    {
        Storage::fake('public');
        $file = UploadedFile::fake()->image('test.jpg');

        $res = $this->withToken($this->adminToken)->postJson('/api/admin/properties/999999/media', [
            'file' => $file,
            'media_type' => 'photo',
        ]);

        $res->assertStatus(404);
    }

    /**
     * Uploading document to non-existent property must return 404.
     */
    public function test_uploading_document_to_non_existent_property_returns_404(): void
    {
        Storage::fake('local');
        $file = UploadedFile::fake()->create('deed.pdf', 500, 'application/pdf');

        $res = $this->withToken($this->adminToken)->postJson('/api/admin/properties/999999/documents', [
            'file' => $file,
            'title' => 'Test Deed',
            'doc_type' => 'title_deed',
        ]);

        $res->assertStatus(404);
    }

    /**
     * Attempting to delete non-existent media or document returns 404.
     */
    public function test_deleting_non_existent_media_or_document_returns_404(): void
    {
        $mediaRes = $this->withToken($this->adminToken)->deleteJson('/api/admin/media/999999');
        $mediaRes->assertStatus(404);

        $docRes = $this->withToken($this->adminToken)->deleteJson('/api/admin/documents/999999');
        $docRes->assertStatus(404);
    }
}
