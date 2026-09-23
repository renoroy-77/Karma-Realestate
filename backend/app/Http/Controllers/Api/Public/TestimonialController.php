<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Testimonial;
use Illuminate\Http\JsonResponse;

class TestimonialController extends Controller
{
    /**
     * Return active public testimonials.
     */
    public function index(): JsonResponse
    {
        $testimonials = Testimonial::where('is_active', true)
            ->orderBy('id', 'desc')
            ->take(25)
            ->get(['id', 'client_name', 'client_role', 'content', 'rating', 'photo_url', 'bg_image']);

        return response()->json([
            'success' => true,
            'data' => $testimonials,
        ]);
    }
}
