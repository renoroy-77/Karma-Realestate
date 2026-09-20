<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeocodingService
{
    protected array $kannurLocalityCoords = [
        'talap' => [11.8833, 75.3667],
        'thottada' => [11.8239, 75.4190],
        'payyanur' => [12.1000, 75.2000],
        'taliparamba' => [12.0400, 75.3500],
        'mattannur' => [11.9300, 75.5700],
        'dharmadam' => [11.7770, 75.4670],
        'thalassery' => [11.7480, 75.4890],
        'pallikkunnu' => [11.8900, 75.3600],
        'puzhathi' => [11.8800, 75.3800],
        'chalad' => [11.8850, 75.3550],
        'chovva' => [11.8600, 75.3950],
        'kannur' => [11.8745, 75.3704],
    ];

    /**
     * Resolve latitude and longitude from address or locality.
     *
     * @return array{latitude: float, longitude: float}
     */
    public function geocode(?string $address, ?string $locality = null, string $district = 'Kannur'): array
    {
        $apiKey = config('services.google_maps.api_key');

        if ($apiKey && ($address || $locality)) {
            try {
                $query = implode(', ', array_filter([$address, $locality, $district, 'Kerala, India']));
                $response = Http::timeout(5)->get('https://maps.googleapis.com/maps/api/geocode/json', [
                    'address' => $query,
                    'key' => $apiKey,
                ]);

                if ($response->successful()) {
                    $data = $response->json();
                    if (! empty($data['results'][0]['geometry']['location'])) {
                        $loc = $data['results'][0]['geometry']['location'];

                        return [
                            'latitude' => (float) $loc['lat'],
                            'longitude' => (float) $loc['lng'],
                        ];
                    }
                }
            } catch (\Throwable $e) {
                Log::warning('Google Geocoding failed: '.$e->getMessage());
            }
        }

        // Fallback to Kannur locality coordinates
        $key = strtolower(trim((string) $locality));
        foreach ($this->kannurLocalityCoords as $name => $coords) {
            if (str_contains($key, $name) || str_contains(strtolower((string) $address), $name)) {
                return [
                    'latitude' => $coords[0],
                    'longitude' => $coords[1],
                ];
            }
        }

        // Default Kannur City Center
        return [
            'latitude' => 11.8745,
            'longitude' => 75.3704,
        ];
    }
}
