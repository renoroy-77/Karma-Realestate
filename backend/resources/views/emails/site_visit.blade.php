<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; padding: 24px; color: #1e293b; }
        .box { max-width: 560px; margin: 0 auto; background: #fff; border-radius: 8px; border: 1px solid #e2e8f0; padding: 24px; }
        h2 { color: #0f172a; margin-top: 0; }
        .table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        .table td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; }
        .label { font-weight: 600; color: #64748b; width: 35%; }
    </style>
</head>
<body>
    <div class="box">
        <h2>🗓 New Site Visit Scheduled</h2>
        <p>A customer has booked an in-person site visit through the KARMA Real Estate website.</p>
        
        <table class="table">
            <tr>
                <td class="label">Property:</td>
                <td><strong>{{ $property->title ?? 'N/A' }}</strong> ({{ $property->locality ?? '' }})</td>
            </tr>
            <tr>
                <td class="label">Visitor Name:</td>
                <td>{{ $visit->visitor_name }}</td>
            </tr>
            <tr>
                <td class="label">Email:</td>
                <td><a href="mailto:{{ $visit->visitor_email }}">{{ $visit->visitor_email }}</a></td>
            </tr>
            <tr>
                <td class="label">Phone:</td>
                <td><a href="tel:{{ $visit->visitor_phone }}">{{ $visit->visitor_phone }}</a></td>
            </tr>
            <tr>
                <td class="label">Preferred Date:</td>
                <td><strong>{{ $visit->preferred_date?->format('d M Y') }}</strong></td>
            </tr>
            <tr>
                <td class="label">Time Slot:</td>
                <td>{{ ucfirst($visit->preferred_time_slot) }}</td>
            </tr>
            @if($visit->notes)
            <tr>
                <td class="label">Customer Notes:</td>
                <td>{{ $visit->notes }}</td>
            </tr>
            @endif
        </table>

        <p style="margin-top: 24px; font-size: 13px; color: #64748b;">
            Log in to the KARMA Admin Panel to confirm or reschedule this appointment.
        </p>
    </div>
</body>
</html>
