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
                'photo_url' => null,
                'is_active' => true,
            ],
            [
                'client_name' => 'Faisal Mohammed',
                'client_role' => 'NRI Business Owner, Abu Dhabi',
                'content' => 'Finding sea-view luxury land in Kannur while living in the UAE was effortless with KARMA. The OTP-unlocked details and drone video gave me complete confidence to book before flying down.',
                'rating' => 5,
                'photo_url' => null,
                'is_active' => true,
            ],
            [
                'client_name' => 'Adv. Meenakshi Menon',
                'client_role' => 'High Court Advocate',
                'content' => 'As a legal practitioner, I was thoroughly impressed by KARMA’s confidential document vault and encumbrance tracking. Absolutely professional service.',
                'rating' => 5,
                'photo_url' => null,
                'is_active' => true,
            ],
        ];

        foreach ($testimonials as $item) {
            Testimonial::create($item);
        }
    }
}
