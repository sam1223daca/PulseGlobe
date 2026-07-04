import Globe from 'https://esm.sh/globe.gl';
import * as THREE from 'https://esm.sh/three';

// Execute initialization immediately since module scripts run after DOM is parsed
  // --- APPLICATION STATE ---
  const state = {
    globe: null,
    isSpinning: true,
    audioEnabled: false,
    audioContext: null,
    activeTheme: 'satellite', // 'satellite', 'terrain', or 'night'
    selectedGeo: {
      lat: null,
      lng: null,
      local: '',
      state: '',
      country: '',
      countryCode: ''
    },
    activeScope: 'local', // 'local', 'state', 'country'
    hotspots: [],
    markers: [],
    customMarker: null,
    searchTimeout: null,
    currentFilter: 'all' // 'all', 'danger', 'warning', 'general'
  };

  // --- INITIAL HOTSPOTS SEED DATA ---
  const initialHotspots = [
    { id: 'hs-1', name: 'Reykjavik', region: 'Iceland', lat: 64.1466, lng: -21.9426, type: 'danger', title: 'Volcanic Fissure Eruption', snippet: 'New volcanic fissure opens on Reykjanes Peninsula, prompting emergency alerts and evacuation coordinates.' },
    { id: 'hs-2', name: 'Kyiv', region: 'Ukraine', lat: 50.4501, lng: 30.5234, type: 'danger', title: 'Air Alert Sounded', snippet: 'Emergency alarms activate across several regions following reports of drone and rocket detections.' },
    { id: 'hs-3', name: 'Manila', region: 'Philippines', lat: 14.5995, lng: 120.9842, type: 'danger', title: 'Category 4 Typhoon Warning', snippet: 'Typhoon approaching coastal regions. Red alert warnings issued for evacuation zones.' },
    { id: 'hs-4', name: 'Goma', region: 'DR Congo', lat: -1.6585, lng: 29.2205, type: 'danger', title: 'Nyiragongo Tremor Activity', snippet: 'Seismologists report a surge in volcanic tremors. Local authorities warn of potential lava flows.' },
    { id: 'hs-5', name: 'Tokyo', region: 'Japan', lat: 35.6762, lng: 139.6503, type: 'general', title: 'Autonomous AI Lab Unveiled', snippet: 'Leading tech firm reveals automated research complex for quantum material designs.' },
    { id: 'hs-6', name: 'New Delhi', region: 'India', lat: 28.6139, lng: 77.2090, type: 'warning', title: 'Heavy Monsoon Storm Flooding', snippet: 'Intense rain event swamps major city roads. Commuters advised to follow emergency routes.' },
    { id: 'hs-7', name: 'New York City', region: 'USA', lat: 40.7128, lng: -74.0060, type: 'general', title: 'UN Summit on Carbon Cap', snippet: 'Global delegates agree on binding timelines for industrial emissions reductions.' },
    { id: 'hs-8', name: 'Sydney', region: 'Australia', lat: -33.8688, lng: 151.2093, type: 'general', title: 'Reef Recovery Reports Positive', snippet: 'Marine biologists log significant coral growth rate increases in northern sectors.' },
    { id: 'hs-9', name: 'London', region: 'UK', lat: 51.5074, lng: -0.1278, type: 'warning', title: 'Grid Overload Advisory', snippet: 'Energy operators warn of peak usage strain. Short-term grid reduction measures deployed.' },
    { id: 'hs-10', name: 'Rio de Janeiro', region: 'Brazil', lat: -22.9068, lng: -43.1729, type: 'warning', title: 'Heatwave Health Warnings', snippet: 'City health departments open cooling shelters as local index breaks high records.' },
    { id: 'hs-11', name: 'Cape Town', region: 'South Africa', lat: -33.9249, lng: 18.4241, type: 'general', title: 'Desalination Facility Opens', snippet: 'New facility begins supplying fresh water to the metropolitan grid, increasing drought resilience.' },
    { id: 'hs-12', name: 'Anchorage', region: 'Alaska, USA', lat: 61.2181, lng: -149.9003, type: 'warning', title: 'Magnitude 6.2 Off-coast Tremor', snippet: 'Earthquake recorded near Aleutians. No immediate tsunami hazard generated.' },
    { id: 'hs-13', name: 'Geneva', region: 'Switzerland', lat: 46.2044, lng: 6.1432, type: 'general', title: 'Pandemic Accord Finalized', snippet: 'World Health Assembly completes ratification on collaborative virus warning rules.' },
    { id: 'hs-14', name: 'Cairo', region: 'Egypt', lat: 30.0444, lng: 31.2357, type: 'general', title: 'New Sphinx Corridor Decoded', snippet: 'Archaeologists map previously unknown cavern system containing ancient seals.' },
    { id: 'hs-15', name: 'Mumbai', region: 'India', lat: 19.0760, lng: 72.8777, type: 'general', title: 'Tech Index Breaks Record', snippet: 'Domestic tech shares rise to historical peaks driven by digital exports.' },
    { id: 'hs-16', name: 'Paris', region: 'France', lat: 48.8566, lng: 2.3522, type: 'warning', title: 'Airport Security Transit Delays', snippet: 'Digital border check outages cause long traveler lines. Fix currently deploying.' },
    { id: 'hs-17', name: 'Beijing', region: 'China', lat: 39.9042, lng: 116.4074, type: 'general', title: 'Moon Rover Transmits Data', snippet: 'Lunar scanner sends high-res images showing composition of deep craters.' },
    { id: 'hs-18', name: 'Melbourne', region: 'Australia', lat: -37.8136, lng: 144.9631, type: 'general', title: 'Hydrogen Transit Trial Success', snippet: 'Public fleet wraps up six-month trial running fully on green hydrogen cells.' },
    { id: 'hs-19', name: 'San Francisco', region: 'USA', lat: 37.7749, lng: -122.4194, type: 'general', title: 'Quantum Compute Trial Public', snippet: 'Tech lab opens cloud access to their 120-qubit processor for developer testings.' },
    { id: 'hs-20', name: 'Panama City', region: 'Panama', lat: 8.9824, lng: -79.5199, type: 'warning', title: 'Canal Draft Limits Slashed', snippet: 'Prolonged dry spells force canal managers to restrict maximum freighter cargo loads.' }
  ];

  // Danger/Warning Keywords for sentiment classification
  const dangerKeywords = ["fire", "danger", "disaster", "emergency", "crisis", "blast", "clash", "war", "conflict", "kill", "death", "alert", "outbreak", "wildfire", "earthquake", "flood", "cyclone", "typhoon", "eruption", "explosion", "shoot", "attack", "casualty", "casualties", "terror", "accident", "crash", "emergency", "evacuation"];
  const warningKeywords = ["warning", "alert", "threat", "storm", "heatwave", "strike", "protest", "outage", "spill", "shutdown", "ban", "advisory", "investigate", "delay", "arrest", "quake", "monsoon", "volcano", "suspend", "tension", "tsunami", "landslide"];

  // Initialize Hotspots Data
  state.hotspots = [...initialHotspots];

  // --- DYNAMIC GEOGRAPHIC LABELS ---
  const labelDataset = [
    // Countries (comprehensive global coverage)
    { lat: 20.5937, lng: 78.9629, name: 'India', type: 'country' },
    { lat: 37.0902, lng: -95.7129, name: 'United States', type: 'country' },
    { lat: 35.8617, lng: 104.1954, name: 'China', type: 'country' },
    { lat: 61.5240, lng: 105.3188, name: 'Russia', type: 'country' },
    { lat: -14.2350, lng: -51.9253, name: 'Brazil', type: 'country' },
    { lat: -25.2744, lng: 133.7751, name: 'Australia', type: 'country' },
    { lat: 56.1304, lng: -106.3468, name: 'Canada', type: 'country' },
    { lat: 55.3781, lng: -3.4360, name: 'United Kingdom', type: 'country' },
    { lat: 51.1657, lng: 10.4515, name: 'Germany', type: 'country' },
    { lat: 46.2276, lng: 2.2137, name: 'France', type: 'country' },
    { lat: 36.2048, lng: 138.2529, name: 'Japan', type: 'country' },
    { lat: -30.5595, lng: 22.9375, name: 'South Africa', type: 'country' },
    { lat: 26.8206, lng: 30.8025, name: 'Egypt', type: 'country' },
    { lat: -38.4161, lng: -63.6167, name: 'Argentina', type: 'country' },
    { lat: 41.8719, lng: 12.5674, name: 'Italy', type: 'country' },
    { lat: 40.4637, lng: -3.7492, name: 'Spain', type: 'country' },
    { lat: 23.6345, lng: -102.5528, name: 'Mexico', type: 'country' },
    { lat: -0.7893, lng: 113.9213, name: 'Indonesia', type: 'country' },
    { lat: 60.4720, lng: 8.4689, name: 'Norway', type: 'country' },
    { lat: -40.9006, lng: 174.8860, name: 'New Zealand', type: 'country' },
    // Africa
    { lat: 9.082, lng: 8.6753, name: 'Nigeria', type: 'country' },
    { lat: -1.2864, lng: 36.8172, name: 'Kenya', type: 'country' },
    { lat: -6.3690, lng: 34.8888, name: 'Tanzania', type: 'country' },
    { lat: 7.9465, lng: -1.0232, name: 'Ghana', type: 'country' },
    { lat: -13.2543, lng: 34.3015, name: 'Malawi', type: 'country' },
    { lat: 28.0339, lng: 1.6596, name: 'Algeria', type: 'country' },
    { lat: 31.7917, lng: -7.0926, name: 'Morocco', type: 'country' },
    { lat: -18.7669, lng: 46.8691, name: 'Madagascar', type: 'country' },
    { lat: 15.4542, lng: 18.7322, name: 'Chad', type: 'country' },
    { lat: 1.3733, lng: 32.2903, name: 'Uganda', type: 'country' },
    // Middle East
    { lat: 23.4241, lng: 53.8478, name: 'UAE', type: 'country' },
    { lat: 23.8859, lng: 45.0792, name: 'Saudi Arabia', type: 'country' },
    { lat: 32.4279, lng: 53.6880, name: 'Iran', type: 'country' },
    { lat: 38.9637, lng: 35.2433, name: 'Turkey', type: 'country' },
    { lat: 33.2232, lng: 43.6793, name: 'Iraq', type: 'country' },
    { lat: 29.3117, lng: 47.4818, name: 'Kuwait', type: 'country' },
    // Southeast & East Asia
    { lat: 35.9078, lng: 127.7669, name: 'South Korea', type: 'country' },
    { lat: 14.0583, lng: 108.2772, name: 'Vietnam', type: 'country' },
    { lat: 15.8700, lng: 100.9925, name: 'Thailand', type: 'country' },
    { lat: 4.2105, lng: 101.9758, name: 'Malaysia', type: 'country' },
    { lat: 12.5657, lng: 104.9910, name: 'Cambodia', type: 'country' },
    { lat: 21.9162, lng: 95.9560, name: 'Myanmar', type: 'country' },
    { lat: 1.3521, lng: 103.8198, name: 'Singapore', type: 'country' },
    { lat: 12.8797, lng: 121.7740, name: 'Philippines', type: 'country' },
    // Central & South Asia
    { lat: 30.3753, lng: 69.3451, name: 'Pakistan', type: 'country' },
    { lat: 23.6850, lng: 90.3563, name: 'Bangladesh', type: 'country' },
    { lat: 28.3949, lng: 84.1240, name: 'Nepal', type: 'country' },
    { lat: 7.8731, lng: 80.7718, name: 'Sri Lanka', type: 'country' },
    { lat: 33.9391, lng: 67.7100, name: 'Afghanistan', type: 'country' },
    { lat: 41.3775, lng: 64.5853, name: 'Uzbekistan', type: 'country' },
    // Europe
    { lat: 52.1326, lng: 5.2913, name: 'Netherlands', type: 'country' },
    { lat: 50.5039, lng: 4.4699, name: 'Belgium', type: 'country' },
    { lat: 46.8182, lng: 8.2275, name: 'Switzerland', type: 'country' },
    { lat: 49.8175, lng: 15.4730, name: 'Czech Republic', type: 'country' },
    { lat: 51.9194, lng: 19.1451, name: 'Poland', type: 'country' },
    { lat: 48.6690, lng: 19.6990, name: 'Slovakia', type: 'country' },
    { lat: 48.3794, lng: 31.1656, name: 'Ukraine', type: 'country' },
    { lat: 39.0742, lng: 21.8243, name: 'Greece', type: 'country' },
    { lat: 59.3293, lng: 18.0686, name: 'Sweden', type: 'country' },
    { lat: 61.9241, lng: 25.7482, name: 'Finland', type: 'country' },
    { lat: 39.3999, lng: -8.2245, name: 'Portugal', type: 'country' },
    { lat: 45.1000, lng: 15.2000, name: 'Croatia', type: 'country' },
    { lat: 47.1625, lng: 19.5033, name: 'Hungary', type: 'country' },
    { lat: 42.7339, lng: 25.4858, name: 'Bulgaria', type: 'country' },
    { lat: 44.4268, lng: 26.1025, name: 'Romania', type: 'country' },
    // Americas
    { lat: -35.6751, lng: -71.5430, name: 'Chile', type: 'country' },
    { lat: 4.5709, lng: -74.2973, name: 'Colombia', type: 'country' },
    { lat: -9.1900, lng: -75.0152, name: 'Peru', type: 'country' },
    { lat: -16.2902, lng: -63.5887, name: 'Bolivia', type: 'country' },
    { lat: -34.9011, lng: -56.1645, name: 'Uruguay', type: 'country' },
    { lat: 10.4806, lng: -66.9036, name: 'Venezuela', type: 'country' },
    { lat: 21.5218, lng: -77.7812, name: 'Cuba', type: 'country' },


    // Indian States & Union Territories
    { lat: 15.9129, lng: 79.7400, name: 'Andhra Pradesh', type: 'state' },
    { lat: 28.2180, lng: 94.7278, name: 'Arunachal Pradesh', type: 'state' },
    { lat: 26.2006, lng: 92.9376, name: 'Assam', type: 'state' },
    { lat: 25.0961, lng: 85.3131, name: 'Bihar', type: 'state' },
    { lat: 21.2787, lng: 81.8661, name: 'Chhattisgarh', type: 'state' },
    { lat: 15.2993, lng: 74.1240, name: 'Goa', type: 'state' },
    { lat: 22.2587, lng: 71.1924, name: 'Gujarat', type: 'state' },
    { lat: 29.0588, lng: 76.0856, name: 'Haryana', type: 'state' },
    { lat: 31.1048, lng: 77.1734, name: 'Himachal Pradesh', type: 'state' },
    { lat: 23.6102, lng: 85.2799, name: 'Jharkhand', type: 'state' },
    { lat: 15.3173, lng: 75.7139, name: 'Karnataka', type: 'state' },
    { lat: 10.8505, lng: 76.2711, name: 'Kerala', type: 'state' },
    { lat: 22.9734, lng: 78.6569, name: 'Madhya Pradesh', type: 'state' },
    { lat: 19.7515, lng: 75.7139, name: 'Maharashtra', type: 'state' },
    { lat: 24.6637, lng: 93.9063, name: 'Manipur', type: 'state' },
    { lat: 25.4670, lng: 91.3662, name: 'Meghalaya', type: 'state' },
    { lat: 23.1645, lng: 92.9376, name: 'Mizoram', type: 'state' },
    { lat: 26.1584, lng: 94.5624, name: 'Nagaland', type: 'state' },
    { lat: 20.9517, lng: 85.0985, name: 'Odisha', type: 'state' },
    { lat: 31.1471, lng: 75.3412, name: 'Punjab', type: 'state' },
    { lat: 27.0238, lng: 74.2179, name: 'Rajasthan', type: 'state' },
    { lat: 27.5330, lng: 88.5122, name: 'Sikkim', type: 'state' },
    { lat: 11.1271, lng: 78.6569, name: 'Tamil Nadu', type: 'state' },
    { lat: 18.1124, lng: 79.0193, name: 'Telangana', type: 'state' },
    { lat: 23.9408, lng: 91.9882, name: 'Tripura', type: 'state' },
    { lat: 26.8467, lng: 80.9462, name: 'Uttar Pradesh', type: 'state' },
    { lat: 30.0668, lng: 79.0193, name: 'Uttarakhand', type: 'state' },
    { lat: 22.9868, lng: 87.8550, name: 'West Bengal', type: 'state' },
    { lat: 33.7782, lng: 76.5762, name: 'Jammu & Kashmir', type: 'state' },
    { lat: 34.1526, lng: 77.5771, name: 'Ladakh', type: 'state' },
    { lat: 28.7041, lng: 77.1025, name: 'Delhi', type: 'state' },
    { lat: 11.9416, lng: 79.8083, name: 'Puducherry', type: 'state' },

    // US States
    { lat: 36.7783, lng: -119.4179, name: 'California', type: 'state' },
    { lat: 31.9686, lng: -99.9018, name: 'Texas', type: 'state' },
    { lat: 42.1657, lng: -74.9481, name: 'New York', type: 'state' },
    { lat: 27.6648, lng: -81.5158, name: 'Florida', type: 'state' },
    { lat: 40.4173, lng: -82.9071, name: 'Ohio', type: 'state' },
    { lat: 40.7736, lng: -89.6501, name: 'Illinois', type: 'state' },
    { lat: 39.8283, lng: -98.5795, name: 'Kansas', type: 'state' },
    { lat: 44.3148, lng: -85.6024, name: 'Michigan', type: 'state' },
    { lat: 35.7596, lng: -79.0193, name: 'North Carolina', type: 'state' },
    { lat: 33.8361, lng: -81.1637, name: 'South Carolina', type: 'state' },
    { lat: 32.3182, lng: -86.9023, name: 'Alabama', type: 'state' },
    { lat: 47.7511, lng: -120.7401, name: 'Washington', type: 'state' },
    { lat: 43.8041, lng: -120.5542, name: 'Oregon', type: 'state' },
    { lat: 39.3210, lng: -111.0937, name: 'Utah', type: 'state' },
    { lat: 34.0489, lng: -111.0937, name: 'Arizona', type: 'state' },
    { lat: 39.5501, lng: -105.7821, name: 'Colorado', type: 'state' },
    { lat: 38.5266, lng: -96.7265, name: 'Missouri', type: 'state' },
    { lat: 37.4316, lng: -78.6569, name: 'Virginia', type: 'state' },
    { lat: 33.0406, lng: -89.4187, name: 'Mississippi', type: 'state' },
    { lat: 64.2008, lng: -152.4937, name: 'Alaska', type: 'state' },

    // China Provinces
    { lat: 30.5723, lng: 104.0665, name: 'Sichuan', type: 'state' },
    { lat: 23.1291, lng: 113.2644, name: 'Guangdong', type: 'state' },
    { lat: 30.2741, lng: 120.1551, name: 'Zhejiang', type: 'state' },
    { lat: 32.0603, lng: 118.7969, name: 'Jiangsu', type: 'state' },
    { lat: 36.0611, lng: 103.8343, name: 'Gansu', type: 'state' },
    { lat: 27.6104, lng: 111.7088, name: 'Hunan', type: 'state' },
    { lat: 30.5928, lng: 114.3055, name: 'Hubei', type: 'state' },
    { lat: 36.6753, lng: 117.0009, name: 'Shandong', type: 'state' },
    { lat: 38.0428, lng: 114.5149, name: 'Hebei', type: 'state' },
    { lat: 34.2634, lng: 108.9398, name: 'Shaanxi', type: 'state' },
    { lat: 43.8826, lng: 126.5497, name: 'Jilin', type: 'state' },
    { lat: 26.8154, lng: 106.7108, name: 'Guizhou', type: 'state' },
    { lat: 24.4753, lng: 118.0894, name: 'Fujian', type: 'state' },
    { lat: 28.2282, lng: 117.0264, name: 'Jiangxi', type: 'state' },
    { lat: 41.8357, lng: 123.4315, name: 'Liaoning', type: 'state' },
    { lat: 46.8625, lng: 125.3435, name: 'Heilongjiang', type: 'state' },
    { lat: 25.0388, lng: 102.7183, name: 'Yunnan', type: 'state' },
    { lat: 37.5777, lng: 112.2922, name: 'Shanxi', type: 'state' },
    { lat: 33.7500, lng: 113.6500, name: 'Henan', type: 'state' },
    { lat: 40.8175, lng: 111.7656, name: 'Inner Mongolia', type: 'state' },
    { lat: 31.8200, lng: 86.6945, name: 'Tibet', type: 'state' },
    { lat: 41.7485, lng: 84.7658, name: 'Xinjiang', type: 'state' },
    { lat: 22.8152, lng: 108.3275, name: 'Guangxi', type: 'state' },

    // Russia Federal Districts / Major Regions
    { lat: 59.9311, lng: 30.3609, name: 'St. Petersburg', type: 'state' },
    { lat: 55.0084, lng: 82.9357, name: 'Novosibirsk Oblast', type: 'state' },
    { lat: 56.8519, lng: 60.6122, name: 'Sverdlovsk Oblast', type: 'state' },
    { lat: 54.7388, lng: 55.9721, name: 'Bashkortostan', type: 'state' },
    { lat: 55.7963, lng: 49.1082, name: 'Tatarstan', type: 'state' },
    { lat: 45.0355, lng: 38.9753, name: 'Krasnodar Krai', type: 'state' },
    { lat: 52.2868, lng: 104.3050, name: 'Irkutsk Oblast', type: 'state' },
    { lat: 62.0275, lng: 129.7320, name: 'Sakha (Yakutia)', type: 'state' },
    { lat: 48.7080, lng: 44.5133, name: 'Volgograd Oblast', type: 'state' },
    { lat: 43.0248, lng: 44.6820, name: 'North Caucasus', type: 'state' },
    { lat: 53.2001, lng: 50.1500, name: 'Samara Oblast', type: 'state' },
    { lat: 56.3269, lng: 44.0065, name: 'Nizhny Novgorod', type: 'state' },
    { lat: 69.3535, lng: 88.1892, name: 'Krasnoyarsk Krai', type: 'state' },
    { lat: 47.2357, lng: 39.7015, name: 'Rostov Oblast', type: 'state' },
    { lat: 51.6683, lng: 39.2100, name: 'Voronezh Oblast', type: 'state' },

    // Japan Prefectures
    { lat: 34.6937, lng: 135.5023, name: 'Osaka', type: 'state' },
    { lat: 43.0642, lng: 141.3469, name: 'Hokkaido', type: 'state' },
    { lat: 35.1815, lng: 136.9066, name: 'Aichi', type: 'state' },
    { lat: 33.5902, lng: 130.4017, name: 'Fukuoka', type: 'state' },
    { lat: 34.3853, lng: 132.4553, name: 'Hiroshima', type: 'state' },
    { lat: 38.2688, lng: 140.8721, name: 'Miyagi', type: 'state' },
    { lat: 31.5602, lng: 130.5571, name: 'Kagoshima', type: 'state' },

    // Brazil States
    { lat: -23.5505, lng: -46.6333, name: 'São Paulo', type: 'state' },
    { lat: -22.9068, lng: -43.1729, name: 'Rio de Janeiro', type: 'state' },
    { lat: -19.9167, lng: -43.9345, name: 'Minas Gerais', type: 'state' },
    { lat: -12.9714, lng: -38.5124, name: 'Bahia', type: 'state' },
    { lat: -15.8267, lng: -47.9218, name: 'Distrito Federal', type: 'state' },
    { lat: -3.7172, lng: -38.5433, name: 'Ceará', type: 'state' },
    { lat: -8.0476, lng: -34.8770, name: 'Pernambuco', type: 'state' },
    { lat: -3.1190, lng: -60.0217, name: 'Amazonas', type: 'state' },
    { lat: -25.4284, lng: -49.2733, name: 'Paraná', type: 'state' },
    { lat: -30.0346, lng: -51.2177, name: 'Rio Grande do Sul', type: 'state' },

    // Australia States
    { lat: -31.2532, lng: 146.9211, name: 'New South Wales', type: 'state' },
    { lat: -37.0201, lng: 144.9646, name: 'Victoria', type: 'state' },
    { lat: -22.5752, lng: 144.0848, name: 'Queensland', type: 'state' },
    { lat: -31.9505, lng: 115.8605, name: 'Western Australia', type: 'state' },
    { lat: -30.0002, lng: 136.2092, name: 'South Australia', type: 'state' },
    { lat: -42.0409, lng: 146.8087, name: 'Tasmania', type: 'state' },
    { lat: -19.4914, lng: 132.5510, name: 'Northern Territory', type: 'state' },

    // Canada Provinces
    { lat: 51.2538, lng: -85.3232, name: 'Ontario', type: 'state' },
    { lat: 53.9333, lng: -73.5496, name: 'Quebec', type: 'state' },
    { lat: 53.9171, lng: -122.7497, name: 'British Columbia', type: 'state' },
    { lat: 53.2063, lng: -113.7469, name: 'Alberta', type: 'state' },
    { lat: 52.9399, lng: -106.4509, name: 'Saskatchewan', type: 'state' },
    { lat: 53.7609, lng: -98.8139, name: 'Manitoba', type: 'state' },
    { lat: 45.9636, lng: -66.6431, name: 'New Brunswick', type: 'state' },

    // Pakistan Provinces
    { lat: 30.3753, lng: 66.4583, name: 'Balochistan', type: 'state' },
    { lat: 27.6995, lng: 68.8228, name: 'Sindh', type: 'state' },
    { lat: 31.1704, lng: 72.7097, name: 'Punjab (PK)', type: 'state' },
    { lat: 34.9526, lng: 72.3311, name: 'Khyber Pakhtunkhwa', type: 'state' },

    // Mexico States
    { lat: 19.4326, lng: -99.1332, name: 'CDMX', type: 'state' },
    { lat: 20.9674, lng: -89.5926, name: 'Yucatán', type: 'state' },
    { lat: 24.1426, lng: -110.3128, name: 'Baja California Sur', type: 'state' },
    { lat: 20.6597, lng: -103.3496, name: 'Jalisco', type: 'state' },
    { lat: 25.5922, lng: -100.0000, name: 'Nuevo León', type: 'state' },

    // South Korea Provinces
    { lat: 35.1796, lng: 129.0756, name: 'Busan', type: 'state' },
    { lat: 35.8714, lng: 128.6014, name: 'Gyeongsang', type: 'state' },
    { lat: 37.4138, lng: 127.5183, name: 'Gyeonggi', type: 'state' },
    { lat: 35.1595, lng: 126.8526, name: 'Jeolla', type: 'state' },

    // Germany States
    { lat: 48.7904, lng: 11.4975, name: 'Bavaria', type: 'state' },
    { lat: 51.9607, lng: 7.6261, name: 'North Rhine-Westphalia', type: 'state' },
    { lat: 48.6616, lng: 9.3501, name: 'Baden-Württemberg', type: 'state' },
    { lat: 52.1326, lng: 10.2280, name: 'Lower Saxony', type: 'state' },

    // France Regions
    { lat: 48.8499, lng: 2.6370, name: 'Île-de-France', type: 'state' },
    { lat: 43.6047, lng: 1.4442, name: 'Occitanie', type: 'state' },
    { lat: 45.7640, lng: 4.8357, name: 'Auvergne-Rhône-Alpes', type: 'state' },
    { lat: 47.2184, lng: -1.5536, name: 'Pays de la Loire', type: 'state' },

    // UK Regions
    { lat: 52.4862, lng: -1.8904, name: 'West Midlands', type: 'state' },
    { lat: 53.4808, lng: -2.2426, name: 'Greater Manchester', type: 'state' },
    { lat: 55.9533, lng: -3.1883, name: 'Scotland', type: 'state' },
    { lat: 51.4816, lng: -3.1791, name: 'Wales', type: 'state' },

    // Turkey Regions
    { lat: 39.9334, lng: 32.8597, name: 'Central Anatolia', type: 'state' },
    { lat: 37.0000, lng: 35.3213, name: 'Mediterranean', type: 'state' },
    { lat: 40.1828, lng: 29.0665, name: 'Marmara', type: 'state' },
    { lat: 39.7477, lng: 37.0179, name: 'Eastern Anatolia', type: 'state' },

    // Indonesia Provinces
    { lat: -6.2088, lng: 106.8456, name: 'Jakarta', type: 'state' },
    { lat: -7.1500, lng: 110.4200, name: 'Central Java', type: 'state' },
    { lat: -7.2504, lng: 112.7688, name: 'East Java', type: 'state' },
    { lat: -8.4095, lng: 115.1889, name: 'Bali', type: 'state' },
    { lat: 3.5952, lng: 98.6722, name: 'North Sumatra', type: 'state' },
    { lat: -0.0263, lng: 109.3425, name: 'West Kalimantan', type: 'state' },

    // Saudi Arabia Regions
    { lat: 24.7136, lng: 46.6753, name: 'Riyadh Region', type: 'state' },
    { lat: 21.3891, lng: 39.8579, name: 'Makkah Region', type: 'state' },
    { lat: 26.4207, lng: 50.0888, name: 'Eastern Province', type: 'state' },

    // South Africa Provinces
    { lat: -26.2041, lng: 28.0473, name: 'Gauteng', type: 'state' },
    { lat: -33.9249, lng: 18.4241, name: 'Western Cape', type: 'state' },
    { lat: -29.8587, lng: 31.0218, name: 'KwaZulu-Natal', type: 'state' },

    // Nigeria States
    { lat: 6.5244, lng: 3.3792, name: 'Lagos', type: 'state' },
    { lat: 12.0022, lng: 8.5920, name: 'Kano', type: 'state' },
    { lat: 9.0579, lng: 7.4951, name: 'Abuja FCT', type: 'state' },

    // ============ WORLD CITIES ============
    // Indian Cities
    { lat: 19.0760, lng: 72.8777, name: 'Mumbai', type: 'city' },
    { lat: 22.5726, lng: 88.3639, name: 'Kolkata', type: 'city' },
    { lat: 28.6139, lng: 77.2090, name: 'New Delhi', type: 'city' },
    { lat: 12.9716, lng: 77.5946, name: 'Bengaluru', type: 'city' },
    { lat: 13.0827, lng: 80.2707, name: 'Chennai', type: 'city' },
    { lat: 17.3850, lng: 78.4867, name: 'Hyderabad', type: 'city' },
    { lat: 18.5204, lng: 73.8567, name: 'Pune', type: 'city' },
    { lat: 23.0225, lng: 72.5714, name: 'Ahmedabad', type: 'city' },
    { lat: 26.9124, lng: 75.7873, name: 'Jaipur', type: 'city' },
    { lat: 25.5941, lng: 85.1376, name: 'Patna', type: 'city' },
    { lat: 23.2599, lng: 77.4126, name: 'Bhopal', type: 'city' },
    { lat: 34.0837, lng: 74.7973, name: 'Srinagar', type: 'city' },
    { lat: 26.1158, lng: 91.7086, name: 'Guwahati', type: 'city' },
    { lat: 9.9312, lng: 76.2673, name: 'Kochi', type: 'city' },
    { lat: 20.2961, lng: 85.8245, name: 'Bhubaneswar', type: 'city' },
    { lat: 17.6868, lng: 83.2185, name: 'Visakhapatnam', type: 'city' },
    { lat: 30.7333, lng: 76.7794, name: 'Chandigarh', type: 'city' },
    { lat: 30.3165, lng: 78.0322, name: 'Dehradun', type: 'city' },
    { lat: 23.3441, lng: 85.3096, name: 'Ranchi', type: 'city' },
    { lat: 21.2514, lng: 81.6296, name: 'Raipur', type: 'city' },
    { lat: 15.4909, lng: 73.8278, name: 'Panaji', type: 'city' },
    { lat: 8.5241, lng: 76.9366, name: 'Thiruvananthapuram', type: 'city' },

    // Americas Cities
    { lat: 40.7128, lng: -74.0060, name: 'New York City', type: 'city' },
    { lat: 34.0522, lng: -118.2437, name: 'Los Angeles', type: 'city' },
    { lat: 41.8781, lng: -87.6298, name: 'Chicago', type: 'city' },
    { lat: 37.7749, lng: -122.4194, name: 'San Francisco', type: 'city' },
    { lat: 29.7604, lng: -95.3698, name: 'Houston', type: 'city' },
    { lat: 25.7617, lng: -80.1918, name: 'Miami', type: 'city' },
    { lat: 47.6062, lng: -122.3321, name: 'Seattle', type: 'city' },
    { lat: 43.6532, lng: -79.3832, name: 'Toronto', type: 'city' },
    { lat: 49.2827, lng: -123.1207, name: 'Vancouver', type: 'city' },
    { lat: -23.5505, lng: -46.6333, name: 'São Paulo', type: 'city' },
    { lat: -34.6037, lng: -58.3816, name: 'Buenos Aires', type: 'city' },
    { lat: 4.7110, lng: -74.0721, name: 'Bogotá', type: 'city' },
    { lat: -12.0464, lng: -77.0428, name: 'Lima', type: 'city' },
    { lat: -33.4489, lng: -70.6693, name: 'Santiago', type: 'city' },
    { lat: 19.4326, lng: -99.1332, name: 'Mexico City', type: 'city' },

    // Europe Cities
    { lat: 51.5074, lng: -0.1278, name: 'London', type: 'city' },
    { lat: 48.8566, lng: 2.3522, name: 'Paris', type: 'city' },
    { lat: 52.5200, lng: 13.4050, name: 'Berlin', type: 'city' },
    { lat: 41.9028, lng: 12.4964, name: 'Rome', type: 'city' },
    { lat: 40.4168, lng: -3.7038, name: 'Madrid', type: 'city' },
    { lat: 52.3676, lng: 4.9041, name: 'Amsterdam', type: 'city' },
    { lat: 50.0755, lng: 14.4378, name: 'Prague', type: 'city' },
    { lat: 47.4979, lng: 19.0402, name: 'Budapest', type: 'city' },
    { lat: 52.2297, lng: 21.0122, name: 'Warsaw', type: 'city' },
    { lat: 50.4501, lng: 30.5234, name: 'Kyiv', type: 'city' },
    { lat: 59.9343, lng: 30.3351, name: 'St. Petersburg', type: 'city' },
    { lat: 55.7558, lng: 37.6173, name: 'Moscow', type: 'city' },
    { lat: 41.0082, lng: 28.9784, name: 'Istanbul', type: 'city' },
    { lat: 59.3293, lng: 18.0686, name: 'Stockholm', type: 'city' },
    { lat: 60.1699, lng: 24.9384, name: 'Helsinki', type: 'city' },
    { lat: 38.7223, lng: -9.1393, name: 'Lisbon', type: 'city' },

    // Asia Cities
    { lat: 35.6762, lng: 139.6503, name: 'Tokyo', type: 'city' },
    { lat: 39.9042, lng: 116.4074, name: 'Beijing', type: 'city' },
    { lat: 31.2304, lng: 121.4737, name: 'Shanghai', type: 'city' },
    { lat: 22.3193, lng: 114.1694, name: 'Hong Kong', type: 'city' },
    { lat: 37.5665, lng: 126.9780, name: 'Seoul', type: 'city' },
    { lat: 13.7563, lng: 100.5018, name: 'Bangkok', type: 'city' },
    { lat: 1.3521, lng: 103.8198, name: 'Singapore', type: 'city' },
    { lat: 3.1390, lng: 101.6869, name: 'Kuala Lumpur', type: 'city' },
    { lat: 14.5995, lng: 120.9842, name: 'Manila', type: 'city' },
    { lat: 21.0285, lng: 105.8542, name: 'Hanoi', type: 'city' },
    { lat: 16.8661, lng: 96.1951, name: 'Yangon', type: 'city' },
    { lat: 24.8607, lng: 67.0011, name: 'Karachi', type: 'city' },
    { lat: 31.5204, lng: 74.3587, name: 'Lahore', type: 'city' },
    { lat: 23.8103, lng: 90.4125, name: 'Dhaka', type: 'city' },
    { lat: 27.7172, lng: 85.3240, name: 'Kathmandu', type: 'city' },
    { lat: 25.2048, lng: 55.2708, name: 'Dubai', type: 'city' },
    { lat: 24.4539, lng: 54.3773, name: 'Abu Dhabi', type: 'city' },
    { lat: 21.4225, lng: 39.8262, name: 'Mecca', type: 'city' },
    { lat: 34.6937, lng: 135.5023, name: 'Osaka', type: 'city' },
    { lat: 22.5431, lng: 114.0579, name: 'Shenzhen', type: 'city' },
    { lat: 30.5728, lng: 104.0668, name: 'Chengdu', type: 'city' },
    { lat: 23.1291, lng: 113.2644, name: 'Guangzhou', type: 'city' },
    { lat: 34.3416, lng: 108.9398, name: "Xi'an", type: 'city' },
    { lat: 29.5630, lng: 106.5516, name: 'Chongqing', type: 'city' },

    // Africa Cities
    { lat: 30.0444, lng: 31.2357, name: 'Cairo', type: 'city' },
    { lat: -33.9249, lng: 18.4241, name: 'Cape Town', type: 'city' },
    { lat: 6.5244, lng: 3.3792, name: 'Lagos', type: 'city' },
    { lat: -1.2921, lng: 36.8219, name: 'Nairobi', type: 'city' },
    { lat: -6.7924, lng: 39.2083, name: 'Dar es Salaam', type: 'city' },
    { lat: 5.6037, lng: -0.1870, name: 'Accra', type: 'city' },
    { lat: 33.5731, lng: -7.5898, name: 'Casablanca', type: 'city' },
    { lat: 36.8065, lng: 10.1815, name: 'Tunis', type: 'city' },
    { lat: 9.0192, lng: 38.7525, name: 'Addis Ababa', type: 'city' },
    { lat: -26.2041, lng: 28.0473, name: 'Johannesburg', type: 'city' },

    // Oceania Cities
    { lat: -33.8688, lng: 151.2093, name: 'Sydney', type: 'city' },
    { lat: -37.8136, lng: 144.9631, name: 'Melbourne', type: 'city' },
    { lat: -27.4698, lng: 153.0251, name: 'Brisbane', type: 'city' },
    { lat: -31.9505, lng: 115.8605, name: 'Perth', type: 'city' },
    { lat: -36.8485, lng: 174.7633, name: 'Auckland', type: 'city' },

    // Middle East Cities
    { lat: 32.0853, lng: 34.7818, name: 'Tel Aviv', type: 'city' },
    { lat: 33.8886, lng: 35.4955, name: 'Beirut', type: 'city' },
    { lat: 33.5138, lng: 36.2765, name: 'Damascus', type: 'city' },
    { lat: 39.9334, lng: 32.8597, name: 'Ankara', type: 'city' },

    // Iceland
    { lat: 64.1466, lng: -21.9426, name: 'Reykjavik', type: 'city' }
  ];

  function updateLabelsByZoom(altitude) {
    let visibleTypes = [];
    if (altitude < 0.8) {
      // Very close: show only city names (like Google Earth street-level)
      visibleTypes = ['city'];
    } else if (altitude < 1.5) {
      // Mid zoom: show states only (hide country names to avoid clutter)
      visibleTypes = ['state'];
    } else {
      // Zoomed out: show only country names
      visibleTypes = ['country'];
    }

    state.visibleLabels = labelDataset.filter(l => visibleTypes.includes(l.type));
    updateGlobeLayers();
  }

  // --- AUDIO LOGIC ---
  const audioElements = {
    click: document.getElementById('audio-click'),
    sonar: document.getElementById('audio-sonar'),
    ambient: document.getElementById('audio-ambient')
  };

  function playSound(type) {
    if (!state.audioEnabled) return;
    try {
      if (type === 'click') {
        audioElements.click.currentTime = 0;
        audioElements.click.volume = 0.35;
        audioElements.click.play();
      } else if (type === 'sonar') {
        audioElements.sonar.currentTime = 0;
        audioElements.sonar.volume = 0.25;
        audioElements.sonar.play();
      } else if (type === 'ambient') {
        audioElements.ambient.volume = 0.08;
        audioElements.ambient.play();
      }
    } catch (e) {
      console.warn("Audio play blocked", e);
    }
  }

  function pauseAmbient() {
    try {
      audioElements.ambient.pause();
    } catch(e) {}
  }

  // --- TWINKLING STARS GENERATION ---
  function initStars() {
    const starLayers = [
      { element: document.getElementById('stars'), count: 120, size: 1.5, speed: '80s' },
      { element: document.getElementById('stars2'), count: 80, size: 2.2, speed: '120s' },
      { element: document.getElementById('stars3'), count: 40, size: 3.0, speed: '180s' }
    ];

    starLayers.forEach(layer => {
      let shadows = [];
      for (let i = 0; i < layer.count; i++) {
        const x = Math.floor(Math.random() * 2000);
        const y = Math.floor(Math.random() * 2000);
        const opacity = (Math.random() * 0.6 + 0.4).toFixed(2);
        shadows.push(`${x}px ${y}px rgba(255, 255, 255, ${opacity})`);
      }
      layer.element.style.boxShadow = shadows.join(', ');
      layer.element.style.width = `${layer.size}px`;
      layer.element.style.height = `${layer.size}px`;
      layer.element.style.borderRadius = '50%';
      
      // Inject keyframe animation dynamically for parallax scrolling
      const animName = `scrollStars-${layer.size.toFixed(1).replace('.', '')}`;
      if (!document.getElementById(animName)) {
        const style = document.createElement('style');
        style.id = animName;
        style.innerHTML = `
          @keyframes ${animName} {
            from { transform: translateY(0px); }
            to { transform: translateY(-2000px); }
          }
          #${layer.element.id} {
            animation: ${animName} ${layer.speed} linear infinite;
          }
        `;
        document.head.appendChild(style);
      }
    });
  }

  // --- SYSTEM TIME ---
  function updateTime() {
    const timeEl = document.getElementById('hud-gmt-time');
    const dateEl = document.getElementById('hud-gmt-date');
    if (!timeEl || !dateEl) return;
    
    const now = new Date();
    
    // Format time as GMT: HH:MM:SS
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');
    timeEl.textContent = `GMT: ${hours}:${minutes}:${seconds}`;
    
    // Format date as DATE: DD MMM YYYY
    const day = String(now.getUTCDate()).padStart(2, '0');
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const month = months[now.getUTCMonth()];
    const year = now.getUTCFullYear();
    dateEl.textContent = `DATE: ${day} ${month} ${year}`;

    // Update Left Events Subpanel
    const serverTimeEl = document.getElementById('info-server-time');
    const tempTimeEl = document.getElementById('info-temp-time');
    if (serverTimeEl) serverTimeEl.textContent = `${hours}:${minutes} UTC`;
    if (tempTimeEl) tempTimeEl.textContent = `${hours}:${minutes} UTC`;
  }
  setInterval(updateTime, 1000);
  updateTime();

  // --- INITIALIZE GLOBE.GL ---
  function initGlobe() {
    const container = document.getElementById('globeViz');
    
    // High-resolution texture URLs with fallback chain
    const HD_EARTH = 'https://eoimages.gsfc.nasa.gov/images/imagerecords/74000/74218/world.200412.3x5400x2700.jpg';
    const FALLBACK_EARTH = '//unpkg.com/three-globe@2.41.12/example/img/earth-blue-marble.jpg';
    const BUMP_MAP = '//unpkg.com/three-globe@2.41.12/example/img/earth-topology.png';
    const WATER_MAP = '//unpkg.com/three-globe@2.41.12/example/img/earth-water.png';

    state.globe = Globe()(container)
      .globeImageUrl(HD_EARTH)
      .bumpImageUrl(BUMP_MAP)
      .backgroundColor('rgba(0,0,0,0)')
      .showAtmosphere(true)
      .atmosphereColor('#4d9cff')
      .atmosphereAltitude(0.22);

    // Fallback: if NASA 8K texture fails to load (CORS), swap to CDN texture
    const testImg = new Image();
    testImg.crossOrigin = 'anonymous';
    testImg.onload = () => console.log('HD Earth texture loaded successfully (' + testImg.width + 'x' + testImg.height + ')');
    testImg.onerror = () => {
      console.warn('HD texture blocked by CORS, falling back to CDN texture');
      state.globe.globeImageUrl(FALLBACK_EARTH);
    };
    testImg.src = HD_EARTH;

    // Enhance globe material for Google Earth-like quality
    const globeMaterial = state.globe.globeMaterial();
    if (globeMaterial) {
      globeMaterial.shininess = 40;
      globeMaterial.bumpScale = 10;
      if (globeMaterial.specular) {
        globeMaterial.specular.set('#446688');
      }
    }

    // Load specular map for realistic ocean reflections
    new THREE.TextureLoader().load(WATER_MAP, waterTexture => {
      globeMaterial.specularMap = waterTexture;
      globeMaterial.needsUpdate = true;
    });

    // Enhance lighting for a more natural, Google Earth-like look
    const scene = state.globe.scene();
    // Add subtle ambient fill light
    const ambientLight = new THREE.AmbientLight(0x334466, 0.6);
    scene.add(ambientLight);
    // Add warm directional sunlight
    const sunLight = new THREE.DirectionalLight(0xfff5e6, 1.2);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    // Initial camera position
    state.globe.pointOfView({ lat: 20, lng: 77, altitude: 2.2 });

    // Enable/Disable auto rotate based on state
    state.globe.controls().autoRotate = state.isSpinning;
    state.globe.controls().autoRotateSpeed = 0.35;
    state.globe.controls().enableDamping = true;
    state.globe.controls().dampingFactor = 0.05;
    state.globe.controls().minDistance = 120;
    state.globe.controls().maxDistance = 800;

    // Handle Globe Click events
    state.globe.onGlobeClick(({ lat, lng }, event) => {
      playSound('click');
      handleGlobeClick(lat, lng);
    });

    // Add Clouds layer with higher polygon count for smoother look
    const CLOUDS_IMG_URL = '//unpkg.com/three-globe@2.41.12/example/img/earth-clouds.png';
    const CLOUDS_ALT = 0.004;
    const CLOUDS_ROTATION_SPEED = -0.006;

    new THREE.TextureLoader().load(CLOUDS_IMG_URL, cloudsTexture => {
      const clouds = new THREE.Mesh(
        new THREE.SphereGeometry(state.globe.getGlobeRadius() * (1 + CLOUDS_ALT), 128, 128),
        new THREE.MeshPhongMaterial({ map: cloudsTexture, transparent: true, opacity: 0.35 })
      );
      state.globe.scene().add(clouds);

      (function rotateClouds() {
        clouds.rotation.y += CLOUDS_ROTATION_SPEED * Math.PI / 180;
        requestAnimationFrame(rotateClouds);
      })();
    });

    // Draw layers
    updateGlobeLayers();

    // Fetch and render country boundary polygons (cleaner borders like Google Earth)
    fetch('https://cdn.jsdelivr.net/npm/three-globe/example/img/ne_110m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(countries => {
        state.globe.polygonsData(countries.features.filter(d => d.properties.ISO_A2 !== 'AQ'))
          .polygonCapColor(() => 'rgba(0, 0, 0, 0)')
          .polygonSideColor(() => 'rgba(0, 0, 0, 0)')
          .polygonStrokeColor(() => 'rgba(255, 255, 255, 0.35)')
          .polygonStrokeWidth(0.8);
      })
      .catch(err => console.error("Error loading boundaries:", err));

    // (WebGL labels removed in favor of crisp HTML labels)
    // Initial label display trigger
    updateLabelsByZoom(2.2);

    // Listen to camera movements to dynamically shift label details (zoom levels)
    state.globe.controls().addEventListener('change', () => {
      const pov = state.globe.pointOfView();
      updateLabelsByZoom(pov.altitude);
    });
  }

  // Update visual markers and ripples on the globe
  function updateGlobeLayers() {
    if (!state.globe) return;

    // Filter hotspots based on current filter state
    const filteredHotspots = state.hotspots.filter(h => {
      if (state.currentFilter === 'all') return true;
      return h.type === state.currentFilter;
    });

    // Add rings data for pulsing ripples on hotspots
    state.globe
      .ringsData(filteredHotspots)
      .ringColor(d => {
        if (d.type === 'danger') return `rgba(255, 71, 87, 0.7)`;
        if (d.type === 'warning') return `rgba(255, 165, 2, 0.7)`;
        return `rgba(84, 160, 255, 0.7)`;
      })
      .ringMaxRadius(3.5)
      .ringPropagationSpeed(2.2)
      .ringRepeatPeriod(2000);

    // Render unified HTML overlays (labels, hotspots, target marker)
    const visibleLabels = state.visibleLabels || [];
    const htmlData = [...filteredHotspots, ...visibleLabels, state.customMarker].filter(Boolean);
    
    state.globe
      .htmlElementsData(htmlData)
      .htmlElement(d => {
        // 1. Custom click target marker
        if (d.isCustomTarget) {
          const el = document.createElement('div');
          el.className = 'globe-marker-container';
          el.innerHTML = `
            <div class="click-target-ring">
              <div class="click-target-dot"></div>
            </div>
          `;
          return el;
        }

        // 2. Geographic text labels (crisp CSS, constant size)
        if (d.type === 'country' || d.type === 'state' || d.type === 'city') {
          const el = document.createElement('div');
          el.className = `geo-label label-${d.type}`;
          if (d.type === 'city') {
            const dot = document.createElement('div');
            dot.className = 'city-dot';
            el.appendChild(dot);
          }
          const textEl = document.createElement('span');
          textEl.textContent = d.name;
          el.appendChild(textEl);
          return el;
        }

        // 3. Hotspot markers
        const markerColor = d.type === 'danger' ? 'var(--color-danger)' : (d.type === 'warning' ? 'var(--color-warning)' : 'var(--color-general)');
        
        const el = document.createElement('div');
        el.className = 'globe-marker-container';
        el.style.color = markerColor;
        el.innerHTML = `
          <div class="pulse-ring" style="border-color: ${markerColor}"></div>
          <div class="marker-dot" style="background-color: ${markerColor}"></div>
          <div class="marker-tooltip">${d.name} (${d.region})<br><strong style="color: ${markerColor}">${d.title}</strong></div>
        `;
        
        // Marker Click event
        el.addEventListener('click', (e) => {
          e.stopPropagation(); // Stop click from propagating to globe backplate
          playSound('sonar');
          flyToLocation(d.lat, d.lng, d.name, d.region, d.type, d.title);
        });

        return el;
      });
  }

  // Fly camera to a selected position, select it, and trigger reverse geocoder
  function flyToLocation(lat, lng, label, region = '', severity = 'general', incidentTitle = '') {
    state.globe.pointOfView({ lat, lng, altitude: 1.6 }, 1400);
    
    // Pause auto-spinning during active selection
    if (state.isSpinning) {
      toggleSpin(false);
    }

    // Set side panel coordinate display
    document.getElementById('coord-lat').textContent = lat.toFixed(4);
    document.getElementById('coord-lng').textContent = lng.toFixed(4);

    // Place a temporary visual "target ring" at the selected point
    // We can do this by using Globe.gl customLayer or HTML marker. Let's append a custom clicked target.
    // If a target ring is already active, remove it.
    removeCustomClickMarker();

    state.customMarker = {
      lat,
      lng,
      isCustomTarget: true
    };

    updateGlobeLayers();

    // Expand the details sidebar panel
    const sidebar = document.getElementById('right-sidebar');
    sidebar.classList.remove('collapsed');

    // Run reverse geocoder query
    reverseGeocode(lat, lng, label, incidentTitle);
  }

  function removeCustomClickMarker() {
    state.customMarker = null;
  }

  // --- REVERSE GEOCODING LOGIC ---
  async function reverseGeocode(lat, lng, fallbackLabel = '', incidentTitle = '') {
    // Show spinner & reset panel text
    setNewsScanStatus('RESOLVING POSITION...');
    showNewsLoader(true);
    document.getElementById('location-name').textContent = fallbackLabel || 'Locating...';
    document.getElementById('location-region').textContent = 'Querying orbital coordinates...';
    document.getElementById('location-flag').textContent = '🌍';

    try {
      // Use OpenStreetMap Nominatim reverse geocode (Free & keyless API)
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=12&addressdetails=1`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'PulseGlobeLiveNewsTracker/1.0 (samarshi@example.com)'
        }
      });
      
      if (!response.ok) throw new Error('Geocode request failed');
      const data = await response.json();
      
      const addr = data.address || {};
      
      // Determine local area name (prioritize town, city, suburb, county)
      const localName = addr.suburb || addr.neighbourhood || addr.city_district || addr.city || addr.town || addr.village || addr.municipality || addr.county || '';
      const stateName = addr.state || addr.region || addr.province || addr.state_district || '';
      const countryName = addr.country || '';
      const countryCode = addr.country_code ? addr.country_code.toLowerCase() : '';

      // Save geocoded address to global state
      state.selectedGeo = {
        lat,
        lng,
        local: localName,
        state: stateName,
        country: countryName,
        countryCode,
        incidentTitle
      };

      // Set titles in UI
      const primaryTitle = localName || stateName || countryName || `Coordinate Point`;
      const secondaryTitle = [stateName, countryName].filter(Boolean).join(', ') || `Lat: ${lat.toFixed(2)}, Lng: ${lng.toFixed(2)}`;
      
      document.getElementById('location-name').textContent = primaryTitle;
      document.getElementById('location-region').textContent = secondaryTitle;
      
      // Set flag emoji
      const flagEmoji = getFlagEmoji(countryCode);
      document.getElementById('location-flag').textContent = flagEmoji || '📍';

      // Load news for geocoded location
      fetchLocationNews();

    } catch (err) {
      console.error("Reverse geocoding error:", err);
      // Fallback if API fails or rate limits
      state.selectedGeo = {
        lat,
        lng,
        local: fallbackLabel || '',
        state: '',
        country: fallbackLabel || 'Selected Coordinate',
        countryCode: '',
        incidentTitle
      };
      
      document.getElementById('location-name').textContent = fallbackLabel || `Coordinate Point`;
      document.getElementById('location-region').textContent = `Lat: ${lat.toFixed(3)}, Lng: ${lng.toFixed(3)}`;
      document.getElementById('location-flag').textContent = '📍';
      
      fetchLocationNews();
    }
  }

  // Convert two letter country code to flag emoji
  function getFlagEmoji(countryCode) {
    if (!countryCode) return '';
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  }

  // --- GOOGLE NEWS RSS FETCHER ---
  async function fetchLocationNews() {
    showNewsLoader(true);
    setNewsScanStatus('SCANNING CHANNELS...');
    
    const geo = state.selectedGeo;
    let query = '';

    // Build the query parameter string based on scope selection
    if (geo.incidentTitle) {
      // If clicking a specific hotspot, use a looser keyword search to maximize matches
      query = `${geo.incidentTitle} ${geo.local || geo.country || ''} news`;
    } else {
      if (state.activeScope === 'local') {
        if (geo.local) {
          query = `"${geo.local}" ${geo.country || ''}`;
        } else if (geo.state) {
          query = `"${geo.state}"`;
        } else {
          query = `"${geo.country}"`;
        }
      } else if (state.activeScope === 'state') {
        if (geo.state) {
          query = `"${geo.state}" ${geo.country || ''}`;
        } else {
          query = `"${geo.country}"`;
        }
      } else { // country scope
        if (geo.country) {
          query = `"${geo.country}"`;
        } else {
          query = 'world';
        }
      }
      // Append "news" suffix to refine Google News matches
      query += ' news';
    }

    // Construct Google News RSS query URL
    const feedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
    
    // Bypass CORS and parse XML instantly using rss2json (much faster than raw proxies)
    const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;

    // Abort fetch if it takes longer than 6 seconds to ensure fast UI response
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(proxyUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error("Proxy retrieval failed");
      const data = await response.json();

      if (data.status === 'ok' && data.items) {
        let finalItems = data.items;
        
        // If clicking a mock hotspot, guarantee it appears at the top of the feed
        // even if Google News found 0 real articles.
        if (geo.incidentTitle) {
          const matchedHotspot = state.hotspots.find(h => h.title === geo.incidentTitle);
          if (matchedHotspot) {
            finalItems.unshift({
              title: `${matchedHotspot.title} - Global Incident Tracker`,
              link: `https://www.google.com/search?q=${encodeURIComponent(matchedHotspot.title + ' ' + matchedHotspot.region + ' news')}`,
              pubDate: new Date().toISOString(),
              description: matchedHotspot.snippet
            });
          }
        }

        renderNewsCards(finalItems);
      } else {
        throw new Error("Proxy retrieval failed");
      }

    } catch (err) {
      console.error("Live news fetch failed or timed out:", err);
      // Fallback to mock
      renderMockNews(query);
    }
  }

  // Render parsed RSS articles into UI card lists
  function renderNewsCards(items) {
    const listContainer = document.getElementById('news-list');
    listContainer.innerHTML = '';
    showNewsLoader(false);

    if (!items || items.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-news-state">
          <i data-lucide="radio-off" class="empty-icon"></i>
          <p>No active news feeds detected in this area scan range.</p>
          <span style="font-size:11px;color:var(--text-muted)">Try selecting the "State" or "Country" tabs above to expand scope.</span>
        </div>
      `;
      lucide.createIcons();
      setNewsScanStatus('ZERO MATCHES', 'warning');
      return;
    }

    // Display maximum 15 articles to avoid layout bloat
    const limit = Math.min(items.length, 15);
    let dangerCount = 0;
    let warningCount = 0;
    
    for (let i = 0; i < limit; i++) {
      const item = items[i];
      
      // Support both JSON objects and DOM XML Elements for flexibility
      let fullTitle, link, pubDate;
      if (item instanceof Element) {
        fullTitle = item.querySelector('title')?.textContent || 'Untitled Broadcast';
        link = item.querySelector('link')?.textContent || '#';
        pubDate = item.querySelector('pubDate')?.textContent || '';
      } else {
        fullTitle = item.title || 'Untitled Broadcast';
        link = item.link || '#';
        pubDate = item.pubDate || '';
      }

      // Separate actual title from source publisher (formatted as "Headline - Source" by Google)
      let title = fullTitle;
      let source = 'Global Feed';
      const separatorIdx = fullTitle.lastIndexOf(' - ');
      if (separatorIdx !== -1) {
        title = fullTitle.substring(0, separatorIdx);
        source = fullTitle.substring(separatorIdx + 3);
      }

      // Format date beautifully
      const formattedDate = parseDateToRelative(pubDate);

      // Classify danger alert level based on keywords in title text
      const severity = classifyNewsSeverity(title);
      if (severity === 'danger') dangerCount++;
      else if (severity === 'warning') warningCount++;

      // Create news link card element
      const card = document.createElement('a');
      card.href = link;
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
      card.className = `cyber-feed-card cyber-card-${severity}`;
      
      const badgeText = severity === 'danger' ? 'RED' : (severity === 'warning' ? 'ORANGE' : 'BLUE');
      
      let svgGraphic = '';
      if (severity === 'danger') {
        svgGraphic = `
          <svg class="threat-svg-icon" viewBox="0 0 50 50">
            <rect x="5" y="5" width="40" height="40" fill="none" stroke="rgba(255, 71, 87, 0.15)" stroke-width="1" />
            <path d="M 25,12 L 38,36 L 12,36 Z" fill="none" stroke="#ff4757" stroke-width="2" />
            <line x1="25" y1="20" x2="25" y2="28" stroke="#ff4757" stroke-width="2" />
            <circle cx="25" cy="32" r="1.5" fill="#ff4757" />
          </svg>
        `;
      } else if (severity === 'warning') {
        svgGraphic = `
          <svg class="threat-svg-icon" viewBox="0 0 50 50">
            <rect x="5" y="5" width="40" height="40" fill="none" stroke="rgba(255, 165, 2, 0.15)" stroke-width="1" />
            <circle cx="25" cy="25" r="13" fill="none" stroke="#ffa502" stroke-width="1.5" stroke-dasharray="2,2" />
            <circle cx="25" cy="25" r="7" fill="none" stroke="#ffa502" stroke-width="1.5" />
            <line x1="25" y1="5" x2="25" y2="45" stroke="rgba(255, 165, 2, 0.25)" stroke-width="1" />
            <line x1="5" y1="25" x2="45" y2="25" stroke="rgba(255, 165, 2, 0.25)" stroke-width="1" />
          </svg>
        `;
      } else {
        svgGraphic = `
          <svg class="threat-svg-icon" viewBox="0 0 50 50">
            <rect x="5" y="5" width="40" height="40" fill="none" stroke="rgba(84, 160, 255, 0.15)" stroke-width="1" />
            <path d="M 10,25 Q 17.5,15 25,25 T 40,25" fill="none" stroke="#54a0ff" stroke-width="1.5" />
            <path d="M 10,30 Q 17.5,20 25,30 T 40,30" fill="none" stroke="#54a0ff" stroke-width="0.8" opacity="0.4" />
            <path d="M 10,20 Q 17.5,10 25,20 T 40,20" fill="none" stroke="#54a0ff" stroke-width="0.8" opacity="0.4" />
          </svg>
        `;
      }

      card.innerHTML = `
        <div class="threat-details">
          <div class="threat-lvl-header">${badgeText}</div>
          <div class="threat-text-title">${title.toUpperCase()}</div>
          <div class="threat-location-row">
            <span class="threat-loc-name">${source.toUpperCase()}</span>
            <span class="threat-time">${formattedDate}</span>
          </div>
        </div>
        <div class="card-graphics">
          ${svgGraphic}
        </div>
      `;

      listContainer.appendChild(card);
    }

    lucide.createIcons();

    // Set overall status based on sentiment ratio
    if (dangerCount > 0) {
      setNewsScanStatus(`${dangerCount} HAZARDS DETECTED`, 'danger');
    } else if (warningCount > 0) {
      setNewsScanStatus(`${warningCount} ADVISORIES LOGGED`, 'warning');
    } else {
      setNewsScanStatus('SCAN CLEAR / SECURE', 'general');
    }
  }

  // Fallback mock generator if Google News fails or CORS blocks
  function renderMockNews(query) {
    const listContainer = document.getElementById('news-list');
    listContainer.innerHTML = '';
    showNewsLoader(false);

    const geo = state.selectedGeo;
    const locationName = geo.local || geo.state || geo.country || 'the region';

    // Array of mock templates to create high-fidelity realistic simulations
    const mocks = [
      {
        title: `Climatic shifts register temperature records in ${locationName} districts`,
        source: 'Global Climate Intel',
        severity: 'warning'
      },
      {
        title: `Infrastructure development projects approved for ${locationName} regional transit grid`,
        source: 'Municipal Press Syndicate',
        severity: 'general'
      },
      {
        title: `Emergency authorities dispatch units following utility line failures in local ${locationName} blocks`,
        source: 'First Responder Network',
        severity: 'danger'
      },
      {
        title: `Cultural heritage exhibitions capture high attendance figures throughout ${locationName}`,
        source: 'Chronicle Arts Journal',
        severity: 'general'
      }
    ];

    mocks.forEach(m => {
      const card = document.createElement('a');
      card.href = `https://www.google.com/search?q=${encodeURIComponent(m.title)}`;
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
      card.className = `cyber-feed-card cyber-card-${m.severity}`;
      
      const badgeText = m.severity === 'danger' ? 'RED' : (m.severity === 'warning' ? 'ORANGE' : 'BLUE');

      let svgGraphic = '';
      if (m.severity === 'danger') {
        svgGraphic = `
          <svg class="threat-svg-icon" viewBox="0 0 50 50">
            <rect x="5" y="5" width="40" height="40" fill="none" stroke="rgba(255, 71, 87, 0.15)" stroke-width="1" />
            <path d="M 25,12 L 38,36 L 12,36 Z" fill="none" stroke="#ff4757" stroke-width="2" />
            <line x1="25" y1="20" x2="25" y2="28" stroke="#ff4757" stroke-width="2" />
            <circle cx="25" cy="32" r="1.5" fill="#ff4757" />
          </svg>
        `;
      } else if (m.severity === 'warning') {
        svgGraphic = `
          <svg class="threat-svg-icon" viewBox="0 0 50 50">
            <rect x="5" y="5" width="40" height="40" fill="none" stroke="rgba(255, 165, 2, 0.15)" stroke-width="1" />
            <circle cx="25" cy="25" r="13" fill="none" stroke="#ffa502" stroke-width="1.5" stroke-dasharray="2,2" />
            <circle cx="25" cy="25" r="7" fill="none" stroke="#ffa502" stroke-width="1.5" />
            <line x1="25" y1="5" x2="25" y2="45" stroke="rgba(255, 165, 2, 0.25)" stroke-width="1" />
            <line x1="5" y1="25" x2="45" y2="25" stroke="rgba(255, 165, 2, 0.25)" stroke-width="1" />
          </svg>
        `;
      } else {
        svgGraphic = `
          <svg class="threat-svg-icon" viewBox="0 0 50 50">
            <rect x="5" y="5" width="40" height="40" fill="none" stroke="rgba(84, 160, 255, 0.15)" stroke-width="1" />
            <path d="M 10,25 Q 17.5,15 25,25 T 40,25" fill="none" stroke="#54a0ff" stroke-width="1.5" />
            <path d="M 10,30 Q 17.5,20 25,30 T 40,30" fill="none" stroke="#54a0ff" stroke-width="0.8" opacity="0.4" />
            <path d="M 10,20 Q 17.5,10 25,20 T 40,20" fill="none" stroke="#54a0ff" stroke-width="0.8" opacity="0.4" />
          </svg>
        `;
      }

      card.innerHTML = `
        <div class="threat-details">
          <div class="threat-lvl-header">${badgeText} (SIMULATED)</div>
          <div class="threat-text-title">${m.title.toUpperCase()}</div>
          <div class="threat-location-row">
            <span class="threat-loc-name">${m.source.toUpperCase()}</span>
            <span class="threat-time">JUST NOW</span>
          </div>
        </div>
        <div class="card-graphics">
          ${svgGraphic}
        </div>
      `;

      listContainer.appendChild(card);
    });

    lucide.createIcons();
    setNewsScanStatus('SIMULATED TELEMETRY', 'warning');
  }

  // Classify news headlines based on list keyword matches
  function classifyNewsSeverity(text) {
    const lower = text.toLowerCase();
    
    // Check danger terms
    const isDanger = dangerKeywords.some(keyword => {
      const regex = new RegExp(`\\b${keyword}s?\\b`, 'i');
      return regex.test(lower);
    });
    if (isDanger) return 'danger';

    // Check warning terms
    const isWarning = warningKeywords.some(keyword => {
      const regex = new RegExp(`\\b${keyword}s?\\b`, 'i');
      return regex.test(lower);
    });
    if (isWarning) return 'warning';

    return 'general';
  }

  // Format date helper: parses standard pubDate to human-readable string
  function parseDateToRelative(pubDateStr) {
    if (!pubDateStr) return 'RECENT';
    try {
      const date = new Date(pubDateStr);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      
      if (diffMins < 60) {
        return diffMins <= 5 ? 'JUST NOW' : `${diffMins} MINS AGO`;
      } else if (diffHours < 24) {
        return `${diffHours} ${diffHours === 1 ? 'HR' : 'HRS'} AGO`;
      } else {
        const options = { month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options).toUpperCase();
      }
    } catch (e) {
      return 'RECENT';
    }
  }

  // --- STATS & TICKER MANAGEMENT ---
  function updateSidebarCounters() {
    let danger = 0;
    let warning = 0;
    let general = 0;

    state.hotspots.forEach(h => {
      if (h.type === 'danger') danger++;
      else if (h.type === 'warning') warning++;
      else general++;
    });

    const dangerEl = document.getElementById('stat-danger');
    const warningEl = document.getElementById('stat-warning');
    const infoEl = document.getElementById('stat-info');

    if (dangerEl) dangerEl.textContent = danger;
    if (warningEl) warningEl.textContent = warning;
    if (infoEl) infoEl.textContent = general;
  }

  function populateHotspotsFeed() {
    const feedContainer = document.getElementById('alerts-feed');

    // Filter based on active overview filter
    const filtered = state.hotspots.filter(h => {
      if (state.currentFilter === 'all') return true;
      return h.type === state.currentFilter;
    });

    // Populate bottom scrolling ticker text with breaking alerts (always do this)
    populateTicker(filtered);

    // If feed container element does not exist in HUD layout, exit gracefully
    if (!feedContainer) return;

    feedContainer.innerHTML = '';

    if (filtered.length === 0) {
      feedContainer.innerHTML = `
        <div style="text-align:center;color:var(--text-muted);font-size:12px;padding:30px 10px;">
          No active feed matches filter criteria.
        </div>
      `;
      return;
    }

    filtered.forEach(h => {
      const item = document.createElement('div');
      item.className = 'feed-item';
      if (state.selectedGeo.lat === h.lat && state.selectedGeo.lng === h.lng) {
        item.classList.add('active-selection');
      }

      item.innerHTML = `
        <div class="feed-indicator-dot ${h.type}"></div>
        <div class="feed-item-texts">
          <div class="feed-item-header">
            <span class="feed-item-title">${h.name}</span>
            <span class="feed-item-time">LIVE</span>
          </div>
          <span class="feed-item-snippet"><strong>${h.title}:</strong> ${h.snippet}</span>
        </div>
      `;

      item.addEventListener('click', () => {
        playSound('sonar');
        // Highlight active feed item visually
        document.querySelectorAll('.feed-item').forEach(el => el.classList.remove('active-selection'));
        item.classList.add('active-selection');
        flyToLocation(h.lat, h.lng, h.name, h.region, h.type, h.title);
      });

      feedContainer.appendChild(item);
    });
  }

  function populateTicker(hotspotList) {
    const tickerScroll = document.getElementById('ticker-scroll');
    tickerScroll.innerHTML = '';

    const list = hotspotList.length > 0 ? hotspotList : state.hotspots;
    
    // Duplicate items to ensure smooth continuous marquee loops
    const elements = [...list, ...list];
    
    elements.forEach(h => {
      const span = document.createElement('span');
      span.innerHTML = `<strong>ALERT [${h.name.toUpperCase()}]:</strong> ${h.title.toUpperCase()} // STATUS: SCANNING NEWSWIRE...`;
      tickerScroll.appendChild(span);
    });
  }

  // --- SEARCH ENGINE INTERNALS ---
  async function executeSearch(query) {
    const resultsPanel = document.getElementById('search-results');
    
    if (!query || query.trim().length < 2) {
      resultsPanel.classList.add('hidden');
      return;
    }

    try {
      // Nominatim Search API
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'PulseGlobeLiveNewsTracker/1.0 (samarshi@example.com)'
        }
      });
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();

      renderSearchResults(data);

    } catch (err) {
      console.error("Search API failure:", err);
    }
  }

  function renderSearchResults(results) {
    const panel = document.getElementById('search-results');
    const clearBtn = document.getElementById('clear-search');
    panel.innerHTML = '';

    if (!results || results.length === 0) {
      panel.innerHTML = `
        <div style="padding:12px;color:var(--text-muted);font-size:12.5px;text-align:center;">
          No coordinate vectors resolved.
        </div>
      `;
      panel.classList.remove('hidden');
      return;
    }

    results.forEach(res => {
      const lat = parseFloat(res.lat);
      const lon = parseFloat(res.lon);
      
      const addr = res.address || {};
      const name = res.display_name.split(',')[0];
      const details = res.display_name.split(',').slice(1).join(',').trim();

      const item = document.createElement('div');
      item.className = 'search-result-item';
      item.innerHTML = `
        <i data-lucide="map-pin" class="result-icon"></i>
        <div class="result-texts">
          <span class="result-name">${name}</span>
          <span class="result-detail">${details}</span>
        </div>
      `;

      item.addEventListener('click', () => {
        playSound('sonar');
        panel.classList.add('hidden');
        clearBtn.classList.remove('hidden');
        document.getElementById('search-input').value = name;
        flyToLocation(lat, lon, name, addr.country || '');
      });

      panel.appendChild(item);
    });

    lucide.createIcons();
    panel.classList.remove('hidden');
  }

  // --- UI STATE MUTATORS ---
  function toggleSpin(forceValue) {
    const btn = document.getElementById('btn-spin');
    state.isSpinning = forceValue !== undefined ? forceValue : !state.isSpinning;
    
    if (state.globe) {
      state.globe.controls().autoRotate = state.isSpinning;
    }

    if (state.isSpinning) {
      btn.classList.add('active');
      btn.innerHTML = `<i data-lucide="refresh-cw" class="animate-spin"></i> Auto Rotate`;
    } else {
      btn.classList.remove('active');
      btn.innerHTML = `<i data-lucide="refresh-cw"></i> Auto Rotate`;
    }
    lucide.createIcons();
  }

  function toggleAudio() {
    const btn = document.getElementById('btn-audio');
    state.audioEnabled = !state.audioEnabled;

    if (state.audioEnabled) {
      btn.classList.add('active');
      btn.innerHTML = `<i data-lucide="volume-2"></i> Audio Active`;
      playSound('ambient');
    } else {
      btn.classList.remove('active');
      btn.innerHTML = `<i data-lucide="volume-x"></i> Audio Mute`;
      pauseAmbient();
    }
    lucide.createIcons();
  }

  function toggleGlobeTheme() {
    const btn = document.getElementById('btn-theme');
    
    if (state.activeTheme === 'satellite') {
      state.activeTheme = 'terrain';
    } else if (state.activeTheme === 'terrain') {
      state.activeTheme = 'night';
    } else {
      state.activeTheme = 'satellite';
    }

    if (!state.globe) return;

    if (state.activeTheme === 'satellite') {
      state.globe.globeImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg');
      state.globe.atmosphereColor('#4d9cff');
      btn.innerHTML = `<i data-lucide="layers"></i> Satellite Map`;
    } else if (state.activeTheme === 'terrain') {
      state.globe.globeImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/earth-day.jpg');
      state.globe.atmosphereColor('#abc7f5');
      btn.innerHTML = `<i data-lucide="layers"></i> Terrain Map`;
    } else { // night
      state.globe.globeImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg');
      state.globe.atmosphereColor('#2a4365');
      btn.innerHTML = `<i data-lucide="layers"></i> Night Map`;
    }
    lucide.createIcons();
  }

  function showNewsLoader(show) {
    const loader = document.getElementById('news-loader');
    const newsList = document.getElementById('news-list');
    if (show) {
      loader.classList.remove('hidden');
      newsList.classList.add('hidden');
    } else {
      loader.classList.add('hidden');
      newsList.classList.remove('hidden');
    }
  }

  function setNewsScanStatus(text, type = 'general') {
    const statusEl = document.getElementById('news-scan-status');
    statusEl.textContent = text;
    
    // Reset classes
    statusEl.className = 'scan-status';
    if (type === 'danger') statusEl.style.borderColor = 'var(--color-danger)';
    if (type === 'danger') statusEl.style.color = 'var(--color-danger)';
    
    if (type === 'warning') statusEl.style.borderColor = 'var(--color-warning)';
    if (type === 'warning') statusEl.style.color = 'var(--color-warning)';
    
    if (type === 'general') statusEl.style.borderColor = 'var(--color-general)';
    if (type === 'general') statusEl.style.color = 'var(--color-general)';
  }

  function handleGlobeClick(lat, lng) {
    const detailsBox = document.getElementById('point-details-box');
    if (detailsBox) detailsBox.classList.remove('hidden');
    flyToLocation(lat, lng, 'Custom Vector Coordinates');
  }

  // Render pre-populated global feed matching screenshot when no point is selected
  function renderGlobalThreatFeed() {
    const listContainer = document.getElementById('news-list');
    listContainer.innerHTML = '';
    showNewsLoader(false);

    state.hotspots.forEach(h => {
      const card = document.createElement('a');
      card.href = '#';
      card.className = `cyber-feed-card cyber-card-${h.type}`;
      
      const badgeText = h.type === 'danger' ? 'RED' : (h.type === 'warning' ? 'ORANGE' : 'BLUE');

      let svgGraphic = '';
      if (h.type === 'danger') {
        svgGraphic = `
          <svg class="threat-svg-icon" viewBox="0 0 50 50">
            <rect x="5" y="5" width="40" height="40" fill="none" stroke="rgba(255, 71, 87, 0.15)" stroke-width="1" />
            <path d="M 25,12 L 38,36 L 12,36 Z" fill="none" stroke="#ff4757" stroke-width="2" />
            <line x1="25" y1="20" x2="25" y2="28" stroke="#ff4757" stroke-width="2" />
            <circle cx="25" cy="32" r="1.5" fill="#ff4757" />
          </svg>
        `;
      } else if (h.type === 'warning') {
        svgGraphic = `
          <svg class="threat-svg-icon" viewBox="0 0 50 50">
            <rect x="5" y="5" width="40" height="40" fill="none" stroke="rgba(255, 165, 2, 0.15)" stroke-width="1" />
            <circle cx="25" cy="25" r="13" fill="none" stroke="#ffa502" stroke-width="1.5" stroke-dasharray="2,2" />
            <circle cx="25" cy="25" r="7" fill="none" stroke="#ffa502" stroke-width="1.5" />
            <line x1="25" y1="5" x2="25" y2="45" stroke="rgba(255, 165, 2, 0.25)" stroke-width="1" />
            <line x1="5" y1="25" x2="45" y2="25" stroke="rgba(255, 165, 2, 0.25)" stroke-width="1" />
          </svg>
        `;
      } else {
        svgGraphic = `
          <svg class="threat-svg-icon" viewBox="0 0 50 50">
            <rect x="5" y="5" width="40" height="40" fill="none" stroke="rgba(84, 160, 255, 0.15)" stroke-width="1" />
            <path d="M 10,25 Q 17.5,15 25,25 T 40,25" fill="none" stroke="#54a0ff" stroke-width="1.5" />
            <path d="M 10,30 Q 17.5,20 25,30 T 40,30" fill="none" stroke="#54a0ff" stroke-width="0.8" opacity="0.4" />
            <path d="M 10,20 Q 17.5,10 25,20 T 40,20" fill="none" stroke="#54a0ff" stroke-width="0.8" opacity="0.4" />
          </svg>
        `;
      }

      card.innerHTML = `
        <div class="threat-details">
          <div class="threat-lvl-header">${badgeText}</div>
          <div class="threat-text-title">${h.title.toUpperCase()}</div>
          <div class="threat-location-row">
            <span class="threat-loc-name">${h.name.toUpperCase()} | ${h.region.toUpperCase()}</span>
            <span class="threat-time">14:02 UTC</span>
          </div>
        </div>
        <div class="card-graphics">
          ${svgGraphic}
        </div>
      `;

      card.addEventListener('click', (e) => {
        e.preventDefault();
        const detailsBox = document.getElementById('point-details-box');
        if (detailsBox) detailsBox.classList.remove('hidden');
        playSound('sonar');
        flyToLocation(h.lat, h.lng, h.name, h.region, h.type, h.title);
      });

      listContainer.appendChild(card);
    });

    setNewsScanStatus('GLOBAL DEFENSE NETWORK FEED', 'general');
  }

  // --- EVENT BINDINGS ---
  function setupEventListeners() {
    // Spin button
    document.getElementById('btn-spin').addEventListener('click', () => {
      playSound('click');
      toggleSpin();
    });

    // Locate button
    document.getElementById('btn-locate').addEventListener('click', () => {
      playSound('click');
      if (navigator.geolocation) {
        setNewsScanStatus('ACQUIRING USER BEACON...');
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const detailsBox = document.getElementById('point-details-box');
            if (detailsBox) detailsBox.classList.remove('hidden');
            flyToLocation(lat, lng, 'My Geolocation Vector');
          },
          (err) => {
            console.warn("Geolocation access blocked", err);
            const detailsBox = document.getElementById('point-details-box');
            if (detailsBox) detailsBox.classList.remove('hidden');
            flyToLocation(28.6139, 77.2090, 'Default Position (New Delhi)');
          }
        );
      } else {
        const detailsBox = document.getElementById('point-details-box');
        if (detailsBox) detailsBox.classList.remove('hidden');
        flyToLocation(28.6139, 77.2090, 'Default Position (New Delhi)');
      }
    });

    // Theme toggle
    document.getElementById('btn-theme').addEventListener('click', () => {
      playSound('click');
      toggleGlobeTheme();
    });

    // Audio toggle
    document.getElementById('btn-audio').addEventListener('click', () => {
      toggleAudio();
    });

    // Left Panel Toggle
    document.getElementById('left-panel-toggle').addEventListener('click', () => {
      playSound('click');
      document.querySelector('.left-sidebar').classList.toggle('collapsed');
    });

    document.getElementById('menu-btn').addEventListener('click', () => {
      playSound('click');
      document.querySelector('.left-sidebar').classList.toggle('collapsed');
    });

    // Right Panel Toggle
    document.getElementById('right-panel-toggle').addEventListener('click', () => {
      playSound('click');
      const rightSidebar = document.getElementById('right-sidebar');
      rightSidebar.classList.toggle('collapsed');
      if (rightSidebar.classList.contains('collapsed')) {
        removeCustomClickMarker();
        updateGlobeLayers();
        toggleSpin(true);
      }
    });

    // Header buttons
    document.getElementById('btn-logout').addEventListener('click', () => {
      playSound('click');
      // Reset view to global threat feed
      const detailsBox = document.getElementById('point-details-box');
      if (detailsBox) detailsBox.classList.add('hidden');
      removeCustomClickMarker();
      updateGlobeLayers();
      renderGlobalThreatFeed();
      state.globe.pointOfView({ lat: 20, lng: 77, altitude: 2.2 }, 1200);
      toggleSpin(true);
    });

    document.getElementById('btn-header-settings').addEventListener('click', () => {
      playSound('click');
      const settingsAcc = document.getElementById('settings-accordion');
      const settingsBody = document.getElementById('settings-acc-body');
      const settingsHeader = document.getElementById('settings-acc-header');
      settingsHeader.classList.toggle('active');
      settingsBody.classList.toggle('collapsed');
    });

    // Collapsible Accordions in Left Sidebar
    document.getElementById('filter-acc-header').addEventListener('click', () => {
      playSound('click');
      document.getElementById('filter-acc-header').classList.toggle('active');
      document.getElementById('filter-acc-body').classList.toggle('collapsed');
    });

    document.getElementById('settings-acc-header').addEventListener('click', () => {
      playSound('click');
      document.getElementById('settings-acc-header').classList.toggle('active');
      document.getElementById('settings-acc-body').classList.toggle('collapsed');
    });

    // Geographic Scope Tab switching
    document.querySelectorAll('.scope-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        if (tab.classList.contains('active')) return;
        playSound('click');

        document.querySelectorAll('.scope-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        state.activeScope = tab.dataset.scope;
        if (state.selectedGeo.lat !== null) {
          fetchLocationNews();
        }
      });
    });

    // Search bar
    const searchInput = document.getElementById('search-input');
    const clearSearchBtn = document.getElementById('clear-search');

    searchInput.addEventListener('input', (e) => {
      const val = e.target.value;
      if (val.length > 0) {
        clearSearchBtn.classList.remove('hidden');
      } else {
        clearSearchBtn.classList.add('hidden');
        document.getElementById('search-results').classList.add('hidden');
      }

      clearTimeout(state.searchTimeout);
      state.searchTimeout = setTimeout(() => {
        executeSearch(val);
      }, 400);
    });

    clearSearchBtn.addEventListener('click', () => {
      playSound('click');
      searchInput.value = '';
      clearSearchBtn.classList.add('hidden');
      document.getElementById('search-results').classList.add('hidden');
    });

    document.addEventListener('click', (e) => {
      const results = document.getElementById('search-results');
      const searchBox = document.getElementById('filter-acc-body');
      if (results && !searchBox.contains(e.target)) {
        results.classList.add('hidden');
      }
    });

    // Filter Options
    document.querySelectorAll('.filter-opt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        playSound('click');
        document.querySelectorAll('.filter-opt-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        setFilter(btn.dataset.filter);
      });
    });

    // Left Sidebar Footer Toolbar Icons
    document.querySelectorAll('.toolbar-icon-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        playSound('click');
        document.querySelectorAll('.toolbar-icon-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // World View Tabs Selector
    document.querySelectorAll('.hud-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        playSound('click');
        document.querySelectorAll('.hud-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }

  // Set active left-sidebar hotspots list filter (Danger, Warning, General)
  function setFilter(type) {
    state.currentFilter = type;
    updateGlobeLayers();
    populateHotspotsFeed();
  }

  // --- INITIALIZATION ---
  initStars();
  initGlobe();
  
  // Set alert count panel value dynamically
  const alertsCountVal = document.getElementById('alerts-count-val');
  if (alertsCountVal) {
    alertsCountVal.textContent = state.hotspots.length;
  }

  updateSidebarCounters();
  populateHotspotsFeed();
  
  // Pre-load right panel with global threat feed on launch
  renderGlobalThreatFeed();
  
  // Remove default collapsed state so both panels load open
  document.getElementById('right-sidebar').classList.remove('collapsed');

  setupEventListeners();

  // Load Lucide Icons tags
  lucide.createIcons();
