#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class AdminSettingsAPITester:
    def __init__(self, base_url="http://localhost:3000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.tests_run = 0
        self.tests_passed = 0
        
        # Set demo mode cookie for admin access
        self.session.cookies.set('erp-demo-mode', 'true', domain='localhost')

    def run_test(self, name, method, endpoint, expected_status=200, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/trpc/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=headers)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=headers)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ {name} - PASSED")
                try:
                    response_data = response.json()
                    if 'result' in response_data and 'data' in response_data['result']:
                        data_items = response_data['result']['data']
                        if isinstance(data_items, list):
                            print(f"   Data items: {len(data_items)}")
                            if len(data_items) > 0:
                                print(f"   Sample item keys: {list(data_items[0].keys()) if isinstance(data_items[0], dict) else 'N/A'}")
                        else:
                            print(f"   Data type: {type(data_items)}")
                except Exception as e:
                    print(f"   Response parsing error: {e}")
            else:
                print(f"❌ {name} - FAILED (Expected {expected_status}, got {response.status_code})")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Response: {response.text[:200]}...")

            return success, response

        except Exception as e:
            print(f"❌ {name} - ERROR: {str(e)}")
            return False, None

    def test_security_settings_endpoints(self):
        """Test security settings endpoints"""
        print("\n" + "="*60)
        print("🔐 TESTING SECURITY SETTINGS ENDPOINTS")
        print("="*60)
        
        # Test security settings
        self.run_test("Get All Security Settings", "GET", "security.getAll")
        self.run_test("Get Blocked IPs", "GET", "security.getBlockedIPs")
        self.run_test("Get Active Sessions", "GET", "security.getActiveSessions")
        self.run_test("Get Audit Logs", "GET", "security.getAuditLogs")

    def test_user_management_endpoints(self):
        """Test user management endpoints"""
        print("\n" + "="*60)
        print("👥 TESTING USER MANAGEMENT ENDPOINTS")
        print("="*60)
        
        # Test user management endpoints
        success, response = self.run_test("Get All Users With Details", "GET", "userManagement.getAllWithDetails")
        
        if success and response:
            try:
                data = response.json()
                users = data.get('result', {}).get('data', [])
                print(f"   Found {len(users)} users")
                if len(users) >= 6:
                    print("✅ Expected 6+ users found")
                    # Check if users have required fields
                    sample_user = users[0] if users else {}
                    required_fields = ['name', 'email', 'role']
                    missing_fields = [field for field in required_fields if field not in sample_user]
                    if not missing_fields:
                        print("✅ Users have required fields (name, email, role)")
                    else:
                        print(f"❌ Missing fields in user data: {missing_fields}")
                else:
                    print(f"❌ Expected 6+ users, found {len(users)}")
            except Exception as e:
                print(f"   Error parsing user data: {e}")

    def test_display_preferences_endpoints(self):
        """Test display preferences endpoints"""
        print("\n" + "="*60)
        print("🎨 TESTING DISPLAY PREFERENCES ENDPOINTS")
        print("="*60)
        
        # Test display preferences
        success, response = self.run_test("Get Global Display Preferences", "GET", "displayPreferences.getGlobal")
        
        if success and response:
            try:
                data = response.json()
                prefs = data.get('result', {}).get('data', [])
                print(f"   Found {len(prefs)} display preferences")
                if len(prefs) >= 5:
                    print("✅ Expected 5+ display preferences found")
                    # Check for chart-related settings
                    pref_keys = [pref.get('settingKey', '') for pref in prefs]
                    chart_settings = [key for key in pref_keys if 'chart' in key.lower()]
                    if chart_settings:
                        print(f"✅ Chart-related settings found: {chart_settings}")
                    else:
                        print("❌ No chart-related settings found")
                else:
                    print(f"❌ Expected 5+ preferences, found {len(prefs)}")
            except Exception as e:
                print(f"   Error parsing preferences data: {e}")

    def test_system_settings_endpoints(self):
        """Test system settings endpoints"""
        print("\n" + "="*60)
        print("⚙️ TESTING SYSTEM SETTINGS ENDPOINTS")
        print("="*60)
        
        # Test system settings
        success, response = self.run_test("Get All Settings", "GET", "settings.getAll")
        
        if success and response:
            try:
                data = response.json()
                settings = data.get('result', {}).get('data', [])
                print(f"   Found {len(settings)} system settings")
                # Check for company-related settings
                setting_keys = [setting.get('settingKey', '') for setting in settings]
                company_settings = [key for key in setting_keys if 'company' in key.lower()]
                if company_settings:
                    print(f"✅ Company-related settings found: {company_settings}")
                else:
                    print("❌ No company-related settings found")
            except Exception as e:
                print(f"   Error parsing settings data: {e}")

    def run_all_tests(self):
        """Run all admin settings API tests"""
        print("🚀 Starting Admin Settings API Testing...")
        print(f"📅 Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Test all admin settings modules
        self.test_security_settings_endpoints()
        self.test_user_management_endpoints()
        self.test_display_preferences_endpoints()
        self.test_system_settings_endpoints()
        
        # Print final results
        print("\n" + "="*60)
        print("📊 ADMIN SETTINGS API TEST RESULTS")
        print("="*60)
        print(f"✅ Tests passed: {self.tests_passed}")
        print(f"❌ Tests failed: {self.tests_run - self.tests_passed}")
        print(f"📈 Success rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        print(f"🏁 Total tests run: {self.tests_run}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = AdminSettingsAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())