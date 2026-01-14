export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      auctions: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string
          starting_price: number
          current_price: number
          end_time: string
          owner_id: string
          image_url: string | null
          status: 'active' | 'ended'
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description: string
          starting_price: number
          current_price?: number
          end_time: string
          owner_id: string
          image_url?: string | null
          status?: 'active' | 'ended'
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string
          starting_price?: number
          current_price?: number
          end_time?: string
          owner_id?: string
          image_url?: string | null
          status?: 'active' | 'ended'
        }
      }
      bids: {
        Row: {
          id: string
          created_at: string
          auction_id: string
          bidder_id: string
          bid_amount: number
        }
        Insert: {
          id?: string
          created_at?: string
          auction_id: string
          bidder_id: string
          bid_amount: number
        }
        Update: {
          id?: string
          created_at?: string
          auction_id?: string
          bidder_id?: string
          bid_amount?: number
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          email: string
          full_name: string | null
        }
        Insert: {
          id: string
          created_at?: string
          email: string
          full_name?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          full_name?: string | null
        }
      }
    }
  }
}
