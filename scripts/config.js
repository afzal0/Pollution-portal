// Database configuration
const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  },
  heroku: {
    databaseUrl: process.env.DATABASE_URL
  }
};

module.exports = config;
