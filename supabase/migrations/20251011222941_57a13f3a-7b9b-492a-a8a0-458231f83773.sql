-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  options TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create policy for public to insert orders (no auth required for customers)
CREATE POLICY "Anyone can create orders"
  ON public.orders
  FOR INSERT
  WITH CHECK (true);

-- Create policy for public to insert order items
CREATE POLICY "Anyone can create order items"
  ON public.order_items
  FOR INSERT
  WITH CHECK (true);

-- Create policy for authenticated users (admin) to view all orders
CREATE POLICY "Authenticated users can view orders"
  ON public.orders
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Create policy for authenticated users (admin) to update orders
CREATE POLICY "Authenticated users can update orders"
  ON public.orders
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Create policy for authenticated users to view order items
CREATE POLICY "Authenticated users can view order items"
  ON public.order_items
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);

-- Create trigger for updating updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();