#!/usr/bin/env python3
"""
Backend API Test Suite for BSV Snakebite Campaign - Phase 2 (CMS Platform)
Tests all 42 endpoints including new JWT auth, users, media, AI translation, impact stories, NGOs, reports, volunteers
"""

import requests
import json
import sys
import io

# Configuration
BASE_URL = "https://venom-relief-india.preview.emergentagent.com/api"
ADMIN_EMAIL = "admin@bsv.com"
ADMIN_PASSWORD = "bsv_admin_2025"

# Global variables
jwt_token = None
test_user_id = None
test_media_id = None
test_story_id = None
test_ngo_id = None
test_report_id = None

# Test results tracking
test_results = {
    "passed": 0,
    "failed": 0,
    "errors": []
}

def log_test(test_name, passed, message=""):
    """Log test result"""
    if passed:
        test_results["passed"] += 1
        print(f"✅ PASS: {test_name}")
        if message:
            print(f"   {message}")
    else:
        test_results["failed"] += 1
        test_results["errors"].append(f"{test_name}: {message}")
        print(f"❌ FAIL: {test_name}")
        print(f"   {message}")

# ===== AUTH TESTS =====
def test_auth_login_jwt():
    """Test 1: POST /api/auth/login with JWT"""
    print("\n=== Test 1: POST /api/auth/login (JWT) ===")
    global jwt_token
    try:
        response = requests.post(f"{BASE_URL}/auth/login", 
                                json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, 
                                timeout=10)
        
        if response.status_code == 200:
            log_test("POST /auth/login returns 200", True)
            data = response.json()
            if data.get("token") and data.get("user"):
                jwt_token = data.get("token")
                log_test("POST /auth/login returns token and user", True, f"token: {jwt_token[:20]}...")
            else:
                log_test("POST /auth/login returns token and user", False, f"Got: {data}")
        else:
            log_test("POST /auth/login", False, f"Got status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("POST /auth/login", False, f"Exception: {str(e)}")

def test_auth_me():
    """Test 2: GET /api/auth/me with JWT token"""
    print("\n=== Test 2: GET /api/auth/me ===")
    try:
        headers = {"Authorization": f"Bearer {jwt_token}"}
        response = requests.get(f"{BASE_URL}/auth/me", headers=headers, timeout=10)
        
        if response.status_code == 200:
            log_test("GET /auth/me returns 200", True)
            data = response.json()
            if data.get("user"):
                log_test("GET /auth/me returns user object", True, f"user: {data.get('user').get('email')}")
            else:
                log_test("GET /auth/me returns user object", False, f"Got: {data}")
        else:
            log_test("GET /auth/me", False, f"Got status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("GET /auth/me", False, f"Exception: {str(e)}")

def test_admin_login_legacy():
    """Test 3: POST /api/admin/login (legacy) returns token"""
    print("\n=== Test 3: POST /api/admin/login (Legacy) ===")
    try:
        response = requests.post(f"{BASE_URL}/admin/login", 
                                json={"password": ADMIN_PASSWORD}, 
                                timeout=10)
        
        if response.status_code == 200:
            log_test("POST /admin/login returns 200", True)
            data = response.json()
            if data.get("token") and data.get("success"):
                log_test("POST /admin/login returns token", True)
            else:
                log_test("POST /admin/login returns token", False, f"Got: {data}")
        else:
            log_test("POST /admin/login", False, f"Got status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("POST /admin/login", False, f"Exception: {str(e)}")

def test_legacy_header_auth():
    """Test 4: x-admin-password header still works"""
    print("\n=== Test 4: x-admin-password header (backwards compat) ===")
    try:
        headers = {"x-admin-password": ADMIN_PASSWORD}
        response = requests.get(f"{BASE_URL}/analytics", headers=headers, timeout=10)
        
        if response.status_code == 200:
            log_test("x-admin-password header works", True)
        else:
            log_test("x-admin-password header works", False, f"Got status {response.status_code}")
    except Exception as e:
        log_test("x-admin-password header", False, f"Exception: {str(e)}")

# ===== USERS / ROLES TESTS =====
def test_get_roles_public():
    """Test 5: GET /api/users/roles (public)"""
    print("\n=== Test 5: GET /api/users/roles (Public) ===")
    try:
        response = requests.get(f"{BASE_URL}/users/roles", timeout=10)
        
        if response.status_code == 200:
            log_test("GET /users/roles returns 200", True)
            data = response.json()
            if isinstance(data, list) and len(data) == 6:
                log_test("GET /users/roles returns 6 roles", True, f"roles: {[r['key'] for r in data]}")
            else:
                log_test("GET /users/roles returns 6 roles", False, f"Got {len(data)} roles")
        else:
            log_test("GET /users/roles", False, f"Got status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("GET /users/roles", False, f"Exception: {str(e)}")

def test_get_users_auth():
    """Test 6: GET /api/users (requires super_admin auth)"""
    print("\n=== Test 6: GET /api/users (Auth Required) ===")
    try:
        headers = {"Authorization": f"Bearer {jwt_token}"}
        response = requests.get(f"{BASE_URL}/users", headers=headers, timeout=10)
        
        if response.status_code == 200:
            log_test("GET /users returns 200", True)
            data = response.json()
            if isinstance(data, list):
                log_test("GET /users returns array", True, f"Found {len(data)} users")
            else:
                log_test("GET /users returns array", False, f"Got: {type(data)}")
        else:
            log_test("GET /users", False, f"Got status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("GET /users", False, f"Exception: {str(e)}")

def test_create_user():
    """Test 7: POST /api/users - create user"""
    print("\n=== Test 7: POST /api/users (Create User) ===")
    global test_user_id
    try:
        headers = {"Authorization": f"Bearer {jwt_token}"}
        user_data = {
            "email": "test.manager@bsv.com",
            "password": "test_password_123",
            "name": "Test Campaign Manager",
            "role": "campaign_manager"
        }
        response = requests.post(f"{BASE_URL}/users", json=user_data, headers=headers, timeout=10)
        
        if response.status_code == 200:
            log_test("POST /users returns 200", True)
            data = response.json()
            if data.get("id"):
                test_user_id = data.get("id")
                log_test("POST /users creates user", True, f"user_id: {test_user_id}")
            else:
                log_test("POST /users creates user", False, f"Got: {data}")
        else:
            log_test("POST /users", False, f"Got status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("POST /users", False, f"Exception: {str(e)}")

def test_update_user():
    """Test 8: PATCH /api/users/{id} - update user"""
    print("\n=== Test 8: PATCH /api/users/{id} (Update User) ===")
    try:
        if not test_user_id:
            log_test("PATCH /users/{id}", False, "No test_user_id available")
            return
        
        headers = {"Authorization": f"Bearer {jwt_token}"}
        update_data = {"name": "Updated Campaign Manager"}
        response = requests.patch(f"{BASE_URL}/users/{test_user_id}", json=update_data, headers=headers, timeout=10)
        
        if response.status_code == 200:
            log_test("PATCH /users/{id} returns 200", True)
            data = response.json()
            if data.get("success"):
                log_test("PATCH /users/{id} updates user", True)
            else:
                log_test("PATCH /users/{id} updates user", False, f"Got: {data}")
        else:
            log_test("PATCH /users/{id}", False, f"Got status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("PATCH /users/{id}", False, f"Exception: {str(e)}")

def test_delete_user():
    """Test 9: DELETE /api/users/{id} - delete user"""
    print("\n=== Test 9: DELETE /api/users/{id} (Delete User) ===")
    try:
        if not test_user_id:
            log_test("DELETE /users/{id}", False, "No test_user_id available")
            return
        
        headers = {"Authorization": f"Bearer {jwt_token}"}
        response = requests.delete(f"{BASE_URL}/users/{test_user_id}", headers=headers, timeout=10)
        
        if response.status_code == 200:
            log_test("DELETE /users/{id} returns 200", True)
            data = response.json()
            if data.get("success"):
                log_test("DELETE /users/{id} deletes user", True)
            else:
                log_test("DELETE /users/{id} deletes user", False, f"Got: {data}")
        else:
            log_test("DELETE /users/{id}", False, f"Got status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("DELETE /users/{id}", False, f"Exception: {str(e)}")

# ===== MEDIA LIBRARY TESTS =====
def test_upload_media():
    """Test 10: POST /api/media - upload file"""
    print("\n=== Test 10: POST /api/media (Upload File) ===")
    global test_media_id
    try:
        headers = {"Authorization": f"Bearer {jwt_token}"}
        
        # Create a test file
        file_content = b"This is a test file for BSV media library"
        files = {'file': ('test_document.txt', io.BytesIO(file_content), 'text/plain')}
        data = {
            'title': 'Test Document',
            'category': 'test',
            'alt': 'Test document for media library',
            'tags': 'test,document'
        }
        
        response = requests.post(f"{BASE_URL}/media", files=files, data=data, headers=headers, timeout=10)
        
        if response.status_code == 200:
            log_test("POST /media returns 200", True)
            resp_data = response.json()
            if resp_data.get("id"):
                test_media_id = resp_data.get("id")
                log_test("POST /media uploads file", True, f"media_id: {test_media_id}")
            else:
                log_test("POST /media uploads file", False, f"Got: {resp_data}")
        else:
            log_test("POST /media", False, f"Got status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("POST /media", False, f"Exception: {str(e)}")

def test_get_media_list():
    """Test 11: GET /api/media - list all media"""
    print("\n=== Test 11: GET /api/media (List Media) ===")
    try:
        response = requests.get(f"{BASE_URL}/media", timeout=10)
        
        if response.status_code == 200:
            log_test("GET /media returns 200", True)
            data = response.json()
            if isinstance(data, list):
                log_test("GET /media returns array", True, f"Found {len(data)} media items")
            else:
                log_test("GET /media returns array", False, f"Got: {type(data)}")
        else:
            log_test("GET /media", False, f"Got status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("GET /media", False, f"Exception: {str(e)}")

def test_get_media_file():
    """Test 12: GET /api/media/{id} - download file"""
    print("\n=== Test 12: GET /api/media/{id} (Download File) ===")
    try:
        if not test_media_id:
            log_test("GET /media/{id}", False, "No test_media_id available")
            return
        
        response = requests.get(f"{BASE_URL}/media/{test_media_id}", timeout=10)
        
        if response.status_code == 200:
            log_test("GET /media/{id} returns 200", True)
            if response.headers.get('Content-Type') == 'text/plain':
                log_test("GET /media/{id} returns correct Content-Type", True)
            else:
                log_test("GET /media/{id} returns correct Content-Type", False, f"Got: {response.headers.get('Content-Type')}")
        else:
            log_test("GET /media/{id}", False, f"Got status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("GET /media/{id}", False, f"Exception: {str(e)}")

def test_update_media_metadata():
    """Test 13: PATCH /api/media/{id} - update metadata"""
    print("\n=== Test 13: PATCH /api/media/{id} (Update Metadata) ===")
    try:
        if not test_media_id:
            log_test("PATCH /media/{id}", False, "No test_media_id available")
            return
        
        headers = {"Authorization": f"Bearer {jwt_token}"}
        update_data = {
            "title": "Updated Test Document",
            "alt": "Updated alt text",
            "tags": ["test", "updated"]
        }
        response = requests.patch(f"{BASE_URL}/media/{test_media_id}", json=update_data, headers=headers, timeout=10)
        
        if response.status_code == 200:
            log_test("PATCH /media/{id} returns 200", True)
            data = response.json()
            if data.get("success"):
                log_test("PATCH /media/{id} updates metadata", True)
            else:
                log_test("PATCH /media/{id} updates metadata", False, f"Got: {data}")
        else:
            log_test("PATCH /media/{id}", False, f"Got status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("PATCH /media/{id}", False, f"Exception: {str(e)}")

def test_delete_media():
    """Test 14: DELETE /api/media/{id} - delete file"""
    print("\n=== Test 14: DELETE /api/media/{id} (Delete File) ===")
    try:
        if not test_media_id:
            log_test("DELETE /media/{id}", False, "No test_media_id available")
            return
        
        headers = {"Authorization": f"Bearer {jwt_token}"}
        response = requests.delete(f"{BASE_URL}/media/{test_media_id}", headers=headers, timeout=10)
        
        if response.status_code == 200:
            log_test("DELETE /media/{id} returns 200", True)
            data = response.json()
            if data.get("success"):
                log_test("DELETE /media/{id} deletes file", True)
            else:
                log_test("DELETE /media/{id} deletes file", False, f"Got: {data}")
        else:
            log_test("DELETE /media/{id}", False, f"Got status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("DELETE /media/{id}", False, f"Exception: {str(e)}")

# ===== AI TRANSLATION TEST =====
def test_ai_translate():
    """Test 15: POST /api/ai/translate - translate text"""
    print("\n=== Test 15: POST /api/ai/translate (AI Translation) ===")
    try:
        headers = {"Authorization": f"Bearer {jwt_token}"}
        translate_data = {
            "text": "Snakebite is a serious medical emergency",
            "targetLang": "hi"
        }
        response = requests.post(f"{BASE_URL}/ai/translate", json=translate_data, headers=headers, timeout=30)
        
        if response.status_code == 200:
            log_test("POST /ai/translate returns 200", True)
            data = response.json()
            if data.get("translated") and len(data.get("translated", "")) > 0:
                log_test("POST /ai/translate returns translated text", True, f"translated: {data.get('translated')[:50]}...")
            else:
                log_test("POST /ai/translate returns translated text", False, f"Got: {data}")
        else:
            log_test("POST /ai/translate", False, f"Got status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("POST /ai/translate", False, f"Exception: {str(e)}")

# ===== IMPACT STORIES TESTS =====
def test_get_impact_stories_public():
    """Test 16: GET /api/impact-stories (public, only published)"""
    print("\n=== Test 16: GET /api/impact-stories (Public) ===")
    try:
        response = requests.get(f"{BASE_URL}/impact-stories", timeout=10)
        
        if response.status_code == 200:
            log_test("GET /impact-stories returns 200", True)
            data = response.json()
            if isinstance(data, list):
                log_test("GET /impact-stories returns array", True, f"Found {len(data)} stories")
            else:
                log_test("GET /impact-stories returns array", False, f"Got: {type(data)}")
        else:
            log_test("GET /impact-stories", False, f"Got status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("GET /impact-stories", False, f"Exception: {str(e)}")

def test_create_impact_story():
    """Test 17: POST /api/impact-stories - create story"""
    print("\n=== Test 17: POST /api/impact-stories (Create Story) ===")
    global test_story_id
    try:
        headers = {"Authorization": f"Bearer {jwt_token}"}
        story_data = {
            "title": "Life Saved in Rural Maharashtra",
            "description": "Quick action and proper treatment saved a farmer's life after snakebite",
            "category": "Success Story",
            "state": "Maharashtra",
            "beneficiary": "Ramesh Patil",
            "ngo": "Rural Health Foundation",
            "published": True
        }
        response = requests.post(f"{BASE_URL}/impact-stories", json=story_data, headers=headers, timeout=10)
        
        if response.status_code == 200:
            log_test("POST /impact-stories returns 200", True)
            data = response.json()
            if data.get("id"):
                test_story_id = data.get("id")
                log_test("POST /impact-stories creates story", True, f"story_id: {test_story_id}")
            else:
                log_test("POST /impact-stories creates story", False, f"Got: {data}")
        else:
            log_test("POST /impact-stories", False, f"Got status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("POST /impact-stories", False, f"Exception: {str(e)}")

def test_update_impact_story():
    """Test 18: PATCH /api/impact-stories/{id} - update story"""
    print("\n=== Test 18: PATCH /api/impact-stories/{id} (Update Story) ===")
    try:
        if not test_story_id:
            log_test("PATCH /impact-stories/{id}", False, "No test_story_id available")
            return
        
        headers = {"Authorization": f"Bearer {jwt_token}"}
        update_data = {"description": "Updated description with more details"}
        response = requests.patch(f"{BASE_URL}/impact-stories/{test_story_id}", json=update_data, headers=headers, timeout=10)
        
        if response.status_code == 200:
            log_test("PATCH /impact-stories/{id} returns 200", True)
            data = response.json()
            if data.get("success"):
                log_test("PATCH /impact-stories/{id} updates story", True)
            else:
                log_test("PATCH /impact-stories/{id} updates story", False, f"Got: {data}")
        else:
            log_test("PATCH /impact-stories/{id}", False, f"Got status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("PATCH /impact-stories/{id}", False, f"Exception: {str(e)}")

def test_delete_impact_story():
    """Test 19: DELETE /api/impact-stories/{id} - delete story"""
    print("\n=== Test 19: DELETE /api/impact-stories/{id} (Delete Story) ===")
    try:
        if not test_story_id:
            log_test("DELETE /impact-stories/{id}", False, "No test_story_id available")
            return
        
        headers = {"Authorization": f"Bearer {jwt_token}"}
        response = requests.delete(f"{BASE_URL}/impact-stories/{test_story_id}", headers=headers, timeout=10)
        
        if response.status_code == 200:
            log_test("DELETE /impact-stories/{id} returns 200", True)
            data = response.json()
            if data.get("success"):
                log_test("DELETE /impact-stories/{id} deletes story", True)
            else:
                log_test("DELETE /impact-stories/{id} deletes story", False, f"Got: {data}")
        else:
            log_test("DELETE /impact-stories/{id}", False, f"Got status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("DELETE /impact-stories/{id}", False, f"Exception: {str(e)}")

# ===== NGOS TESTS =====
def test_get_ngos_public():
    """Test 20: GET /api/ngos (public)"""
    print("\n=== Test 20: GET /api/ngos (Public) ===")
    try:
        response = requests.get(f"{BASE_URL}/ngos", timeout=10)
        
        if response.status_code == 200:
            log_test("GET /ngos returns 200", True)
            data = response.json()
            if isinstance(data, list):
                log_test("GET /ngos returns array", True, f"Found {len(data)} NGOs")
            else:
                log_test("GET /ngos returns array", False, f"Got: {type(data)}")
        else:
            log_test("GET /ngos", False, f"Got status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("GET /ngos", False, f"Exception: {str(e)}")

def test_create_ngo():
    """Test 21: POST /api/ngos - create NGO"""
    print("\n=== Test 21: POST /api/ngos (Create NGO) ===")
    global test_ngo_id
    try:
        headers = {"Authorization": f"Bearer {jwt_token}"}
        ngo_data = {
            "name": "Test Rural Health Foundation",
            "description": "Working on snakebite awareness in rural areas",
            "email": "contact@testruralhealthfoundation.org",
            "phone": "+91-9876543210",
            "stateCoverage": ["Maharashtra", "Karnataka"],
            "published": True
        }
        response = requests.post(f"{BASE_URL}/ngos", json=ngo_data, headers=headers, timeout=10)
        
        if response.status_code == 200:
            log_test("POST /ngos returns 200", True)
            data = response.json()
            if data.get("id"):
                test_ngo_id = data.get("id")
                log_test("POST /ngos creates NGO", True, f"ngo_id: {test_ngo_id}")
            else:
                log_test("POST /ngos creates NGO", False, f"Got: {data}")
        else:
            log_test("POST /ngos", False, f"Got status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("POST /ngos", False, f"Exception: {str(e)}")

def test_update_ngo():
    """Test 22: PATCH /api/ngos/{id} - update NGO"""
    print("\n=== Test 22: PATCH /api/ngos/{id} (Update NGO) ===")
    try:
        if not test_ngo_id:
            log_test("PATCH /ngos/{id}", False, "No test_ngo_id available")
            return
        
        headers = {"Authorization": f"Bearer {jwt_token}"}
        update_data = {"description": "Updated description for NGO"}
        response = requests.patch(f"{BASE_URL}/ngos/{test_ngo_id}", json=update_data, headers=headers, timeout=10)
        
        if response.status_code == 200:
            log_test("PATCH /ngos/{id} returns 200", True)
            data = response.json()
            if data.get("success"):
                log_test("PATCH /ngos/{id} updates NGO", True)
            else:
                log_test("PATCH /ngos/{id} updates NGO", False, f"Got: {data}")
        else:
            log_test("PATCH /ngos/{id}", False, f"Got status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("PATCH /ngos/{id}", False, f"Exception: {str(e)}")

def test_delete_ngo():
    """Test 23: DELETE /api/ngos/{id} - delete NGO"""
    print("\n=== Test 23: DELETE /api/ngos/{id} (Delete NGO) ===")
    try:
        if not test_ngo_id:
            log_test("DELETE /ngos/{id}", False, "No test_ngo_id available")
            return
        
        headers = {"Authorization": f"Bearer {jwt_token}"}
        response = requests.delete(f"{BASE_URL}/ngos/{test_ngo_id}", headers=headers, timeout=10)
        
        if response.status_code == 200:
            log_test("DELETE /ngos/{id} returns 200", True)
            data = response.json()
            if data.get("success"):
                log_test("DELETE /ngos/{id} deletes NGO", True)
            else:
                log_test("DELETE /ngos/{id} deletes NGO", False, f"Got: {data}")
        else:
            log_test("DELETE /ngos/{id}", False, f"Got status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("DELETE /ngos/{id}", False, f"Exception: {str(e)}")

# ===== REPORTS TESTS =====
def test_get_reports():
    """Test 24: GET /api/reports"""
    print("\n=== Test 24: GET /api/reports ===")
    try:
        response = requests.get(f"{BASE_URL}/reports", timeout=10)
        
        if response.status_code == 200:
            log_test("GET /reports returns 200", True)
            data = response.json()
            if isinstance(data, list):
                log_test("GET /reports returns array", True, f"Found {len(data)} reports")
            else:
                log_test("GET /reports returns array", False, f"Got: {type(data)}")
        else:
            log_test("GET /reports", False, f"Got status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("GET /reports", False, f"Exception: {str(e)}")

def test_create_report():
    """Test 25: POST /api/reports - create report"""
    print("\n=== Test 25: POST /api/reports (Create Report) ===")
    global test_report_id
    try:
        headers = {"Authorization": f"Bearer {jwt_token}"}
        report_data = {
            "title": "Annual Snakebite Report 2024",
            "category": "Annual Report",
            "description": "Comprehensive report on snakebite incidents and treatment outcomes",
            "language": "en",
            "published": True
        }
        response = requests.post(f"{BASE_URL}/reports", json=report_data, headers=headers, timeout=10)
        
        if response.status_code == 200:
            log_test("POST /reports returns 200", True)
            data = response.json()
            if data.get("id"):
                test_report_id = data.get("id")
                log_test("POST /reports creates report", True, f"report_id: {test_report_id}")
            else:
                log_test("POST /reports creates report", False, f"Got: {data}")
        else:
            log_test("POST /reports", False, f"Got status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("POST /reports", False, f"Exception: {str(e)}")

def test_download_report():
    """Test 26: POST /api/reports/{id}/download - increment download count"""
    print("\n=== Test 26: POST /api/reports/{id}/download (Increment Download) ===")
    try:
        if not test_report_id:
            log_test("POST /reports/{id}/download", False, "No test_report_id available")
            return
        
        response = requests.post(f"{BASE_URL}/reports/{test_report_id}/download", timeout=10)
        
        if response.status_code == 200:
            log_test("POST /reports/{id}/download returns 200", True)
            data = response.json()
            if data.get("success"):
                log_test("POST /reports/{id}/download increments count", True)
            else:
                log_test("POST /reports/{id}/download increments count", False, f"Got: {data}")
        else:
            log_test("POST /reports/{id}/download", False, f"Got status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("POST /reports/{id}/download", False, f"Exception: {str(e)}")

def test_update_report():
    """Test 27: PATCH /api/reports/{id} - update report"""
    print("\n=== Test 27: PATCH /api/reports/{id} (Update Report) ===")
    try:
        if not test_report_id:
            log_test("PATCH /reports/{id}", False, "No test_report_id available")
            return
        
        headers = {"Authorization": f"Bearer {jwt_token}"}
        update_data = {"description": "Updated report description"}
        response = requests.patch(f"{BASE_URL}/reports/{test_report_id}", json=update_data, headers=headers, timeout=10)
        
        if response.status_code == 200:
            log_test("PATCH /reports/{id} returns 200", True)
            data = response.json()
            if data.get("success"):
                log_test("PATCH /reports/{id} updates report", True)
            else:
                log_test("PATCH /reports/{id} updates report", False, f"Got: {data}")
        else:
            log_test("PATCH /reports/{id}", False, f"Got status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("PATCH /reports/{id}", False, f"Exception: {str(e)}")

def test_delete_report():
    """Test 28: DELETE /api/reports/{id} - delete report"""
    print("\n=== Test 28: DELETE /api/reports/{id} (Delete Report) ===")
    try:
        if not test_report_id:
            log_test("DELETE /reports/{id}", False, "No test_report_id available")
            return
        
        headers = {"Authorization": f"Bearer {jwt_token}"}
        response = requests.delete(f"{BASE_URL}/reports/{test_report_id}", headers=headers, timeout=10)
        
        if response.status_code == 200:
            log_test("DELETE /reports/{id} returns 200", True)
            data = response.json()
            if data.get("success"):
                log_test("DELETE /reports/{id} deletes report", True)
            else:
                log_test("DELETE /reports/{id} deletes report", False, f"Got: {data}")
        else:
            log_test("DELETE /reports/{id}", False, f"Got status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("DELETE /reports/{id}", False, f"Exception: {str(e)}")

# ===== VOLUNTEERS TESTS =====
def test_submit_volunteer_application():
    """Test 29: POST /api/volunteers (public) - submit application"""
    print("\n=== Test 29: POST /api/volunteers (Submit Application) ===")
    try:
        volunteer_data = {
            "name": "Anjali Deshmukh",
            "email": "anjali.deshmukh@example.com",
            "phone": "+91-9876543210",
            "state": "Maharashtra",
            "city": "Pune",
            "occupation": "Student",
            "interests": ["awareness campaigns", "community outreach"],
            "availability": "Weekends",
            "message": "I want to help spread awareness about snakebite prevention"
        }
        response = requests.post(f"{BASE_URL}/volunteers", json=volunteer_data, timeout=10)
        
        if response.status_code == 200:
            log_test("POST /volunteers returns 200", True)
            data = response.json()
            if data.get("success") and data.get("id"):
                log_test("POST /volunteers submits application", True, f"volunteer_id: {data.get('id')}")
            else:
                log_test("POST /volunteers submits application", False, f"Got: {data}")
        else:
            log_test("POST /volunteers", False, f"Got status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("POST /volunteers", False, f"Exception: {str(e)}")

def test_get_volunteers_auth():
    """Test 30: GET /api/volunteers (auth) - list applications"""
    print("\n=== Test 30: GET /api/volunteers (Auth Required) ===")
    try:
        headers = {"Authorization": f"Bearer {jwt_token}"}
        response = requests.get(f"{BASE_URL}/volunteers", headers=headers, timeout=10)
        
        if response.status_code == 200:
            log_test("GET /volunteers returns 200", True)
            data = response.json()
            if isinstance(data, list):
                log_test("GET /volunteers returns array", True, f"Found {len(data)} volunteers")
            else:
                log_test("GET /volunteers returns array", False, f"Got: {type(data)}")
        else:
            log_test("GET /volunteers", False, f"Got status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("GET /volunteers", False, f"Exception: {str(e)}")

# ===== EXISTING ENDPOINTS (VERIFY STILL WORK) =====
def test_get_content():
    """Test 31: GET /api/content - verify still works with new keys"""
    print("\n=== Test 31: GET /api/content (Verify Existing) ===")
    try:
        response = requests.get(f"{BASE_URL}/content", timeout=10)
        
        if response.status_code == 200:
            log_test("GET /content returns 200", True)
            data = response.json()
            # Check for new keys
            if "footer" in data and "sections" in data:
                log_test("GET /content includes footer and sections keys", True)
            else:
                log_test("GET /content includes footer and sections keys", False, f"Missing keys in: {data.keys()}")
        else:
            log_test("GET /content", False, f"Got status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("GET /content", False, f"Exception: {str(e)}")

def test_put_content():
    """Test 32: PUT /api/content - admin only"""
    print("\n=== Test 32: PUT /api/content (Admin Only) ===")
    try:
        headers = {"Authorization": f"Bearer {jwt_token}"}
        test_data = {"hero": {"title": "Test Update Phase 2"}}
        response = requests.put(f"{BASE_URL}/content", json=test_data, headers=headers, timeout=10)
        
        if response.status_code == 200:
            log_test("PUT /content with auth returns 200", True)
        else:
            log_test("PUT /content with auth", False, f"Got status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("PUT /content", False, f"Exception: {str(e)}")

def test_reset_content():
    """Test 33: POST /api/content/reset - admin only"""
    print("\n=== Test 33: POST /api/content/reset (Admin Only) ===")
    try:
        headers = {"Authorization": f"Bearer {jwt_token}"}
        response = requests.post(f"{BASE_URL}/content/reset", headers=headers, timeout=10)
        
        if response.status_code == 200:
            log_test("POST /content/reset with auth returns 200", True)
        else:
            log_test("POST /content/reset with auth", False, f"Got status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("POST /content/reset", False, f"Exception: {str(e)}")

def test_post_contact():
    """Test 34: POST /api/contact (public)"""
    print("\n=== Test 34: POST /api/contact (Public) ===")
    try:
        contact_data = {
            "name": "Vikram Singh",
            "email": "vikram.singh@example.com",
            "phone": "+91-9123456789",
            "message": "Need information about snakebite treatment centers"
        }
        response = requests.post(f"{BASE_URL}/contact", json=contact_data, timeout=10)
        
        if response.status_code == 200:
            log_test("POST /contact returns 200", True)
        else:
            log_test("POST /contact", False, f"Got status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("POST /contact", False, f"Exception: {str(e)}")

def test_post_partnership():
    """Test 35: POST /api/partnership (public)"""
    print("\n=== Test 35: POST /api/partnership (Public) ===")
    try:
        partnership_data = {
            "organization": "State Health Department",
            "type": "Government",
            "name": "Dr. Meera Kulkarni",
            "email": "meera.kulkarni@health.gov.in",
            "phone": "+91-9988776655",
            "state": "Karnataka",
            "message": "Interested in collaboration for state-wide awareness program"
        }
        response = requests.post(f"{BASE_URL}/partnership", json=partnership_data, timeout=10)
        
        if response.status_code == 200:
            log_test("POST /partnership returns 200", True)
        else:
            log_test("POST /partnership", False, f"Got status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("POST /partnership", False, f"Exception: {str(e)}")

def test_get_contact_auth():
    """Test 36: GET /api/contact (auth)"""
    print("\n=== Test 36: GET /api/contact (Auth Required) ===")
    try:
        headers = {"Authorization": f"Bearer {jwt_token}"}
        response = requests.get(f"{BASE_URL}/contact", headers=headers, timeout=10)
        
        if response.status_code == 200:
            log_test("GET /contact with auth returns 200", True)
        else:
            log_test("GET /contact with auth", False, f"Got status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("GET /contact", False, f"Exception: {str(e)}")

def test_get_partnership_auth():
    """Test 37: GET /api/partnership (auth)"""
    print("\n=== Test 37: GET /api/partnership (Auth Required) ===")
    try:
        headers = {"Authorization": f"Bearer {jwt_token}"}
        response = requests.get(f"{BASE_URL}/partnership", headers=headers, timeout=10)
        
        if response.status_code == 200:
            log_test("GET /partnership with auth returns 200", True)
        else:
            log_test("GET /partnership with auth", False, f"Got status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("GET /partnership", False, f"Exception: {str(e)}")

def test_post_leads():
    """Test 38: POST /api/leads"""
    print("\n=== Test 38: POST /api/leads ===")
    try:
        lead_data = {
            "name": "Dr. Suresh Nair",
            "email": "suresh.nair@hospital.in",
            "phone": "+91-9876543210",
            "organization": "District Hospital",
            "state": "Kerala",
            "purpose": "Healthcare Professional"
        }
        response = requests.post(f"{BASE_URL}/leads", json=lead_data, timeout=10)
        
        if response.status_code == 200:
            log_test("POST /leads returns 200", True)
        else:
            log_test("POST /leads", False, f"Got status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("POST /leads", False, f"Exception: {str(e)}")

def test_get_leads_auth():
    """Test 39: GET /api/leads (auth)"""
    print("\n=== Test 39: GET /api/leads (Auth Required) ===")
    try:
        headers = {"Authorization": f"Bearer {jwt_token}"}
        response = requests.get(f"{BASE_URL}/leads", headers=headers, timeout=10)
        
        if response.status_code == 200:
            log_test("GET /leads with auth returns 200", True)
        else:
            log_test("GET /leads with auth", False, f"Got status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("GET /leads", False, f"Exception: {str(e)}")

def test_post_quiz_submit():
    """Test 40: POST /api/quiz/submit"""
    print("\n=== Test 40: POST /api/quiz/submit ===")
    try:
        quiz_data = {
            "name": "Kavita Sharma",
            "state": "Rajasthan",
            "district": "Jaipur",
            "occupation": "Teacher",
            "commonMyth": "Myth about snake identification",
            "score": 5,
            "total": 6
        }
        response = requests.post(f"{BASE_URL}/quiz/submit", json=quiz_data, timeout=10)
        
        if response.status_code == 200:
            log_test("POST /quiz/submit returns 200", True)
        else:
            log_test("POST /quiz/submit", False, f"Got status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("POST /quiz/submit", False, f"Exception: {str(e)}")

def test_get_quiz_results_auth():
    """Test 41: GET /api/quiz/results (auth)"""
    print("\n=== Test 41: GET /api/quiz/results (Auth Required) ===")
    try:
        headers = {"Authorization": f"Bearer {jwt_token}"}
        response = requests.get(f"{BASE_URL}/quiz/results", headers=headers, timeout=10)
        
        if response.status_code == 200:
            log_test("GET /quiz/results with auth returns 200", True)
        else:
            log_test("GET /quiz/results with auth", False, f"Got status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("GET /quiz/results", False, f"Exception: {str(e)}")

def test_get_analytics():
    """Test 42: GET /api/analytics - verify new fields"""
    print("\n=== Test 42: GET /api/analytics (Verify New Fields) ===")
    try:
        headers = {"Authorization": f"Bearer {jwt_token}"}
        response = requests.get(f"{BASE_URL}/analytics", headers=headers, timeout=10)
        
        if response.status_code == 200:
            log_test("GET /analytics returns 200", True)
            data = response.json()
            totals = data.get("totals", {})
            # Check for new fields
            if "volunteers" in totals and "media" in totals and "impactStories" in totals:
                log_test("GET /analytics includes new totals (volunteers, media, impactStories)", True)
            else:
                log_test("GET /analytics includes new totals", False, f"Missing fields in totals: {totals.keys()}")
            
            if "mythHeatmap" in data:
                log_test("GET /analytics includes mythHeatmap", True)
            else:
                log_test("GET /analytics includes mythHeatmap", False)
        else:
            log_test("GET /analytics", False, f"Got status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("GET /analytics", False, f"Exception: {str(e)}")

def main():
    """Run all tests"""
    print("=" * 80)
    print("BSV SNAKEBITE CAMPAIGN - PHASE 2 BACKEND API TEST SUITE")
    print("=" * 80)
    print(f"Base URL: {BASE_URL}")
    print(f"Admin Email: {ADMIN_EMAIL}")
    print(f"Admin Password: {ADMIN_PASSWORD}")
    print("=" * 80)
    
    # Run all tests in order
    # AUTH (4 tests)
    test_auth_login_jwt()
    test_auth_me()
    test_admin_login_legacy()
    test_legacy_header_auth()
    
    # USERS/ROLES (5 tests)
    test_get_roles_public()
    test_get_users_auth()
    test_create_user()
    test_update_user()
    test_delete_user()
    
    # MEDIA (5 tests)
    test_upload_media()
    test_get_media_list()
    test_get_media_file()
    test_update_media_metadata()
    test_delete_media()
    
    # AI TRANSLATION (1 test)
    test_ai_translate()
    
    # IMPACT STORIES (4 tests)
    test_get_impact_stories_public()
    test_create_impact_story()
    test_update_impact_story()
    test_delete_impact_story()
    
    # NGOS (4 tests)
    test_get_ngos_public()
    test_create_ngo()
    test_update_ngo()
    test_delete_ngo()
    
    # REPORTS (5 tests)
    test_get_reports()
    test_create_report()
    test_download_report()
    test_update_report()
    test_delete_report()
    
    # VOLUNTEERS (2 tests)
    test_submit_volunteer_application()
    test_get_volunteers_auth()
    
    # EXISTING ENDPOINTS (11 tests)
    test_get_content()
    test_put_content()
    test_reset_content()
    test_post_contact()
    test_post_partnership()
    test_get_contact_auth()
    test_get_partnership_auth()
    test_post_leads()
    test_get_leads_auth()
    test_post_quiz_submit()
    test_get_quiz_results_auth()
    test_get_analytics()
    
    # Print summary
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    print(f"✅ Passed: {test_results['passed']}")
    print(f"❌ Failed: {test_results['failed']}")
    print(f"Total: {test_results['passed'] + test_results['failed']}")
    
    if test_results['failed'] > 0:
        print("\n❌ FAILED TESTS:")
        for error in test_results['errors']:
            print(f"  - {error}")
        sys.exit(1)
    else:
        print("\n✅ ALL TESTS PASSED!")
        sys.exit(0)

if __name__ == "__main__":
    main()
