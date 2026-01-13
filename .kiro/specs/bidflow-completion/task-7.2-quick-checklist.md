# Task 7.2 - Quick Test Checklist

Use this checklist for rapid test execution. Refer to the full test guide for detailed steps.

## Pre-Test Setup
- [ ] Dev server running (`npm run dev`)
- [ ] Supabase configured and accessible
- [ ] Test auction(s) created
- [ ] Two user accounts available
- [ ] Two browsers/profiles ready for real-time testing

---

## Core Functionality Tests

### Viewing Tests
- [ ] **Authenticated user** can view all auction details
- [ ] **Unauthenticated user** sees login prompt instead of bid form
- [ ] Bid history displays correctly (sorted by amount, descending)
- [ ] User's own bids are highlighted

### Countdown Timer Tests
- [ ] Timer displays correct format based on time remaining
- [ ] Timer updates every second
- [ ] Color coding works (green > yellow > red)
- [ ] "Auction Ended" shows for expired auctions
- [ ] Timer stops counting when auction ends

### Bid Form Validation Tests
- [ ] Bid amount ≤ current price → Error message
- [ ] Non-numeric input → Validation error
- [ ] Empty field → Required field validation
- [ ] Valid bid > current price → Success

### Bidding Tests
- [ ] Valid bid submits successfully
- [ ] Success toast notification appears
- [ ] Bid appears in history immediately
- [ ] Current price updates
- [ ] Form clears after submission
- [ ] Owner cannot bid on own auction (form hidden)

### Real-Time Tests (2 Browser Windows)
- [ ] User A places bid → User B sees it immediately
- [ ] User B places bid → User A sees it immediately
- [ ] Current price syncs across both windows
- [ ] Bid list updates in real-time
- [ ] No page refresh needed

### Ended Auction Tests
- [ ] Ended auction shows "Auction Ended" badge
- [ ] Bid form is hidden/disabled
- [ ] Status badge shows "Ended"
- [ ] Auction ending in real-time updates UI automatically

### Technical Tests
- [ ] Subscription cleanup on navigation (check console)
- [ ] No memory leaks from subscriptions
- [ ] Console shows proper subscription lifecycle logs

---

## Edge Cases
- [ ] Rapid bidding from multiple users
- [ ] Network error handling (throttle to Slow 3G)
- [ ] Responsive design on mobile
- [ ] Multiple navigation between auctions

---

## Requirements Verification

| Req | Description | Status |
|-----|-------------|--------|
| 2.1 | Display complete auction details | ⬜ |
| 2.2 | Display bids in descending order | ⬜ |
| 2.3 | Display countdown timer | ⬜ |
| 2.4 | Display "Auction Ended" | ⬜ |
| 2.5 | Show bid form for non-owners | ⬜ |
| 2.6 | Hide bid form for owners | ⬜ |
| 2.7 | Insert valid bids | ⬜ |
| 2.8 | Validate bid amount | ⬜ |
| 2.9 | Real-time price updates | ⬜ |
| 2.10 | Real-time bid updates | ⬜ |
| 2.11 | Prompt login for unauth users | ⬜ |

---

## Quick Notes

**Issues Found:**
```
[Quick notes on any issues]
```

**Test Status:** ⬜ All Pass / ⬜ Some Failures / ⬜ Blocked

**Tested By:** _______________  
**Date:** _______________
