'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import { Navbar } from '@/components/navbar'
import { CountdownTimer } from '@/components/countdown-timer'
import { BidForm } from '@/components/bid-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Database } from '@/types/database'

type Auction = Database['public']['Tables']['auctions']['Row']
type Bid = Database['public']['Tables']['bids']['Row']

interface AuctionDetailClientProps {
  initialAuction: Auction
  initialBids: Bid[]
}

export function AuctionDetailClient({ initialAuction, initialBids }: AuctionDetailClientProps) {
  const { user } = useAuth()
  const supabase = createClient()
  const [auction, setAuction] = useState<Auction>(initialAuction)
  const [bids, setBids] = useState<Bid[]>(initialBids)

  // Compute if auction has ended
  const isEnded = useMemo(() => {
    return new Date(auction.end_time) < new Date()
  }, [auction.end_time])

  // Check if current user is the owner
  const isOwner = user?.id === auction.owner_id

  // Set up real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel(`auction-${auction.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'auctions',
          filter: `id=eq.${auction.id}`,
        },
        (payload) => {
          console.log('Auction updated:', payload)
          setAuction(payload.new as Auction)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bids',
          filter: `auction_id=eq.${auction.id}`,
        },
        (payload) => {
          console.log('New bid:', payload)
          const newBid = payload.new as Bid
          setBids((prevBids) => {
            // Add new bid and sort by amount descending
            const updatedBids = [newBid, ...prevBids]
            return updatedBids.sort((a, b) => Number(b.bid_amount) - Number(a.bid_amount))
          })
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status)
      })

    // Cleanup subscriptions on unmount
    return () => {
      console.log('Cleaning up subscription')
      supabase.removeChannel(channel)
    }
  }, [auction.id, supabase])

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <Link href="/auctions" className="text-purple-600 hover:text-purple-700">
            ← Back to auctions
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main auction details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-3xl mb-2">{auction.title}</CardTitle>
                    <CardDescription>
                      {auction.description || 'No description provided'}
                    </CardDescription>
                  </div>
                  <CountdownTimer endTime={auction.end_time} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Starting Price</p>
                    <p className="text-xl font-semibold">
                      ${Number(auction.starting_price).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Current Price</p>
                    <p className="text-3xl font-bold text-purple-600">
                      ${Number(auction.current_price).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Auction Ends</p>
                  <p className="text-base">{formatDate(auction.end_time)}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge variant={isEnded ? 'destructive' : 'default'}>
                    {isEnded ? 'Ended' : 'Active'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Bid history */}
            <Card>
              <CardHeader>
                <CardTitle>Bid History</CardTitle>
                <CardDescription>
                  {bids.length} {bids.length === 1 ? 'bid' : 'bids'} placed
                </CardDescription>
              </CardHeader>
              <CardContent>
                {bids.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No bids yet. Be the first to bid!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {bids.map((bid) => (
                      <div
                        key={bid.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          bid.bidder_id === user?.id
                            ? 'bg-purple-50 border-purple-200'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <div>
                          <p className="font-semibold">
                            ${Number(bid.bid_amount).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatRelativeTime(bid.created_at)}
                          </p>
                        </div>
                        {bid.bidder_id === user?.id && (
                          <Badge variant="secondary">Your bid</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bid form sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <BidForm auction={auction} disabled={isEnded} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
