/*
  # Initial Database Schema Setup for Food Delivery App

  1. New Tables
    - `users` - Stores user information for customers, riders, and admins
    - `restaurants` - Stores restaurant information
    - `menu_items` - Stores food items for each restaurant
    - `orders` - Stores order information
    - `order_items` - Stores items within each order
    - `rider_details` - Stores additional information for riders
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Add policies for riders to access assigned orders
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  address TEXT,
  role TEXT NOT NULL CHECK (role IN ('customer', 'rider', 'admin')) DEFAULT 'customer'
);

-- Restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  cover_image TEXT NOT NULL,
  address TEXT NOT NULL,
  category TEXT NOT NULL,
  rating NUMERIC(3,2) DEFAULT 0.0,
  delivery_fee NUMERIC(10,2) NOT NULL,
  estimated_delivery_time INTEGER NOT NULL,
  is_open BOOLEAN DEFAULT true
);

-- Menu items table
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  is_available BOOLEAN DEFAULT true
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  customer_id UUID NOT NULL REFERENCES users(id),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  status TEXT NOT NULL CHECK (status IN ('pending', 'preparing', 'ready', 'assigned', 'in_delivery', 'delivered', 'cancelled')) DEFAULT 'pending',
  total_amount NUMERIC(10,2) NOT NULL,
  delivery_address TEXT NOT NULL,
  rider_id UUID REFERENCES users(id),
  estimated_delivery_time TIMESTAMPTZ
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id),
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  special_instructions TEXT
);

-- Rider details table
CREATE TABLE IF NOT EXISTS rider_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('bicycle', 'motorcycle', 'car')),
  license_number TEXT NOT NULL,
  is_available BOOLEAN DEFAULT true,
  current_location JSONB,
  rating NUMERIC(3,2) DEFAULT 0.0
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE rider_details ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users policies
CREATE POLICY "Users can view their own data"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- Restaurants policies (publicly viewable)
CREATE POLICY "Restaurants are viewable by everyone"
  ON restaurants
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can modify restaurants
CREATE POLICY "Only admins can insert restaurants"
  ON restaurants
  FOR INSERT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

CREATE POLICY "Only admins can update restaurants"
  ON restaurants
  FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

-- Menu items policies (publicly viewable)
CREATE POLICY "Menu items are viewable by everyone"
  ON menu_items
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can modify menu items
CREATE POLICY "Only admins can insert menu items"
  ON menu_items
  FOR INSERT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

CREATE POLICY "Only admins can update menu items"
  ON menu_items
  FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

-- Orders policies
CREATE POLICY "Customers can view their own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = customer_id);

CREATE POLICY "Customers can create orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Riders can view assigned orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = rider_id OR
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin') OR
    status = 'ready' AND EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'rider')
  );

CREATE POLICY "Riders can update their assigned orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = rider_id OR
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

-- Order items policies
CREATE POLICY "Users can view their own order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.customer_id = auth.uid() OR orders.rider_id = auth.uid())
    ) OR
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

CREATE POLICY "Customers can create order items"
  ON order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.customer_id = auth.uid()
    )
  );

-- Rider details policies
CREATE POLICY "Rider details are viewable by the rider"
  ON rider_details
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

CREATE POLICY "Riders can update their own details"
  ON rider_details
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Riders can insert their own details"
  ON rider_details
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', NULL, 'customer');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to add new users to users table
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();