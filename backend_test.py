#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class ERPAPITester:
    def __init__(self, base_url="http://localhost:3000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.tests_run = 0
        self.tests_passed = 0
        self.auth_cookie = None
        
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
                # Format data for TRPC
                if data:
                    trpc_data = {"input": data}
                else:
                    trpc_data = {}
                response = self.session.post(url, json=trpc_data, headers=headers)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ {name} - PASSED")
                try:
                    response_data = response.json()
                    if 'result' in response_data and 'data' in response_data['result']:
                        data_length = len(response_data['result']['data']) if isinstance(response_data['result']['data'], list) else 1
                        print(f"   Data items: {data_length}")
                except:
                    pass
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

    def test_login_functionality(self):
        """Test login functionality with admin credentials"""
        print("\n" + "="*50)
        print("🔐 TESTING LOGIN FUNCTIONALITY")
        print("="*50)
        
        # Test email/password login
        login_data = {
            "email": "sohelemid@gmail.com",
            "password": "123abc456"
        }
        
        success, response = self.run_test(
            "Admin Login", 
            "POST", 
            "auth.login", 
            200, 
            login_data
        )
        
        if success and response:
            try:
                response_data = response.json()
                if 'result' in response_data and 'data' in response_data['result']:
                    user_data = response_data['result']['data']
                    print(f"   ✅ Login successful for user: {user_data.get('user', {}).get('name', 'Unknown')}")
                    
                    # Store auth cookie if present
                    if 'erp-user-id' in response.cookies:
                        self.auth_cookie = response.cookies['erp-user-id']
                        self.session.cookies.set('erp-user-id', self.auth_cookie, domain='localhost')
                        print(f"   ✅ Auth cookie stored: {self.auth_cookie}")
                else:
                    print(f"   ⚠️ Unexpected response format: {response_data}")
            except Exception as e:
                print(f"   ⚠️ Error parsing login response: {e}")
        
        # Test auth.me endpoint to verify authentication
        self.run_test("Get Current User", "GET", "auth.me", 200)
        
        return success

    def test_dashboard_endpoints(self):
        """Test dashboard and overview endpoints"""
        print("\n" + "="*50)
        print("🏠 TESTING DASHBOARD ENDPOINTS")
        print("="*50)
        
        # Test dashboard overview
        self.run_test("Dashboard Overview", "GET", "dashboard.getOverview")
        
        # Test dashboard insights
        self.run_test("Dashboard Insights", "GET", "dashboard.getInsights")
        
        # Test notifications
        self.run_test("Dashboard Notifications", "GET", "dashboard.getNotifications")

    def test_financial_endpoints(self):
        """Test financial module endpoints"""
        print("\n" + "="*50)
        print("💰 TESTING FINANCIAL ENDPOINTS")
        print("="*50)
        
        # Test AR endpoints
        self.run_test("Accounts Receivable", "GET", "financial.getAllAR")
        self.run_test("AR Summary", "GET", "financial.getARSummary")
        
        # Test AP endpoints
        self.run_test("Accounts Payable", "GET", "financial.getAllAP")
        self.run_test("AP Summary", "GET", "financial.getAPSummary")

    def test_project_endpoints(self):
        """Test project module endpoints"""
        print("\n" + "="*50)
        print("📋 TESTING PROJECT ENDPOINTS")
        print("="*50)
        
        # Test project endpoints
        self.run_test("All Projects", "GET", "projects.getAll")
        self.run_test("Project Stats", "GET", "projects.getStats")

    def test_customer_endpoints(self):
        """Test customer module endpoints"""
        print("\n" + "="*50)
        print("👥 TESTING CUSTOMER ENDPOINTS")
        print("="*50)
        
        # Test customer endpoints
        self.run_test("All Customers", "GET", "customers.getAll")
        self.run_test("Customer Stats", "GET", "customers.getStats")

    def test_sales_endpoints(self):
        """Test sales module endpoints"""
        print("\n" + "="*50)
        print("🛒 TESTING SALES ENDPOINTS")
        print("="*50)
        
        # Test sales endpoints
        self.run_test("All Sales", "GET", "sales.getAll")
        self.run_test("Sales Products", "GET", "sales.getAllProducts")
        self.run_test("Sales Tracking", "GET", "sales.getAllTracking")
        self.run_test("Performance Summary", "GET", "sales.getPerformanceSummary")

    def test_hr_endpoints(self):
        """Test HR module endpoints"""
        print("\n" + "="*50)
        print("👨‍💼 TESTING HR ENDPOINTS")
        print("="*50)
        
        # Test HR endpoints
        self.run_test("HR Dashboard Stats", "GET", "hr.getDashboardStats")
        self.run_test("All Employees", "GET", "hr.getAllEmployees")
        self.run_test("All Departments", "GET", "hr.getAllDepartments")
        self.run_test("Pending Leave Applications", "GET", "hr.getPendingLeaveApplications")

    def test_action_tracker_endpoints(self):
        """Test action tracker endpoints"""
        print("\n" + "="*50)
        print("🎯 TESTING ACTION TRACKER ENDPOINTS")
        print("="*50)
        
        # Test action tracker endpoints
        self.run_test("All Action Items", "GET", "actionTracker.getAll")
        self.run_test("Open Action Items", "GET", "actionTracker.getOpen")

    def test_tender_quotation_endpoints(self):
        """Test tender/quotation endpoints"""
        print("\n" + "="*50)
        print("📄 TESTING TENDER/QUOTATION ENDPOINTS")
        print("="*50)
        
        # Test tender/quotation endpoints
        self.run_test("All Tenders/Quotations", "GET", "tenderQuotation.getAll")
        self.run_test("Overdue Tenders", "GET", "tenderQuotation.getOverdue")

    def test_income_expenditure_endpoints(self):
        """Test income & expenditure endpoints"""
        print("\n" + "="*50)
        print("💸 TESTING INCOME & EXPENDITURE ENDPOINTS")
        print("="*50)
        
        # Test income/expenditure endpoints
        self.run_test("All Income/Expenditure", "GET", "incomeExpenditure.getAll")
        self.run_test("Income/Expenditure Summary", "GET", "incomeExpenditure.getSummary")

    def test_team_endpoints(self):
        """Test team endpoints"""
        print("\n" + "="*50)
        print("👥 TESTING TEAM ENDPOINTS")
        print("="*50)
        
        # Test team endpoints
        self.run_test("All Team Members", "GET", "team.getAllMembers")

    def test_user_management_endpoints(self):
        """Test user management endpoints (admin only)"""
        print("\n" + "="*50)
        print("🔐 TESTING USER MANAGEMENT ENDPOINTS")
        print("="*50)
        
        # Test user management endpoints
        self.run_test("All Users", "GET", "users.getAll")

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting ERP API Testing...")
        print(f"📅 Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Test login first
        login_success = self.test_login_functionality()
        if not login_success:
            print("❌ Login failed - skipping authenticated endpoints")
            return False
        
        # Test all modules
        self.test_dashboard_endpoints()
        self.test_financial_endpoints()
        self.test_project_endpoints()
        self.test_customer_endpoints()
        self.test_sales_endpoints()
        self.test_hr_endpoints()
        self.test_action_tracker_endpoints()
        self.test_tender_quotation_endpoints()
        self.test_income_expenditure_endpoints()
        self.test_team_endpoints()
        self.test_user_management_endpoints()
        
        # Print final results
        print("\n" + "="*60)
        print("📊 FINAL TEST RESULTS")
        print("="*60)
        print(f"✅ Tests passed: {self.tests_passed}")
        print(f"❌ Tests failed: {self.tests_run - self.tests_passed}")
        print(f"📈 Success rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        print(f"🏁 Total tests run: {self.tests_run}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = ERPAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())