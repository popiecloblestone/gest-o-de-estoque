-- Esse script corrige as permissões de acesso (RLS - Row Level Security)
-- para que usuários logados no painel admin consigam visualizar e gerenciar
-- as compras, clientes, cupons e métricas de acessos.
-- 1. Tabela de Pedidos (Orders)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated full access to orders" ON public.orders;
CREATE POLICY "Allow authenticated full access to orders" ON public.orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
-- 2. Tabela de Itens do Pedido (Order Items)
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated full access to order_items" ON public.order_items;
CREATE POLICY "Allow authenticated full access to order_items" ON public.order_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
-- 3. Tabela de Perfis/Clientes (Profiles)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated full access to profiles" ON public.profiles;
CREATE POLICY "Allow authenticated full access to profiles" ON public.profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);
-- 4. Tabela de Cupons (Coupons)
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated full access to coupons" ON public.coupons;
CREATE POLICY "Allow authenticated full access to coupons" ON public.coupons FOR ALL TO authenticated USING (true) WITH CHECK (true);
-- 5. Tabelas de Analytics (Acessos e Visitas)
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin read visits" ON public.site_visits;
DROP POLICY IF EXISTS "Allow authenticated full access to site_visits" ON public.site_visits;
CREATE POLICY "Allow authenticated full access to site_visits" ON public.site_visits FOR ALL TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin read views" ON public.product_views;
DROP POLICY IF EXISTS "Allow authenticated full access to product_views" ON public.product_views;
CREATE POLICY "Allow authenticated full access to product_views" ON public.product_views FOR ALL TO authenticated USING (true) WITH CHECK (true);
-- Extra: Tabela de Produtos (Products) apenas para garantir
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated full access to products" ON public.products;
CREATE POLICY "Allow authenticated full access to products" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);
-- Permitir leitura pública aos produtos
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
CREATE POLICY "Allow public read access to products" ON public.products FOR
SELECT TO anon,
    authenticated USING (true);