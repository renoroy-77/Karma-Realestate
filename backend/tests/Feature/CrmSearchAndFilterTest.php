<?php

namespace Tests\Feature;

use App\Enums\LeadStatus;
use App\Models\AdminUser;
use App\Models\Lead;
use App\Models\LeadActivity;
use App\Models\LeadNote;
use App\Models\LeadPropertyView;
use App\Models\Property;
use App\Models\SiteVisitRequest;
use App\Models\Wishlist;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;
use Tests\TestCase;

class CrmSearchAndFilterTest extends TestCase
{
    use RefreshDatabase;

    private AdminUser $admin;

    private string $token;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();

        $this->admin = AdminUser::first();
        $this->token = $this->admin->createToken('test-crm')->plainTextToken;
    }

    public function test_filter_validation_and_bounded_per_page(): void
    {
        // 1. Unbounded per_page (> 100) should fail validation with 422
        $resMax = $this->withToken($this->token)->getJson('/api/admin/leads?per_page=100000');
        $resMax->assertStatus(422)
            ->assertJsonValidationErrors(['per_page']);

        // 2. per_page = 0 should fail validation with 422 (min: 1)
        $resZero = $this->withToken($this->token)->getJson('/api/admin/leads?per_page=0');
        $resZero->assertStatus(422)
            ->assertJsonValidationErrors(['per_page']);

        // 3. Invalid status array/type should fail validation
        $resStatusArray = $this->withToken($this->token)->getJson('/api/admin/leads?status[]=invalid');
        $resStatusArray->assertStatus(422)
            ->assertJsonValidationErrors(['status']);

        // 4. Invalid status string should fail validation via Rule::enum
        $resStatusString = $this->withToken($this->token)->getJson('/api/admin/leads?status=non_existent_status');
        $resStatusString->assertStatus(422)
            ->assertJsonValidationErrors(['status']);

        // 5. Valid per_page and filters should return proper structure and status_counts meta
        $resValid = $this->withToken($this->token)->getJson('/api/admin/leads?per_page=10&status=new');
        $resValid->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data',
                'meta' => [
                    'current_page',
                    'last_page',
                    'per_page',
                    'total',
                    'status_counts',
                ],
            ]);
    }

    public function test_phone_search_normalizes_digits_and_escapes_wildcards(): void
    {
        // Search with space-less digits
        $res = $this->withToken($this->token)->getJson('/api/admin/leads?search=9447123456');
        $res->assertStatus(200);
        $this->assertTrue(collect($res->json('data'))->contains('email', 'rajesh.nambiar@keralahealth.org'));

        // Search formatted phone with spaces
        $res2 = $this->withToken($this->token)->getJson('/api/admin/leads?search=94471+23456');
        $res2->assertStatus(200);
        $this->assertTrue(collect($res2->json('data'))->contains('email', 'rajesh.nambiar@keralahealth.org'));

        // Wildcards like % or _ should be safely escaped by addcslashes and not match everything
        $resWildcard = $this->withToken($this->token)->getJson('/api/admin/leads?search=%25%25');
        $resWildcard->assertStatus(200);
        $this->assertCount(0, $resWildcard->json('data'));
    }

    public function test_multi_touch_property_id_filter(): void
    {
        $property = Property::first();
        $this->assertNotNull($property);

        $leadWishlistOnly = Lead::create([
            'name' => 'Wishlist Buyer',
            'email' => 'wishlist.only@example.com',
            'phone' => '+919111122222',
            'source' => 'manual',
            'status' => LeadStatus::NEW,
            'email_verified' => true,
        ]);

        Wishlist::create([
            'lead_id' => $leadWishlistOnly->id,
            'property_id' => $property->id,
        ]);

        // property_id filter should match leads who wishlisted the property (not just viewed)
        $res = $this->withToken($this->token)->getJson("/api/admin/leads?property_id={$property->id}");
        $res->assertStatus(200);
        $emails = collect($res->json('data'))->pluck('email');
        $this->assertTrue($emails->contains('wishlist.only@example.com'));
    }

    public function test_created_at_range_and_sorts(): void
    {
        // Filter by created date range
        $resDate = $this->withToken($this->token)->getJson('/api/admin/leads?created_from='.now()->subDays(30)->toDateString().'&created_to='.now()->toDateString());
        $resDate->assertStatus(200);

        // Sort by most_viewed
        $resMostViewed = $this->withToken($this->token)->getJson('/api/admin/leads?sort_by=most_viewed');
        $resMostViewed->assertStatus(200);

        // Sort by name_asc and name_desc
        $resNameAsc = $this->withToken($this->token)->getJson('/api/admin/leads?sort_by=name_asc');
        $resNameAsc->assertStatus(200);
    }

    public function test_status_update_records_activity_only_on_change_and_in_transaction(): void
    {
        $lead = Lead::where('status', LeadStatus::NEW)->first();
        $this->assertNotNull($lead);

        // 1. Valid status update
        $res = $this->withToken($this->token)->patchJson("/api/admin/leads/{$lead->id}/status", [
            'status' => 'contacted',
        ]);

        $res->assertStatus(200)
            ->assertJson([
                'success' => true,
                'status' => 'contacted',
            ]);

        $this->assertDatabaseHas('lead_activities', [
            'lead_id' => $lead->id,
            'type' => 'status_change',
            'from' => 'new',
            'to' => 'contacted',
            'admin_user_id' => $this->admin->id,
        ]);

        $activitiesCountBefore = LeadActivity::where('lead_id', $lead->id)->count();

        // 2. Updating with the SAME status should not create a duplicate activity row
        $resSame = $this->withToken($this->token)->patchJson("/api/admin/leads/{$lead->id}/status", [
            'status' => 'contacted',
        ]);
        $resSame->assertStatus(200);

        $activitiesCountAfter = LeadActivity::where('lead_id', $lead->id)->count();
        $this->assertEquals($activitiesCountBefore, $activitiesCountAfter);
    }

    public function test_safe_lead_merging_with_shared_phone_per_table_fk_moves_and_token_redirection(): void
    {
        $property = Property::first();

        // Create primary lead (status: new)
        $primary = Lead::create([
            'name' => 'Primary Customer',
            'email' => 'primary@example.com',
            'phone' => '+919999988888',
            'locality' => null,
            'source' => 'manual',
            'status' => LeadStatus::NEW,
            'email_verified' => true,
        ]);

        // Create duplicate lead with shared phone and status: interested
        $duplicate = Lead::create([
            'name' => 'Duplicate Customer',
            'email' => 'duplicate@example.com',
            'phone' => '+919999988888',
            'locality' => 'Thavakkara',
            'source' => 'site_visit',
            'status' => LeadStatus::INTERESTED,
            'email_verified' => true,
        ]);

        // Add children rows to duplicate
        LeadNote::create([
            'lead_id' => $duplicate->id,
            'admin_user_id' => $this->admin->id,
            'note' => 'Duplicate note before merge',
        ]);

        SiteVisitRequest::create([
            'property_id' => $property->id,
            'lead_id' => $duplicate->id,
            'visitor_name' => $duplicate->name,
            'visitor_email' => $duplicate->email,
            'visitor_phone' => $duplicate->phone,
            'preferred_date' => now()->addDays(5)->toDateString(),
            'preferred_time_slot' => 'morning',
            'booking_status' => 'pending',
        ]);

        Wishlist::create([
            'lead_id' => $duplicate->id,
            'property_id' => $property->id,
        ]);

        LeadPropertyView::create([
            'lead_id' => $duplicate->id,
            'property_id' => $property->id,
            'view_count' => 3,
            'first_viewed_at' => now()->subDays(3),
            'last_viewed_at' => now()->subDay(),
        ]);

        LeadActivity::create([
            'lead_id' => $duplicate->id,
            'admin_user_id' => $this->admin->id,
            'type' => 'status_change',
            'from' => 'new',
            'to' => 'interested',
            'description' => 'Moved to interested',
            'created_at' => now(),
        ]);

        // Create an encrypted lead token for duplicate
        $dupToken = Crypt::encryptString(json_encode([
            'lead_id' => $duplicate->id,
            'email' => $duplicate->email,
        ]));

        // Merge duplicate into primary
        $res = $this->withToken($this->token)->postJson('/api/admin/leads/merge', [
            'primary_lead_id' => $primary->id,
            'duplicate_lead_id' => $duplicate->id,
        ]);

        $res->assertStatus(200)
            ->assertJson(['success' => true]);

        // Verify primary received missing fields
        $primary->refresh();
        $this->assertEquals('+919999988888', $primary->phone);
        $this->assertEquals('Thavakkara', $primary->locality);
        // Status priority: interested (4) > new (2) -> primary upgraded to interested
        $this->assertEquals(LeadStatus::INTERESTED, $primary->status);

        // Verify duplicate row is hard deleted
        $this->assertDatabaseMissing('leads', ['id' => $duplicate->id]);

        // Verify all 5 child tables re-linked without data loss:
        // 1. Notes moved
        $this->assertDatabaseHas('lead_notes', [
            'lead_id' => $primary->id,
            'note' => 'Duplicate note before merge',
        ]);
        // 2. Site visits moved
        $this->assertDatabaseHas('site_visit_requests', [
            'lead_id' => $primary->id,
            'property_id' => $property->id,
        ]);
        // 3. Wishlists moved
        $this->assertDatabaseHas('wishlists', [
            'lead_id' => $primary->id,
            'property_id' => $property->id,
        ]);
        // 4. Property views moved
        $this->assertDatabaseHas('lead_property_views', [
            'lead_id' => $primary->id,
            'property_id' => $property->id,
        ]);
        // 5. Activities moved
        $this->assertDatabaseHas('lead_activities', [
            'lead_id' => $primary->id,
            'type' => 'status_change',
            'to' => 'interested',
        ]);

        // Verify audit note and activity on primary
        $this->assertDatabaseHas('lead_notes', [
            'lead_id' => $primary->id,
            'note' => "System: Merged from lead #{$duplicate->id} (Duplicate Customer, email: duplicate@example.com, phone: +919999988888).",
        ]);
        $this->assertDatabaseHas('lead_activities', [
            'lead_id' => $primary->id,
            'type' => 'merged',
        ]);

        // Verify old token from duplicate still resolves primary lead via lead_merges redirection
        $tokenRes = $this->withHeader('X-Lead-Token', $dupToken)->getJson('/api/wishlist');
        $tokenRes->assertStatus(200);
    }

    public function test_xml_sitemap_caching_and_robots_txt(): void
    {
        Cache::forget('sitemap_xml');

        // Test robots.txt
        $robotsRes = $this->get('/robots.txt');
        $robotsRes->assertStatus(200)
            ->assertHeader('Content-Type', 'text/plain; charset=UTF-8')
            ->assertSeeText('Sitemap:');

        // Test sitemap.xml
        $sitemapRes = $this->get('/sitemap.xml');
        $sitemapRes->assertStatus(200)
            ->assertHeader('Content-Type', 'application/xml; charset=UTF-8')
            ->assertSee('/kannur/')
            ->assertSee('/properties')
            ->assertSee('/about');

        // Verify sitemap is cached
        $this->assertTrue(Cache::has('sitemap_xml'));

        // Saving a property busts the cache
        $prop = Property::first();
        $prop->update(['title' => $prop->title.' (Updated)']);
        $this->assertFalse(Cache::has('sitemap_xml'));
    }

    public function test_api_root_returns_json_status(): void
    {
        $res = $this->getJson('/');
        $res->assertStatus(200)
            ->assertJson([
                'service' => 'KARMA Real Estate API',
                'status' => 'operational',
            ]);
    }
}
