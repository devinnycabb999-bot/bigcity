'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import type { Database } from '@/types/database'

type Auction = Database['public']['Tables']['auctions']['Row']

interface BidFormProps {
  auction: Auction
  disabled: boolean
}

export function BidForm({ auction, disabled }: BidFormProps) {
  const { user } = useAuth()
  const supabase = createClient()
  const { toast } = useToast()
  const [bidAmount, setBidAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isOwner = user?.id === auction.owner_id
  const minBid = Number(auction.current_price) + 0.01

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Check if user is authenticated
    if (!user) {
      setError('Please log in to place a bid')
      setLoading(false)
      return
    }

    // Check if user is trying to bid on their own auction
    if (isOwner) {
      setError('You cannot bid on your own auction')
      setLoading(false)
      return
    }

    // Validate bid amount is numeric
    const amount = parseFloat(bidAmount)
    if (isNaN(amount)) {
      setError('Please enter a valid number')
      setLoading(false)
      return
    }

    // Validate bid is higher than current price
    if (amount <= Number(auction.current_price)) {
      setError(`Bid must be higher than $${Number(auction.current_price).toFixed(2)}`)
      setLoading(false)
      return
    }

    try {
      const { error: insertError } = await supabase
        .from('bids')
        .insert({
          auction_id: auction.id,
          bidder_id: user.id,
          bid_amount: amount,
        })

      if (insertError) {
        throw insertError
      }

      toast({
        title: 'Bid placed successfully!',
        description: `Your bid of $${amount.toFixed(2)} has been placed`,
      })

      // Clear the form
      setBidAmount('')
    } catch (err: any) {
      console.error('Bid error:', err)
      
      if (err.message?.includes('permission')) {
        setError('You don\'t have permission to place this bid')
      } else if (err.message?.includes('constraint')) {
        setError('Invalid bid amount')
      } else {
        setError('Failed to place bid. Please try again')
      }

      toast({
        title: 'Error',
        description: error || 'Failed to place bid',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Don't show form if user is not authenticated
  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-600">
            Please <a href="/login" className="text-purple-600 hover:text-purple-700 font-medium">log in</a> to place a bid
          </p>
        </CardContent>
      </Card>
    )
  }

  // Don't show form if user is the owner
  if (isOwner) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-600">
            You cannot bid on your own auction
          </p>
        </CardContent>
      </Card>
    )
  }

  // Don't show form if auction has ended
  if (disabled) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-600">
            This auction has ended
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Place Your Bid</CardTitle>
        <CardDescription>
          Current price: ${Number(auction.current_price).toFixed(2)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bidAmount">Your Bid Amount ($)</Label>
            <Input
              id="bidAmount"
              type="number"
              step="0.01"
              min={minBid}
              placeholder={minBid.toFixed(2)}
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-500">
              Minimum bid: ${minBid.toFixed(2)}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Placing bid...' : 'Place Bid'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
