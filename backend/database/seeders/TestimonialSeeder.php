<?php

namespace Database\Seeders;

use App\Models\Testimonial;
use Illuminate\Database\Seeder;

class TestimonialSeeder extends Seeder
{
    public function run(): void
    {
        $testimonials = [
            [
                'client_name' => 'Dr. K. Radhakrishnan',
                'client_role' => 'Cardiologist, Kannur Medical College',
                'content' => 'KARMA handled our Talap commercial clinic purchase with utmost transparency. The document verification and title clearance were done in less than 48 hours.',
                'rating' => 5,
                'photo_url' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
                'bg_image' => 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80',
                'is_active' => true,
            ],
            [
                'client_name' => 'Faisal Mohammed',
                'client_role' => 'NRI Business Owner, Abu Dhabi',
                'content' => 'Finding sea-view luxury land in Payyambalam, Kannur while living in the UAE was effortless with KARMA. The OTP-unlocked details and drone video gave me complete confidence.',
                'rating' => 5,
                'photo_url' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
                'is_active' => true,
            ],
            [
                'client_name' => 'Adv. Meenakshi Menon',
                'client_role' => 'High Court Advocate',
                'content' => 'As a legal practitioner, I was thoroughly impressed by KARMA’s confidential document vault and encumbrance tracking. Absolutely professional service.',
                'rating' => 5,
                'photo_url' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
                'is_active' => true,
            ],
            [
                'client_name' => 'K.V. Sasidharan',
                'client_role' => 'Retd. PWD Executive Engineer, Payyanur',
                'content' => 'The honest pros and cons report saved us from buying a plot in a water-logging zone. Only KARMA has this level of integrity in Malabar real estate.',
                'rating' => 5,
                'photo_url' => 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
                'is_active' => true,
            ],
            [
                'client_name' => 'Mathew & Mini Joseph',
                'client_role' => 'IT Executives, Bangalore / Chalad',
                'content' => 'Relocating back to Kannur was made seamless. KARMA negotiated the best valuation for our ancestral property and closed the sale within 3 weeks.',
                'rating' => 5,
                'photo_url' => 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
                'is_active' => true,
            ],
            [
                'client_name' => 'Dr. Ananya Nair',
                'client_role' => 'Pediatric Consultant, UK / Thalassery',
                'content' => 'Purchasing our luxury beachfront villa from London was completely stress-free. The virtual walkthrough and verified legal clearances exceeded our expectations.',
                'rating' => 5,
                'photo_url' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
                'is_active' => true,
            ],
            [
                'client_name' => 'Rashid & Shabana',
                'client_role' => 'Retail Chain Owners, Dubai / Thana',
                'content' => 'KARMA secured a prime high-footfall commercial building in Thana for our new outlet. Outstanding market insights and hassle-free registration!',
                'rating' => 5,
                'photo_url' => 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
                'is_active' => true,
            ],
            [
                'client_name' => 'Capt. Suresh Kumar',
                'client_role' => 'Merchant Navy Officer, Alavil',
                'content' => 'While away at sea, KARMA managed my land purchase, survey, and boundary fencing flawlessly. True peace of mind and 100% transparency.',
                'rating' => 5,
                'photo_url' => 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
                'is_active' => true,
            ]
        ];

        foreach ($testimonials as $item) {
            Testimonial::updateOrCreate(
                ['client_name' => $item['client_name']],
                $item
            );
        }
    }
}

