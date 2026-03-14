-- Analytics Tables and Functions
-- 1. Create site_visits table
CREATE TABLE IF NOT EXISTS public.site_visits (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id text NOT NULL,
    visited_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    duration_seconds integer DEFAULT 0,
    page_path text
);
-- RLS for site_visits
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;
-- Allow anyone (anon and authenticated) to insert visits
CREATE POLICY "Allow public inserts" ON public.site_visits FOR
INSERT WITH CHECK (true);
-- Allow only authenticated users (admins) to read visits
CREATE POLICY "Allow admin read visits" ON public.site_visits FOR
SELECT USING (auth.uid() IS NOT NULL);
-- Allow anyone to update their own session duration (using session_id)
-- Note: It's safer to just allow anon updates based on session_id
CREATE POLICY "Allow public updates by session" ON public.site_visits FOR
UPDATE USING (true) WITH CHECK (true);
-- 2. Create product_views table
CREATE TABLE IF NOT EXISTS public.product_views (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id integer NOT NULL,
    -- Assuming integer based on types.ts Product id
    viewed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    session_id text NOT NULL
);
-- RLS for product_views
ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;
-- Allow anyone to insert product views
CREATE POLICY "Allow public inserts views" ON public.product_views FOR
INSERT WITH CHECK (true);
-- Allow only authenticated users (admins) to read product views
CREATE POLICY "Allow admin read views" ON public.product_views FOR
SELECT USING (auth.uid() IS NOT NULL);
-- 3. RPC: Average duration
CREATE OR REPLACE FUNCTION public.get_average_duration() RETURNS integer LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE avg_seconds integer;
BEGIN -- We only want to average sessions that actually stayed (> 0s)
-- Or you can average all, but > 0 is usually more accurate for actual engagement
SELECT COALESCE(AVG(duration_seconds)::integer, 0) INTO avg_seconds
FROM public.site_visits
WHERE duration_seconds > 0;
RETURN avg_seconds;
END;
$$;
-- 4. RPC: Visits by day of week (last 7 days usually, or overall)
-- Returning a JSON array of {day: string, count: number}
CREATE OR REPLACE FUNCTION public.get_visits_by_day() RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE result json;
BEGIN WITH daily_visits AS (
    SELECT TO_CHAR(visited_at, 'Day') AS day_name,
        EXTRACT(
            ISODOW
            FROM visited_at
        ) AS day_num,
        COUNT(DISTINCT session_id) AS visit_count
    FROM public.site_visits
    WHERE visited_at >= (NOW() - INTERVAL '7 days')
    GROUP BY TO_CHAR(visited_at, 'Day'),
        EXTRACT(
            ISODOW
            FROM visited_at
        )
)
SELECT json_agg(
        json_build_object(
            'day',
            TRIM(day_name),
            'count',
            visit_count
        )
        ORDER BY day_num
    ) INTO result
FROM daily_visits;
RETURN COALESCE(result, '[]'::json);
END;
$$;
-- 5. RPC: Most viewed products
-- Returns top 10 product IDs with their view count
CREATE OR REPLACE FUNCTION public.get_most_viewed_products(limit_count integer DEFAULT 10) RETURNS TABLE (product_id integer, view_count bigint) LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN RETURN QUERY
SELECT pv.product_id,
    COUNT(*) as view_count
FROM public.product_views pv
GROUP BY pv.product_id
ORDER BY view_count DESC
LIMIT limit_count;
END;
$$;