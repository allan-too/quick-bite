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
      users: {
        Row: {
          id: string
          created_at: string
          email: string
          full_name: string
          avatar_url: string | null
          phone: string | null
          address: string | null
          role: 'customer' | 'rider' | 'admin'
        }
        Insert: {
          id: string
          created_at?: string
          email: string
          full_name: string
          avatar_url?: string | null
          phone?: string | null
          address?: string | null
          role?: 'customer' | 'rider' | 'admin'
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          phone?: string | null
          address?: string | null
          role?: 'customer' | 'rider' | 'admin'
        }
      }
      restaurants: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string
          logo_url: string
          cover_image: string
          address: string
          category: string
          rating: number
          delivery_fee: number
          estimated_delivery_time: number
          is_open: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description: string
          logo_url: string
          cover_image: string
          address: string
          category: string
          rating?: number
          delivery_fee: number
          estimated_delivery_time: number
          is_open?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string
          logo_url?: string
          cover_image?: string
          address?: string
          category?: string
          rating?: number
          delivery_fee?: number
          estimated_delivery_time?: number
          is_open?: boolean
        }
      }
      menu_items: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string
          price: number
          image_url: string
          category: string
          restaurant_id: string
          is_available: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description: string
          price: number
          image_url: string
          category: string
          restaurant_id: string
          is_available?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string
          price?: number
          image_url?: string
          category?: string
          restaurant_id?: string
          is_available?: boolean
        }
      }
      orders: {
        Row: {
          id: string
          created_at: string
          customer_id: string
          restaurant_id: string
          status: 'pending' | 'preparing' | 'ready' | 'assigned' | 'in_delivery' | 'delivered' | 'cancelled'
          total_amount: number
          delivery_address: string
          rider_id: string | null
          estimated_delivery_time: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          customer_id: string
          restaurant_id: string
          status?: 'pending' | 'preparing' | 'ready' | 'assigned' | 'in_delivery' | 'delivered' | 'cancelled'
          total_amount: number
          delivery_address: string
          rider_id?: string | null
          estimated_delivery_time?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          customer_id?: string
          restaurant_id?: string
          status?: 'pending' | 'preparing' | 'ready' | 'assigned' | 'in_delivery' | 'delivered' | 'cancelled'
          total_amount?: number
          delivery_address?: string
          rider_id?: string | null
          estimated_delivery_time?: string | null
        }
      }
      order_items: {
        Row: {
          id: string
          created_at: string
          order_id: string
          menu_item_id: string
          quantity: number
          unit_price: number
          special_instructions: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          order_id: string
          menu_item_id: string
          quantity: number
          unit_price: number
          special_instructions?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          order_id?: string
          menu_item_id?: string
          quantity?: number
          unit_price?: number
          special_instructions?: string | null
        }
      }
      rider_details: {
        Row: {
          id: string
          user_id: string
          created_at: string
          vehicle_type: 'bicycle' | 'motorcycle' | 'car'
          license_number: string
          is_available: boolean
          current_location: Json | null
          rating: number
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          vehicle_type: 'bicycle' | 'motorcycle' | 'car'
          license_number: string
          is_available?: boolean
          current_location?: Json | null
          rating?: number
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          vehicle_type?: 'bicycle' | 'motorcycle' | 'car'
          license_number?: string
          is_available?: boolean
          current_location?: Json | null
          rating?: number
        }
      }
    }
  }
}