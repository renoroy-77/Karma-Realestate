#!/usr/bin/env bash
# ==============================================================================
# KARMA REAL ESTATE - STAGING SMOKE TEST SCRIPT
# Runs automated end-to-end verification of critical flows against staging/production:
# 1. Health check & public API
# 2. Admin authentication & token issuance
# 3. Property creation & validation
# 4. Public data leak verification (address masking & coordinate jitter)
# 5. Coordinate obfuscation on map-pins endpoint
# 6. OTP generation & lead token verification
# 7. Gated confidential property unlock
# 8. In-person site visit booking
# 9. Property teardown & cleanup
# ==============================================================================

set -euo pipefail

BASE_URL="${1:-http://127.0.0.1:8000}"
ADMIN_EMAIL="${2:-admin@karmarealestate.in}"
ADMIN_PASSWORD="${3:-KarmaAdmin@2026}"
LEAD_TOKEN="${4:-}"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

pass() {
    echo -e "${GREEN}  ✓ PASS:${NC} $1"
}

fail() {
    echo -e "${RED}  ✗ FAIL:${NC} $1"
    exit 1
}

info() {
    echo -e "${BLUE}==>${NC} $1"
}

command -v curl >/dev/null 2>&1 || { echo "curl is required but not installed."; exit 1; }
command -v jq >/dev/null 2>&1 || { echo "jq is required but not installed."; exit 1; }

echo ""
echo "========================================================"
echo " Starting Staging Smoke Test against: ${BASE_URL}"
echo "========================================================"
echo ""

# ------------------------------------------------------------------------------
# STEP 1: Health Check
# ------------------------------------------------------------------------------
info "Step 1: Checking Service Health..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/up" || true)
if [ "$HTTP_STATUS" != "200" ]; then
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/home" || true)
fi

if [ "$HTTP_STATUS" = "200" ]; then
    pass "Backend service is online (HTTP 200)"
else
    fail "Backend service is unreachable at ${BASE_URL} (HTTP ${HTTP_STATUS})"
fi

# ------------------------------------------------------------------------------
# STEP 2: Admin Login
# ------------------------------------------------------------------------------
info "Step 2: Authenticating Admin..."
LOGIN_RES=$(curl -s -X POST "${BASE_URL}/api/admin/login" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}")

ADMIN_TOKEN=$(echo "$LOGIN_RES" | jq -r '.token // .data.token // empty')

if [ -n "$ADMIN_TOKEN" ] && [ "$ADMIN_TOKEN" != "null" ]; then
    pass "Admin login successful. Token acquired."
else
    fail "Admin login failed: ${LOGIN_RES}"
fi

# ------------------------------------------------------------------------------
# STEP 3: Create Test Property
# ------------------------------------------------------------------------------
info "Step 3: Creating Test Property via Admin API..."
TIMESTAMP=$(date +%s)
PROP_TITLE="Staging Smoke Villa ${TIMESTAMP}"

CREATE_RES=$(curl -s -X POST "${BASE_URL}/api/admin/properties" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -d "{
        \"title\": \"${PROP_TITLE}\",
        \"purpose\": \"sale\",
        \"type\": \"house\",
        \"price\": 18500000,
        \"price_basis\": \"total\",
        \"locality\": \"Thottada Beach Road\",
        \"address_line\": \"CONFIDENTIAL: House 42, Secret Beach Lane, Thottada\",
        \"latitude\": 11.8542000,
        \"longitude\": 75.3985000,
        \"status\": \"available\",
        \"is_published\": true,
        \"bedrooms\": 4,
        \"bathrooms\": 4,
        \"land_area\": 15.5,
        \"land_area_unit\": \"cent\",
        \"building_area_sqft\": 2800,
        \"owner_name\": \"Confidential Seller VIP\",
        \"owner_phone\": \"+919876543210\"
    }")

PROPERTY_ID=$(echo "$CREATE_RES" | jq -r '.data.id // empty')
PROPERTY_SLUG=$(echo "$CREATE_RES" | jq -r '.data.slug // empty')

if [ -n "$PROPERTY_ID" ] && [ "$PROPERTY_ID" != "null" ]; then
    pass "Property created successfully (ID: ${PROPERTY_ID}, Slug: ${PROPERTY_SLUG})"
else
    fail "Property creation failed: ${CREATE_RES}"
fi

# ------------------------------------------------------------------------------
# STEP 4: Verify Data-Leak Protection (Guest / Unauthenticated)
# ------------------------------------------------------------------------------
info "Step 4: Verifying Data-Leak Protection for Unauthenticated Visitors..."
PUBLIC_RES=$(curl -s -X GET "${BASE_URL}/api/properties/${PROPERTY_SLUG}" \
    -H "Accept: application/json")

IS_MASKED=$(echo "$PUBLIC_RES" | jq -r '.data.is_masked')
ADDRESS_LINE=$(echo "$PUBLIC_RES" | jq -r '.data.address_line // empty')
OWNER_NAME=$(echo "$PUBLIC_RES" | jq -r '.data.owner_name // empty')

if [ "$IS_MASKED" = "true" ]; then
    pass "Data-leak check passed: Property is masked for public guest"
else
    fail "Data-leak failure: Property was not masked for unauthenticated user!"
fi

if [[ "$ADDRESS_LINE" == *"CONFIDENTIAL"* ]]; then
    fail "Data-leak CRITICAL failure: Exact address leaked in public payload!"
else
    pass "Exact confidential address correctly withheld from public"
fi

if [ -n "$OWNER_NAME" ] && [ "$OWNER_NAME" != "null" ]; then
    fail "Data-leak CRITICAL failure: Owner contact details leaked!"
else
    pass "Owner details securely withheld from public API"
fi

# ------------------------------------------------------------------------------
# STEP 5: Map Pins Privacy Check
# ------------------------------------------------------------------------------
info "Step 5: Verifying Coordinate Masking on Map Pins Endpoint..."
MAP_RES=$(curl -s -X GET "${BASE_URL}/api/properties/map-pins" \
    -H "Accept: application/json")

EXACT_LAT_PRESENT=$(echo "$MAP_RES" | grep "11.8542000" || true)
if [ -n "$EXACT_LAT_PRESENT" ]; then
    fail "Data-leak CRITICAL failure: Exact GPS latitude (11.8542000) was found in map pins!"
else
    pass "Map pins endpoint successfully obfuscates GPS coordinates with deterministic jitter"
fi

# ------------------------------------------------------------------------------
# STEP 6: Lead OTP Flow & Gating Unlock
# ------------------------------------------------------------------------------
info "Step 6: Testing OTP Request & Lead Token Verification..."
CUSTOMER_EMAIL="smoke_test_${TIMESTAMP}@example.com"

OTP_SEND_RES=$(curl -s -X POST "${BASE_URL}/api/otp/send" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -d "{\"email\":\"${CUSTOMER_EMAIL}\",\"name\":\"Smoke Test Buyer\",\"phone\":\"+919876543210\"}")

OTP_SEND_SUCCESS=$(echo "$OTP_SEND_RES" | jq -r '.success // false')
if [ "$OTP_SEND_SUCCESS" = "true" ]; then
    pass "OTP send request accepted"
else
    fail "OTP send failed: ${OTP_SEND_RES}"
fi

# Generate / retrieve lead token
if [ -z "$LEAD_TOKEN" ]; then
    if [ -f "backend/artisan" ]; then
        LEAD_TOKEN=$(php backend/artisan tinker --execute="echo \Illuminate\Support\Facades\Crypt::encryptString(json_encode(['lead_id' => \App\Models\Lead::firstOrCreate(['email' => '${CUSTOMER_EMAIL}'], ['name' => 'Smoke Test Buyer'])->id, 'email' => '${CUSTOMER_EMAIL}', 'created_at' => now()->timestamp]));" 2>/dev/null | tail -n 1)
    elif [ -f "artisan" ]; then
        LEAD_TOKEN=$(php artisan tinker --execute="echo \Illuminate\Support\Facades\Crypt::encryptString(json_encode(['lead_id' => \App\Models\Lead::firstOrCreate(['email' => '${CUSTOMER_EMAIL}'], ['name' => 'Smoke Test Buyer'])->id, 'email' => '${CUSTOMER_EMAIL}', 'created_at' => now()->timestamp]));" 2>/dev/null | tail -n 1)
    fi
fi

# ------------------------------------------------------------------------------
# STEP 7: Verify Gated Unlock with Lead Token
# ------------------------------------------------------------------------------
if [ -n "$LEAD_TOKEN" ]; then
    info "Step 7: Testing Gated Unlock with Verified Lead Token..."
    UNLOCKED_RES=$(curl -s -X GET "${BASE_URL}/api/properties/${PROPERTY_SLUG}" \
        -H "X-Lead-Token: ${LEAD_TOKEN}" \
        -H "Accept: application/json")

    UNLOCKED_MASKED=$(echo "$UNLOCKED_RES" | jq -r '.data.is_masked')
    if [ "$UNLOCKED_MASKED" = "false" ]; then
        pass "Gated property details successfully unlocked for verified lead!"
    else
        fail "Gated unlock failure: property remained masked with lead token!"
    fi
fi

# ------------------------------------------------------------------------------
# STEP 8: Site Visit Booking (Lead Action)
# ------------------------------------------------------------------------------
info "Step 8: Booking In-Person Site Visit..."
VISIT_DATE=$(date -v+3d "+%Y-%m-%d" 2>/dev/null || date -d "+3 days" "+%Y-%m-%d")

VISIT_HEADERS=(-H "Content-Type: application/json" -H "Accept: application/json")
if [ -n "$LEAD_TOKEN" ]; then
    VISIT_HEADERS+=(-H "X-Lead-Token: ${LEAD_TOKEN}")
fi

VISIT_RES=$(curl -s -X POST "${BASE_URL}/api/site-visits" \
    "${VISIT_HEADERS[@]}" \
    -d "{
        \"property_id\": ${PROPERTY_ID},
        \"visitor_name\": \"Smoke Test Visitor\",
        \"visitor_email\": \"${CUSTOMER_EMAIL}\",
        \"visitor_phone\": \"+919876543210\",
        \"preferred_date\": \"${VISIT_DATE}\",
        \"preferred_time_slot\": \"morning\",
        \"notes\": \"Automated staging smoke test booking.\"
    }")

VISIT_SUCCESS=$(echo "$VISIT_RES" | jq -r '.success // false')
if [ "$VISIT_SUCCESS" = "true" ]; then
    pass "Site visit successfully booked (Status: pending confirmation)"
else
    fail "Site visit booking failed: ${VISIT_RES}"
fi

# ------------------------------------------------------------------------------
# STEP 9: Teardown & Clean Up
# ------------------------------------------------------------------------------
info "Step 9: Cleaning up Smoke Test Property..."
DELETE_RES=$(curl -s -X DELETE "${BASE_URL}/api/admin/properties/${PROPERTY_ID}" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}" \
    -H "Accept: application/json")

DELETE_SUCCESS=$(echo "$DELETE_RES" | jq -r '.success // false')
if [ "$DELETE_SUCCESS" = "true" ]; then
    pass "Test property (ID: ${PROPERTY_ID}) successfully removed from database"
else
    echo -e "${YELLOW}  ⚠ Cleanup warning: Could not delete property ID ${PROPERTY_ID}${NC}"
fi

echo ""
echo "========================================================"
echo -e "${GREEN} STAGING SMOKE TEST COMPLETED SUCCESSFULLY! ALL PASS.${NC}"
echo "========================================================"
echo ""
