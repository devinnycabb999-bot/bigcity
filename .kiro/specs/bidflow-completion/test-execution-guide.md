# Authentication Flow End-to-End Test Execution Guide

## Test Task: 7.1 - Authentication Flow Testing

This document provides a comprehensive manual testing guide for the authentication flow in the BidFlow application.

**Requirements Covered:** 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8

---

## Prerequisites

Before starting the tests:
1. Ensure the development server is running (`npm run dev`)
2. Have access to Supabase dashboard to verify user creation
3. Use a browser with developer tools open (F12) to monitor network requests
4. Clear browser cache and cookies before starting fresh tests
5. Have at least 2 different email addresses available for testing

---

## Test Suite 1: Signup with Valid Credentials

**Requirement:** 1.1, 1.2, 1.3

### Test Case 1.1: Successful User Registration

**Steps:**
1. Navigate to `http://localhost:3000/signup`
2. Verify the signup form displays with:
   - Email input field
   - Password input field (with "Must be at least 6 characters" hint)
   - Confirm Password input field
   - "Sign Up" button
   - Link to login page
3. Enter a valid email (e.g., `testuser1@example.com`)
4. Enter a password with at least 6 characters (e.g., `password123`)
5. Enter the same password in the confirm password field
6. Click "Sign Up" button

**Expected Results:**
- ✅ Button shows "Creating account..." while loading
- ✅ No error messages appear
- ✅ User is redirected to `/auctions` page
- ✅ User is logged in (navbar shows user email/logout button)
- ✅ In Supabase dashboard, new user appears in Authentication > Users

**Status:** ⬜ Pass / ⬜ Fail

**Notes:**
_______________________________________________________________________

---

## Test Suite 2: Signup with Invalid/Duplicate Email

**Requirement:** 1.1, 1.2, 1.3

### Test Case 2.1: Password Mismatch Validation

**Steps:**
1. Navigate to `http://localhost:3000/signup`
2. Enter email: `testuser2@example.com`
3. Enter password: `password123`
4. Enter confirm password: `differentpassword`
5. Click "Sign Up" button

**Expected Results:**
- ✅ Error message displays: "Passwords do not match"
- ✅ User remains on signup page
- ✅ No account is created in Supabase

**Status:** ⬜ Pass / ⬜ Fail

**Notes:**
_______________________________________________________________________

### Test Case 2.2: Password Too Short

**Steps:**
1. Navigate to `http://localhost:3000/signup`
2. Enter email: `testuser3@example.com`
3. Enter password: `12345` (only 5 characters)
4. Enter confirm password: `12345`
5. Click "Sign Up" button

**Expected Results:**
- ✅ Error message displays: "Password must be at least 6 characters long"
- ✅ User remains on signup page
- ✅ No account is created

**Status:** ⬜ Pass / ⬜ Fail

**Notes:**
_______________________________________________________________________

### Test Case 2.3: Duplicate Email Registration

**Steps:**
1. Navigate to `http://localhost:3000/signup`
2. Enter the email used in Test Case 1.1 (e.g., `testuser1@example.com`)
3. Enter password: `password123`
4. Enter confirm password: `password123`
5. Click "Sign Up" button

**Expected Results:**
- ✅ Error message displays: "Account already exists. Please log in instead."
- ✅ User remains on signup page
- ✅ No duplicate account is created

**Status:** ⬜ Pass / ⬜ Fail

**Notes:**
_______________________________________________________________________

### Test Case 2.4: Invalid Email Format

**Steps:**
1. Navigate to `http://localhost:3000/signup`
2. Enter email: `notanemail` (invalid format)
3. Enter password: `password123`
4. Enter confirm password: `password123`
5. Click "Sign Up" button

**Expected Results:**
- ✅ Browser validation prevents submission OR
- ✅ Error message displays about invalid email format
- ✅ No account is created

**Status:** ⬜ Pass / ⬜ Fail

**Notes:**
_______________________________________________________________________

---

## Test Suite 3: Login with Valid Credentials

**Requirement:** 1.4, 1.5, 1.6

### Test Case 3.1: Successful Login

**Steps:**
1. If logged in, log out first
2. Navigate to `http://localhost:3000/login`
3. Verify the login form displays with:
   - Email input field
   - Password input field
   - "Log In" button
   - Link to signup page
4. Enter email from Test Case 1.1 (e.g., `testuser1@example.com`)
5. Enter the correct password (e.g., `password123`)
6. Click "Log In" button

**Expected Results:**
- ✅ Button shows "Logging in..." while loading
- ✅ No error messages appear
- ✅ User is redirected to `/auctions` page
- ✅ Navbar shows user is logged in
- ✅ User can access protected routes

**Status:** ⬜ Pass / ⬜ Fail

**Notes:**
_______________________________________________________________________

---

## Test Suite 4: Login with Invalid Credentials

**Requirement:** 1.4, 1.5, 1.6

### Test Case 4.1: Wrong Password

**Steps:**
1. Navigate to `http://localhost:3000/login`
2. Enter a valid email (e.g., `testuser1@example.com`)
3. Enter an incorrect password (e.g., `wrongpassword`)
4. Click "Log In" button

**Expected Results:**
- ✅ Error message displays: "Invalid email or password"
- ✅ User remains on login page
- ✅ User is not logged in
- ✅ Password field is cleared or remains filled (acceptable either way)

**Status:** ⬜ Pass / ⬜ Fail

**Notes:**
_______________________________________________________________________

### Test Case 4.2: Non-existent Email

**Steps:**
1. Navigate to `http://localhost:3000/login`
2. Enter an email that doesn't exist (e.g., `nonexistent@example.com`)
3. Enter any password (e.g., `password123`)
4. Click "Log In" button

**Expected Results:**
- ✅ Error message displays: "Invalid email or password"
- ✅ User remains on login page
- ✅ User is not logged in

**Status:** ⬜ Pass / ⬜ Fail

**Notes:**
_______________________________________________________________________

### Test Case 4.3: Empty Fields

**Steps:**
1. Navigate to `http://localhost:3000/login`
2. Leave email field empty
3. Leave password field empty
4. Click "Log In" button

**Expected Results:**
- ✅ Browser validation prevents submission (HTML5 required attribute)
- ✅ Form highlights required fields
- ✅ No network request is made

**Status:** ⬜ Pass / ⬜ Fail

**Notes:**
_______________________________________________________________________

---

## Test Suite 5: Session Persistence Across Page Refreshes

**Requirement:** 1.8

### Test Case 5.1: Session Persists After Refresh

**Steps:**
1. Log in successfully (use Test Case 3.1)
2. Verify you're on `/auctions` page and logged in
3. Press F5 or click browser refresh button
4. Wait for page to reload

**Expected Results:**
- ✅ User remains logged in after refresh
- ✅ Navbar still shows user email/logout button
- ✅ User can still access protected routes
- ✅ No redirect to login page occurs

**Status:** ⬜ Pass / ⬜ Fail

**Notes:**
_______________________________________________________________________

### Test Case 5.2: Session Persists Across Navigation

**Steps:**
1. While logged in, navigate to `/auctions`
2. Click on "Create Auction" link
3. Navigate back to `/auctions`
4. Navigate to `/dashboard`
5. Navigate back to home page `/`

**Expected Results:**
- ✅ User remains logged in throughout all navigation
- ✅ No login prompts appear
- ✅ Protected routes remain accessible

**Status:** ⬜ Pass / ⬜ Fail

**Notes:**
_______________________________________________________________________

### Test Case 5.3: Session Persists After Browser Tab Close/Reopen

**Steps:**
1. Log in successfully
2. Close the browser tab (not the entire browser)
3. Open a new tab
4. Navigate to `http://localhost:3000/dashboard`

**Expected Results:**
- ✅ User is still logged in
- ✅ Dashboard loads without redirect to login
- ✅ Session was persisted in browser storage

**Status:** ⬜ Pass / ⬜ Fail

**Notes:**
_______________________________________________________________________

---

## Test Suite 6: Logout Functionality

**Requirement:** 1.8

### Test Case 6.1: Successful Logout

**Steps:**
1. Log in successfully
2. Locate the logout button in the navbar
3. Click the logout button

**Expected Results:**
- ✅ User is logged out
- ✅ User is redirected to home page `/` or login page
- ✅ Navbar no longer shows user email
- ✅ Navbar shows "Login" and "Sign Up" links
- ✅ Attempting to access `/dashboard` redirects to `/login`

**Status:** ⬜ Pass / ⬜ Fail

**Notes:**
_______________________________________________________________________

### Test Case 6.2: Session Cleared After Logout

**Steps:**
1. Log in successfully
2. Log out
3. Try to navigate directly to `/dashboard` by typing URL

**Expected Results:**
- ✅ User is redirected to `/login`
- ✅ Session is completely cleared
- ✅ Cannot access protected routes

**Status:** ⬜ Pass / ⬜ Fail

**Notes:**
_______________________________________________________________________

---

## Test Suite 7: Protected Route Redirects for Unauthenticated Users

**Requirement:** 1.7

### Test Case 7.1: Dashboard Redirect When Not Logged In

**Steps:**
1. Ensure you are logged out (clear cookies if needed)
2. Navigate directly to `http://localhost:3000/dashboard`

**Expected Results:**
- ✅ User is immediately redirected to `/login`
- ✅ Dashboard content does not flash/appear briefly
- ✅ URL changes to `/login`

**Status:** ⬜ Pass / ⬜ Fail

**Notes:**
_______________________________________________________________________

### Test Case 7.2: Create Auction Page Redirect When Not Logged In

**Steps:**
1. Ensure you are logged out
2. Navigate directly to `http://localhost:3000/create`

**Expected Results:**
- ✅ User is immediately redirected to `/login`
- ✅ Create auction form does not appear
- ✅ URL changes to `/login`

**Status:** ⬜ Pass / ⬜ Fail

**Notes:**
_______________________________________________________________________

### Test Case 7.3: Public Routes Accessible Without Login

**Steps:**
1. Ensure you are logged out
2. Navigate to `http://localhost:3000/` (home page)
3. Navigate to `http://localhost:3000/auctions` (auction list)
4. Navigate to `http://localhost:3000/auctions/[any-id]` (auction detail)

**Expected Results:**
- ✅ Home page loads without redirect
- ✅ Auction list page loads without redirect
- ✅ Auction detail page loads without redirect
- ✅ Only bidding functionality requires login (shows prompt)

**Status:** ⬜ Pass / ⬜ Fail

**Notes:**
_______________________________________________________________________

---

## Test Suite 8: Edge Cases and Error Handling

### Test Case 8.1: Network Error During Signup

**Steps:**
1. Open browser DevTools > Network tab
2. Set network throttling to "Offline"
3. Navigate to `/signup`
4. Fill in valid signup credentials
5. Click "Sign Up"

**Expected Results:**
- ✅ Error message displays: "Connection error. Please try again"
- ✅ User remains on signup page
- ✅ Form can be resubmitted after network is restored

**Status:** ⬜ Pass / ⬜ Fail

**Notes:**
_______________________________________________________________________

### Test Case 8.2: Network Error During Login

**Steps:**
1. Open browser DevTools > Network tab
2. Set network throttling to "Offline"
3. Navigate to `/login`
4. Fill in valid login credentials
5. Click "Log In"

**Expected Results:**
- ✅ Error message displays: "Connection error. Please try again"
- ✅ User remains on login page
- ✅ Form can be resubmitted after network is restored

**Status:** ⬜ Pass / ⬜ Fail

**Notes:**
_______________________________________________________________________

---

## Summary Report

### Test Execution Summary

**Total Test Cases:** 18
**Passed:** _____
**Failed:** _____
**Blocked:** _____

### Critical Issues Found

1. _______________________________________________________________________
2. _______________________________________________________________________
3. _______________________________________________________________________

### Non-Critical Issues Found

1. _______________________________________________________________________
2. _______________________________________________________________________
3. _______________________________________________________________________

### Recommendations

_______________________________________________________________________
_______________________________________________________________________
_______________________________________________________________________

### Sign-off

**Tested By:** _______________________
**Date:** _______________________
**Environment:** Development (localhost:3000)
**Browser(s) Tested:** _______________________

---

## Notes for Developers

- All tests should be executed in a clean browser session
- Supabase Auth settings may affect some behaviors (email confirmation, etc.)
- Session persistence depends on Supabase client configuration
- Protected route redirects use `useEffect` hooks, so there may be brief loading states

