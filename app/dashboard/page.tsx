'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import type { Database } from '@/types/database'

type Auction = Database['public']['Tables']['auctions']['Row']
type Bid = Database['public']['Tables']['bids']['Row']

interface AuctionWithBidCount extends Auction {
  bids: { count: number }[]
}

interface BidWithAuction extends Bid {
  auction: Auction
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const supabase = createClient()
  const [myAuctions, setMyAuctions] = useState<AuctionWithBidCount[]>([])
  const [myBids, setMyBids] = useState<BidWithAuction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Check authentication and redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Fetch user's data
  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Fetch user's auctions with bid count
        const { data: auctions, error: auctionsError } = await supabase
          .from('auctions')
          .select(`
            *,
            bids(count)
          `)
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false })

        if (auctionsError) {
          console.error('Error fetching auctions:', auctionsError)
          throw new Error('Failed to load your auctions. Please try again.')
        }
        
        setMyAuctions(auctions as AuctionWithBidCount[] || [])

        // Fetch user's bids with auction details
        const { data: bids, error: bidsError } = await supabase
          .from('bids')
          .select(`
            *,
            auction:auctions(*)
          `)
          .eq('bidder_id', user.id)
          .order('created_at', { ascending: false })

        if (bidsError) {
          console.error('Error fetching bids:', bidsError)
          throw new Error('Failed to load your bids. Please try again.')
        }
        
        setMyBids(bids as BidWithAuction[] || [])
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
        setError(errorMessage)
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, supabase, toast])

  // Set up real-time subscriptions for dashboard updates
  useEffect(() => {
    if (!user) return

    // Subscribe to auction updates for user's auctions
    const auctionChannel = supabase
      .channel('my-auctions')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'auctions',
          filter: `owner_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Auction updated:', payload)
          setMyAuctions((prev) =>
            prev.map((a) => 
              a.id === payload.new.id 
                ? { ...(payload.new as Auction), bids: a.bids } 
                : a
            )
          )
        }
      )
      .subscribe()

    // Subscribe to auction updates for auctions user has bid on
    const bidAuctionChannel = supabase
      .channel('bid-auctions')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'auctions',
        },
        (payload) => {
          console.log('Bid auction updated:', payload)
          setMyBids((prev) =>
            prev.map((bid) =>
              bid.auction.id === payload.new.id
                ? { ...bid, auction: payload.new as Auction }
                : bid
            )
          )
        }
      )
      .subscribe()

    // Cleanup subscriptions on unmount
    return () => {
      console.log('Cleaning up dashboard subscriptions')
      supabase.removeChannel(auctionChannel)
      supabase.removeChannel(bidAuctionChannel)
    }
  }, [user, supabase])

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  // Check if auction has ended
  const isEnded = (endTime: string) => {
    return new Date(endTime) < new Date()
  }

  // Check if user is winning
  const isWinning = (bid: Bid, auction: Auction) => {
    return Number(bid.bid_amount) === Number(auction.current_price)
  }

  // Get bid count from auction
  const getBidCount = (auction: AuctionWithBidCount) => {
    return auction.bids?.[0]?.count ?? 0
  }

  // Skeleton loader for table rows
  const TableSkeleton = ({ rows = 3 }: { rows?: number }) => (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-3">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-5 w-1/6" />
          <Skeleton className="h-5 w-1/6" />
          <Skeleton className="h-5 w-1/6" />
        </div>
      ))}
    </div>
  )

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <p className="text-center">Loading...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">My Dashboard</h1>

        <div className="space-y-8">
          {/* My Auctions Section */}
          <Card>
            <CardHeader>
              <CardTitle>My Auctions</CardTitle>
              <CardDescription>
                Auctions you've created
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <TableSkeleton rows={3} />
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={() => window.location.reload()}>
                    Retry
                  </Button>
                </div>
              ) : myAuctions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">You haven't created any auctions yet</p>
                  <Link href="/create">
                    <Button>Create your first auction</Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Title</th>
                        <th className="text-left py-3 px-4">Current Price</th>
                        <th className="text-left py-3 px-4">Bid Count</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">End Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myAuctions.map((auction) => (
                        <tr key={auction.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <Link 
                              href={`/auctions/${auction.id}`}
                              className="text-purple-600 hover:text-purple-700 font-medium"
                            >
                              {auction.title}
                            </Link>
                          </td>
                          <td className="py-3 px-4">
                            ${Number(auction.current_price).toFixed(2)}
                          </td>
                          <td className="py-3 px-4">
                            {getBidCount(auction)}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={isEnded(auction.end_time) ? 'destructive' : 'default'}>
                              {isEnded(auction.end_time) ? 'Ended' : 'Active'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            {formatDate(auction.end_time)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Bids Section */}
          <Card>
            <CardHeader>
              <CardTitle>My Bids</CardTitle>
              <CardDescription>
                Auctions you've bid on
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <TableSkeleton rows={3} />
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={() => window.location.reload()}>
                    Retry
                  </Button>
                </div>
              ) : myBids.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">You haven't placed any bids yet</p>
                  <Link href="/auctions">
                    <Button>Browse auctions to start bidding</Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Auction</th>
                        <th className="text-left py-3 px-4">My Bid</th>
                        <th className="text-left py-3 px-4">Current Price</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">End Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myBids.map((bid) => (
                        <tr key={bid.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <Link 
                              href={`/auctions/${bid.auction.id}`}
                              className="text-purple-600 hover:text-purple-700 font-medium"
                            >
                              {bid.auction.title}
                            </Link>
                          </td>
                          <td className="py-3 px-4">
                            ${Number(bid.bid_amount).toFixed(2)}
                          </td>
                          <td className="py-3 px-4">
                            ${Number(bid.auction.current_price).toFixed(2)}
                          </td>
                          <td className="py-3 px-4">
                            {isWinning(bid, bid.auction) ? (
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                Winning
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                Outbid
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {formatDate(bid.auction.end_time)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
