
-- Drop existing policies for goods_exchange table to recreate them
DROP POLICY IF EXISTS goods_exchange_insert_policy ON goods_exchange;
DROP POLICY IF EXISTS goods_exchange_select_policy ON goods_exchange;
DROP POLICY IF EXISTS goods_exchange_update_policy ON goods_exchange;
DROP POLICY IF EXISTS goods_exchange_delete_policy ON goods_exchange;

-- Policy for inserting records: any authenticated user can insert
CREATE POLICY goods_exchange_insert_policy ON goods_exchange
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for viewing records: any authenticated user can view
CREATE POLICY goods_exchange_select_policy ON goods_exchange
  FOR SELECT USING (true);

-- Policy for updating records: user can update their own records
-- This updated policy allows the owner to update any field of their own records
CREATE POLICY goods_exchange_update_policy ON goods_exchange
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy for deleting records: only the owner can delete
CREATE POLICY goods_exchange_delete_policy ON goods_exchange
  FOR DELETE USING (auth.uid() = user_id);
