#!/usr/bin/env python3
"""
Backend API Test Suite for BSV Snakebite Campaign - Phase 5 (Global Settings)
Tests all Phase 5 endpoints: settings, sitemap, robots.txt, redirects, and translate-all bug fix
"""

import requests
import json
import sys
from xml.etree import ElementTree as ET

# Configuration
BASE_URL = "https://venom-relief-india.preview.emergentagent.com/api"
ADMIN_EMAIL = "admin@bsv.com"
ADMIN_PASSWORD = "bsv_admin_2025"

# Color codes for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def log_success(msg):
    print(f"{GREEN}✅ {msg}{RESET}")

def log_error(msg):
    print(f"{RED}❌ {msg}{RESET}")

def log_info(msg):
    print(f"{BLUE}ℹ️  {msg}{RESET}")

def log_warning(msg):
    print(f"{YELLOW}⚠️  {msg}{RESET}")

# Get admin token
def get_admin_token():
    """Login and get JWT token"""
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        }, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            token = data.get('token')
            if token:
                log_success(f"Admin login successful, token obtained")
                return token
            else:
                log_error("Login response missing token")
                return None
        else:
            log_error(f"Login failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        log_error(f"Login error: {str(e)}")
        return None

def test_get_settings_public():
    """Test GET /api/settings (public endpoint)"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}TEST 1: GET /api/settings (public){RESET}")
    print(f"{BLUE}{'='*80}{RESET}")
    
    try:
        response = requests.get(f"{BASE_URL}/settings", timeout=10)
        
        if response.status_code != 200:
            log_error(f"Expected 200, got {response.status_code}")
            return False
        
        log_success(f"Status: {response.status_code}")
        
        data = response.json()
        
        # Verify top-level keys
        required_keys = ['branding', 'seoHome', 'perPage', 'contact', 'social', 'tracking', 'advanced']
        for key in required_keys:
            if key not in data:
                log_error(f"Missing top-level key: {key}")
                return False
            log_success(f"Found top-level key: {key}")
        
        # Verify branding structure
        branding_keys = ['websiteName', 'campaignName', 'tagline', 'headerLogo', 'footerLogo', 'favicon']
        for key in branding_keys:
            if key not in data['branding']:
                log_error(f"Missing branding.{key}")
                return False
        log_success(f"branding structure verified (websiteName, campaignName, tagline, logos, etc.)")
        
        # Verify seoHome structure
        seo_keys = ['metaTitle', 'metaDescription', 'ogTitle', 'ogImage', 'twitterCardType']
        for key in seo_keys:
            if key not in data['seoHome']:
                log_error(f"Missing seoHome.{key}")
                return False
        log_success(f"seoHome structure verified (metaTitle, metaDescription, ogTitle, ogImage, twitterCardType, etc.)")
        
        # Verify tracking structure
        tracking_keys = ['googleAnalyticsId', 'googleTagManagerId', 'metaPixelId', 'microsoftClarityId']
        for key in tracking_keys:
            if key not in data['tracking']:
                log_error(f"Missing tracking.{key}")
                return False
        log_success(f"tracking structure verified (googleAnalyticsId, googleTagManagerId, metaPixelId, microsoftClarityId, etc.)")
        
        log_success("GET /api/settings returns complete settings object with all required keys")
        return True
        
    except Exception as e:
        log_error(f"Test failed with exception: {str(e)}")
        return False

def test_put_settings_auth(token):
    """Test PUT /api/settings with and without auth"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}TEST 2: PUT /api/settings (auth required){RESET}")
    print(f"{BLUE}{'='*80}{RESET}")
    
    try:
        # First, get current settings
        response = requests.get(f"{BASE_URL}/settings", timeout=10)
        if response.status_code != 200:
            log_error("Failed to get current settings")
            return False
        
        current_settings = response.json()
        
        # Test without auth - should fail with 401
        log_info("Testing PUT without auth (should fail with 401)...")
        updated_settings = current_settings.copy()
        updated_settings['branding']['websiteName'] = 'Test Update Without Auth'
        
        response = requests.put(f"{BASE_URL}/settings", json=updated_settings, timeout=10)
        
        if response.status_code != 401:
            log_error(f"Expected 401 without auth, got {response.status_code}")
            return False
        
        log_success("PUT without auth correctly rejected with 401")
        
        # Test with auth - should succeed with 200
        log_info("Testing PUT with auth (should succeed with 200)...")
        updated_settings['branding']['websiteName'] = 'BSV Phase 5 Test Update'
        updated_settings['branding']['tagline'] = 'Updated tagline for testing'
        
        response = requests.put(
            f"{BASE_URL}/settings",
            json=updated_settings,
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        if response.status_code != 200:
            log_error(f"Expected 200 with auth, got {response.status_code}")
            return False
        
        log_success("PUT with auth succeeded with 200")
        
        # Verify the update by getting settings again
        response = requests.get(f"{BASE_URL}/settings", timeout=10)
        if response.status_code != 200:
            log_error("Failed to verify updated settings")
            return False
        
        verified_settings = response.json()
        
        if verified_settings['branding']['websiteName'] != 'BSV Phase 5 Test Update':
            log_error(f"Settings not updated correctly. Expected 'BSV Phase 5 Test Update', got '{verified_settings['branding']['websiteName']}'")
            return False
        
        if verified_settings['branding']['tagline'] != 'Updated tagline for testing':
            log_error(f"Tagline not updated correctly")
            return False
        
        log_success("GET after PUT returns updated values (websiteName and tagline verified)")
        
        return True
        
    except Exception as e:
        log_error(f"Test failed with exception: {str(e)}")
        return False

def test_post_settings_reset(token):
    """Test POST /api/settings/reset (auth required)"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}TEST 3: POST /api/settings/reset (auth required){RESET}")
    print(f"{BLUE}{'='*80}{RESET}")
    
    try:
        # Test without auth - should fail with 401
        log_info("Testing POST /api/settings/reset without auth (should fail with 401)...")
        response = requests.post(f"{BASE_URL}/settings/reset", timeout=10)
        
        if response.status_code != 401:
            log_error(f"Expected 401 without auth, got {response.status_code}")
            return False
        
        log_success("POST /api/settings/reset without auth correctly rejected with 401")
        
        # Test with auth - should succeed with 200
        log_info("Testing POST /api/settings/reset with auth (should succeed with 200)...")
        response = requests.post(
            f"{BASE_URL}/settings/reset",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        if response.status_code != 200:
            log_error(f"Expected 200 with auth, got {response.status_code}")
            return False
        
        log_success("POST /api/settings/reset with auth succeeded with 200")
        
        data = response.json()
        if not data.get('success'):
            log_error("Response missing success:true")
            return False
        
        log_success("Response contains success:true")
        
        # Verify reset by checking default values
        response = requests.get(f"{BASE_URL}/settings", timeout=10)
        if response.status_code != 200:
            log_error("Failed to verify reset settings")
            return False
        
        settings = response.json()
        
        if settings['branding']['websiteName'] != 'BSV Snakebite Awareness Campaign':
            log_error(f"Settings not reset to defaults. Expected 'BSV Snakebite Awareness Campaign', got '{settings['branding']['websiteName']}'")
            return False
        
        log_success("Settings reset to defaults verified (websiteName back to default)")
        
        return True
        
    except Exception as e:
        log_error(f"Test failed with exception: {str(e)}")
        return False

def test_get_sitemap_xml():
    """Test GET /api/sitemap.xml (public endpoint)"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}TEST 4: GET /api/sitemap.xml (public){RESET}")
    print(f"{BLUE}{'='*80}{RESET}")
    
    try:
        response = requests.get(f"{BASE_URL}/sitemap.xml", timeout=10)
        
        if response.status_code != 200:
            log_error(f"Expected 200, got {response.status_code}")
            return False
        
        log_success(f"Status: {response.status_code}")
        
        # Verify Content-Type
        content_type = response.headers.get('Content-Type', '')
        if 'application/xml' not in content_type and 'text/xml' not in content_type:
            log_error(f"Expected Content-Type: application/xml, got {content_type}")
            return False
        
        log_success(f"Content-Type: {content_type}")
        
        # Parse XML
        try:
            root = ET.fromstring(response.text)
            
            # Verify XML structure
            if 'urlset' not in root.tag:
                log_error(f"Expected <urlset> root element, got {root.tag}")
                return False
            
            log_success("Valid XML with <urlset> root element")
            
            # Find all <url> elements
            urls = root.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}url')
            
            if len(urls) == 0:
                log_error("No <url> elements found in sitemap")
                return False
            
            log_success(f"Found {len(urls)} <url> elements")
            
            # Verify required URLs
            required_paths = ['/', '/impact-stories', '/reports', '/ngo-network', '/volunteer']
            found_paths = []
            
            for url_elem in urls:
                loc = url_elem.find('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')
                if loc is not None and loc.text:
                    # Extract path from full URL
                    path = loc.text.replace('https://venom-relief-india.preview.emergentagent.com', '')
                    found_paths.append(path)
            
            for required_path in required_paths:
                if required_path not in found_paths:
                    log_error(f"Missing required URL: {required_path}")
                    return False
                log_success(f"Found required URL: {required_path}")
            
            # Check for impact story URLs (should have at least one if stories exist)
            story_urls = [p for p in found_paths if p.startswith('/impact-stories/') and p != '/impact-stories']
            if len(story_urls) > 0:
                log_success(f"Found {len(story_urls)} individual impact story URLs")
            else:
                log_info("No individual impact story URLs found (may be empty)")
            
            return True
            
        except ET.ParseError as e:
            log_error(f"Invalid XML: {str(e)}")
            return False
        
    except Exception as e:
        log_error(f"Test failed with exception: {str(e)}")
        return False

def test_get_robots_txt():
    """Test GET /api/robots.txt (public endpoint)"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}TEST 5: GET /api/robots.txt (public){RESET}")
    print(f"{BLUE}{'='*80}{RESET}")
    
    try:
        response = requests.get(f"{BASE_URL}/robots.txt", timeout=10)
        
        if response.status_code != 200:
            log_error(f"Expected 200, got {response.status_code}")
            return False
        
        log_success(f"Status: {response.status_code}")
        
        # Verify Content-Type
        content_type = response.headers.get('Content-Type', '')
        if 'text/plain' not in content_type:
            log_error(f"Expected Content-Type: text/plain, got {content_type}")
            return False
        
        log_success(f"Content-Type: {content_type}")
        
        # Verify content
        text = response.text
        
        if 'User-agent:' not in text:
            log_error("Missing 'User-agent:' directive")
            return False
        
        log_success("Contains 'User-agent:' directive")
        
        if 'User-agent: *' in text:
            log_success("Contains 'User-agent: *' (allows all bots)")
        
        log_success("robots.txt content valid")
        
        return True
        
    except Exception as e:
        log_error(f"Test failed with exception: {str(e)}")
        return False

def test_redirects_crud(token):
    """Test GET/POST/DELETE /api/redirects"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}TEST 6: Redirects CRUD (GET/POST/DELETE /api/redirects){RESET}")
    print(f"{BLUE}{'='*80}{RESET}")
    
    try:
        # Test GET /api/redirects (public)
        log_info("Testing GET /api/redirects (public)...")
        response = requests.get(f"{BASE_URL}/redirects", timeout=10)
        
        if response.status_code != 200:
            log_error(f"GET /api/redirects failed: {response.status_code}")
            return False
        
        log_success("GET /api/redirects succeeded with 200")
        
        initial_redirects = response.json()
        if not isinstance(initial_redirects, list):
            log_error("GET /api/redirects should return an array")
            return False
        
        log_success(f"GET /api/redirects returns array (count: {len(initial_redirects)})")
        
        # Test POST /api/redirects without auth - should fail with 401
        log_info("Testing POST /api/redirects without auth (should fail with 401)...")
        response = requests.post(
            f"{BASE_URL}/redirects",
            json={"from": "/old-page", "to": "/new-page", "code": 301},
            timeout=10
        )
        
        if response.status_code != 401:
            log_error(f"Expected 401 without auth, got {response.status_code}")
            return False
        
        log_success("POST /api/redirects without auth correctly rejected with 401")
        
        # Test POST /api/redirects with auth - should succeed with 200
        log_info("Testing POST /api/redirects with auth (should succeed with 200)...")
        response = requests.post(
            f"{BASE_URL}/redirects",
            json={"from": "/test-old-url", "to": "/test-new-url", "code": 301},
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        if response.status_code != 200:
            log_error(f"Expected 200 with auth, got {response.status_code}")
            return False
        
        log_success("POST /api/redirects with auth succeeded with 200")
        
        redirect_data = response.json()
        if 'id' not in redirect_data:
            log_error("Response missing 'id' field")
            return False
        
        redirect_id = redirect_data['id']
        log_success(f"Redirect created with id: {redirect_id}")
        
        # Verify redirect was created
        response = requests.get(f"{BASE_URL}/redirects", timeout=10)
        if response.status_code != 200:
            log_error("Failed to verify redirect creation")
            return False
        
        redirects = response.json()
        found = False
        for r in redirects:
            if r.get('id') == redirect_id:
                found = True
                if r.get('from') != '/test-old-url' or r.get('to') != '/test-new-url':
                    log_error("Redirect data mismatch")
                    return False
                break
        
        if not found:
            log_error("Created redirect not found in list")
            return False
        
        log_success("Redirect creation verified via GET")
        
        # Test DELETE /api/redirects/{id} without auth - should fail with 401
        log_info("Testing DELETE /api/redirects/{id} without auth (should fail with 401)...")
        response = requests.delete(f"{BASE_URL}/redirects/{redirect_id}", timeout=10)
        
        if response.status_code != 401:
            log_error(f"Expected 401 without auth, got {response.status_code}")
            return False
        
        log_success("DELETE /api/redirects/{id} without auth correctly rejected with 401")
        
        # Test DELETE /api/redirects/{id} with auth - should succeed with 200
        log_info("Testing DELETE /api/redirects/{id} with auth (should succeed with 200)...")
        response = requests.delete(
            f"{BASE_URL}/redirects/{redirect_id}",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        if response.status_code != 200:
            log_error(f"Expected 200 with auth, got {response.status_code}")
            return False
        
        log_success("DELETE /api/redirects/{id} with auth succeeded with 200")
        
        # Verify redirect was deleted
        response = requests.get(f"{BASE_URL}/redirects", timeout=10)
        if response.status_code != 200:
            log_error("Failed to verify redirect deletion")
            return False
        
        redirects = response.json()
        for r in redirects:
            if r.get('id') == redirect_id:
                log_error("Redirect still exists after deletion")
                return False
        
        log_success("Redirect deletion verified via GET")
        
        return True
        
    except Exception as e:
        log_error(f"Test failed with exception: {str(e)}")
        return False

def test_translate_all_preserves_status(token):
    """Test POST /api/ai/translate-all preserves existing translationStatus"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}TEST 7: POST /api/ai/translate-all (translationStatus preservation bug fix){RESET}")
    print(f"{BLUE}{'='*80}{RESET}")
    
    try:
        # First, get current content
        log_info("Getting current content...")
        response = requests.get(f"{BASE_URL}/content", timeout=10)
        
        if response.status_code != 200:
            log_error(f"Failed to get content: {response.status_code}")
            return False
        
        content = response.json()
        log_success("Current content retrieved")
        
        # Check if there's existing translationStatus
        existing_status = content.get('translationStatus', {})
        log_info(f"Existing translationStatus: {json.dumps(existing_status, indent=2)}")
        
        # If there's an approved status, we'll verify it's preserved
        # If not, we'll create one first
        has_approved = any(v.get('status') == 'approved' for v in existing_status.values())
        
        if not has_approved:
            log_info("No approved translations found. Creating one for testing...")
            # Approve Hindi translation
            response = requests.post(
                f"{BASE_URL}/translations/approve",
                json={"lang": "hi", "status": "approved"},
                headers={"Authorization": f"Bearer {token}"},
                timeout=10
            )
            
            if response.status_code != 200:
                log_warning(f"Failed to approve translation: {response.status_code}. Continuing test anyway...")
            else:
                log_success("Hindi translation approved for testing")
        
        # Get content again to see current translationStatus
        response = requests.get(f"{BASE_URL}/content", timeout=10)
        if response.status_code != 200:
            log_error("Failed to get updated content")
            return False
        
        content = response.json()
        status_before = content.get('translationStatus', {})
        log_info(f"translationStatus before translate-all: {json.dumps(status_before, indent=2)}")
        
        # Now run translate-all for Hindi
        log_info("Running POST /api/ai/translate-all for Hindi...")
        response = requests.post(
            f"{BASE_URL}/ai/translate-all",
            json={"content": content, "targetLangs": ["hi"]},
            headers={"Authorization": f"Bearer {token}"},
            timeout=60
        )
        
        if response.status_code != 200:
            log_error(f"translate-all failed: {response.status_code} - {response.text}")
            return False
        
        log_success("translate-all succeeded with 200")
        
        data = response.json()
        
        if not data.get('success'):
            log_error("Response missing success:true")
            return False
        
        log_success("Response contains success:true")
        
        # Get content again to check translationStatus after translate-all
        response = requests.get(f"{BASE_URL}/content", timeout=10)
        if response.status_code != 200:
            log_error("Failed to get content after translate-all")
            return False
        
        content_after = response.json()
        status_after = content_after.get('translationStatus', {})
        log_info(f"translationStatus after translate-all: {json.dumps(status_after, indent=2)}")
        
        # Verify that translationStatus exists and has been updated (not overwritten)
        if 'hi' not in status_after:
            log_error("Hindi translationStatus missing after translate-all")
            return False
        
        log_success("Hindi translationStatus exists after translate-all")
        
        # The bug fix: if status was 'approved' before, it should now be 'pending_review' with reason 're-translated'
        # If it was not approved, it should be 'pending_review' with generatedBy 'ai'
        hi_status = status_after.get('hi', {})
        
        if hi_status.get('status') != 'pending_review':
            log_error(f"Expected status 'pending_review', got '{hi_status.get('status')}'")
            return False
        
        log_success("Hindi status is 'pending_review' (correct)")
        
        # Check if it has the right fields
        if 'generatedAt' not in hi_status and 'approvedAt' not in hi_status:
            log_error("translationStatus missing timestamp fields")
            return False
        
        log_success("translationStatus has timestamp fields")
        
        # The key verification: existing translationStatus was preserved and updated, not overwritten
        # If there were other languages in status_before, they should still be there
        for lang in status_before:
            if lang not in status_after:
                log_error(f"Language '{lang}' was in translationStatus before but missing after translate-all")
                return False
        
        log_success("Existing translationStatus preserved (not overwritten) - bug fix verified")
        
        return True
        
    except Exception as e:
        log_error(f"Test failed with exception: {str(e)}")
        return False

def main():
    """Run all Phase 5 backend tests"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}BSV SNAKEBITE CAMPAIGN - PHASE 5 BACKEND TESTING{RESET}")
    print(f"{BLUE}Global Settings Module Verification{RESET}")
    print(f"{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}Base URL: {BASE_URL}{RESET}")
    print(f"{BLUE}Admin: {ADMIN_EMAIL}{RESET}")
    print(f"{BLUE}{'='*80}{RESET}")
    
    # Get admin token
    token = get_admin_token()
    if not token:
        log_error("Failed to obtain admin token. Cannot proceed with tests.")
        sys.exit(1)
    
    # Run all tests
    results = []
    
    results.append(("GET /api/settings (public)", test_get_settings_public()))
    results.append(("PUT /api/settings (auth)", test_put_settings_auth(token)))
    results.append(("POST /api/settings/reset (auth)", test_post_settings_reset(token)))
    results.append(("GET /api/sitemap.xml (public)", test_get_sitemap_xml()))
    results.append(("GET /api/robots.txt (public)", test_get_robots_txt()))
    results.append(("Redirects CRUD (GET/POST/DELETE)", test_redirects_crud(token)))
    results.append(("POST /api/ai/translate-all (bug fix)", test_translate_all_preserves_status(token)))
    
    # Summary
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}TEST SUMMARY{RESET}")
    print(f"{BLUE}{'='*80}{RESET}")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = f"{GREEN}✅ PASSED{RESET}" if result else f"{RED}❌ FAILED{RESET}"
        print(f"{test_name}: {status}")
    
    print(f"\n{BLUE}{'='*80}{RESET}")
    if passed == total:
        print(f"{GREEN}ALL {total} TESTS PASSED! 🎉{RESET}")
        print(f"{BLUE}{'='*80}{RESET}")
        sys.exit(0)
    else:
        print(f"{RED}{total - passed} TEST(S) FAILED OUT OF {total}{RESET}")
        print(f"{BLUE}{'='*80}{RESET}")
        sys.exit(1)

if __name__ == "__main__":
    main()
