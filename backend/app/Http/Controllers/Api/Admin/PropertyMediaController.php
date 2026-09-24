<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UploadMediaRequest;
use App\Http\Resources\MediaResource;
use App\Models\Property;
use App\Models\PropertyMedia;
use App\Services\MediaOptimizationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PropertyMediaController extends Controller
{
    public function __construct(
        protected MediaOptimizationService $mediaService
    ) {}

    /**
     * Upload photo or add real video file / virtual tour to property gallery.
     */
    public function upload(UploadMediaRequest $request, int $id): JsonResponse
    {
        $property = Property::findOrFail($id);
        $validated = $request->validated();
        $isCover = $request->boolean('is_cover', false);

        // If setting as cover, remove cover flag from existing media
        if ($isCover) {
            PropertyMedia::where('property_id', $property->id)->update(['is_cover' => false]);
        }

        $nextSortOrder = (PropertyMedia::where('property_id', $property->id)->max('sort_order') ?? -1) + 1;

        if ($validated['media_type'] === 'photo') {
            $paths = $this->mediaService->processAndStore($request->file('file'), $property->id);

            $media = PropertyMedia::create([
                'property_id' => $property->id,
                'media_type' => 'photo',
                'original_path' => $paths['original_path'],
                'thumb_path' => $paths['thumb_path'],
                'medium_path' => $paths['medium_path'],
                'full_path' => $paths['full_path'],
                'is_cover' => $isCover,
                'sort_order' => $validated['sort_order'] ?? $nextSortOrder,
            ]);
        } elseif ($validated['media_type'] === 'video' && $request->hasFile('file')) {
            // Real Video File Upload into storage
            $videoFile = $request->file('file');
            $ext = strtolower($videoFile->getClientOriginalExtension() ?: 'mp4');
            $filename = Str::uuid()->toString().'.'.$ext;
            $relFolder = "properties/{$property->id}/videos";
            Storage::disk('public')->makeDirectory($relFolder);
            $relPath = "{$relFolder}/{$filename}";
            Storage::disk('public')->put($relPath, file_get_contents($videoFile->getRealPath()));

            $videoUrl = "/storage/{$relPath}";

            $media = PropertyMedia::create([
                'property_id' => $property->id,
                'media_type' => 'video',
                'original_path' => $relPath,
                'video_url' => $videoUrl,
                'is_cover' => false,
                'sort_order' => $validated['sort_order'] ?? $nextSortOrder,
            ]);

            // Sync with property virtual_tour_url for complete consistency
            $property->update(['virtual_tour_url' => $videoUrl]);
        } else {
            $media = PropertyMedia::create([
                'property_id' => $property->id,
                'media_type' => $validated['media_type'],
                'video_url' => $validated['video_url'] ?? null,
                'is_cover' => false,
                'sort_order' => $validated['sort_order'] ?? $nextSortOrder,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Media uploaded and stored successfully.',
            'data' => new MediaResource($media),
        ], 201);
    }

    /**
     * Reorder gallery items and toggle cover photo.
     */
    public function reorder(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|integer|exists:property_media,id',
            'items.*.sort_order' => 'required|integer|min:0',
            'items.*.is_cover' => 'nullable|boolean',
        ]);

        $property = Property::findOrFail($id);

        $itemIds = collect($request->input('items'))->pluck('id')->all();
        $unownedCount = PropertyMedia::whereIn('id', $itemIds)
            ->where('property_id', '!=', $property->id)
            ->count();

        if ($unownedCount > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot reorder media items belonging to a different property.',
            ], 422);
        }

        foreach ($request->input('items') as $item) {
            PropertyMedia::where('property_id', $property->id)
                ->where('id', $item['id'])
                ->update([
                    'sort_order' => $item['sort_order'],
                    'is_cover' => $item['is_cover'] ?? false,
                ]);
        }

        $updatedMedia = PropertyMedia::where('property_id', $property->id)
            ->orderBy('sort_order', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Gallery order updated successfully.',
            'data' => MediaResource::collection($updatedMedia),
        ]);
    }

    /**
     * Delete media item and clean up stored files.
     */
    public function destroy(int $mediaId): JsonResponse
    {
        $media = PropertyMedia::findOrFail($mediaId);

        if ($media->media_type === 'photo') {
            $this->mediaService->deleteFiles($media);
        } elseif ($media->media_type === 'video') {
            if ($media->original_path && Storage::disk('public')->exists($media->original_path)) {
                Storage::disk('public')->delete($media->original_path);
            }
            if ($media->property && ($media->property->virtual_tour_url === $media->video_url || str_contains($media->property->virtual_tour_url ?? '', $media->original_path ?? '___none___'))) {
                $media->property->update(['virtual_tour_url' => null]);
            }
        }

        $media->delete();

        return response()->json([
            'success' => true,
            'message' => 'Media deleted successfully.',
        ]);
    }

    /**
     * Upload real PDF Brochure file for a property into backend storage.
     */
    public function uploadBrochure(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf|max:30720', // max 30MB PDF
        ]);

        $property = Property::findOrFail($id);
        $file = $request->file('file');
        $filename = Str::uuid()->toString().'.pdf';
        $relFolder = "properties/{$property->id}/brochures";
        Storage::disk('public')->makeDirectory($relFolder);
        $relPath = "{$relFolder}/{$filename}";
        Storage::disk('public')->put($relPath, file_get_contents($file->getRealPath()));

        $brochureUrl = "/storage/{$relPath}";
        $property->update(['brochure_url' => $brochureUrl]);

        return response()->json([
            'success' => true,
            'message' => 'Brochure PDF uploaded successfully to backend storage.',
            'data' => [
                'brochure_url' => $brochureUrl,
            ],
        ]);
    }

    /**
     * Remove custom brochure file from storage.
     */
    public function deleteBrochure(int $id): JsonResponse
    {
        $property = Property::findOrFail($id);

        if ($property->brochure_url) {
            $parsed = parse_url($property->brochure_url, PHP_URL_PATH);
            if ($parsed) {
                $subPath = preg_replace('#^/storage/#', '', $parsed);
                if ($subPath && Storage::disk('public')->exists($subPath)) {
                    Storage::disk('public')->delete($subPath);
                }
            }
            $property->update(['brochure_url' => null]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Brochure removed.',
        ]);
    }
}
