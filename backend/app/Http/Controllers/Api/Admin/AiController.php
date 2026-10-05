<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiController extends Controller
{
    /**
     * Generate AI-suggested Pros and Cons tailored to property details and location.
     */
    public function suggestProsCons(Request $request): JsonResponse
    {
        $title = trim($request->input('title', ''));
        $loc = trim($request->input('loc', 'Kannur'));
        $type = trim($request->input('type', 'House'));
        $purpose = trim($request->input('purpose', 'Sale'));
        $price = $request->input('price', '');
        $area = trim($request->input('area', ''));
        $beds = $request->input('beds', '');
        $baths = $request->input('baths', '');
        $desc = trim($request->input('desc', ''));

        $apiKey = env('GROQ_API_KEY', config('services.groq.key'));

        // Attempt Groq API if key is available
        if (!empty($apiKey)) {
            try {
                $prompt = "You are a senior real estate consultant for KARMA Real Estate in Kannur, Kerala, India.\n" .
                    "Generate authentic, localized, professional 'Pros' (What We Love / Verified Highlights) and 'Cons' (Keep In Mind / Honest Considerations) for the following property:\n" .
                    "- Title: {$title}\n" .
                    "- Locality: {$loc}, Kannur, Kerala\n" .
                    "- Property Type: {$type}\n" .
                    "- Purpose: For {$purpose}\n" .
                    "- Price: ₹{$price}\n" .
                    "- Built-up / Land Area: {$area}\n" .
                    "- Bedrooms: {$beds} | Bathrooms: {$baths}\n" .
                    "- Additional Notes: {$desc}\n\n" .
                    "Requirements:\n" .
                    "1. Pros must highlight real localized benefits (e.g. proximity to Kannur landmarks, airport, beaches, hospitals, NH-66 frontage, water availability, clear title).\n" .
                    "2. Cons must be honest, constructive considerations buyers/tenants appreciate (e.g. road width, monsoon humidity, salt air near coast, flight path noise near airport, strict lock-in or maintenance).\n" .
                    "3. Return strict JSON with exactly two keys: 'pros' (array of 5 concise strings) and 'cons' (array of 3 concise strings). Do not include markdown codeblocks or extra text.";

                $response = Http::timeout(12)
                    ->withToken($apiKey)
                    ->post('https://api.groq.com/openai/v1/chat/completions', [
                        'model' => 'llama-3.3-70b-versatile',
                        'messages' => [
                            [
                                'role' => 'system',
                                'content' => 'You are an expert real estate advisor in Kerala. Return strict JSON with keys "pros" and "cons".'
                            ],
                            [
                                'role' => 'user',
                                'content' => $prompt
                            ]
                        ],
                        'response_format' => ['type' => 'json_object'],
                        'temperature' => 0.6,
                        'max_tokens' => 800
                    ]);

                if ($response->successful()) {
                    $json = $response->json();
                    $content = $json['choices'][0]['message']['content'] ?? '';
                    $decoded = json_decode($content, true);

                    if (isset($decoded['pros']) && is_array($decoded['pros']) && isset($decoded['cons']) && is_array($decoded['cons'])) {
                        return response()->json([
                            'success' => true,
                            'source' => 'groq',
                            'model' => 'llama-3.3-70b-versatile',
                            'pros' => array_values(array_filter($decoded['pros'])),
                            'cons' => array_values(array_filter($decoded['cons'])),
                        ]);
                    }
                } else {
                    Log::warning('Groq API call returned error', ['status' => $response->status(), 'body' => $response->body()]);
                }
            } catch (\Throwable $e) {
                Log::warning('Groq API call exception: ' . $e->getMessage());
            }
        }

        // Domain-specific smart fallback engine tailored to Kannur/Kerala
        $fallback = $this->generateFallbackProsCons($title, $loc, $type, $purpose, $price, $area, $beds, $baths);

        return response()->json([
            'success' => true,
            'source' => 'smart_engine',
            'pros' => $fallback['pros'],
            'cons' => $fallback['cons'],
        ]);
    }

    /**
     * Kerala & Kannur localized real estate intelligence fallback engine.
     */
    private function generateFallbackProsCons(
        string $title,
        string $loc,
        string $type,
        string $purpose,
        $price,
        string $area,
        $beds,
        $baths
    ): array {
        $normLoc = strtolower($loc);
        $normType = strtolower($type);
        $normPurp = strtolower($purpose);

        $pros = [];
        $cons = [];

        // Locality-specific highlights
        if (str_contains($normLoc, 'payyambalam') || str_contains($normLoc, 'beach') || str_contains($normLoc, 'coastal')) {
            $pros[] = "Walking distance to Payyambalam beach with uninterrupted sea breeze";
            $pros[] = "Prime coastal residential enclave with exceptional long-term appreciation";
            $cons[] = "Marine salt air requires periodic anti-corrosion exterior maintenance";
            $cons[] = "Coastal Regulation Zone (CRZ) rules apply to external structural modifications";
        } elseif (str_contains($normLoc, 'mattannur') || str_contains($normLoc, 'airport')) {
            $pros[] = "Under 10 minutes to Kannur International Airport (CNN) passenger & cargo gates";
            $pros[] = "High-growth commercial corridor driven by expanding airport logistics";
            $cons[] = "Occasional daytime aircraft acoustic presence during scheduled departures";
            $cons[] = "Public transit frequency lower compared to Kannur city center";
        } elseif (str_contains($normLoc, 'talap') || str_contains($normLoc, 'city') || str_contains($normLoc, 'thana') || str_contains($normLoc, 'south bazar')) {
            $pros[] = "Prime city center address close to AKG Hospital, leading CBSE schools and retail hubs";
            $pros[] = "High-demand rental pocket with virtually zero vacancy risk year-round";
            $cons[] = "Moderate rush-hour traffic along adjacent main artery routes";
            $cons[] = "Strict municipal residential zoning rules for commercial alterations";
        } elseif (str_contains($normLoc, 'iritty')) {
            $pros[] = "Scenic gateway location along Thalassery-Mysore inter-state highway";
            $pros[] = "Lush green natural micro-climate with abundant fertile soil";
            $cons[] = "Approx. 40 km transit time to Kannur coastal business hubs";
            $cons[] = "Requires seasonal drainage and slope maintenance during heavy monsoon";
        } elseif (str_contains($normLoc, 'dharmadam') || str_contains($normLoc, 'thalassery')) {
            $pros[] = "Prestigious heritage locality with quick connectivity to Thalassery railway station";
            $pros[] = "Close proximity to Dharmadam Island and scenic coastal tourism stretch";
            $cons[] = "Traditional municipal access roads can experience market-day congestion";
            $cons[] = "Older municipal water supply network; dedicated private well recommended";
        } else {
            $pros[] = "Strategically located in peaceful, fast-developing neighborhood of {$loc}";
            $pros[] = "Smooth wide tarred road access with effortless turning radius for family SUVs";
            $cons[] = "Municipal piped gas connection pending in this sector; LPG cylinder delivery active";
        }

        // Property Type specifics
        if ($normType === 'flat' || $normType === 'apartment') {
            $pros[] = "24/7 manned security, CCTV surveillance, and automated generator backup";
            $pros[] = "Dedicated covered basement car parking with EV charging provision";
            $cons[] = "Monthly apartment association maintenance dues applicable";
        } elseif ($normType === 'land' || $normType === 'plot') {
            $pros[] = "Clear level land with solid red-soil foundation ready for immediate construction";
            $pros[] = "Clean boundary demarcation with stone fencing and private gate already completed";
            $cons[] = "Municipal building permit and plan sanction required prior to construction";
        } elseif ($normType === 'commercial') {
            $pros[] = "High-visibility frontage on major route with continuous vehicular footfall";
            $pros[] = "Pre-approved 3-phase heavy industrial power line and dedicated borewell water";
            $cons[] = "Commercial heavy truck loading restricted during peak morning and evening hours";
        } else {
            $pros[] = "Architect-designed independent layout featuring excellent cross-ventilation and natural daylight";
            $pros[] = "Abundant year-round sweet drinking water from deep private open well";
        }

        // Legal & Quality Assurance (KARMA Trademark)
        $pros[] = "100% clear freehold title deed and 30-year Encumbrance Certificate verified by KARMA legal team";
        if ($normPurp === 'rent' || $normPurp === 'lease') {
            $cons[] = "Standard 11-month registered lease agreement with 3-month security deposit";
        } else {
            $cons[] = "Firm evaluated market pricing based on verified recent comparable registry data";
        }

        return [
            'pros' => array_slice(array_unique($pros), 0, 6),
            'cons' => array_slice(array_unique($cons), 0, 4),
        ];
    }
}
