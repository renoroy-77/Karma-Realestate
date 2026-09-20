<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{ $property->title }} — KARMA Brochure</title>
    <style>
        @page {
            margin: 0;
            padding: 0;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1e293b;
            margin: 0;
            padding: 0;
            background-color: #ffffff;
            font-size: 13px;
            line-height: 1.5;
            position: relative;
        }
        /* Background Watermark */
        .watermark-container {
            position: fixed;
            top: 35%;
            left: 5%;
            right: 5%;
            text-align: center;
            opacity: 0.07;
            transform: rotate(-35deg);
            z-index: -1000;
        }
        .watermark-text {
            font-size: 55px;
            font-weight: 900;
            letter-spacing: 12px;
            color: #0f172a;
            text-transform: uppercase;
        }
        .header {
            background-color: #0f172a;
            color: #ffffff;
            padding: 30px 40px;
        }
        .brand-title {
            font-size: 26px;
            font-weight: 800;
            letter-spacing: 3px;
            margin: 0;
            color: #f8fafc;
        }
        .brand-sub {
            font-size: 11px;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #94a3b8;
            margin-top: 4px;
        }
        .watermark-badge {
            float: right;
            background-color: rgba(220, 38, 38, 0.15);
            color: #ef4444;
            border: 1px solid #ef4444;
            padding: 4px 10px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            border-radius: 4px;
            letter-spacing: 1px;
        }
        .container {
            padding: 30px 40px;
        }
        .property-title {
            font-size: 22px;
            font-weight: 700;
            color: #0f172a;
            margin: 0 0 8px 0;
        }
        .badge {
            display: inline-block;
            padding: 4px 10px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            border-radius: 4px;
            background-color: #e2e8f0;
            color: #334155;
            margin-right: 6px;
        }
        .badge-sale {
            background-color: #dbeafe;
            color: #1d4ed8;
        }
        .price-tag {
            font-size: 24px;
            font-weight: 800;
            color: #047857;
            margin: 16px 0;
        }
        .specs-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .specs-table td {
            padding: 10px 14px;
            border: 1px solid #e2e8f0;
            font-size: 12px;
        }
        .spec-label {
            font-weight: 700;
            color: #64748b;
            background-color: #f8fafc;
            width: 25%;
        }
        .spec-val {
            color: #0f172a;
            font-weight: 600;
            width: 25%;
        }
        .section-heading {
            font-size: 14px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #0f172a;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 4px;
            margin: 24px 0 12px 0;
        }
        .amenities-list {
            margin: 0;
            padding-left: 20px;
        }
        .amenities-list li {
            margin-bottom: 4px;
        }
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background-color: #0f172a;
            color: #94a3b8;
            padding: 16px 40px;
            font-size: 11px;
        }
        .footer table {
            width: 100%;
        }
    </style>
</head>
<body>
    <!-- Semi-transparent Page Watermark -->
    <div class="watermark-container">
        <div class="watermark-text">KARMA REAL ESTATE</div>
        <div style="font-size: 24px; letter-spacing: 8px; margin-top: 10px;">CONFIDENTIAL BROCHURE</div>
    </div>

    <div class="header">
        <div class="watermark-badge">OFFICIAL VERIFIED BROCHURE</div>
        <div class="brand-title">KARMA</div>
        <div class="brand-sub">Luxury Real Estate • Kannur, Kerala</div>
    </div>

    <div class="container">
        <div>
            <span class="badge badge-sale">{{ strtoupper($property->purpose) }}</span>
            <span class="badge">{{ strtoupper($property->type) }}</span>
            <span class="badge">{{ strtoupper($property->status) }}</span>
        </div>

        <h1 class="property-title" style="margin-top: 12px;">{{ $property->title }}</h1>
        <div style="color: #64748b; font-size: 13px;">📍 {{ $property->locality }}, {{ $property->district }}</div>

        <div class="price-tag">
            ₹{{ number_format($property->price, 0) }}
            @if($property->price_basis && $property->price_basis !== 'total')
                <span style="font-size: 14px; font-weight: normal; color: #64748b;">/ {{ str_replace('_', ' ', $property->price_basis) }}</span>
            @endif
            @if($property->negotiable)
                <span style="font-size: 12px; font-weight: normal; color: #0284c7; margin-left: 8px;">(Negotiable)</span>
            @endif
        </div>

        <div class="section-heading">Property Specifications</div>
        <table class="specs-table">
            <tr>
                <td class="spec-label">Land Area</td>
                <td class="spec-val">{{ $property->land_area ? $property->land_area . ' ' . $property->land_area_unit : 'N/A' }}</td>
                <td class="spec-label">Built-up Area</td>
                <td class="spec-val">{{ $property->building_area_sqft ? $property->building_area_sqft . ' Sq.Ft' : 'N/A' }}</td>
            </tr>
            <tr>
                <td class="spec-label">Bedrooms</td>
                <td class="spec-val">{{ $property->bedrooms ?? 'N/A' }}</td>
                <td class="spec-label">Bathrooms</td>
                <td class="spec-val">{{ $property->bathrooms ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td class="spec-label">Classification</td>
                <td class="spec-val">{{ $property->land_classification ?? 'Residential' }}</td>
                <td class="spec-label">RERA ID</td>
                <td class="spec-val">{{ $property->rera_number ?? 'Not Applicable' }}</td>
            </tr>
        </table>

        @if(!empty($property->description))
            <div class="section-heading">Overview</div>
            <p style="color: #334155; line-height: 1.6;">{{ $property->description }}</p>
        @endif

        @if(!empty($property->amenities) && is_array($property->amenities))
            <div class="section-heading">Key Amenities</div>
            <table style="width: 100%;">
                <tr>
                    @foreach(array_chunk($property->amenities, 3) as $chunk)
                        <td style="vertical-align: top; width: 33%;">
                            <ul class="amenities-list">
                                @foreach($chunk as $amenity)
                                    <li>{{ $amenity }}</li>
                                @endforeach
                            </ul>
                        </td>
                    @endforeach
                </tr>
            </table>
        @endif

        @if(!empty($property->pros) && is_array($property->pros))
            <div class="section-heading">Highlights & Advantages</div>
            <ul>
                @foreach($property->pros as $pro)
                    <li style="color: #047857; margin-bottom: 4px;">✔ {{ $pro }}</li>
                @endforeach
            </ul>
        @endif
    </div>

    <div class="footer">
        <table>
            <tr>
                <td><strong>KARMA Real Estate</strong> • Kannur, Kerala</td>
                <td style="text-align: right;">Contact: +91 98765 43210 | info@karmarealestate.in</td>
            </tr>
        </table>
    </div>
</body>
</html>
