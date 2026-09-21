<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SiteSettingController extends Controller
{
    /**
     * Get all site & CMS settings.
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => SiteSetting::getAllKeyValues(),
        ]);
    }

    /**
     * Update multiple site & CMS settings.
     */
    public function update(Request $request): JsonResponse
    {
        $settings = $request->input('settings', []);

        foreach ($settings as $key => $val) {
            $group = 'general';
            if (str_starts_with($key, 'hero_')) {
                $group = 'hero';
            } elseif (str_starts_with($key, 'agency_')) {
                $group = 'contact';
            } elseif (str_starts_with($key, 'stats_')) {
                $group = 'stats';
            }

            SiteSetting::set((string) $key, $val, $group);
        }

        return response()->json([
            'success' => true,
            'message' => 'Settings saved successfully.',
            'data' => SiteSetting::getAllKeyValues(),
        ]);
    }

    /**
     * Upload and save a hero background image.
     */
    public function uploadHeroBg(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,webp,avif|max:10240',
        ]);

        $file = $request->file('image');
        $extension = strtolower($file->getClientOriginalExtension() ?: 'jpg');
        $filename = 'hero_bg_'.Str::uuid()->toString().'.'.$extension;
        $path = $file->storeAs('cms', $filename, 'public');
        $url = Storage::url($path);

        SiteSetting::set('hero_bg_image', $url, 'hero');

        return response()->json([
            'success' => true,
            'url' => $url,
            'message' => 'Hero background image uploaded successfully.',
        ]);
    }

    /**
     * Upload an image for a location card or general CMS asset.
     */
    public function uploadLocationImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,webp,avif|max:10240',
        ]);

        $file = $request->file('image');
        $extension = strtolower($file->getClientOriginalExtension() ?: 'jpg');
        $filename = 'loc_'.Str::uuid()->toString().'.'.$extension;
        $path = $file->storeAs('cms', $filename, 'public');
        $url = Storage::url($path);

        return response()->json([
            'success' => true,
            'url' => $url,
            'message' => 'Location photo uploaded successfully.',
        ]);
    }
}
