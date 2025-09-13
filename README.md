# Australia Pollution Portal

A comprehensive web application for analyzing and visualizing pollution data across Australia using satellite data from Google Earth Engine and Copernicus.

## 🌟 Features

- **Interactive Map Visualization**: Explore pollution data on an interactive map with multiple visualization modes (points, heatmap, clusters)
- **Multi-Level Geographic Analysis**: Support for SA2, SA3, and SA4 statistical areas
- **Time Series Analysis**: Track pollution trends over time with interactive charts
- **Data Aggregation**: Daily, weekly, monthly, quarterly, yearly, and seasonal data aggregation
- **Statistical Dashboard**: Comprehensive statistics and data analysis tools
- **Data Comparison**: Compare different datasets, pollutants, states, and time periods
- **Export Capabilities**: Download data as CSV and charts as PNG
- **Custom Area Filtering**: Draw polygons, upload shapefiles, or input coordinates for custom analysis areas

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS
- **Maps**: MapLibre GL JS
- **Charts**: Recharts
- **Database**: PostgreSQL with PostGIS
- **Deployment**: Heroku

## 📊 Data Sources

This application uses data from the **Copernicus Programme** (Sentinel satellites and Copernicus Atmosphere Monitoring Service – CAMS), accessed and processed via Google Earth Engine.

**Attribution**: Contains modified Copernicus Sentinel and CAMS data (2025), processed via Google Earth Engine. © European Union, Copernicus Programme.

## 🚀 Getting Started

### Prerequisites

- Node.js 22.x or later
- npm or yarn
- PostgreSQL database with PostGIS extension

### Installation

1. Clone the repository:
```bash
git clone https://github.com/afzal0/Pollution-portal.git
cd Pollution-portal
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your database credentials:
```env
DATABASE_URL=your_postgresql_connection_string
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── pollution/     # Main data API
│   │   ├── pollutants/    # Pollutants list API
│   │   ├── states/        # States list API
│   │   └── date-range/    # Date range API
│   ├── about/             # About page
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── Layout/            # Header, Sidebar
│   ├── Views/             # Map, Table, Charts, Statistics, Compare
│   └── Filters.tsx        # Filter components
└── lib/                   # Utilities and configurations
    ├── constants.ts       # Application constants
    ├── herokuDb.ts        # Database connection
    └── supabaseClient.ts  # Supabase client
```

## 🗄️ Database Schema

The application uses PostgreSQL with the following main tables:

- `pollution_daily`: Daily pollution observations at SA2 level
- `pollution_daily_sa3`: Aggregated data at SA3 level
- `pollution_daily_sa4`: Aggregated data at SA4 level
- `asgs_sa2_2021`, `asgs_sa3_2021`, `asgs_sa4_2021`: Geographic boundaries

## 🔧 API Endpoints

- `GET /api/pollution`: Main data endpoint with filtering and aggregation
- `GET /api/pollutants`: List available pollutants
- `GET /api/states`: List available states
- `GET /api/date-range`: Get min/max dates for selected filters

## 📈 Data Aggregation

The application supports multiple data aggregation levels:

- **Daily**: Raw daily observations
- **Weekly**: Weekly averages using `DATE_TRUNC('week', date)`
- **Monthly**: Monthly averages using `DATE_TRUNC('month', date)`
- **Quarterly**: Quarterly averages using `DATE_TRUNC('quarter', date)`
- **Yearly**: Yearly averages using `DATE_TRUNC('year', date)`
- **Seasonal**: Seasonal averages (Summer, Autumn, Winter, Spring)

## 🎨 Visualization Modes

- **Points**: Individual data points on the map
- **Heatmap**: Density-based visualization
- **Clusters**: Grouped data points for better performance

## 📊 Supported Pollutants

- AER_AI (Aerosol Index)
- AER_LH (Aerosol Layer Height)
- CO (Carbon Monoxide)
- HCHO (Formaldehyde)
- CLOUD (Cloud properties)
- O3_TCL (Ozone Total Column)
- SO2 (Sulfur Dioxide)

## 🚀 Deployment

The application is deployed on Heroku. To deploy:

1. Set up Heroku CLI
2. Create a Heroku app
3. Set environment variables
4. Deploy:
```bash
git push heroku main
```

## 📄 License

This project is licensed under the MIT License. The data used is from the Copernicus Programme under its free and open data policy.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Contact

**Developer**: Afzal Khan
**Email**: fzlkhan0@gmail.com
**GitHub**: [@afzal0](https://github.com/afzal0)

## ⚠️ Important Notes

- This application is designed for research and educational purposes
- Data is provided under the Copernicus free and open data policy
- Commercial use is permitted under the Copernicus licensing terms
- Proper attribution is required when using the data
- The application does not suggest endorsement by the European Union, ESA, ECMWF, or Google

## 🙏 Acknowledgments

- **Copernicus Programme**: For providing the satellite data
- **Google Earth Engine**: For data access and processing capabilities
- **Australian Bureau of Statistics**: For geographic boundary data (ASGS)
- **Open Source Community**: For the various libraries and tools used

---

**Data Attribution**: Contains modified Copernicus Sentinel and CAMS data (2025), processed via Google Earth Engine. © European Union, Copernicus Programme.