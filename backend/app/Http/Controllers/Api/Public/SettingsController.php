<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\JsonResponse;

class SettingsController extends Controller
{
    /**
     * Return public application configuration and agency contact details.
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'agency_name' => SiteSetting::get('agency_name', 'KARMA Real Estate'),
                'tagline' => SiteSetting::get('hero_headline', 'Premium Properties & Investments in Kannur'),
                'hero_headline' => SiteSetting::get('hero_headline', 'Find Your Perfect Property in Kerala'),
                'hero_subheadline' => SiteSetting::get('hero_subheadline', 'Discover 1000+ verified properties across Kerala. Search by location, budget & lifestyle.'),
                'hero_announcement' => SiteSetting::get('hero_announcement', '🔥 Kannur Airport Corridor Commercial Lands Available'),
                'phone' => SiteSetting::get('agency_phone', '+91 98765 43210'),
                'whatsapp' => SiteSetting::get('agency_whatsapp', '+919876543210'),
                'email' => SiteSetting::get('agency_email', 'info@karmarealestate.in'),
                'stats_properties' => SiteSetting::get('stats_properties', '1,000+'),
                'stats_clients' => SiteSetting::get('stats_clients', '850+'),
                'stats_volume' => SiteSetting::get('stats_volume', '₹250+ Cr'),
                'address' => [
                    'line1' => SiteSetting::get('agency_address', 'KARMA Tower, 2nd Floor, South Bazar, Talap Road, Kannur, Kerala 670002'),
                    'locality' => 'South Bazar, Talap Road',
                    'city' => 'Kannur',
                    'state' => 'Kerala',
                    'pincode' => '670002',
                ],
                'localities' => [
                    'Talap',
                    'Thottada',
                    'Payyanur',
                    'Taliparamba',
                    'Mattannur',
                    'Dharmadam',
                    'Thalassery',
                    'Pallikkunnu',
                    'Puzhathi',
                    'Chalad',
                    'Chovva',
                ],
                'property_types' => [
                    ['value' => 'land', 'label' => 'Land / Plot'],
                    ['value' => 'house', 'label' => 'Independent Villa / House'],
                    ['value' => 'flat', 'label' => 'Apartment / Flat'],
                    ['value' => 'warehouse', 'label' => 'Warehouse / Godown'],
                    ['value' => 'commercial', 'label' => 'Commercial Building / Shop'],
                ],
                'purposes' => [
                    ['value' => 'sale', 'label' => 'For Sale'],
                    ['value' => 'rent', 'label' => 'For Rent'],
                    ['value' => 'lease', 'label' => 'For Lease'],
                ],
            ],
        ]);
    }
}
