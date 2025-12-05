#!/usr/bin/env python3
"""
Test script for authentication API endpoints
Run this from the backend directory: python test_auth.py
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000/api"

def test_signup():
    """Test user registration"""
    print("\n" + "="*50)
    print("🧪 Testing User Registration (Sign Up)")
    print("="*50)
    
    payload = {
        "username": f"testuser_{datetime.now().timestamp()}",
        "email": f"test_{datetime.now().timestamp()}@example.com",
        "password": "TestPassword123",
        "company_name": "Test Company"
    }
    
    print(f"\n📤 Sending POST request to /auth/register")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    response = requests.post(f"{BASE_URL}/auth/register", json=payload)
    
    print(f"\n✅ Response Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        data = response.json()
        if data.get("success"):
            token = data.get("data", {}).get("access_token")
            print(f"\n✨ Registration successful!")
            print(f"Token: {token[:50]}...")
            return token, payload["email"]
    
    return None, None

def test_login(email, password):
    """Test user login"""
    print("\n" + "="*50)
    print("🧪 Testing User Login")
    print("="*50)
    
    payload = {
        "email": email,
        "password": password
    }
    
    print(f"\n📤 Sending POST request to /auth/login")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    response = requests.post(f"{BASE_URL}/auth/login", json=payload)
    
    print(f"\n✅ Response Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        data = response.json()
        if data.get("success"):
            token = data.get("data", {}).get("access_token")
            print(f"\n✨ Login successful!")
            print(f"Token: {token[:50]}...")
            return token
    
    return None

def test_get_profile(token):
    """Test getting user profile"""
    print("\n" + "="*50)
    print("🧪 Testing Get User Profile")
    print("="*50)
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    print(f"\n📤 Sending GET request to /auth/me")
    print(f"Headers: {{'Authorization': 'Bearer {token[:30]}...'}}")
    
    response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    
    print(f"\n✅ Response Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        print(f"\n✨ Profile fetched successfully!")

def test_admin_signup():
    """Test admin registration"""
    print("\n" + "="*50)
    print("🧪 Testing Admin Registration")
    print("="*50)
    
    payload = {
        "username": f"admin_{datetime.now().timestamp()}",
        "email": f"admin_{datetime.now().timestamp()}@example.com",
        "password": "AdminPassword123"
    }
    
    print(f"\n📤 Sending POST request to /auth/admin/register")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    response = requests.post(f"{BASE_URL}/auth/admin/register", json=payload)
    
    print(f"\n✅ Response Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        data = response.json()
        if data.get("success"):
            print(f"\n✨ Admin registration successful!")
            admin_user = data.get("data", {}).get("user", {})
            print(f"Admin is_admin: {admin_user.get('is_admin')}")

def test_duplicate_email():
    """Test duplicate email registration (should fail)"""
    print("\n" + "="*50)
    print("🧪 Testing Duplicate Email (Should Fail)")
    print("="*50)
    
    email = f"duplicate_test_{datetime.now().timestamp()}@example.com"
    
    payload1 = {
        "username": "user1",
        "email": email,
        "password": "Password123",
        "company_name": "Company 1"
    }
    
    # First registration should succeed
    print(f"\n📤 First registration...")
    response1 = requests.post(f"{BASE_URL}/auth/register", json=payload1)
    print(f"Status: {response1.status_code}")
    
    # Second registration with same email should fail
    payload2 = {
        "username": "user2",
        "email": email,
        "password": "Password123",
        "company_name": "Company 2"
    }
    
    print(f"\n📤 Second registration with same email (should fail)...")
    response2 = requests.post(f"{BASE_URL}/auth/register", json=payload2)
    print(f"Status: {response2.status_code}")
    print(f"Response: {json.dumps(response2.json(), indent=2)}")
    
    if response2.status_code == 400:
        print(f"\n✨ Correctly rejected duplicate email!")

def main():
    print("\n" + "🚀 "*20)
    print("AUTH API TESTING SUITE")
    print("🚀 "*20)
    
    print("\n⚠️  Make sure the backend is running on http://localhost:8000")
    input("Press Enter to start testing...\n")
    
    try:
        # Test 1: Sign up
        token, email = test_signup()
        
        if not token:
            print("\n❌ Sign up failed, skipping remaining tests")
            return
        
        # Test 2: Login
        login_token = test_login(email, "TestPassword123")
        
        if login_token:
            # Test 3: Get profile
            test_get_profile(login_token)
        
        # Test 4: Admin registration
        test_admin_signup()
        
        # Test 5: Duplicate email
        test_duplicate_email()
        
        print("\n" + "="*50)
        print("✅ All tests completed!")
        print("="*50 + "\n")
        
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Could not connect to backend")
        print("Make sure the backend is running on http://localhost:8000")
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")

if __name__ == "__main__":
    main()
