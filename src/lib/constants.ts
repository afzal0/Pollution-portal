// Design system constants
export const COLORS = {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  secondary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  warning: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#eab308',
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12',
  },
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
}

export const POLLUTANTS = [
  { value: 'SO2', label: 'Sulfur Dioxide (SO₂)', color: '#facc15' },
  { value: 'NO2', label: 'Nitrogen Dioxide (NO₂)', color: '#f87171' },
  { value: 'CO', label: 'Carbon Monoxide (CO)', color: '#a3a3a3' },
  { value: 'O3', label: 'Ozone (O₃)', color: '#38bdf8' },
  { value: 'CH4', label: 'Methane (CH₄)', color: '#4ade80' },
  { value: 'HCHO', label: 'Formaldehyde (HCHO)', color: '#c084fc' },
  { value: 'PM2.5', label: 'Fine Particles (PM2.5)', color: '#fb923c' },
  { value: 'PM10', label: 'Coarse Particles (PM10)', color: '#a78bfa' },
]

export const STATES = [
  { value: 'all', label: 'All States' },
  { value: 'New South Wales', label: 'New South Wales' },
  { value: 'Victoria', label: 'Victoria' },
  { value: 'Queensland', label: 'Queensland' },
  { value: 'Western Australia', label: 'Western Australia' },
  { value: 'South Australia', label: 'South Australia' },
  { value: 'Tasmania', label: 'Tasmania' },
  { value: 'Northern Territory', label: 'Northern Territory' },
  { value: 'Australian Capital Territory', label: 'Australian Capital Territory' },
]

export const SA_LEVELS = [
  { value: 'SA2', label: 'SA2 - Statistical Area 2' },
  { value: 'SA3', label: 'SA3 - Statistical Area 3' },
  { value: 'SA4', label: 'SA4 - Statistical Area 4' },
]

export const VIEW_TABS = [
  { id: 'map', label: 'Map View', icon: 'Map' },
  { id: 'data', label: 'Data Table', icon: 'Table' },
  { id: 'timeseries', label: 'Time Series', icon: 'LineChart' },
  { id: 'statistics', label: 'Statistics', icon: 'BarChart3' },
  { id: 'compare', label: 'Compare', icon: 'GitCompare' },
]

export const MAP_STYLES = [
  { value: 'light', label: 'Light', url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json' },
  { value: 'dark', label: 'Dark', url: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json' },
  { value: 'satellite', label: 'Satellite', url: 'https://api.maptiler.com/maps/hybrid/style.json?key=get_your_own_key' },
]

export const COLOR_SCALES = {
  pollution: [
    { value: -2, color: '#2166ac', label: 'Very Low' },
    { value: -1, color: '#4393c3', label: 'Low' },
    { value: 0, color: '#92c5de', label: 'Moderate Low' },
    { value: 0.5, color: '#d1e5f0', label: 'Normal' },
    { value: 1, color: '#f7f7f7', label: 'Baseline' },
    { value: 1.5, color: '#fddbc7', label: 'Moderate High' },
    { value: 2, color: '#f4a582', label: 'High' },
    { value: 3, color: '#d6604d', label: 'Very High' },
    { value: 4, color: '#b2182b', label: 'Extreme' },
  ],
}
