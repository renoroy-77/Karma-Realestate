<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Services\BrochurePdfService;
use Illuminate\Http\Response;

class BrochureController extends Controller
{
    public function __construct(
        protected BrochurePdfService $pdfService
    ) {}

    /**
     * Generate and download branded A4 PDF brochure for a property.
     */
    public function generate(int $id): Response
    {
        $property = Property::with(['coverPhoto', 'media'])->findOrFail($id);

        $pdf = $this->pdfService->generate($property);

        return $pdf->download("KARMA-{$property->slug}-Brochure.pdf");
    }
}
