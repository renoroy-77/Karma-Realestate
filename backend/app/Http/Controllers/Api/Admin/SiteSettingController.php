<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
}
