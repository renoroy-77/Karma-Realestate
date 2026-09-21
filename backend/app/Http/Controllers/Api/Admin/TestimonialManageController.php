<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Testimonial;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class TestimonialManageController extends Controller
{
    /**
     * List all testimonials (active and inactive).
     */
    public function index(): JsonResponse
    {
        $testimonials = Testimonial::orderBy('id', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $testimonials,
        ]);
    }

    /**
     * Upload an avatar photo for client testimonial.
     */
    public function uploadAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,webp,gif|max:5120',
        ]);

        $file = $request->file('avatar');
        $extension = strtolower($file->getClientOriginalExtension() ?: 'jpg');
        $filename = 'avatar_'.Str::uuid()->toString().'.'.$extension;
        $path = $file->storeAs('testimonials/avatars', $filename, 'public');

        return response()->json([
            'success' => true,
            'url' => Storage::url($path),
            'message' => 'Avatar photo uploaded successfully.',
        ]);
    }

    /**
     * Upload a background photo for client testimonial card.
     */
    public function uploadBg(Request $request): JsonResponse
    {
        $request->validate([
            'bg_image' => 'required|image|mimes:jpeg,png,jpg,webp,avif|max:10240',
        ]);

        $file = $request->file('bg_image');
        $extension = strtolower($file->getClientOriginalExtension() ?: 'jpg');
        $filename = 'testimonial_bg_'.Str::uuid()->toString().'.'.$extension;
        $path = $file->storeAs('testimonials/backgrounds', $filename, 'public');

        return response()->json([
            'success' => true,
            'url' => Storage::url($path),
            'message' => 'Testimonial background photo uploaded successfully.',
        ]);
    }

    /**
     * Store a new testimonial.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'client_name' => 'required|string|max:255',
            'client_role' => 'required|string|max:255',
            'content' => 'required|string',
            'rating' => 'nullable|integer|min:1|max:5',
            'photo_url' => 'nullable|string|max:1000',
            'bg_image' => 'nullable|string|max:1000',
            'is_active' => 'nullable|boolean',
        ]);

        $photoUrl = $validated['photo_url'] ?? null;
        $bgImage = $validated['bg_image'] ?? null;

        if ($request->hasFile('avatar')) {
            $request->validate(['avatar' => 'image|mimes:jpeg,png,jpg,webp,gif|max:5120']);
            $file = $request->file('avatar');
            $extension = strtolower($file->getClientOriginalExtension() ?: 'jpg');
            $filename = 'avatar_'.Str::uuid()->toString().'.'.$extension;
            $path = $file->storeAs('testimonials/avatars', $filename, 'public');
            $photoUrl = Storage::url($path);
        }

        if ($request->hasFile('bg_image_file')) {
            $request->validate(['bg_image_file' => 'image|mimes:jpeg,png,jpg,webp,avif|max:10240']);
            $file = $request->file('bg_image_file');
            $extension = strtolower($file->getClientOriginalExtension() ?: 'jpg');
            $filename = 'testimonial_bg_'.Str::uuid()->toString().'.'.$extension;
            $path = $file->storeAs('testimonials/backgrounds', $filename, 'public');
            $bgImage = Storage::url($path);
        }

        $testimonial = Testimonial::create([
            'client_name' => $validated['client_name'],
            'client_role' => $validated['client_role'],
            'content' => $validated['content'],
            'rating' => $validated['rating'] ?? 5,
            'photo_url' => $photoUrl,
            'bg_image' => $bgImage,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Testimonial created successfully.',
            'data' => $testimonial,
        ], 201);
    }

    /**
     * Show a single testimonial.
     */
    public function show(int $id): JsonResponse
    {
        $testimonial = Testimonial::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $testimonial,
        ]);
    }

    /**
     * Update an existing testimonial.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $testimonial = Testimonial::findOrFail($id);

        $validated = $request->validate([
            'client_name' => 'required|string|max:255',
            'client_role' => 'required|string|max:255',
            'content' => 'required|string',
            'rating' => 'nullable|integer|min:1|max:5',
            'photo_url' => 'nullable|string|max:1000',
            'bg_image' => 'nullable|string|max:1000',
            'is_active' => 'nullable|boolean',
        ]);

        $photoUrl = $validated['photo_url'] ?? $testimonial->photo_url;
        $bgImage = array_key_exists('bg_image', $validated) ? $validated['bg_image'] : $testimonial->bg_image;

        if ($request->hasFile('avatar')) {
            $request->validate(['avatar' => 'image|mimes:jpeg,png,jpg,webp,gif|max:5120']);
            $file = $request->file('avatar');
            $extension = strtolower($file->getClientOriginalExtension() ?: 'jpg');
            $filename = 'avatar_'.Str::uuid()->toString().'.'.$extension;
            $path = $file->storeAs('testimonials/avatars', $filename, 'public');
            $photoUrl = Storage::url($path);
        }

        if ($request->hasFile('bg_image_file')) {
            $request->validate(['bg_image_file' => 'image|mimes:jpeg,png,jpg,webp,avif|max:10240']);
            $file = $request->file('bg_image_file');
            $extension = strtolower($file->getClientOriginalExtension() ?: 'jpg');
            $filename = 'testimonial_bg_'.Str::uuid()->toString().'.'.$extension;
            $path = $file->storeAs('testimonials/backgrounds', $filename, 'public');
            $bgImage = Storage::url($path);
        }

        $testimonial->update([
            'client_name' => $validated['client_name'],
            'client_role' => $validated['client_role'],
            'content' => $validated['content'],
            'rating' => $validated['rating'] ?? $testimonial->rating,
            'photo_url' => $photoUrl,
            'bg_image' => $bgImage,
            'is_active' => $request->has('is_active') ? $request->boolean('is_active') : $testimonial->is_active,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Testimonial updated successfully.',
            'data' => $testimonial,
        ]);
    }

    /**
     * Toggle active/inactive status.
     */
    public function toggle(int $id): JsonResponse
    {
        $testimonial = Testimonial::findOrFail($id);
        $testimonial->is_active = ! $testimonial->is_active;
        $testimonial->save();

        return response()->json([
            'success' => true,
            'message' => 'Status updated.',
            'data' => $testimonial,
        ]);
    }

    /**
     * Delete testimonial.
     */
    public function destroy(int $id): JsonResponse
    {
        $testimonial = Testimonial::findOrFail($id);
        $testimonial->delete();

        return response()->json([
            'success' => true,
            'message' => 'Testimonial deleted successfully.',
        ]);
    }
}
