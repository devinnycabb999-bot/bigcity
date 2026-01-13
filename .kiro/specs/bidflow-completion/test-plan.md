# Authentication Flow Test Plan - Quick Reference

## Overview
This document provides a quick reference for testing the authentication flow end-to-end.

## Test Scenarios Checklist

### ✅ Signup Tests
- [ ] Valid signup with new email
- [ ] Password mismatch error
- [ ] Password too short error
- [ ] Duplicate email error
- [ ] Invalid email format error

### ✅ Login Tests
- [ ] Successful login with valid credentials
- [ ] Wrong password error
- [ ] Non-existent email error
- [ ] Empty fields validation

### ✅ Session Persistence Tests
- [ ] Session persists after page refresh
- [ ] Session persists across navigation
- [ ] Session persists after tab close/reopen

### ✅ Logout Tests
- [ ] Successful logout
- [ ] Session cleared after logout

### ✅ Protected Route Tests
- [ ] Dashboard redirects when not logged in
- [ ] Create page redirects when not logged in
- [ ] Public routes accessible without login

### ✅ Error Handling Tests
- [ ] Network error during signup
- [ ] Network error during login

## Quick Test Commands

### Start Development Server
```bash
npm run dev
```

### Access Test URLs
- Signup: `http://localhost:3000/signup`
- Login: `http://localhost:3000/login`
- Dashboard: `http://localhost:3000/dashboard`
- Create: `http://localhost:3000/create`
- Auctions: `http://localhost:3000/auctions`

### Test Credentials
Use these for consistent testing:
- Email 1: `testuser1@example.com`
- Email 2: `testuser2@example.com`
- Password: `password123`

## Requirements Coverage

| Requirement | Description | Test Cases |
|-------------|-------------|------------|
| 1.1 | Signup form display | 1.1, 2.1-2.4 |
| 1.2 | Create account with valid credentials | 1.1 |
| 1.3 | Display error for invalid credentials | 2.1-2.4 |
| 1.4 | Login form display | 3.1, 4.1-4.3 |
| 1.5 | Authenticate with valid credentials | 3.1 |
| 1.6 | Display error for invalid login | 4.1-4.3 |
| 1.7 | Redirect unauthenticated users | 7.1-7.3 |
| 1.8 | Session persistence | 5.1-5.3, 6.1-6.2 |

## Test Execution Notes

1. **Before Testing:**
   - Clear browser cache and cookies
   - Ensure dev server is running
   - Have Supabase dashboard open

2. **During Testing:**
   - Keep browser DevTools open
   - Monitor network requests
   - Check console for errors
   - Take screenshots of failures

3. **After Testing:**
   - Document all issues found
   - Clean up test accounts in Supabase
   - Update test results in execution guide

## Common Issues to Watch For

- Flash of unauthenticated content before redirect
- Session not persisting after refresh
- Error messages not displaying correctly
- Loading states not showing
- Form validation not working
- Network errors not handled gracefully

## Success Criteria

All 18 test cases must pass for the authentication flow to be considered complete and ready for production.

