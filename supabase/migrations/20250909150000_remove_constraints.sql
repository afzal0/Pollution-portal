-- Remove constraints to allow null values and empty data
-- Make date column nullable
ALTER TABLE public.pollution_daily ALTER COLUMN date DROP NOT NULL;

-- Make other columns nullable
ALTER TABLE public.pollution_daily ALTER COLUMN ste_name DROP NOT NULL;
ALTER TABLE public.pollution_daily ALTER COLUMN sa2_code DROP NOT NULL;
ALTER TABLE public.pollution_daily ALTER COLUMN sa2_name DROP NOT NULL;
ALTER TABLE public.pollution_daily ALTER COLUMN value DROP NOT NULL;
ALTER TABLE public.pollution_daily ALTER COLUMN pollutant DROP NOT NULL;

-- Make centroid columns nullable
ALTER TABLE public.pollution_daily ALTER COLUMN centroid_lat DROP NOT NULL;
ALTER TABLE public.pollution_daily ALTER COLUMN centroid_lon DROP NOT NULL;
