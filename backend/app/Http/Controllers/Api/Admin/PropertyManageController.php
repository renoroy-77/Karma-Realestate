<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePropertyRequest;
use App\Http\Requests\UpdatePropertyRequest;
use App\Http\Resources\PropertyDetailResource;
use App\Models\Property;
use App\Services\GeocodingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PropertyManageController extends Controller
{
    public function __construct(
        protected GeocodingService $geocodingService
    ) {}

    /**
     * List all properties (published and unpublished) with admin filters.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->input('per_page', 15);
        $query = Property::query()
            ->with(['coverPhoto', 'media', 'internalRemark'])
            ->filtered($request->all());

        $properties = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => PropertyDetailResource::collection($properties),
            'meta' => [
                'current_page' => $properties->currentPage(),
                'last_page' => $properties->lastPage(),
                'per_page' => $properties->perPage(),
                'total' => $properties->total(),
            ],
        ]);
    }

    /**
     * Show single property with confidential docs and internal remarks.
     */
    public function show(int $id): JsonResponse
    {
        $property = Property::with(['media', 'coverPhoto', 'internalRemark', 'confidentialDocuments'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => new PropertyDetailResource($property),
        ]);
    }

    /**
     * Create a new property listing with auto-geocoding.
     */
    public function store(StorePropertyRequest $request): JsonResponse
    {
        $data = $request->validated();

        // Auto-geocode if coordinates not supplied
        if (empty($data['latitude']) || empty($data['longitude'])) {
            $coords = $this->geocodingService->geocode(
                address: $data['address_line'] ?? null,
                locality: $data['locality'] ?? null,
                district: $data['district'] ?? 'Kannur',
            );
            $data['latitude'] = $coords['latitude'];
            $data['longitude'] = $coords['longitude'];
        }

        $property = Property::create($data);
        $property->load(['coverPhoto', 'media']);

        return response()->json([
            'success' => true,
            'message' => 'Property created successfully.',
            'data' => new PropertyDetailResource($property),
        ], 201);
    }

    /**
     * Update an existing property.
     */
    public function update(UpdatePropertyRequest $request, int $id): JsonResponse
    {
        $property = Property::findOrFail($id);
        $data = $request->validated();

        // Re-geocode if address or locality changed and coordinates were not explicitly sent
        $addressChanged = isset($data['address_line']) && $data['address_line'] !== $property->address_line;
        $localityChanged = isset($data['locality']) && $data['locality'] !== $property->locality;

        if (($addressChanged || $localityChanged) && empty($data['latitude'])) {
            $coords = $this->geocodingService->geocode(
                address: $data['address_line'] ?? $property->address_line,
                locality: $data['locality'] ?? $property->locality,
                district: $data['district'] ?? $property->district,
            );
            $data['latitude'] = $coords['latitude'];
            $data['longitude'] = $coords['longitude'];
        }

        $property->update($data);
        $property->load(['coverPhoto', 'media', 'internalRemark', 'confidentialDocuments']);

        return response()->json([
            'success' => true,
            'message' => 'Property updated successfully.',
            'data' => new PropertyDetailResource($property),
        ]);
    }

    /**
     * Update property availability status.
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:available,under_negotiation,sold,rented,leased,delisted',
        ]);

        $property = Property::findOrFail($id);
        $property->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'message' => "Property status updated to '{$property->status}'.",
            'status' => $property->status,
        ]);
    }

    /**
     * Toggle property published state.
     */
    public function togglePublish(int $id): JsonResponse
    {
        $property = Property::findOrFail($id);
        $property->update(['is_published' => ! $property->is_published]);

        return response()->json([
            'success' => true,
            'message' => $property->is_published ? 'Property published to portal.' : 'Property hidden from portal.',
            'is_published' => $property->is_published,
        ]);
    }

    /**
     * Soft delete a property.
     */
    public function destroy(int $id): JsonResponse
    {
        $property = Property::findOrFail($id);
        $property->delete();

        return response()->json([
            'success' => true,
            'message' => 'Property deleted successfully.',
        ]);
    }
}
