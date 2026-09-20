<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UploadDocumentRequest;
use App\Http\Resources\DocumentResource;
use App\Models\ConfidentialDocument;
use App\Models\DocumentAccessLog;
use App\Models\Property;
use App\Services\WatermarkService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ConfidentialDocController extends Controller
{
    public function __construct(
        protected WatermarkService $watermarkService
    ) {}

    /**
     * Upload a confidential document into the secure vault.
     */
    public function upload(UploadDocumentRequest $request, int $id): JsonResponse
    {
        $property = Property::findOrFail($id);
        $file = $request->file('file');

        $ext = $file->getClientOriginalExtension() ?: 'pdf';
        $safeName = Str::uuid()->toString().'.'.$ext;
        $folder = "confidential/properties/{$property->id}";

        // Save into private storage (local disk, NOT public)
        $storedPath = $file->storeAs($folder, $safeName, 'local');

        $doc = ConfidentialDocument::create([
            'property_id' => $property->id,
            'title' => $request->input('title'),
            'doc_type' => $request->input('doc_type'),
            'original_filename' => $file->getClientOriginalName(),
            'stored_path' => $storedPath,
            'mime_type' => $file->getMimeType() ?: 'application/pdf',
            'file_size_bytes' => $file->getSize(),
            'is_watermarked' => $request->boolean('apply_watermark', true),
        ]);

        // Record audit log
        $this->logAction($doc->id, $request->user()?->id, 'uploaded', $request);

        return response()->json([
            'success' => true,
            'message' => 'Confidential document uploaded securely.',
            'data' => new DocumentResource($doc),
        ], 201);
    }

    /**
     * Stream document inline in browser with dynamic watermark.
     */
    public function view(Request $request, int $docId): Response
    {
        $doc = ConfidentialDocument::findOrFail($docId);
        $fullPath = Storage::disk('local')->path($doc->stored_path);

        if (! file_exists($fullPath)) {
            abort(404, 'Document file not found on disk.');
        }

        // Record audit log
        $this->logAction($doc->id, $request->user()?->id, 'viewed', $request);

        $content = $doc->is_watermarked
            ? $this->watermarkService->applyWatermark($fullPath, $doc->mime_type)
            : file_get_contents($fullPath);

        return response($content, 200, [
            'Content-Type' => $doc->mime_type,
            'Content-Disposition' => 'inline; filename="'.addslashes($doc->original_filename).'"',
            'Cache-Control' => 'no-store, no-cache, must-revalidate',
        ]);
    }

    /**
     * Download document with dynamic watermark stamp.
     */
    public function download(Request $request, int $docId): Response
    {
        $doc = ConfidentialDocument::findOrFail($docId);
        $fullPath = Storage::disk('local')->path($doc->stored_path);

        if (! file_exists($fullPath)) {
            abort(404, 'Document file not found on disk.');
        }

        // Record audit log
        $this->logAction($doc->id, $request->user()?->id, 'downloaded', $request);

        $content = $doc->is_watermarked
            ? $this->watermarkService->applyWatermark($fullPath, $doc->mime_type)
            : file_get_contents($fullPath);

        return response($content, 200, [
            'Content-Type' => $doc->mime_type,
            'Content-Disposition' => 'attachment; filename="'.addslashes($doc->original_filename).'"',
            'Cache-Control' => 'no-store, no-cache, must-revalidate',
        ]);
    }

    /**
     * Delete document and log audit record.
     */
    public function destroy(Request $request, int $docId): JsonResponse
    {
        $doc = ConfidentialDocument::findOrFail($docId);

        // Record audit log BEFORE deleting record
        $this->logAction($doc->id, $request->user()?->id, 'deleted', $request);

        if (Storage::disk('local')->exists($doc->stored_path)) {
            Storage::disk('local')->delete($doc->stored_path);
        }

        $doc->delete();

        return response()->json([
            'success' => true,
            'message' => 'Document deleted and audit log recorded.',
        ]);
    }

    /**
     * Get immutable audit access logs for a document.
     */
    public function logs(int $docId): JsonResponse
    {
        $doc = ConfidentialDocument::findOrFail($docId);
        $logs = DocumentAccessLog::where('document_id', $doc->id)
            ->with('adminUser:id,name,email')
            ->orderBy('created_at', 'desc')
            ->get();

        $logData = [];
        foreach ($logs as $l) {
            $logData[] = [
                'id' => $l->id,
                'action' => $l->action,
                'admin_name' => $l->adminUser ? $l->adminUser->name : 'System',
                'admin_email' => $l->adminUser ? $l->adminUser->email : null,
                'ip_address' => $l->ip_address,
                'timestamp' => $l->created_at ? $l->created_at->toISOString() : null,
            ];
        }

        return response()->json([
            'success' => true,
            'document_id' => $doc->id,
            'title' => $doc->title,
            'data' => $logData,
        ]);
    }

    protected function logAction(int $docId, ?int $adminId, string $action, Request $request): void
    {
        DocumentAccessLog::create([
            'document_id' => $docId,
            'admin_user_id' => $adminId,
            'action' => $action,
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 500),
            'created_at' => now(),
        ]);
    }
}
