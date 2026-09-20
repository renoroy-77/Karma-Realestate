<?php

namespace App\Services;

use App\Models\Property;
use Barryvdh\DomPDF\Facade\Pdf;

class BrochurePdfService
{
    /**
     * Generate branded PDF brochure for a property.
     *
     * @return \Barryvdh\DomPDF\PDF
     */
    public function generate(Property $property)
    {
        $property->loadMissing(['media', 'coverPhoto']);

        $pdf = Pdf::loadView('pdf.brochure', [
            'property' => $property,
        ])->setPaper('a4', 'portrait');

        return $pdf;
    }
}
