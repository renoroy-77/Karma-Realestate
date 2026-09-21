<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\PropertyListResource;
use App\Models\ContactMessage;
use App\Models\Lead;
use App\Models\Property;
use App\Models\SiteSetting;
use App\Models\Testimonial;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    /**
     * Homepage composite endpoint: Hero, Featured, Recently Added, Type counts, Testimonials, & Contact info.
     */
    public function index(): JsonResponse
    {
        // 1. Featured Properties
        $featured = Property::published()
            ->featured()
            ->with(['coverPhoto', 'media'])
            ->latest()
            ->limit(6)
            ->get();

        // If no featured explicitly tagged, fallback to latest 4
        if ($featured->isEmpty()) {
            $featured = Property::published()
                ->with(['coverPhoto', 'media'])
                ->latest()
                ->limit(4)
                ->get();
        }

        // 2. Recently Added
        $recentlyAdded = Property::published()
            ->with(['coverPhoto', 'media'])
            ->latest()
            ->limit(6)
            ->get();

        // 3. Browse by Property Type counts
        $typeCounts = Property::published()
            ->selectRaw('type, count(*) as count')
            ->groupBy('type')
            ->pluck('count', 'type');

        $propertyTypes = [
            ['type' => 'land', 'label' => 'Plots & Land', 'count' => $typeCounts['land'] ?? 0],
            ['type' => 'house', 'label' => 'Luxury Villas & Houses', 'count' => $typeCounts['house'] ?? 0],
            ['type' => 'flat', 'label' => 'Apartments & Flats', 'count' => $typeCounts['flat'] ?? 0],
            ['type' => 'warehouse', 'label' => 'Commercial Warehouses', 'count' => $typeCounts['warehouse'] ?? 0],
            ['type' => 'commercial', 'label' => 'Showrooms & Commercial', 'count' => $typeCounts['commercial'] ?? 0],
        ];

        // 4. Testimonials
        $testimonials = Testimonial::where('is_active', true)
            ->latest()
            ->take(8)
            ->get(['id', 'client_name', 'client_role', 'content', 'rating', 'photo_url', 'bg_image']);

        return response()->json([
            'success' => true,
            'data' => [
                'hero_banners' => PropertyListResource::collection($featured->take(3)),
                'hero_cms' => [
                    'headline' => SiteSetting::get('hero_headline', 'Find Your Perfect Property in Kerala'),
                    'subheadline' => SiteSetting::get('hero_subheadline', 'Discover 1000+ verified properties across Kerala. Search by location, budget & lifestyle.'),
                    'announcement' => SiteSetting::get('hero_announcement', '🔥 Kannur Airport Corridor Commercial Lands Available'),
                    'stats_properties' => SiteSetting::get('stats_properties', '1,000+'),
                    'stats_clients' => SiteSetting::get('stats_clients', '850+'),
                    'stats_volume' => SiteSetting::get('stats_volume', '₹250+ Cr'),
                ],
                'featured_properties' => PropertyListResource::collection($featured),
                'recently_added' => PropertyListResource::collection($recentlyAdded),
                'browse_by_type' => $propertyTypes,
                'testimonials' => $testimonials,
                'contact_info' => [
                    'agency' => SiteSetting::get('agency_name', 'KARMA Real Estate'),
                    'phone' => SiteSetting::get('agency_phone', '+91 98765 43210'),
                    'whatsapp' => SiteSetting::get('agency_whatsapp', '+919876543210'),
                    'email' => SiteSetting::get('agency_email', 'info@karmarealestate.in'),
                    'office_address' => SiteSetting::get('agency_address', 'KARMA Tower, 2nd Floor, South Bazar, Talap Road, Kannur, Kerala 670002'),
                ],
            ],
        ]);
    }

    /**
     * Public Contact Form submission.
     */
    public function contact(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'subject' => 'nullable|string|max:255',
            'message' => 'required|string|max:5000',
        ]);

        $message = ContactMessage::create($validated);

        // Auto-capture as lead in CRM
        Lead::firstOrCreate(
            ['email' => $validated['email']],
            [
                'name' => $validated['name'],
                'phone' => $validated['phone'] ?? null,
                'source' => 'manual',
                'status' => 'new',
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Thank you for contacting KARMA Real Estate. Our team will reach out to you shortly.',
            'id' => $message->id,
        ], 201);
    }
}
