<?php

namespace Tests\Feature\Security;

use App\Mail\OtpMail;
use App\Models\AdminUser;
use App\Models\Lead;
use App\Models\OtpVerification;
use App\Models\Property;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class OtpAbuseAndGatingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow(); // Reset simulated time after each test
        parent::tearDown();
    }

    public function test_expired_code_is_rejected(): void
    {
        Mail::fake();

        $email = 'expire.test@example.com';
        $this->postJson('/api/otp/send', ['email' => $email])->assertStatus(200);

        $sentOtp = null;
        Mail::assertSent(OtpMail::class, function ($mail) use (&$sentOtp) {
            $sentOtp = $mail->otp;

            return true;
        });

        // Fast forward 15 minutes past the 10-minute expiry
        Carbon::setTestNow(now()->addMinutes(15));

        $response = $this->postJson('/api/otp/verify', [
            'email' => $email,
            'otp' => $sentOtp,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['otp']);
        $this->assertStringContainsString('expired', $response->json('errors.otp.0'));
    }

    public function test_reused_code_is_rejected(): void
    {
        Mail::fake();

        $email = 'reuse.test@example.com';
        $this->postJson('/api/otp/send', ['email' => $email])->assertStatus(200);

        $sentOtp = null;
        Mail::assertSent(OtpMail::class, function ($mail) use (&$sentOtp) {
            $sentOtp = $mail->otp;

            return true;
        });

        // First verification should succeed
        $firstRes = $this->postJson('/api/otp/verify', [
            'email' => $email,
            'otp' => $sentOtp,
        ]);
        $firstRes->assertStatus(200)->assertJson(['success' => true]);

        // Second verification with identical code must fail
        $secondRes = $this->postJson('/api/otp/verify', [
            'email' => $email,
            'otp' => $sentOtp,
        ]);
        $secondRes->assertStatus(422)
            ->assertJsonValidationErrors(['otp']);
    }

    public function test_wrong_code_lockout_after_three_failed_attempts(): void
    {
        Mail::fake();

        $email = 'lockout.test@example.com';
        $this->postJson('/api/otp/send', ['email' => $email])->assertStatus(200);

        $sentOtp = null;
        Mail::assertSent(OtpMail::class, function ($mail) use (&$sentOtp) {
            $sentOtp = $mail->otp;

            return true;
        });

        // Attempt 1: wrong code
        $r1 = $this->postJson('/api/otp/verify', ['email' => $email, 'otp' => '000000']);
        $r1->assertStatus(422);
        $this->assertStringContainsString('2 attempt(s) remaining', $r1->json('errors.otp.0'));

        // Attempt 2: wrong code
        $r2 = $this->postJson('/api/otp/verify', ['email' => $email, 'otp' => '000001']);
        $r2->assertStatus(422);
        $this->assertStringContainsString('1 attempt(s) remaining', $r2->json('errors.otp.0'));

        // Attempt 3: wrong code -> triggers 60s lockout
        $r3 = $this->postJson('/api/otp/verify', ['email' => $email, 'otp' => '000002']);
        $r3->assertStatus(422);
        $this->assertStringContainsString('Cooldown active', $r3->json('errors.otp.0'));

        // Attempt 4: even with the correct code, lockout rejects immediately
        $r4 = $this->postJson('/api/otp/verify', ['email' => $email, 'otp' => $sentOtp]);
        $r4->assertStatus(422);
        $this->assertStringContainsString('Too many incorrect attempts', $r4->json('errors.otp.0'));
    }

    public function test_resend_inside_cooldown_is_rejected(): void
    {
        Mail::fake();

        $email = 'cooldown.test@example.com';

        // 1st request succeeds
        $res1 = $this->postJson('/api/otp/send', ['email' => $email]);
        $res1->assertStatus(200);

        // Immediate 2nd request inside 60-second cooldown is rejected
        $res2 = $this->postJson('/api/otp/send', ['email' => $email]);
        $res2->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
        $this->assertStringContainsString('Please wait', $res2->json('errors.email.0'));
    }

    public function test_new_otp_invalidates_old_one(): void
    {
        Mail::fake();

        $email = 'invalidate.test@example.com';

        // 1st send
        $this->postJson('/api/otp/send', ['email' => $email])->assertStatus(200);
        $codeA = null;
        Mail::assertSent(OtpMail::class, function ($mail) use (&$codeA) {
            $codeA = $mail->otp;

            return true;
        });

        // Advance beyond the 60s cooldown
        Carbon::setTestNow(now()->addSeconds(65));

        // 2nd send
        $this->postJson('/api/otp/send', ['email' => $email])->assertStatus(200);
        $codeB = null;
        Mail::assertSent(OtpMail::class, function ($mail) use (&$codeB, $codeA) {
            if ($mail->otp !== $codeA) {
                $codeB = $mail->otp;
            }

            return true;
        });

        $this->assertNotNull($codeB);
        $this->assertNotEquals($codeA, $codeB);

        // Code A must fail (invalidated)
        $verifyA = $this->postJson('/api/otp/verify', ['email' => $email, 'otp' => $codeA]);
        $verifyA->assertStatus(422);

        // Code B must succeed
        $verifyB = $this->postJson('/api/otp/verify', ['email' => $email, 'otp' => $codeB]);
        $verifyB->assertStatus(200)->assertJson(['success' => true]);
    }

    public function test_email_case_and_whitespace_normalization(): void
    {
        Mail::fake();

        $rawEmail = "  User.MixedCase@Example.COM  \t";
        $normalizedEmail = 'user.mixedcase@example.com';

        $this->postJson('/api/otp/send', [
            'email' => $rawEmail,
            'name' => 'Whitespace Test',
        ])->assertStatus(200);

        $sentOtp = null;
        Mail::assertSent(OtpMail::class, function ($mail) use (&$sentOtp) {
            $sentOtp = $mail->otp;

            return true;
        });

        // Verify with all-lowercase and no whitespace
        $verifyRes = $this->postJson('/api/otp/verify', [
            'email' => $normalizedEmail,
            'otp' => " {$sentOtp} ",
        ]);

        $verifyRes->assertStatus(200)->assertJson(['success' => true]);

        // Check lead table stores normalized email
        $this->assertDatabaseHas('leads', [
            'email' => $normalizedEmail,
            'email_verified' => true,
        ]);
    }

    public function test_otp_is_stored_hashed_and_never_in_plaintext_in_database(): void
    {
        Mail::fake();

        $email = 'hashcheck@example.com';
        $this->postJson('/api/otp/send', ['email' => $email])->assertStatus(200);

        $record = OtpVerification::where('email', $email)->latest()->firstOrFail();

        // Must be a 64-character SHA-256 hexadecimal hash
        $this->assertMatchesRegularExpression('/^[a-f0-9]{64}$/', $record->otp_hash);

        // Assert plaintext 6-digit OTP is nowhere in this record
        $attributes = json_encode($record->toArray());
        $this->assertNotNull($attributes);

        Mail::assertSent(OtpMail::class, function ($mail) use ($attributes) {
            $rawOtp = $mail->otp;
            $this->assertStringNotContainsString('"'.$rawOtp.'"', $attributes);

            return true;
        });
    }

    public function test_smtp_failure_returns_clean_error_and_does_not_lock_out_user(): void
    {
        Mail::shouldReceive('to->send')
            ->once()
            ->andThrow(new \RuntimeException('Connection refused to SMTP relay:25'));

        $email = 'smtp.fail@example.com';

        $response = $this->postJson('/api/otp/send', ['email' => $email]);

        // Clean validation error (422), never an unhandled 500 error
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);

        // User must not be left with a pending record that locks them out
        $this->assertDatabaseMissing('otp_verifications', [
            'email' => $email,
        ]);
    }

    public function test_lead_capture_updates_existing_lead_without_duplicates(): void
    {
        Mail::fake();

        $email = 'lead.update@example.com';

        // 1st request with name and phone
        $this->postJson('/api/otp/send', [
            'email' => $email,
            'name' => 'Initial Name',
            'phone' => '+919876543210',
            'locality' => 'Kannur',
        ])->assertStatus(200);

        $code = null;
        Mail::assertSent(OtpMail::class, function ($mail) use (&$code) {
            $code = $mail->otp;

            return true;
        });

        $this->postJson('/api/otp/verify', ['email' => $email, 'otp' => $code])->assertStatus(200);

        // Advance beyond cooldown
        Carbon::setTestNow(now()->addSeconds(65));

        // 2nd request with same email but updated phone and locality
        $this->postJson('/api/otp/send', [
            'email' => $email,
            'name' => 'Updated Name',
            'phone' => '+919876543219',
            'locality' => 'Thalassery',
        ])->assertStatus(200);

        // Only ONE lead row should exist for this email
        $this->assertEquals(1, Lead::where('email', $email)->count());

        $lead = Lead::where('email', $email)->first();
        $this->assertNotNull($lead);
        $this->assertEquals('Updated Name', $lead->name);
        $this->assertEquals('Thalassery', $lead->locality);
    }

    public function test_invalid_phone_format_is_rejected(): void
    {
        $response = $this->postJson('/api/otp/send', [
            'email' => 'phone.fail@example.com',
            'phone' => 'not-a-valid-phone-number',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['phone']);
    }

    public function test_unicode_names_are_supported(): void
    {
        Mail::fake();

        $email = 'unicode.name@example.com';
        $unicodeName = 'René François Müller अमित';

        $this->postJson('/api/otp/send', [
            'email' => $email,
            'name' => $unicodeName,
        ])->assertStatus(200);

        $sentOtp = null;
        Mail::assertSent(OtpMail::class, function ($mail) use (&$sentOtp) {
            $sentOtp = $mail->otp;

            return true;
        });

        $this->postJson('/api/otp/verify', [
            'email' => $email,
            'otp' => $sentOtp,
        ])->assertStatus(200);

        $lead = Lead::where('email', $email)->first();
        $this->assertNotNull($lead);
        $this->assertEquals($unicodeName, $lead->name);
    }

    public function test_gating_unpublished_or_draft_property_returns_404(): void
    {
        $admin = AdminUser::firstOrFail();

        // Create an unpublished property (is_published = false)
        $draft = Property::create([
            'title' => 'Unpublished Secret Villa',
            'slug' => 'unpublished-secret-villa',
            'purpose' => 'sale',
            'type' => 'house',
            'status' => 'available',
            'is_published' => false,
            'price' => 50000000,
            'locality' => 'Secret Hills',
            'address_line' => 'Confidential Plot 9',
            'latitude' => 11.8700,
            'longitude' => 75.3700,
        ]);

        // 1. Guest request -> 404
        $this->getJson("/api/properties/{$draft->slug}")->assertStatus(404);

        // 2. Verified lead request -> still 404 (drafts are not visible to public or leads)
        $lead = Lead::firstOrCreate(['email' => 'lead.gating@example.com'], ['name' => 'Lead Gating']);
        $leadToken = Crypt::encryptString(json_encode([
            'lead_id' => $lead->id,
            'email' => $lead->email,
            'created_at' => now()->timestamp,
        ]));

        $this->withHeader('X-Lead-Token', $leadToken)
            ->getJson("/api/properties/{$draft->slug}")
            ->assertStatus(404);
    }

    public function test_gating_expired_lead_token_treated_as_guest(): void
    {
        $lead = Lead::firstOrCreate(['email' => 'expired.lead@example.com'], ['name' => 'Expired Lead']);

        // Create token with timestamp 35 days ago (older than 30 days)
        $expiredToken = Crypt::encryptString(json_encode([
            'lead_id' => $lead->id,
            'email' => $lead->email,
            'created_at' => now()->subDays(35)->timestamp,
        ]));

        $property = Property::published()->firstOrFail();

        // Fetching property with expired token returns masked property (not unlocked)
        $res = $this->withHeader('X-Lead-Token', $expiredToken)
            ->getJson("/api/properties/{$property->slug}");

        $res->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'is_masked' => true,
                ],
            ]);

        // Accessing a lead-required route with expired token returns 401
        $siteVisitRes = $this->withHeader('X-Lead-Token', $expiredToken)
            ->postJson('/api/site-visits', [
                'property_id' => $property->id,
                'preferred_date' => now()->addDays(2)->format('Y-m-d'),
                'preferred_slot' => 'morning',
            ]);

        $siteVisitRes->assertStatus(401);
    }

    public function test_gating_token_for_deleted_lead_returns_401(): void
    {
        $lead = Lead::create([
            'name' => 'To Be Deleted',
            'email' => 'deleted.lead@example.com',
            'status' => 'new',
            'email_verified' => true,
        ]);

        $leadToken = Crypt::encryptString(json_encode([
            'lead_id' => $lead->id,
            'email' => $lead->email,
            'created_at' => now()->timestamp,
        ]));

        // Now delete the lead entirely from the DB
        $lead->delete();

        $property = Property::published()->firstOrFail();

        // Calling lead-required endpoint must reject with 401
        $res = $this->withHeader('X-Lead-Token', $leadToken)
            ->postJson('/api/site-visits', [
                'property_id' => $property->id,
                'preferred_date' => now()->addDays(3)->format('Y-m-d'),
                'preferred_slot' => 'morning',
            ]);

        $res->assertStatus(401);
    }

    public function test_search_edge_cases_cap_per_page_and_safeguard_sort_by(): void
    {
        // 1. Huge per_page is capped at 50
        $hugePerPageRes = $this->getJson('/api/properties?per_page=999999');
        $hugePerPageRes->assertStatus(200);
        $this->assertLessThanOrEqual(50, $hugePerPageRes->json('meta.per_page'));

        // 2. Malicious sort_by attempt (SQL injection attempt) is safely handled by whitelist
        $maliciousSortRes = $this->getJson('/api/properties?sort_by=id;DROP+TABLE+properties--');
        $maliciousSortRes->assertStatus(200);

        // 3. Price min > price max returns empty result set cleanly without 500 error
        $reversedPriceRes = $this->getJson('/api/properties?price_min=99999999999&price_max=10');
        $reversedPriceRes->assertStatus(200);
        $this->assertEquals(0, count($reversedPriceRes->json('data')));
    }
}
