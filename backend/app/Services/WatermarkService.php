<?php

namespace App\Services;

use Intervention\Image\Laravel\Facades\Image;
use setasign\Fpdi\Fpdi;

class WatermarkService
{
    protected string $watermarkText = 'CONFIDENTIAL - KARMA REAL ESTATE - AUTHORIZED USE ONLY';

    /**
     * Apply watermark to a document and return watermarked content as binary string.
     *
     * @param  string  $storagePath  Absolute or disk path to the file
     */
    public function applyWatermark(string $storagePath, string $mimeType, ?string $customText = null): string
    {
        $text = $customText ?: $this->watermarkText;

        if ($mimeType === 'application/pdf') {
            return $this->watermarkPdf($storagePath, $text);
        }

        if (str_starts_with($mimeType, 'image/')) {
            return $this->watermarkImage($storagePath, $text);
        }

        // Fallback: return raw content
        return file_get_contents($storagePath);
    }

    /**
     * Watermark PDF pages using FPDI.
     */
    protected function watermarkPdf(string $filePath, string $text): string
    {
        $pdf = new Fpdi;
        $pageCount = $pdf->setSourceFile($filePath);

        for ($pageNo = 1; $pageNo <= $pageCount; $pageNo++) {
            $templateId = $pdf->importPage($pageNo);
            $size = $pdf->getTemplateSize($templateId);

            $pdf->AddPage($size['orientation'], [$size['width'], $size['height']]);
            $pdf->useTemplate($templateId);

            // Top Header Watermark Banner
            $pdf->SetFont('Helvetica', 'B', 11);
            $pdf->SetTextColor(220, 38, 38); // Red
            $pdf->SetXY(10, 10);
            $pdf->Cell($size['width'] - 20, 8, $text, 0, 0, 'C');

            // Footer Audit Stamp
            $pdf->SetFont('Helvetica', 'I', 9);
            $pdf->SetTextColor(120, 120, 120);
            $pdf->SetXY(10, $size['height'] - 15);
            $stamp = 'KARMA Document Vault | Stamped on: '.now()->toDateTimeString();
            $pdf->Cell($size['width'] - 20, 8, $stamp, 0, 0, 'C');
        }

        return $pdf->Output('S');
    }

    /**
     * Watermark Image using Intervention Image.
     */
    protected function watermarkImage(string $filePath, string $text): string
    {
        $image = Image::read($filePath);

        // Add text stamp in top right or center
        $image->text($text, 20, 30, function ($font) {
            $font->size(16);
            $font->color('#e11d48');
        });

        return (string) $image->encode();
    }
}
