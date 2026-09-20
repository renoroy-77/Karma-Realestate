<?php

namespace App\Services;

use App\Models\PropertyMedia;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Laravel\Facades\Image;

class MediaOptimizationService
{
    /**
     * Process and store an uploaded image into 3 responsive WebP sizes.
     */
    public function processAndStore(UploadedFile $file, int $propertyId): array
    {
        $baseFolder = "properties/{$propertyId}";
        $filename = Str::uuid()->toString();

        // Ensure directories exist on public disk
        Storage::disk('public')->makeDirectory("{$baseFolder}/thumb");
        Storage::disk('public')->makeDirectory("{$baseFolder}/medium");
        Storage::disk('public')->makeDirectory("{$baseFolder}/full");
        Storage::disk('public')->makeDirectory("{$baseFolder}/original");

        // 1. Store original
        $originalExt = $file->getClientOriginalExtension() ?: 'jpg';
        $originalRelPath = "{$baseFolder}/original/{$filename}.{$originalExt}";
        Storage::disk('public')->put($originalRelPath, file_get_contents($file->getRealPath()));

        // 2. Generate responsive versions with fallback
        $manager = app(\Intervention\Image\ImageManager::class);

        try {
            $fullImage = $manager->decodePath($file->getRealPath());
            if ($fullImage->width() > 1600) {
                $fullImage->scaleDown(width: 1600);
            }
            $fullRelPath = "{$baseFolder}/full/{$filename}.webp";
            Storage::disk('public')->put($fullRelPath, (string) $fullImage->encodeUsingFileExtension('webp'));
        } catch (\Throwable $e) {
            $fullRelPath = $originalRelPath;
        }

        try {
            $mediumImage = $manager->decodePath($file->getRealPath());
            if ($mediumImage->width() > 800) {
                $mediumImage->scaleDown(width: 800);
            }
            $mediumRelPath = "{$baseFolder}/medium/{$filename}.webp";
            Storage::disk('public')->put($mediumRelPath, (string) $mediumImage->encodeUsingFileExtension('webp'));
        } catch (\Throwable $e) {
            $mediumRelPath = $originalRelPath;
        }

        try {
            $thumbImage = $manager->decodePath($file->getRealPath());
            if ($thumbImage->width() > 400) {
                $thumbImage->scaleDown(width: 400);
            }
            $thumbRelPath = "{$baseFolder}/thumb/{$filename}.webp";
            Storage::disk('public')->put($thumbRelPath, (string) $thumbImage->encodeUsingFileExtension('webp'));
        } catch (\Throwable $e) {
            $thumbRelPath = $originalRelPath;
        }

        return [
            'original_path' => $originalRelPath,
            'thumb_path' => $thumbRelPath,
            'medium_path' => $mediumRelPath,
            'full_path' => $fullRelPath,
        ];
    }

    /**
     * Delete files associated with a PropertyMedia record.
     */
    public function deleteFiles(PropertyMedia $media): void
    {
        $paths = [
            $media->original_path,
            $media->thumb_path,
            $media->medium_path,
            $media->full_path,
        ];

        foreach ($paths as $path) {
            if ($path && Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        }
    }
}
