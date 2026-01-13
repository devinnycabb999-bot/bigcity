import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import { AuctionDetailClient } from './auction-detail-client'

export const revalidate = 0

interface PageProps {
  params: {
    id: string
  }
}

export default async function AuctionDetailPage({ params }: PageProps) {
  const supabase = createServerClient()
  const auctionId = params.id

  // Fetch auction details
  const { data: auction, error: auctionError } = await supabase
    .from('auctions')
    .select('*')
    .eq('id', auctionId)
    .single()

  // Handle 404 if auction not found
  if (auctionError || !auction) {
    notFound()
  }

  // Fetch initial bids for the auction
  const { data: bids, error: bidsError } = await supabase
    .from('bids')
    .select('*')
    .eq('auction_id', auctionId)
    .order('bid_amount', { ascending: false })

  if (bidsError) {
    console.error('Error fetching bids:', bidsError)
  }

  // Pass initial data to client component
  return (
    <AuctionDetailClient 
      initialAuction={auction} 
      initialBids={bids || []} 
    />
  )
}
