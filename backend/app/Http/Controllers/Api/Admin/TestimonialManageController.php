<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Testimonial;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
            'is_active' => 'nullable|boolean',
        ]);

        $testimonial = Testimonial::create([
            'client_name' => $validated['client_name'],
            'client_role' => $validated['client_role'],
            'content' => $validated['content'],
            'rating' => $validated['rating'] ?? 5,
            'photo_url' => $validated['photo_url'] ?? null,
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
            'is_active' => 'nullable|boolean',
        ]);

        $testimonial->update([
            'client_name' => $validated['client_name'],
            'client_role' => $validated['client_role'],
            'content' => $validated['content'],
            'rating' => $validated['rating'] ?? $testimonial->rating,
            'photo_url' => $validated['photo_url'] ?? $testimonial->photo_url,
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
        $testimonial->is_active = !$testimonial->is_active;
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
