<?php

namespace App\Http\Resources;

use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Property
 */
class PropertyDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isAdmin = (bool) $request->user('sanctum');
        $verifiedLead = $request->attributes->get('verified_lead');
        $isUnlocked = $isAdmin || ! empty($verifiedLead);

        $cover = $this->coverPhoto ?? $this->media->firstWhere('media_type', 'photo');
        $videoMedia = $this->media->firstWhere('media_type', 'video');

        // Schema.org RealEstateListing JSON-LD Structured Data
        $jsonLd = [
            '@context' => 'https://schema.org',
            '@type' => 'RealEstateListing',
            'name' => $this->title,
            'description' => $this->description,
            'url' => url("/properties/{$this->slug}"),
            'datePosted' => $this->created_at?->toIso8601String(),
            'price' => (float) $this->price,
            'priceCurrency' => 'INR',
            'category' => $this->type,
            'address' => [
                '@type' => 'PostalAddress',
                'addressLocality' => $this->locality,
                'addressRegion' => 'Kerala',
                'addressCountry' => 'IN',
            ],
        ];

        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'purpose' => $this->purpose,
            'type' => $this->type,
            'price' => (float) $this->price,
            'price_basis' => $this->price_basis,
            'price_formatted' => '₹'.number_format($this->price, 0),
            'negotiable' => (bool) $this->negotiable,
            'land_area' => $this->land_area ? (float) $this->land_area : null,
            'land_area_unit' => $this->land_area_unit,
            'building_area_sqft' => $this->building_area_sqft ? (float) $this->building_area_sqft : null,
            'bedrooms' => $this->bedrooms,
            'bathrooms' => $this->bathrooms,
            'amenities' => $this->amenities ?? [],
            'pros' => $this->pros ?? [],
            'cons' => $this->cons ?? [],
            'description' => $this->description,
            'locality' => $this->locality,
            'district' => $this->district,
            'is_masked' => ! $isUnlocked,
            'address_line' => $isUnlocked ? $this->address_line : null,
            'latitude' => $isUnlocked ? ($this->latitude ? (float) $this->latitude : null) : null,
            'longitude' => $isUnlocked ? ($this->longitude ? (float) $this->longitude : null) : null,
            'virtual_tour_url' => $this->virtual_tour_url,
            'video_url' => $videoMedia ? $videoMedia->video_url : $this->virtual_tour_url,
            'brochure_url' => $this->brochure_url,
            'rera_number' => $this->rera_number,
            'land_classification' => $this->land_classification,
            'status' => $this->status,
            'is_published' => (bool) $this->is_published,
            'is_featured' => (bool) $this->is_featured,
            'view_count' => (int) $this->view_count,

            // SEO Meta Tags
            'meta_title' => $this->meta_title ?: "{$this->title} in {$this->locality}, Kannur | KARMA Real Estate",
            'meta_description' => $this->meta_description ?: substr(strip_tags((string) $this->description), 0, 160),
            'json_ld' => $jsonLd,

            'cover_photo' => $cover ? [
                'thumb_url' => $cover->thumb_url,
                'medium_url' => $cover->medium_url,
                'full_url' => $cover->full_url,
            ] : null,

            // Complete Gallery & Media
            'gallery' => MediaResource::collection($this->whenLoaded('media')),
            'documents_count' => $this->confidentialDocuments()->count(),

            // Dynamic Contact & Agent Information (Editable in Admin Panel)
            'contact_name' => $this->owner_name ?: 'KARMA Official',
            'contact_phone' => $this->owner_phone ?: '+91 99957 97450',
            'contact_email' => $this->owner_email ?: 'hello@karmarealestate.in',

            // Confidential Owner Information (Admins only)
            'owner_details' => $this->when($isAdmin, function () {
                return [
                    'name' => $this->owner_name,
                    'phone' => $this->owner_phone,
                    'email' => $this->owner_email,
                    'notes' => $this->owner_notes,
                ];
            }),

            'internal_remark' => $this->when($isAdmin && $this->relationLoaded('internalRemark'), function () {
                return $this->internalRemark?->remark;
            }),
            'confidential_documents' => $this->when($isAdmin && $this->relationLoaded('confidentialDocuments'), function () {
                return DocumentResource::collection($this->confidentialDocuments);
            }),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
