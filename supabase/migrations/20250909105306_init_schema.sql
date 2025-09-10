-- Enable PostGIS
create extension if not exists postgis;

-- Pollution daily table (SA2 centroids)
create table if not exists public.pollution_daily (
	id uuid primary key default gen_random_uuid(),
	pollutant text not null,
	date date not null,
	ste_name text not null,
	sa2_code text not null,
	sa2_name text not null,
	centroid_lat double precision not null,
	centroid_lon double precision not null,
	value double precision not null,
	inserted_at timestamp with time zone default now()
);

-- Basic read policy for anon
alter table public.pollution_daily enable row level security;
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_policies
		WHERE schemaname = 'public' AND tablename = 'pollution_daily' AND policyname = 'allow read'
	) THEN
		CREATE POLICY "allow read" ON public.pollution_daily FOR SELECT USING (true);
	END IF;
END $$;

-- Indexes
create index if not exists idx_pollution_daily_date on public.pollution_daily(date);
create index if not exists idx_pollution_daily_ste on public.pollution_daily(ste_name);
create index if not exists idx_pollution_daily_sa2 on public.pollution_daily(sa2_code);
create index if not exists idx_pollution_daily_pollutant on public.pollution_daily(pollutant);

-- Optional geometry for points
alter table public.pollution_daily
	add column if not exists geom geometry(Point, 4326);
update public.pollution_daily
set geom = st_setsrid(st_makepoint(centroid_lon, centroid_lat), 4326)
where geom is null;
create index if not exists idx_pollution_daily_geom on public.pollution_daily using gist (geom);

-- ASGS boundaries (store geometry in WGS84)
create table if not exists public.asgs_sa2_2021 (
	code text primary key,
	name text not null,
	state_name text not null,
	geom geometry(MultiPolygon, 4326) not null
);
create table if not exists public.asgs_sa3_2021 (
	code text primary key,
	name text not null,
	state_name text not null,
	geom geometry(MultiPolygon, 4326) not null
);
create table if not exists public.asgs_sa4_2021 (
	code text primary key,
	name text not null,
	state_name text not null,
	geom geometry(MultiPolygon, 4326) not null
);

alter table public.asgs_sa2_2021 enable row level security;
alter table public.asgs_sa3_2021 enable row level security;
alter table public.asgs_sa4_2021 enable row level security;
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_policies
		WHERE schemaname = 'public' AND tablename = 'asgs_sa2_2021' AND policyname = 'allow read'
	) THEN
		CREATE POLICY "allow read" ON public.asgs_sa2_2021 FOR SELECT USING (true);
	END IF;
END $$;
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_policies
		WHERE schemaname = 'public' AND tablename = 'asgs_sa3_2021' AND policyname = 'allow read'
	) THEN
		CREATE POLICY "allow read" ON public.asgs_sa3_2021 FOR SELECT USING (true);
	END IF;
END $$;
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_policies
		WHERE schemaname = 'public' AND tablename = 'asgs_sa4_2021' AND policyname = 'allow read'
	) THEN
		CREATE POLICY "allow read" ON public.asgs_sa4_2021 FOR SELECT USING (true);
	END IF;
END $$;

-- Helper mapping SA2->SA3/SA4 (can be materialized from ABS correspondences)
create or replace view public.sa2_to_sa3 as
select s2.code as sa2_code, s2.name as sa2_name, s2.state_name,
	   s3.code as sa3_code, s3.name as sa3_name,
	   s4.code as sa4_code, s4.name as sa4_name
from public.asgs_sa2_2021 s2
join public.asgs_sa3_2021 s3 on st_intersects(s2.geom, s3.geom)
join public.asgs_sa4_2021 s4 on st_intersects(s2.geom, s4.geom);

-- Aggregated views (daily means by region)
create or replace view public.pollution_daily_sa2 as
select pollutant, date, ste_name, sa2_code, sa2_name,
	avg(value) as value
from public.pollution_daily
group by pollutant, date, ste_name, sa2_code, sa2_name;

create or replace view public.pollution_daily_sa3 as
select p.pollutant, p.date, p.ste_name, m.sa3_code, m.sa3_name,
	avg(p.value) as value
from public.pollution_daily p
join public.sa2_to_sa3 m on m.sa2_code = p.sa2_code
group by p.pollutant, p.date, p.ste_name, m.sa3_code, m.sa3_name;

create or replace view public.pollution_daily_sa4 as
select p.pollutant, p.date, p.ste_name, m.sa4_code, m.sa4_name,
	avg(p.value) as value
from public.pollution_daily p
join public.sa2_to_sa3 m on m.sa2_code = p.sa2_code
group by p.pollutant, p.date, p.ste_name, m.sa4_code, m.sa4_name;
