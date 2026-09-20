<?php

namespace Database\Seeders;

use App\Enums\LeadStatus;
use App\Models\AdminUser;
use App\Models\Lead;
use App\Models\LeadActivity;
use App\Models\LeadNote;
use App\Models\LeadPropertyView;
use App\Models\Property;
use App\Models\SiteVisitRequest;
use Illuminate\Database\Seeder;

class LeadSeeder extends Seeder
{
    public function run(): void
    {
        $admin = AdminUser::first();
        $adminId = $admin?->id;

        $properties = Property::take(3)->get();
        $prop1 = $properties->get(0);
        $prop2 = $properties->get(1);

        $leads = [
            [
                'name' => 'Dr. Rajesh Nambiar',
                'email' => 'rajesh.nambiar@keralahealth.org',
                'phone' => '+919447123456',
                'locality' => 'Talap',
                'source' => 'site_visit',
                'status' => 'interested',
                'email_verified' => true,
                'note' => 'Senior Surgeon at Aster MIMS. Looking for beachfront villa for retirement. Pre-approved loan of ₹2.5 Cr with SBI.',
            ],
            [
                'name' => 'Fahad Al-Qasimi / Mathew Joseph',
                'email' => 'mathew.gulfinvest@gmail.com',
                'phone' => '+971501234567',
                'locality' => 'Dubai / Kannur',
                'source' => 'otp_verify',
                'status' => 'contacted',
                'email_verified' => true,
                'note' => 'NRI investor based in Deira. Interested in logistics warehouse near Kannur Airport.',
            ],
            [
                'name' => 'Anjali Warrier',
                'email' => 'anjali.warrier@tcs.com',
                'phone' => '+919895099887',
                'locality' => 'Pallikkunnu',
                'source' => 'otp_verify',
                'status' => 'new',
                'email_verified' => true,
                'note' => 'Requested exact coordinates for Pallikkunnu penthouse.',
            ],
            [
                'name' => 'Vinod Kumar K.',
                'email' => 'vinod.k@malabartextiles.in',
                'phone' => '+919496055443',
                'locality' => 'Thalassery',
                'source' => 'manual',
                'status' => 'closed',
                'email_verified' => true,
                'note' => 'Deal closed on commercial lease. Very satisfied with KARMA service.',
            ],
        ];

        foreach ($leads as $data) {
            $noteText = $data['note'];
            unset($data['note']);

            $lead = Lead::create($data);

            if ($adminId && $noteText) {
                LeadNote::create([
                    'lead_id' => $lead->id,
                    'admin_user_id' => $adminId,
                    'note' => $noteText,
                ]);

                LeadActivity::create([
                    'lead_id' => $lead->id,
                    'admin_user_id' => $adminId,
                    'type' => 'status_change',
                    'from' => 'new',
                    'to' => $lead->status instanceof LeadStatus ? $lead->status->value : $lead->status,
                    'description' => 'Initial lead captured and status assigned.',
                    'created_at' => now()->subDays(rand(2, 5)),
                ]);
            }

            if ($prop1) {
                LeadPropertyView::create([
                    'lead_id' => $lead->id,
                    'property_id' => $prop1->id,
                    'view_count' => rand(2, 6),
                    'first_viewed_at' => now()->subDays(rand(2, 10)),
                    'last_viewed_at' => now()->subHours(rand(1, 12)),
                ]);
            }

            $isInterested = ($lead->status instanceof LeadStatus && $lead->status === LeadStatus::INTERESTED)
                || $lead->status === 'interested';

            if ($prop2 && $isInterested) {
                SiteVisitRequest::create([
                    'property_id' => $prop2->id,
                    'lead_id' => $lead->id,
                    'visitor_name' => $lead->name,
                    'visitor_email' => $lead->email,
                    'visitor_phone' => $lead->phone,
                    'preferred_date' => now()->addDays(3)->toDateString(),
                    'preferred_time_slot' => 'morning',
                    'booking_status' => 'confirmed',
                    'notes' => 'Customer requested site agent to bring title deed copies.',
                ]);
            }
        }
    }
}
