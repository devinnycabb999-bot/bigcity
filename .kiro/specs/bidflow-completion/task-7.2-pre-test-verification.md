# Task 7.2 - Pre-Test Verification

Before executing manual tests, verify that all required components are implemented correctly.

## Component Verification

### 1. Auction Detail Page Structure

**File:** `app/auctions/[id]/page.tsx`

✅ **Verify:**
- [ ] Server component fetches auction by ID
- [ ] Handles 404 for non-existent auctions
- [ ] Fetches initial bids ordered by amount descending
- [ ] Passes data to client component

**File:** `app/auctions/[id]/auction-detail-client.tsx`

✅ **Verify:**
- [ ] Client component receives initialAuction and initialBids
- [ ] State management for auction and bids
- [ ] Computes isEnded based on end_time
- [ ] Checks if user is owner
- [ ] Real-time subscription setup in useEffect
- [ ] Subscription cleanup on unmount
- [ ] Renders all required sections:
  - [ ] Navbar
  - [ ] Back link
  - [ ] Auction details card
  - [ ] CountdownTimer component
  - [ ] Status badge
  - [ ] Bid history card
  - [ ] BidForm component (conditional)

---

### 2. Bid Form Component

**File:** `components/bid-form.tsx`

✅ **Verify:**
- [ ] Accepts auction and disabled props
- [ ] State for bidAmount, loading, error
- [ ] Checks user authentication
- [ ] Checks if user is owner
- [ ] Validates bid amount is numeric
- [ ] Validates bid > current_price
- [ ] Inserts bid via Supabase
- [ ] Shows success toast on success
- [ ] Shows error toast on failure
- [ ] Clears form after successful bid
- [ ] Conditional rendering:
  - [ ] Login prompt for unauthenticated users
  - [ ] Owner message for auction owners
  - [ ] Ended message for disabled auctions
  - [ ] Bid form for valid users

---

### 3. Countdown Timer Component

**File:** `components/countdown-timer.tsx`

✅ **Verify:**
- [ ] Accepts endTime prop
- [ ] Calculates time left (days, hours, minutes, seconds)
- [ ] Updates every second via setInterval
- [ ] Cleans up interval on unmount
- [ ] Shows "Auction Ended" when time expires
- [ ] Color coding based on time remaining:
  - [ ] Green for > 1 day
  - [ ] Yellow for < 1 day
  - [ ] Red for < 1 hour
- [ ] Format changes based on time:
  - [ ] "Xd Xh left" for > 1 day
  - [ ] "Xh Xm left" for < 1 day
  - [ ] "Xm Xs left" for < 1 hour

---

## Real-Time Subscription Verification

### Auction Updates Subscription

✅ **Verify in auction-detail-client.tsx:**
```typescript
.on(
  'postgres_changes',
  {
    event: 'UPDATE',
    schema: 'public',
    table: 'auctions',
    filter: `id=eq.${auction.id}`,
  },
  (payload) => {
    setAuction(payload.new as Auction)
  }
)
```

### Bid Inserts Subscription

✅ **Verify in auction-detail-client.tsx:**
```typescript
.on(
  'postgres_changes',
  {
    event: 'INSERT',
    schema: 'public',
    table: 'bids',
    filter: `auction_id=eq.${auction.id}`,
  },
  (payload) => {
    const newBid = payload.new as Bid
    setBids((prevBids) => {
      const updatedBids = [newBid, ...prevBids]
      return updatedBids.sort((a, b) => 
        Number(b.bid_amount) - Number(a.bid_amount)
      )
    })
  }
)
```

### Cleanup

✅ **Verify:**
```typescript
return () => {
  supabase.removeChannel(channel)
}
```

---

## Database Trigger Verification

Ensure the database trigger exists to update auction.current_price when a bid is inserted.

**Check in Supabase SQL Editor:**

```sql
-- Verify trigger exists
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'update_auction_price_on_bid';

-- Verify function exists
SELECT routine_name
FROM information_schema.routines
WHERE routine_name = 'update_auction_current_price';
```

✅ **Expected:**
- [ ] Trigger exists on bids table
- [ ] Function updates auction.current_price to MAX(bid_amount)

---

## Supabase Realtime Configuration

**Check in Supabase Dashboard:**

1. Go to Database → Replication
2. Verify the following tables have Realtime enabled:
   - [ ] auctions
   - [ ] bids

**Check RLS Policies:**

✅ **Verify policies allow:**
- [ ] All users can SELECT auctions
- [ ] All users can SELECT bids
- [ ] Authenticated users can INSERT bids (with bidder_id = auth.uid())
- [ ] Users cannot bid on their own auctions (optional policy)

---

## Code Quality Checks

### TypeScript Compilation

```bash
npm run build
```

✅ **Verify:**
- [ ] No TypeScript errors
- [ ] Build completes successfully

### Console Logs for Debugging

✅ **Verify these logs exist in auction-detail-client.tsx:**
- [ ] "Auction updated:" when auction changes
- [ ] "New bid:" when bid is inserted
- [ ] "Subscription status:" on subscription
- [ ] "Cleaning up subscription" on unmount

---

## Test Data Preparation

### Create Test Auctions

You'll need at least 3 test auctions:

1. **Active Auction (Long Duration)**
   - [ ] End time: 7+ days in the future
   - [ ] Has some existing bids
   - [ ] Owned by User A

2. **Active Auction (Short Duration)**
   - [ ] End time: 1-2 minutes in the future (for real-time ending test)
   - [ ] Has some existing bids
   - [ ] Owned by User A

3. **Ended Auction**
   - [ ] End time: In the past
   - [ ] Has some existing bids
   - [ ] Owned by User A

### Create Test Users

- [ ] **User A:** Auction owner (for testing owner restrictions)
- [ ] **User B:** Regular user (for testing bidding)
- [ ] Both users have valid credentials

---

## Browser Setup

### Primary Browser
- [ ] Chrome/Edge/Firefox with DevTools
- [ ] Logged in as User B
- [ ] Console open to view subscription logs

### Secondary Browser
- [ ] Different browser or incognito/private mode
- [ ] Logged in as User A
- [ ] Console open to view subscription logs

---

## Environment Variables

✅ **Verify in `.env.local`:**
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

## Development Server

```bash
npm run dev
```

✅ **Verify:**
- [ ] Server starts without errors
- [ ] Accessible at http://localhost:3000
- [ ] No compilation errors in terminal

---

## Pre-Test Checklist Summary

- [ ] All components implemented and verified
- [ ] Real-time subscriptions configured correctly
- [ ] Database triggers working
- [ ] Supabase Realtime enabled
- [ ] RLS policies configured
- [ ] TypeScript compiles without errors
- [ ] Test data prepared (3 auctions, 2 users)
- [ ] Browsers set up for testing
- [ ] Environment variables configured
- [ ] Dev server running

---

## Ready to Test?

If all items above are checked, you're ready to proceed with the manual testing outlined in:
- **Full Guide:** `task-7.2-test-guide.md`
- **Quick Checklist:** `task-7.2-quick-checklist.md`

---

## Common Issues and Solutions

### Issue: Real-time updates not working

**Check:**
1. Supabase Realtime enabled for tables
2. Subscription logs in console
3. Network tab shows WebSocket connection
4. RLS policies allow SELECT on tables

### Issue: Bids not inserting

**Check:**
1. User is authenticated
2. RLS policies allow INSERT
3. Bid amount validation passing
4. Console for error messages

### Issue: Countdown timer not updating

**Check:**
1. setInterval is running
2. Component is not unmounting
3. endTime prop is valid ISO string
4. No JavaScript errors in console

### Issue: Owner can still see bid form

**Check:**
1. user.id === auction.owner_id comparison
2. useAuth hook returning correct user
3. Conditional rendering logic in BidForm

---

**Verification Completed By:** _______________  
**Date:** _______________  
**All Checks Passed:** ⬜ Yes / ⬜ No (see notes)

**Notes:**
```
[Any issues or concerns before testing]
```
