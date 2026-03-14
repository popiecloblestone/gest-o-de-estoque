ALTER TABLE public.site_visits
ADD COLUMN IF NOT EXISTS user_email text;
CREATE OR REPLACE FUNCTION public.get_visits_by_day() RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE result json;
BEGIN WITH daily_visits AS (
    SELECT TO_CHAR(visited_at, 'Day') AS day_name,
        EXTRACT(
            ISODOW
            FROM visited_at
        ) AS day_num,
        COALESCE(user_email, 'Anônimo') AS visitor_type,
        COUNT(DISTINCT session_id) AS visit_count
    FROM public.site_visits
    WHERE visited_at >= (NOW() - INTERVAL '7 days')
    GROUP BY TO_CHAR(visited_at, 'Day'),
        EXTRACT(
            ISODOW
            FROM visited_at
        ),
        COALESCE(user_email, 'Anônimo')
)
SELECT json_agg(
        json_build_object(
            'day',
            TRIM(day_name),
            'day_num',
            day_num,
            'visitor_type',
            visitor_type,
            'count',
            visit_count
        )
        ORDER BY day_num
    ) INTO result
FROM daily_visits;
RETURN COALESCE(result, '[]'::json);
END;
$$;