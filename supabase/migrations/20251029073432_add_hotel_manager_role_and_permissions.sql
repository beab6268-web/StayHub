/*
  # Add Hotel Manager Role and Permission System

  ## Overview
  This migration adds support for hotel managers who can manage specific hotels assigned to them.

  ## Changes

  1. **New Tables**
    - `hotel_managers` - Junction table linking managers to their hotels
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `hotel_id` (uuid, foreign key to hotels)
      - `created_at` (timestamptz)
  
  2. **Security Updates**
    - Update RLS policies for hotel managers to access only their hotels
    - Hotel managers can view/edit hotels and rooms assigned to them
    - Hotel managers can view/manage reservations for their hotels
    - Admins retain full access to all resources
  
  3. **Important Notes**
    - Hotel managers cannot create new hotels (admin only)
    - Hotel managers can only manage hotels explicitly assigned to them
    - Regular users maintain read-only access to hotels/rooms
    - Users can only manage their own reservations
*/

-- Create hotel_managers junction table
CREATE TABLE IF NOT EXISTS hotel_managers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  hotel_id uuid NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, hotel_id)
);

-- Enable RLS on hotel_managers
ALTER TABLE hotel_managers ENABLE ROW LEVEL SECURITY;

-- Hotel_managers policies
CREATE POLICY "Admins can view all hotel manager assignments"
  ON hotel_managers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Hotel managers can view their own assignments"
  ON hotel_managers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can create hotel manager assignments"
  ON hotel_managers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete hotel manager assignments"
  ON hotel_managers FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Update hotels policies to allow hotel managers
DROP POLICY IF EXISTS "Admins can update hotels" ON hotels;
DROP POLICY IF EXISTS "Admins can delete hotels" ON hotels;

CREATE POLICY "Admins and hotel managers can update their hotels"
  ON hotels FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM hotel_managers
      WHERE hotel_managers.hotel_id = hotels.id
      AND hotel_managers.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM hotel_managers
      WHERE hotel_managers.hotel_id = hotels.id
      AND hotel_managers.user_id = auth.uid()
    )
  );

CREATE POLICY "Only admins can delete hotels"
  ON hotels FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Update rooms policies to allow hotel managers
DROP POLICY IF EXISTS "Admins can insert rooms" ON rooms;
DROP POLICY IF EXISTS "Admins can update rooms" ON rooms;
DROP POLICY IF EXISTS "Admins can delete rooms" ON rooms;

CREATE POLICY "Admins and hotel managers can insert rooms for their hotels"
  ON rooms FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM hotel_managers
      WHERE hotel_managers.hotel_id = rooms.hotel_id
      AND hotel_managers.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins and hotel managers can update rooms for their hotels"
  ON rooms FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM hotel_managers
      WHERE hotel_managers.hotel_id = rooms.hotel_id
      AND hotel_managers.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM hotel_managers
      WHERE hotel_managers.hotel_id = rooms.hotel_id
      AND hotel_managers.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins and hotel managers can delete rooms for their hotels"
  ON rooms FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM hotel_managers
      WHERE hotel_managers.hotel_id = rooms.hotel_id
      AND hotel_managers.user_id = auth.uid()
    )
  );

-- Update reservations policies to allow hotel managers to view their hotel reservations
DROP POLICY IF EXISTS "Admins can view all reservations" ON reservations;

CREATE POLICY "Admins can view all reservations"
  ON reservations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Hotel managers can view reservations for their hotels"
  ON reservations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM hotel_managers
      WHERE hotel_managers.hotel_id = reservations.hotel_id
      AND hotel_managers.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_hotel_managers_user_id ON hotel_managers(user_id);
CREATE INDEX IF NOT EXISTS idx_hotel_managers_hotel_id ON hotel_managers(hotel_id);
CREATE INDEX IF NOT EXISTS idx_reservations_dates ON reservations(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_reservations_room_status ON reservations(room_id, status);