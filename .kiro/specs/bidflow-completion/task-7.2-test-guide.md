# Task 7.2: Auction Detail Page and Bidding - Test Execution Guide

**Status:** In Progress  
**Requirements Covered:** 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11

## Overview

This document provides a comprehensive manual testing guide for the auction detail page and bidding functionality. All tests should be performed manually in the browser.

---

## Prerequisites

Before starting tests, ensure:
- ✅ Development server is running (`npm run dev`)
- ✅ Supabase is configured and accessible
- ✅ At least one test auction exists in the database
- ✅ You have access to two different user accounts for real-time testing
- ✅ You have access to two different browsers or browser profiles

---

## Test Scenarios

### 1. Test Viewing Auction Details as Authenticated User

**Requirements:** 2.1, 2.2

**Steps:**
1. Log in to the application with a valid user account
2. Navigate to the auctions list page (`/auctions`)
3. Click on any auction to view its details
4. Verify the following elements are displayed:
   - ✅ Auction title
   - ✅ Auction description
   - ✅ Starting price
   - ✅ Current price (prominently displayed)
   - ✅ Auction end time (formatted date)
   - ✅ Status badge (Active/Ended)
   - ✅ Countdown timer
   - ✅ Bid history section
   - ✅ All bids displayed in descending order by amount
   - ✅ Bidder information and timestamps for each bid
   - ✅ "Back to auctions" link

**Expected Result:**
- All auction details are visible and correctly formatted
- Bid history shows all bids sorted by amount (highest first)
- User's own bids are highlighted with "Your bid" badge
- Page layout is responsive and clean

**Status:** ⬜ Pass / ⬜ Fail

**Notes:**
```
[Record any observations or issues here]
```

---

### 2. Test Viewing Auction Details as Unauthenticated User

**Requirements:** 2.11

**Steps:**
1. Log out of the application (or use incognito/private browsing)
2. Navigate directly to an auction detail page (e.g., `/auctions/[auction-id]`)
3. Verify the following:
   - ✅ All auction details are visible (title, description, prices, etc.)
   - ✅ Countdown timer is displayed
   - ✅ Bid history is visible
   - ✅ Instead of bid form, a message is displayed: "Please log in to place a bid"
   - ✅ The message includes a clickable link to the login page

**Expected Result:**
- Unauthenticated users can view all auction information
- Bid form is replaced with a login prompt
- Login link redirects to `/login`

**Status:** ⬜ Pass / ⬜ Fail

**Notes:**
```
[Record any observations or issues here]
```

---

### 3. Test Countdown Timer Display and Updates

**Requirements:** 2.3, 2.4

**Test 3a: Active Auction with Time Remaining**

**Steps:**
1. Navigate to an auction that has NOT ended yet
2. Observe the countdown timer
3. Wait for at least 60 seconds and observe the timer updates

**Verify:**
- ✅ Timer displays correctly based on time remaining:
  - If > 1 day: Shows "Xd Xh left" format
  - If < 1 day but > 1 hour: Shows "Xh Xm left" format
  - If < 1 hour: Shows "Xm Xs left" format
- ✅ Timer updates every second
- ✅ Color coding is correct:
  - Green background for > 1 day remaining
  - Yellow background for < 1 day remaining
  - Red background for < 1 hour remaining

**Expected Result:**
- Timer counts down in real-time
- Display format changes appropriately as time decreases
- Colors change based on urgency

**Status:** ⬜ Pass / ⬜ Fail

**Test 3b: Ended Auction**

**Steps:**
1. Navigate to an auction that has already ended (end_time is in the past)
2. Observe the countdown timer

**Verify:**
- ✅ Timer displays "Auction Ended" badge
- ✅ Badge has red/destructive styling
- ✅ Timer does not count down

**Expected Result:**
- "Auction Ended" badge is displayed
- No countdown is shown

**Status:** ⬜ Pass / ⬜ Fail

**Notes:**
```
[Record any observations or issues here]
```

---

### 4. Test Bid Form Validation - Amount Too Low

**Requirements:** 2.6, 2.8

**Steps:**
1. Log in as a user who does NOT own the auction
2. Navigate to an active auction detail page
3. In the bid form, enter an amount equal to or less than the current price
4. Click "Place Bid"

**Test Cases:**
- Enter amount = current price (e.g., if current price is $100.00, enter $100.00)
- Enter amount < current price (e.g., if current price is $100.00, enter $99.99)

**Verify:**
- ✅ Error message is displayed: "Bid must be higher than [current_price]"
- ✅ Bid is NOT submitted to the database
- ✅ Form remains on the page
- ✅ User can correct the amount and try again

**Expected Result:**
- Validation prevents bids that are not higher than current price
- Clear error message guides the user
- No database insertion occurs

**Status:** ⬜ Pass / ⬜ Fail

**Notes:**
```
[Record any observations or issues here]
```

---

### 5. Test Bid Form Validation - Non-Numeric Input

**Requirements:** 2.6

**Steps:**
1. Log in as a user who does NOT own the auction
2. Navigate to an active auction detail page
3. In the bid form, attempt to enter non-numeric values

**Test Cases:**
- Enter text (e.g., "abc", "one hundred")
- Enter special characters (e.g., "$100", "100!")
- Leave the field empty and submit

**Verify:**
- ✅ HTML5 number input prevents non-numeric characters from being typed
- ✅ If somehow submitted, error message displays: "Please enter a valid number"
- ✅ Bid is NOT submitted to the database

**Expected Result:**
- Input field only accepts numeric values
- Validation catches any invalid input
- User receives clear feedback

**Status:** ⬜ Pass / ⬜ Fail

**Notes:**
```
[Record any observations or issues here]
```

---

### 6. Test Placing Valid Bid

**Requirements:** 2.5, 2.7

**Steps:**
1. Log in as a user who does NOT own the auction
2. Navigate to an active auction detail page
3. Note the current price (e.g., $100.00)
4. Enter a valid bid amount higher than current price (e.g., $105.50)
5. Click "Place Bid"

**Verify:**
- ✅ Loading state is shown ("Placing bid..." button text)
- ✅ Success toast notification appears: "Bid placed successfully!"
- ✅ Bid form clears after successful submission
- ✅ New bid appears in the bid history immediately
- ✅ Current price updates to the new bid amount
- ✅ New bid is highlighted as "Your bid"
- ✅ Bid is sorted correctly in the bid list (at the top if highest)

**Expected Result:**
- Bid is successfully inserted into the database
- UI updates immediately to reflect the new bid
- User receives positive feedback
- Form is ready for another bid if desired

**Status:** ⬜ Pass / ⬜ Fail

**Notes:**
```
[Record any observations or issues here]
```

---

### 7. Test Owner Cannot Bid on Own Auction

**Requirements:** 2.6

**Steps:**
1. Log in as the user who created/owns a specific auction
2. Navigate to that auction's detail page
3. Observe the bid form area

**Verify:**
- ✅ Bid form is NOT displayed
- ✅ Instead, a message is shown: "You cannot bid on your own auction"
- ✅ No way to submit a bid is available

**Additional Test:**
- If you somehow bypass the UI and attempt to submit a bid via browser console or API, verify that:
  - ✅ Backend/RLS policies prevent the bid insertion
  - ✅ Appropriate error is returned

**Expected Result:**
- Auction owners cannot bid on their own auctions
- Clear message explains why bidding is disabled
- Backend enforces this rule even if UI is bypassed

**Status:** ⬜ Pass / ⬜ Fail

**Notes:**
```
[Record any observations or issues here]
```

---

### 8. Test Real-Time Updates (Two Browser Windows)

**Requirements:** 2.9, 2.10

**Setup:**
- Browser Window 1: User A (logged in)
- Browser Window 2: User B (logged in with different account)
- Both windows viewing the same auction detail page

**Steps:**
1. Open the same auction in two different browser windows/profiles
2. Log in as User A in Window 1
3. Log in as User B in Window 2
4. In Window 1 (User A), place a bid
5. Observe Window 2 (User B) WITHOUT refreshing

**Verify in Window 2:**
- ✅ New bid from User A appears in the bid history automatically
- ✅ Current price updates to User A's bid amount
- ✅ Bid list re-sorts with new bid in correct position
- ✅ Update happens within 1-2 seconds (real-time)
- ✅ No page refresh is required

**Verify in Window 1:**
- ✅ User A sees their own bid immediately
- ✅ Bid is highlighted as "Your bid"

**Additional Test:**
6. In Window 2 (User B), place a higher bid
7. Observe Window 1 (User A) WITHOUT refreshing

**Verify in Window 1:**
- ✅ User B's bid appears automatically
- ✅ Current price updates
- ✅ User A's bid is no longer the highest (if applicable)

**Expected Result:**
- Real-time subscriptions work correctly
- Both users see updates without manual refresh
- Bid history and current price stay synchronized
- Console logs show subscription events (check browser console)

**Status:** ⬜ Pass / ⬜ Fail

**Notes:**
```
[Record any observations or issues here]
```

---

### 9. Test Auction Ended State and Disabled Bidding

**Requirements:** 2.4, 2.8

**Test 9a: Viewing Ended Auction**

**Steps:**
1. Navigate to an auction where end_time is in the past
2. Observe the page

**Verify:**
- ✅ Countdown timer shows "Auction Ended" badge
- ✅ Status badge shows "Ended" with red/destructive styling
- ✅ Bid form is NOT displayed
- ✅ Instead, message shows: "This auction has ended"
- ✅ Bid history is still visible
- ✅ All auction details remain accessible

**Expected Result:**
- Ended auctions clearly indicate they are no longer active
- Bidding is completely disabled
- Historical information remains viewable

**Status:** ⬜ Pass / ⬜ Fail

**Test 9b: Auction Ending in Real-Time**

**Steps:**
1. Find or create an auction that will end in the next 1-2 minutes
2. Navigate to the auction detail page
3. Wait and observe as the auction end time approaches and passes

**Verify:**
- ✅ Countdown timer continues to update
- ✅ When time reaches zero, timer changes to "Auction Ended"
- ✅ Bid form disappears or becomes disabled
- ✅ Status badge updates to "Ended"
- ✅ No page refresh is required for these updates

**Expected Result:**
- Auction transitions from active to ended automatically
- UI updates reflect the ended state immediately
- Users cannot place bids after auction ends

**Status:** ⬜ Pass / ⬜ Fail

**Notes:**
```
[Record any observations or issues here]
```

---

### 10. Test Real-Time Subscription Cleanup

**Requirements:** 2.10 (implicit - prevent memory leaks)

**Steps:**
1. Open browser developer tools (F12)
2. Go to Console tab
3. Navigate to an auction detail page
4. Observe console logs for subscription messages
5. Navigate away from the auction (e.g., back to auctions list)
6. Observe console logs

**Verify:**
- ✅ When entering auction page, console shows: "Subscription status: SUBSCRIBED"
- ✅ When leaving auction page, console shows: "Cleaning up subscription"
- ✅ No error messages about failed subscriptions
- ✅ Navigate to multiple auctions and back - no accumulation of subscriptions

**Expected Result:**
- Subscriptions are properly cleaned up on component unmount
- No memory leaks from lingering subscriptions
- Console logs confirm proper lifecycle management

**Status:** ⬜ Pass / ⬜ Fail

**Notes:**
```
[Record any observations or issues here]
```

---

## Edge Cases and Additional Tests

### 11. Test Rapid Bidding

**Steps:**
1. Have two users place bids rapidly one after another
2. Observe both windows

**Verify:**
- ✅ All bids are recorded
- ✅ Bids appear in correct order
- ✅ No race conditions or lost updates
- ✅ Current price always reflects the highest bid

**Status:** ⬜ Pass / ⬜ Fail

---

### 12. Test Network Error Handling

**Steps:**
1. Open browser developer tools
2. Go to Network tab
3. Throttle network to "Slow 3G" or "Offline"
4. Attempt to place a bid

**Verify:**
- ✅ Loading state is shown
- ✅ Error message appears if network fails
- ✅ User is prompted to try again
- ✅ Application doesn't crash

**Status:** ⬜ Pass / ⬜ Fail

---

### 13. Test Responsive Design

**Steps:**
1. View auction detail page on different screen sizes
2. Test on mobile device or use browser responsive mode

**Verify:**
- ✅ Layout adapts to mobile screens
- ✅ Bid form remains accessible
- ✅ All information is readable
- ✅ Buttons are touch-friendly

**Status:** ⬜ Pass / ⬜ Fail

---

## Summary

### Test Results Overview

| Test Scenario | Status | Notes |
|--------------|--------|-------|
| 1. Authenticated user viewing | ⬜ | |
| 2. Unauthenticated user viewing | ⬜ | |
| 3a. Countdown timer - active | ⬜ | |
| 3b. Countdown timer - ended | ⬜ | |
| 4. Validation - amount too low | ⬜ | |
| 5. Validation - non-numeric | ⬜ | |
| 6. Placing valid bid | ⬜ | |
| 7. Owner cannot bid | ⬜ | |
| 8. Real-time updates | ⬜ | |
| 9a. Ended auction state | ⬜ | |
| 9b. Auction ending real-time | ⬜ | |
| 10. Subscription cleanup | ⬜ | |
| 11. Rapid bidding | ⬜ | |
| 12. Network errors | ⬜ | |
| 13. Responsive design | ⬜ | |

### Requirements Coverage

- ✅ Requirement 2.1: Display complete auction details
- ✅ Requirement 2.2: Display all bids in descending order
- ✅ Requirement 2.3: Display countdown timer for active auctions
- ✅ Requirement 2.4: Display "Auction Ended" when time expires
- ✅ Requirement 2.5: Display bid form for authenticated non-owners
- ✅ Requirement 2.6: Hide bid form for auction owners
- ✅ Requirement 2.7: Insert valid bids into database
- ✅ Requirement 2.8: Validate bid amount > current price
- ✅ Requirement 2.9: Real-time price updates
- ✅ Requirement 2.10: Real-time bid list updates
- ✅ Requirement 2.11: Prompt unauthenticated users to log in

### Overall Status

**Total Tests:** 15  
**Passed:** ___  
**Failed:** ___  
**Blocked:** ___  

### Critical Issues Found

```
[List any critical issues that block functionality]
```

### Non-Critical Issues Found

```
[List any minor issues or improvements needed]
```

### Recommendations

```
[Any recommendations for improvements or follow-up work]
```

---

## Test Execution Log

**Tester:** _______________  
**Date:** _______________  
**Environment:** Development / Staging / Production  
**Browser(s):** _______________  
**Test Duration:** _______________

**Sign-off:** _______________
