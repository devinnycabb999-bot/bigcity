import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <h1 className="text-6xl font-bold text-gray-900">
            Welcome to <span className="text-purple-600">BigCity</span> Auctions
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover unique items, place bids, and win amazing deals in our online auction platform.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                Browse Auctions
              </Button>
            </Link>
            <Link href="/create">
              <Button size="lg" variant="outline">
                Create Auction
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
