<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'purpose' => 'required|in:sale,rent,lease',
            'type' => 'required|in:land,house,flat,warehouse,commercial',
            'price' => 'required|numeric|min:0',
            'price_basis' => 'nullable|string|in:total,per_cent,per_sqft,per_month',
            'negotiable' => 'nullable|boolean',
            'land_area' => 'nullable|numeric|min:0',
            'land_area_unit' => 'nullable|string|in:cent,acre,sqft',
            'building_area_sqft' => 'nullable|numeric|min:0',
            'bedrooms' => 'nullable|integer|min:0',
            'bathrooms' => 'nullable|integer|min:0',
            'amenities' => 'nullable|array',
            'amenities.*' => 'string|max:100',
            'pros' => 'nullable|array',
            'pros.*' => 'string|max:255',
            'cons' => 'nullable|array',
            'cons.*' => 'string|max:255',
            'description' => 'nullable|string',
            'locality' => 'required|string|max:255',
            'district' => 'nullable|string|max:100',
            'address_line' => 'nullable|string|max:500',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'virtual_tour_url' => 'nullable|url|max:500',
            'brochure_url' => 'nullable|string|max:500',
            'rera_number' => 'nullable|string|max:100',
            'land_classification' => 'nullable|string|max:100',
            'status' => 'nullable|in:available,under_negotiation,sold,rented,leased,delisted',
            'is_published' => 'nullable|boolean',
            'is_featured' => 'nullable|boolean',

            // SEO Meta Tags
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:1000',

            // Confidential Owner Information
            'owner_name' => 'nullable|string|max:255',
            'owner_phone' => 'nullable|string|max:50',
            'owner_email' => 'nullable|email|max:255',
            'owner_notes' => 'nullable|string|max:2000',
        ];
    }
}
