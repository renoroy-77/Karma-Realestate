<?php

namespace Tests\Feature;

use App\Models\AdminUser;
use App\Models\Property;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DocumentAndBrochureTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_can_generate_property_pdf_brochure(): void
    {
        $admin = AdminUser::first();
        $property = Property::first();

        $response = $this->actingAs($admin, 'sanctum')
            ->get("/api/admin/properties/{$property->id}/pdf");

        $response->assertStatus(200);
        $this->assertEquals('application/pdf', $response->headers->get('Content-Type'));
        $this->assertStringContainsString('attachment', $response->headers->get('Content-Disposition'));
    }

    public function test_can_upload_and_stream_confidential_document(): void
    {
        Storage::fake('local');
        $admin = AdminUser::first();
        $property = Property::first();

        // Create a simple valid dummy PDF file
        $pdfContent = "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000010 00000 n \n0000000053 00000 n \n0000000102 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n178\n%%EOF";
        $file = UploadedFile::fake()->createWithContent('title_deed.pdf', $pdfContent);

        // 1. Upload
        $uploadRes = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/admin/properties/{$property->id}/documents", [
                'title' => 'Official 1982 Title Deed',
                'doc_type' => 'title_deed',
                'file' => $file,
                'apply_watermark' => false, // test raw stream
            ]);

        $uploadRes->assertStatus(201);
        $docId = $uploadRes->json('data.id');

        // 2. View Document
        $viewRes = $this->actingAs($admin, 'sanctum')
            ->get('/api/admin/documents/{docId}/view');

        // 3. Check Audit Logs
        $logsRes = $this->actingAs($admin, 'sanctum')
            ->getJson("/api/admin/documents/{$docId}/logs");

        $logsRes->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'document_id',
                'data' => [
                    '*' => ['id', 'action', 'admin_name', 'timestamp'],
                ],
            ]);

        $this->assertDatabaseHas('document_access_logs', [
            'document_id' => $docId,
            'action' => 'uploaded',
        ]);
    }
}
