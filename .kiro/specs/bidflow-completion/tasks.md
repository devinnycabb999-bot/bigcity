# Implementation Plan

- [x] 1. Implement authentication pages


  - Create login and signup pages with Supabase Auth integration
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.8_

- [x] 1.1 Create login page with form and authentication logic



  - Create `app/(auth)/login/page.tsx` as a client component
  - Implement form with email and password inputs using shadcn/ui components
  - Add form state management for email, password, loading, and error
  - Implement `handleLogin` function using `supabase.auth.signInWithPassword()`
  - Add error handling with user-friendly messages
  - Redirect to `/auctions` on successful login
  - Include link to signup page


  - _Requirements: 1.4, 1.5, 1.6, 5.1, 5.4_

- [x] 1.2 Create signup page with registration form




  - Create `app/(auth)/signup/page.tsx` as a client component
  - Implement form with email, password, and confirm password inputs
  - Add client-side validation for password matching
  - Implement `handleSignup` function using `supabase.auth.signUp()`
  - Add error handling for duplicate emails and validation errors
  - Redirect to `/auctions` on successful registration
  - Include link to login page



  - _Requirements: 1.1, 1.2, 1.3, 5.1, 5.4_

- [x] 2. Build countdown timer component


  - Create reusable countdown timer for auction end times
  - _Requirements: 2.3, 2.4_



- [x] 2.1 Implement countdown timer component

  - Create `components/countdown-timer.tsx` as a client component


  - Accept `endTime` prop as ISO string
  - Implement `calculateTimeLeft` function to compute days, hours, minutes, seconds
  - Use `useEffect` with `setInterval` to update every second
  - Clean up interval on component unmount


  - Display "Auction Ended" when time expires
  - Format display based on time remaining (days/hours or hours/minutes)
  - Add color coding (green for >1 day, yellow for <1 day, red for <1 hour)
  - _Requirements: 2.3, 2.4_

- [x] 3. Create bid form component










  - Build form for placing bids with validation
  - _Requirements: 2.5, 2.6, 2.7, 2.8, 5.2, 5.5_



- [x] 3.1 Implement bid form component with validation

  - Create `components/bid-form.tsx` as a client component
  - Accept `auction` and `disabled` props
  - Implement form state for bid amount, loading, and error
  - Add number input with step="0.01" for bid amount

  - Display current price and minimum bid hint
  - Implement client-side validation (bid > current_price, numeric input)
  - Check if user is authenticated using `useAuth` hook
  - Prevent bidding on own auction by comparing user ID with owner ID
  - Implement `handleSubmit` to insert bid via Supabase
  - Add error handling with toast notifications
  - Disable form when auction has ended or user is owner
  - _Requirements: 2.5, 2.6, 2.7, 2.8, 5.1, 5.2, 5.5_

- [x] 4. Implement auction detail page with real-time bidding

  - Create dynamic route for viewing individual auctions with live updates
  - _Requirements: 2.1, 2.2, 2.9, 2.10, 2.11, 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 4.1 Create server component for initial auction data fetch

  - Create `app/auctions/[id]/page.tsx` as a server component
  - Extract auction ID from route params
  - Fetch auction details using `createServerClient()`
  - Fetch initial bids for the auction ordered by amount descending
  - Handle 404 case if auction not found
  - Pass initial data to client component
  - _Requirements: 2.1, 2.2_

- [x] 4.2 Create client component for real-time auction updates


  - Create `AuctionDetailClient` component within the same file
  - Accept `initialAuction` and `initialBids` as props
  - Initialize state with initial data
  - Compute `isEnded` based on end_time
  - Get current user from `useAuth` hook
  - Determine if current user is the auction owner
  - Render auction details (title, description, prices, owner info)
  - Integrate `CountdownTimer` component
  - Conditionally render `BidForm` (hide if ended or user is owner)
  - Display message for unauthenticated users to log in
  - Render bid list with all bids
  - _Requirements: 2.1, 2.3, 2.4, 2.5, 2.6, 2.11_

- [x] 4.3 Implement real-time subscriptions for auction and bids


  - Set up Supabase Realtime channel in `useEffect`
  - Subscribe to auction UPDATE events filtered by auction ID
  - Subscribe to bid INSERT events filtered by auction ID
  - Update auction state when auction changes (price updates)
  - Add new bids to bid list and sort by amount descending
  - Clean up subscriptions on component unmount
  - Handle subscription errors gracefully
  - _Requirements: 2.9, 2.10, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_


- [x] 5. Build user dashboard page




  - Create dashboard showing user's auctions and bids with real-time updates
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_



- [x] 5.1 Create dashboard page with authentication check








  - Create `app/dashboard/page.tsx` as a client component
  - Check authentication status on mount using `useAuth`
  - Redirect to `/login` if user is not authenticated
  - Initialize state for myAuctions, myBids, and loading
  - Render Navbar component
  - Create two-section layout: "My Auctions" and "My Bids"
  - _Requirements: 3.1, 3.7, 1.7_


-


- [x] 5.2 Implement data fetching for user's auctions and bids







  - Fetch user's auctions using Supabase query filtered by owner_id
  - Fetch user's bids with joined auction data using Supabase query
  - Order both queries by created_at descending
  - Handle loading states with skeleton loaders
  - Handle errors with user-friendly messages

  - _Requirements: 3.2, 3.3_


- [x] 5.3 Build "My Auctions" section with table display








  - Create table displaying auction title, current price, bid count, status, and end time
  - Make auction titles clickable links to auction detail pages
  - Calculate and display auction status (Active/Ended) based on end_time
  - Format prices and dates for display

  - Add empty state with "Create your first auction" message and CTA button
  - _Requirements: 3.4, 3.6, 3.9_


-

- [x] 5.4 Build "My Bids" section with status indicators







  - Create table displaying auction title, user's bid amount, current price, status, and end time
  - Make auction titles clickable links to auction detail pages
  - Implement `isWinning` logic to check if user's bid equals current price

  - Display status badge (Winning/Outbid) with appropriate styling
  - Format prices and dates for display
  - Add empty state with "Browse auctions to start bidding" message and CTA button
  - _Requirements: 3.5, 3.6, 3.8, 3.9_
-

- [x] 5.5 Add real-time updates to dashboard






  - Set up Supabase Realtime subscriptions for user's auctions
  - Subscribe to auction UPDATE events filtered by owner_id
  - Update myAuctions state when auction data changes
  - Optionally subscribe to bid updates for auctions user has bid on
  - Clean up subscriptions on component unmount
  - _Requirements: 4.1, 4.2, 4.3, 4.5_

-

- [x] 6. Add route protection for protected pages




  - Ensure unauthenticated users are redirected from protected routes
  - _Requirements: 1.7_

- [x] 6.1 Add authentication check to create auction page









  - Open `app/create/page.tsx`
  - Verify authentication check exists at component mount
  - Ensure redirect to `/login` if user is not authenticated
  - Test that authenticated users can access the page
  - _Requirements: 1.7_

- [x] 7. Test and validate all features








  - Verify all requirements are met through manual testing
  - _Requirements: All_

- [x] 7.1 Test authentication flow end-to-end




- [x] 7.1 Test authentication flow end-to-end


  - Test signup with valid credentials
  - Test signup with invalid/duplicate email
  - Test login with valid credentials
  - Test login with invalid credentials
  - Test session persistence across page refreshes
  - Test logout functionality
  - Test protected route redirects for unauthenticated users
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_




- [x] 7.2 Test auction detail page and bidding











  - Test viewing auction details as authenticated and unauthenticated user
  - Test countdown timer display and updates
  - Test bid form validation (amount too low, non-numeric input)
  - Test placing valid bid
  - Test that owner cannot bid on own auction
  - Test real-time updates when another user places bid (use two browser windows)
  - Test auction ended state and disabled bidding
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11_

- [x] 7.3 Test dashboard functionality



  - Test dashboard access (authenticated vs unauthenticated)
  - Test "My Auctions" section displays correct data
  - Test "My Bids" section displays correct data
  - Test winning/outbid status indicators
  - Test clicking auction links navigates correctly
  - Test empty states when no auctions or bids exist
  - Test real-time updates on dashboard
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

- [x] 7.4 Test error handling and edge cases



  - Test form validation errors display correctly
  - Test network error handling
  - Test database error handling
  - Test real-time subscription failures
  - Test memory leak prevention (subscriptions cleaned up)
  - Test responsive design on mobile devices
  - _Requirements: 4.5, 4.6, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_
