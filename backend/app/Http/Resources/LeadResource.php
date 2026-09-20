<?php

namespace App\Http\Resources;

use App\Enums\LeadStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeadResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'locality' => $this->locality,
            'source' => $this->source,
            'status' => $this->status instanceof LeadStatus ? $this->status->value : (string) $this->status,
            'email_verified' => (bool) $this->email_verified,
            'views_count' => (int) ($this->property_views_count ?? $this->propertyViews()->count()),
            'timeline' => $this->whenLoaded('activities', function () {
                return $this->activities->map(fn ($act) => [
                    'id' => $act->id,
                    'type' => $act->type,
                    'from' => $act->from,
                    'to' => $act->to,
                    'description' => $act->description,
                    'author' => $act->adminUser ? $act->adminUser->name : 'System',
                    'created_at' => $act->created_at?->toISOString(),
                ]);
            }),
            'activity_timeline' => $this->whenLoaded('activities', function () {
                return $this->activities->map(fn ($act) => [
                    'id' => $act->id,
                    'type' => $act->type,
                    'from' => $act->from,
                    'to' => $act->to,
                    'description' => $act->description,
                    'author' => $act->adminUser ? $act->adminUser->name : 'System',
                    'created_at' => $act->created_at?->toISOString(),
                ]);
            }),
            'notes' => $this->whenLoaded('notes', function () {
                return $this->notes->map(fn ($n) => [
                    'id' => $n->id,
                    'note' => $n->note,
                    'author' => $n->adminUser ? $n->adminUser->name : 'Admin',
                    'created_at' => $n->created_at?->toISOString(),
                ]);
            }),
            'viewed_properties' => $this->whenLoaded('propertyViews', function () {
                return $this->propertyViews->map(fn ($pv) => [
                    'property_id' => $pv->property_id,
                    'property_title' => $pv->property?->title,
                    'property_slug' => $pv->property?->slug,
                    'locality' => $pv->property?->locality,
                    'view_count' => $pv->view_count,
                    'first_viewed_at' => $pv->first_viewed_at?->toISOString(),
                    'last_viewed_at' => $pv->last_viewed_at?->toISOString(),
                ]);
            }),
            'site_visits' => $this->whenLoaded('siteVisits', function () {
                return $this->siteVisits->map(fn ($sv) => [
                    'id' => $sv->id,
                    'property_id' => $sv->property_id,
                    'property_title' => $sv->property?->title,
                    'preferred_date' => $sv->preferred_date?->format('Y-m-d'),
                    'preferred_time_slot' => $sv->preferred_time_slot,
                    'booking_status' => $sv->booking_status,
                    'notes' => $sv->notes,
                    'created_at' => $sv->created_at?->toISOString(),
                ]);
            }),
            'wishlist' => $this->whenLoaded('wishlistProperties', function () {
                return PropertyListResource::collection($this->wishlistProperties);
            }),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
