
-- Create the goods_exchange table
CREATE TABLE IF NOT EXISTS goods_exchange (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- For compatibility with existing queries, always 'goods'
  goods_category TEXT, -- furniture, tools, electronics, etc.
  request_type TEXT NOT NULL CHECK (request_type IN ('need', 'offer')),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  valid_until TIMESTAMPTZ,
  urgency TEXT CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
  image_url TEXT, -- For backward compatibility
  images TEXT[], -- Array of image URLs
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE goods_exchange ENABLE ROW LEVEL SECURITY;

-- Policy for inserting records: any authenticated user can insert
CREATE POLICY goods_exchange_insert_policy ON goods_exchange
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for viewing records: any authenticated user can view
CREATE POLICY goods_exchange_select_policy ON goods_exchange
  FOR SELECT USING (true);

-- Policy for updating records: only the owner can update
CREATE POLICY goods_exchange_update_policy ON goods_exchange
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for deleting records: only the owner can delete
CREATE POLICY goods_exchange_delete_policy ON goods_exchange
  FOR DELETE USING (auth.uid() = user_id);
