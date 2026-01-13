# Design Document

## Overview

This design document outlines the implementation approach for completing the BidFlow auction platform. The application follows Next.js 14 App Router conventions with TypeScript, leveraging Supabase for authentication, database operations, and real-time subscriptions. The design emphasizes component reusability, type safety, and real-time data synchronization.

The architecture builds upon the existing foundation:
- Next.js 14 with App Router and TypeScript
- Supabase for backend services (Auth, PostgreSQL, Realtime)
- Tailwind CSS + shadcn/ui for styling
- Client/Server component separation for optimal performance

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js App Router                       │
├─────────────────────────────────────────────────────────────┤
│  Client Components          │  Server Components            │
│  - Auth Pages (login/signup)│  - Auction List (SSR)        │
│  - Auction Detail (realtime)│  - Initial Data Fetch        │
│  - Dashboard (realtime)     │  - Auth Checks               │
│  - Bid Form                 │                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Services                         │
├─────────────────────────────────────────────────────────────┤
│  Auth Service    │  PostgreSQL DB   │  Realtime Channels   │
│  - signUp()      │  - auctions      │  - auction updates   │
│  - signIn()      │  - bids          │  - bid inserts       │
│  - signOut()     │  - RLS policies  │  - subscriptions     │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

The application follows a clear separation between server and client components:

**Server Components** (default, for initial data fetching):
- Auction list page
- Initial auction detail data
- Dashboard initial data

**Client Components** (for interactivity and real-time):
- Authentication forms
- Bid form and submission
- Real-time bid list
- Countdown timer
- Dashboard with live updates

### Data Flow

1. **Authentication Flow**:
   - User submits credentials → Supabase Auth → Session created → Redirect to auctions
   - AuthProvider maintains session state globally
   - Protected routes check auth state and redirect if needed

2. **Auction Detail Real-Time Flow**:
   - Server component fetches initial auction + bids
   - Client component subscribes to Supabase Realtime
   - New bids trigger real-time updates
   - Auction price updates propagate instantly
   - Component cleanup unsubscribes on unmount

3. **Bidding Flow**:
   - User submits bid → Validate amount > current_price
   - Insert bid via Supabase client
   - Database trigger updates auction.current_price
   - Real-time subscription broadcasts update to all viewers

## Components and Interfaces

### 1. Authentication Pages

#### app/(auth)/login/page.tsx
Client component with login form.

**Props**: None (route-based)

**State**:
- `email: string`
- `password: string`
- `loading: boolean`
- `error: string | null`

**Key Functions**:
- `handleLogin()`: Calls `supabase.auth.signInWithPassword()`
- Redirects to `/auctions` on success
- Displays error messages on failure

**UI Elements**:
- Email input (required)
- Password input (required, type="password")
- Submit button (disabled while loading)
- Link to signup page
- Error message display

#### app/(auth)/signup/page.tsx
Client component with registration form.

**Props**: None (route-based)

**State**:
- `email: string`
- `password: string`
- `confirmPassword: string`
- `loading: boolean`
- `error: string | null`

**Key Functions**:
- `handleSignup()`: Calls `supabase.auth.signUp()`
- Validates password match
- Redirects to `/auctions` on success

**UI Elements**:
- Email input (required, type="email")
- Password input (required, min length validation)
- Confirm password input (must match)
- Submit button
- Link to login page

### 2. Auction Detail Page

#### app/auctions/[id]/page.tsx
Hybrid approach: Server component for initial data, client component for real-time.

**Server Component Responsibilities**:
- Fetch auction details by ID
- Fetch initial bid list
- Handle 404 if auction not found
- Pass data to client component

**Client Component** (AuctionDetailClient):

**Props**:
```typescript
{
  initialAuction: Auction
  initialBids: Bid[]
}
```

**State**:
- `auction: Auction` (updates in real-time)
- `bids: Bid[]` (updates in real-time)
- `isEnded: boolean` (computed from end_time)

**Real-Time Subscriptions**:
1. Subscribe to `auctions` table changes for specific auction ID
2. Subscribe to `bids` table inserts for specific auction ID
3. Cleanup subscriptions on unmount

**Key Functions**:
- `setupRealtimeSubscriptions()`: Initialize Supabase channels
- `handleAuctionUpdate()`: Update local auction state
- `handleNewBid()`: Add new bid to list, sort by amount

**Child Components**:
- `<CountdownTimer endTime={auction.end_time} />`
- `<BidForm auction={auction} disabled={isEnded || isOwner} />`
- `<BidList bids={bids} />`

### 3. Bid Form Component

#### components/bid-form.tsx
Client component for placing bids.

**Props**:
```typescript
{
  auction: Auction
  disabled: boolean
}
```

**State**:
- `bidAmount: string`
- `loading: boolean`
- `error: string | null`

**Validation**:
- Bid must be numeric
- Bid must be > current_price
- User must be authenticated
- User cannot bid on own auction

**Key Functions**:
- `handleSubmit()`: Validate and insert bid
- `validateBid()`: Check bid amount rules
- Error handling with toast notifications

**UI Elements**:
- Number input with step="0.01"
- Current price display
- Minimum bid hint (current_price + 0.01)
- Submit button
- Error/success messages

### 4. Countdown Timer Component

#### components/countdown-timer.tsx
Client component displaying time remaining.

**Props**:
```typescript
{
  endTime: string
}
```

**State**:
- `timeLeft: { days, hours, minutes, seconds }`
- `isEnded: boolean`

**Key Functions**:
- `calculateTimeLeft()`: Compute remaining time
- `useEffect` with interval to update every second
- Cleanup interval on unmount

**Display Logic**:
- If ended: "Auction Ended" badge
- If > 1 day: "Xd Xh left"
- If < 1 day: "Xh Xm Xs left"
- Color coding: green (>1 day), yellow (<1 day), red (<1 hour)

### 5. Dashboard Page

#### app/dashboard/page.tsx
Client component with real-time updates.

**Authentication**:
- Check auth on mount, redirect to `/login` if not authenticated

**State**:
- `myAuctions: Auction[]`
- `myBids: BidWithAuction[]`
- `loading: boolean`

**Data Fetching**:
```typescript
// My Auctions
const { data: myAuctions } = await supabase
  .from('auctions')
  .select('*')
  .eq('owner_id', user.id)
  .order('created_at', { ascending: false })

// My Bids (with auction details)
const { data: myBids } = await supabase
  .from('bids')
  .select(`
    *,
    auction:auctions(*)
  `)
  .eq('bidder_id', user.id)
  .order('created_at', { ascending: false })
```

**Real-Time Updates**:
- Subscribe to auction updates for user's auctions
- Subscribe to bid updates for auctions user has bid on
- Update UI when prices change

**UI Sections**:
1. **My Auctions Table**:
   - Title (clickable link)
   - Current Price
   - Bid Count
   - Status (Active/Ended)
   - End Time
   - Empty state: "Create your first auction"

2. **My Bids Table**:
   - Auction Title (clickable link)
   - My Bid Amount
   - Current Price
   - Status Badge (Winning/Outbid)
   - End Time
   - Empty state: "Browse auctions to start bidding"

**Status Logic**:
```typescript
const isWinning = (bid: Bid, auction: Auction) => {
  return bid.bid_amount === auction.current_price
}
```

### 6. Bid List Component

#### components/bid-list.tsx
Display component for showing bid history.

**Props**:
```typescript
{
  bids: Bid[]
  currentUserId?: string
}
```

**Display**:
- Table format with columns: Bidder, Amount, Time
- Sorted by amount (descending)
- Highlight current user's bids
- Show relative time (e.g., "2 minutes ago")
- Empty state: "No bids yet. Be the first!"

## Data Models

### TypeScript Interfaces

```typescript
// Already defined in types/database.ts
type Auction = Database['public']['Tables']['auctions']['Row']
type Bid = Database['public']['Tables']['bids']['Row']

// Extended types for dashboard
interface BidWithAuction extends Bid {
  auction: Auction
}

interface AuctionWithBidCount extends Auction {
  bid_count: number
}
```

### Database Queries

**Fetch Auction with Bid Count**:
```typescript
const { data } = await supabase
  .from('auctions')
  .select(`
    *,
    bids(count)
  `)
  .eq('id', auctionId)
  .single()
```

**Fetch Bids for Auction**:
```typescript
const { data } = await supabase
  .from('bids')
  .select('*')
  .eq('auction_id', auctionId)
  .order('bid_amount', { ascending: false })
```

**Insert Bid**:
```typescript
const { data, error } = await supabase
  .from('bids')
  .insert({
    auction_id: auctionId,
    bidder_id: userId,
    bid_amount: amount
  })
```

## Error Handling

### Error Categories and Handling Strategy

1. **Authentication Errors**:
   - Invalid credentials: Display "Invalid email or password"
   - Email already exists: Display "Account already exists"
   - Network errors: Display "Connection error. Please try again"
   - Strategy: Use Supabase error codes to provide specific messages

2. **Validation Errors**:
   - Bid too low: "Bid must be higher than $X.XX"
   - Missing fields: "Please fill in all required fields"
   - Invalid format: "Please enter a valid number"
   - Strategy: Client-side validation before submission

3. **Database Errors**:
   - RLS policy violations: "You don't have permission to perform this action"
   - Constraint violations: "Invalid bid amount"
   - Connection errors: "Database connection failed. Please retry"
   - Strategy: Catch errors, log to console, show user-friendly message

4. **Real-Time Errors**:
   - Subscription failures: Silently retry connection
   - Channel errors: Log error, continue with polling fallback
   - Strategy: Graceful degradation, don't block UI

### Error Display Components

Use existing `useToast` hook for notifications:
```typescript
toast({
  title: 'Error',
  description: errorMessage,
  variant: 'destructive'
})
```

For form errors, display inline below inputs:
```typescript
{error && (
  <p className="text-sm text-red-600 mt-1">{error}</p>
)}
```

## Testing Strategy

### Unit Testing

**Components to Test**:
1. `CountdownTimer`: Time calculation logic
2. `BidForm`: Validation logic
3. `AuctionCard`: Display formatting
4. Utility functions: Time formatting, price formatting

**Testing Approach**:
- Use Jest + React Testing Library
- Mock Supabase client
- Test component rendering
- Test user interactions
- Test edge cases (expired auctions, no bids, etc.)

### Integration Testing

**Flows to Test**:
1. **Authentication Flow**:
   - Sign up → Login → Access protected route
   - Failed login → Error display
   - Logout → Redirect to home

2. **Bidding Flow**:
   - View auction → Place bid → See update
   - Invalid bid → Error message
   - Bid on own auction → Prevented

3. **Dashboard Flow**:
   - View my auctions → Click auction → Navigate
   - View my bids → Check winning status

**Testing Approach**:
- Use Playwright or Cypress for E2E tests
- Test against Supabase test project
- Mock real-time updates
- Test responsive design

### Real-Time Testing

**Scenarios**:
1. Multiple users bidding simultaneously
2. Network disconnection and reconnection
3. Subscription cleanup on navigation
4. Memory leak prevention

**Testing Approach**:
- Manual testing with multiple browser windows
- Monitor network tab for subscription activity
- Check for memory leaks with Chrome DevTools
- Test on slow network conditions

## Security Considerations

### Row Level Security (RLS)

Already configured in Supabase:
- Users can only create auctions as themselves
- Users can only create bids as themselves
- All users can read active auctions
- Bid validation prevents invalid amounts

### Client-Side Security

1. **Authentication State**:
   - Never trust client-side auth checks alone
   - Server components verify auth with Supabase
   - RLS policies enforce database-level security

2. **Input Validation**:
   - Validate all user inputs client-side
   - Server-side validation via database constraints
   - Sanitize inputs to prevent XSS

3. **API Keys**:
   - Use `NEXT_PUBLIC_SUPABASE_ANON_KEY` (safe for client)
   - RLS policies protect data access
   - Never expose service role key

### Protected Routes

Implement route protection pattern:
```typescript
// In protected pages
const { data: { user } } = await supabase.auth.getUser()
if (!user) {
  redirect('/login')
}
```

## Performance Optimization

### Server-Side Rendering

- Use Server Components for initial data fetch
- Reduces client-side JavaScript bundle
- Improves SEO and initial load time

### Real-Time Optimization

1. **Subscription Management**:
   - Subscribe only to specific auction/bid changes
   - Unsubscribe on component unmount
   - Use single channel per page

2. **Data Fetching**:
   - Fetch only necessary fields
   - Use pagination for large bid lists
   - Cache auction data client-side

3. **Re-render Optimization**:
   - Use React.memo for bid list items
   - Optimize countdown timer updates
   - Debounce rapid state updates

### Bundle Size

- Use dynamic imports for heavy components
- Tree-shake unused shadcn/ui components
- Optimize images with Next.js Image component

## Deployment Considerations

### Environment Variables

Required in Vercel:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Build Configuration

```javascript
// next.config.js
module.exports = {
  reactStrictMode: true,
  images: {
    domains: ['hzybcchwbnfjfrbtfsio.supabase.co']
  }
}
```

### Vercel Deployment

- Automatic deployments from Git
- Preview deployments for PRs
- Environment variables configured in dashboard
- Edge functions for optimal performance

## Real-Time Implementation Details

### Supabase Realtime Setup

**Auction Detail Page Subscriptions**:

```typescript
useEffect(() => {
  const channel = supabase
    .channel(`auction-${auctionId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'auctions',
        filter: `id=eq.${auctionId}`
      },
      (payload) => {
        setAuction(payload.new as Auction)
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'bids',
        filter: `auction_id=eq.${auctionId}`
      },
      (payload) => {
        setBids(prev => [payload.new as Bid, ...prev].sort((a, b) => 
          b.bid_amount - a.bid_amount
        ))
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [auctionId])
```

**Dashboard Subscriptions**:

```typescript
// Subscribe to updates for user's auctions
const auctionChannel = supabase
  .channel('my-auctions')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'auctions',
      filter: `owner_id=eq.${user.id}`
    },
    (payload) => {
      setMyAuctions(prev => 
        prev.map(a => a.id === payload.new.id ? payload.new : a)
      )
    }
  )
  .subscribe()
```

### Handling Connection Issues

```typescript
const [connectionStatus, setConnectionStatus] = useState('connected')

channel.on('system', {}, (payload) => {
  if (payload.status === 'CHANNEL_ERROR') {
    setConnectionStatus('error')
    // Optionally implement reconnection logic
  }
})
```

## UI/UX Design Patterns

### Loading States

- Skeleton loaders for initial data fetch
- Spinner for form submissions
- Optimistic UI updates for bids

### Empty States

- Friendly messages with CTAs
- Icons to make empty states engaging
- Clear next steps for users

### Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Touch-friendly bid buttons on mobile
- Collapsible tables on small screens

### Accessibility

- Semantic HTML elements
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus management for modals
- Color contrast compliance (WCAG AA)

## Migration from Existing Code

### Files to Create

New files needed:
- `app/(auth)/login/page.tsx`
- `app/(auth)/signup/page.tsx`
- `app/auctions/[id]/page.tsx`
- `app/dashboard/page.tsx`
- `components/bid-form.tsx`
- `components/countdown-timer.tsx`
- `components/bid-list.tsx` (optional, can be inline)

### Files to Modify

No existing files need modification. The existing structure supports the new features:
- `components/auth-provider.tsx` - Already provides auth context
- `components/navbar.tsx` - Already handles auth state
- `lib/supabase.ts` - Already configured
- `types/database.ts` - Already has type definitions

### Backward Compatibility

All new features are additive:
- Existing pages continue to work
- No breaking changes to components
- Database schema already supports all features
