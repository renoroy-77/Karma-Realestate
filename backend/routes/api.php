<?php

use App\Http\Controllers\Api\Admin\AuthController as AdminAuthController;
use App\Http\Controllers\Api\Admin\BrochureController as AdminBrochureController;
use App\Http\Controllers\Api\Admin\ConfidentialDocController as AdminConfidentialDocController;
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\InternalRemarkController as AdminInternalRemarkController;
use App\Http\Controllers\Api\Admin\LeadController as AdminLeadController;
use App\Http\Controllers\Api\Admin\PropertyManageController as AdminPropertyManageController;
use App\Http\Controllers\Api\Admin\PropertyMediaController as AdminPropertyMediaController;
use App\Http\Controllers\Api\Admin\SiteSettingController as AdminSiteSettingController;
use App\Http\Controllers\Api\Admin\SiteVisitManageController as AdminSiteVisitManageController;
use App\Http\Controllers\Api\Admin\TestimonialManageController as AdminTestimonialController;
use App\Http\Controllers\Api\Public\CompareController;
use App\Http\Controllers\Api\Public\HomeController;
use App\Http\Controllers\Api\Public\OtpController;
use App\Http\Controllers\Api\Public\PropertyController;
use App\Http\Controllers\Api\Public\SettingsController;
use App\Http\Controllers\Api\Public\SiteVisitController;
use App\Http\Controllers\Api\Public\WishlistController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes (Visitors & Leads)
|--------------------------------------------------------------------------
*/

// Home page composite feed & public contact form
Route::get('/home', [HomeController::class, 'index']);
Route::post('/contact', [HomeController::class, 'contact']);

// Interactive map pins for clustering & "Search this area"
Route::get('/properties/map', [PropertyController::class, 'mapPins']);

// Property browsing & search (masked by default)
Route::get('/properties', [PropertyController::class, 'index']);
Route::get('/properties/{slug}', [PropertyController::class, 'show'])->middleware('lead.token:optional');
Route::get('/properties/{slug}/similar', [PropertyController::class, 'similar']);

// Comparison tool & global settings
Route::post('/compare', [CompareController::class, 'compare']);
Route::get('/settings', [SettingsController::class, 'index']);

// Email OTP Verification
Route::post('/otp/send', [OtpController::class, 'send']);
Route::post('/otp/verify', [OtpController::class, 'verify']);

// Site visit booking
Route::post('/site-visit', [SiteVisitController::class, 'book']);

// Wishlist (Requires verified lead token)
Route::middleware('lead.token:required')->group(function () {
    Route::post('/wishlist/toggle', [WishlistController::class, 'toggle']);
    Route::get('/wishlist', [WishlistController::class, 'index']);
});

/*
|--------------------------------------------------------------------------
| Admin Authentication
|--------------------------------------------------------------------------
*/
Route::post('/admin/login', [AdminAuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Protected Admin Routes (Sanctum Token Required)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    // Auth & Profile
    Route::post('/logout', [AdminAuthController::class, 'logout']);
    Route::get('/me', [AdminAuthController::class, 'me']);

    // Dashboard Analytics
    Route::get('/dashboard/stats', [AdminDashboardController::class, 'stats']);

    // Property Management (CRUD & Status)
    Route::get('/properties', [AdminPropertyManageController::class, 'index']);
    Route::get('/properties/{id}', [AdminPropertyManageController::class, 'show']);
    Route::post('/properties', [AdminPropertyManageController::class, 'store']);
    Route::put('/properties/{id}', [AdminPropertyManageController::class, 'update']);
    Route::patch('/properties/{id}/status', [AdminPropertyManageController::class, 'updateStatus']);
    Route::patch('/properties/{id}/publish', [AdminPropertyManageController::class, 'togglePublish']);
    Route::delete('/properties/{id}', [AdminPropertyManageController::class, 'destroy']);
    Route::patch('/properties/{id}/remarks', [AdminInternalRemarkController::class, 'upsert']);

    // Media Management (Photos, Real Videos, Virtual Tours)
    Route::post('/properties/{id}/media', [AdminPropertyMediaController::class, 'upload']);
    Route::patch('/properties/{id}/media/sort', [AdminPropertyMediaController::class, 'reorder']);
    Route::delete('/media/{mediaId}', [AdminPropertyMediaController::class, 'destroy']);
    Route::post('/properties/{id}/brochure', [AdminPropertyMediaController::class, 'uploadBrochure']);
    Route::delete('/properties/{id}/brochure', [AdminPropertyMediaController::class, 'deleteBrochure']);

    // Confidential Documents Vault (Deeds, ECs, Tax Receipts, Logs)
    Route::post('/properties/{id}/documents', [AdminConfidentialDocController::class, 'upload']);
    Route::get('/documents/{docId}/view', [AdminConfidentialDocController::class, 'view']);
    Route::get('/documents/{docId}/download', [AdminConfidentialDocController::class, 'download']);
    Route::delete('/documents/{docId}', [AdminConfidentialDocController::class, 'destroy']);
    Route::get('/documents/{docId}/logs', [AdminConfidentialDocController::class, 'logs']);

    // PDF Brochure Generation
    Route::get('/properties/{id}/pdf', [AdminBrochureController::class, 'generate']);

    // CRM Lead Pipeline
    Route::get('/leads', [AdminLeadController::class, 'index']);
    Route::get('/leads/{id}', [AdminLeadController::class, 'show']);
    Route::match(['patch', 'put'], '/leads/{id}/status', [AdminLeadController::class, 'updateStatus']);
    Route::post('/leads/{id}/notes', [AdminLeadController::class, 'addNote']);
    Route::post('/leads/merge', [AdminLeadController::class, 'merge']);

    // Tour & Site Visit Management
    Route::get('/site-visits', [AdminSiteVisitManageController::class, 'index']);
    Route::patch('/site-visits/{id}/status', [AdminSiteVisitManageController::class, 'updateStatus']);
    Route::delete('/site-visits/{id}', [AdminSiteVisitManageController::class, 'destroy']);

    // CMS & Hero Settings
    Route::get('/settings', [AdminSiteSettingController::class, 'index']);
    Route::match(['post', 'put'], '/settings', [AdminSiteSettingController::class, 'update']);

    // Testimonials Management
    Route::get('/testimonials', [AdminTestimonialController::class, 'index']);
    Route::post('/testimonials', [AdminTestimonialController::class, 'store']);
    Route::get('/testimonials/{id}', [AdminTestimonialController::class, 'show']);
    Route::put('/testimonials/{id}', [AdminTestimonialController::class, 'update']);
    Route::patch('/testimonials/{id}/toggle', [AdminTestimonialController::class, 'toggle']);
    Route::delete('/testimonials/{id}', [AdminTestimonialController::class, 'destroy']);
});
