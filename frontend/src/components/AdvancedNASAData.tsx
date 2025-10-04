'use client';

import { motion } from 'framer-motion';
import { 
  Rocket, 
  Globe, 
  BarChart3,
  MapPin,
  ExternalLink,
  Database
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AdvancedNASADataProps {
  location: string;
  coordinates: { lat: number; lon: number };
  date: string;
  endDate?: string;
}

interface GiovanniData {
  source: string;
  coordinates: { lat: number; lon: number };
  dateRange: { start: string; end: string };
  timeSeries: Array<{
    date: string;
    precipitation: number;
    temperature: number;
    humidity: number;
    pressure: number;
  }>;
  mapData: {
    bounds: {
      north: number;
      south: number;
      east: number;
      west: number;
    };
    resolution: string;
  };
}

export default function AdvancedNASAData({ location, coordinates, date, endDate }: AdvancedNASADataProps) {
  const [giovanniData, setGiovanniData] = useState<GiovanniData | null>(null);
  const [earthdataResults, setEarthdataResults] = useState<Array<{title: string; description: string; provider: string}>>([]);
  const [worldviewURL, setWorldviewURL] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'visualization' | 'datasets'>('visualization');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdvancedNASAData = async () => {
      try {
        setLoading(true);
        
        // Simulate fetching from different NASA sources
        // In a real implementation, you would call the actual NASA APIs
        
        // Giovanni data
        const giovanni = {
          source: 'Giovanni',
          coordinates: coordinates,
          dateRange: { start: date, end: endDate || date },
          timeSeries: Array.from({ length: 7 }, (_, i) => {
            const d = new Date(date);
            d.setDate(d.getDate() + i);
            return {
              date: d.toISOString().split('T')[0],
              precipitation: Math.random() * 10,
              temperature: Math.random() * 15 + 10,
              humidity: Math.random() * 40 + 40,
              pressure: Math.random() * 20 + 980
            };
          }),
          mapData: {
            bounds: {
              north: coordinates.lat + 0.1,
              south: coordinates.lat - 0.1,
              east: coordinates.lon + 0.1,
              west: coordinates.lon - 0.1
            },
            resolution: '0.1°'
          }
        };
        
        // Worldview URL
        const worldview = `https://worldview.earthdata.nasa.gov/?p=geographic&l=MODIS_Terra_CorrectedReflectance_TrueColor&t=${date}&v=${coordinates.lon},${coordinates.lat},${coordinates.lon},${coordinates.lat}&e=${endDate || date}&c=${coordinates.lon},${coordinates.lat}`;
        
        // Mock Earthdata results
        const earthdata = [
          {
            title: 'MODIS Terra Surface Reflectance',
            description: 'Daily surface reflectance data from MODIS Terra satellite',
            provider: 'NASA LP DAAC'
          },
          {
            title: 'GPM Precipitation Data',
            description: 'Global Precipitation Measurement mission data',
            provider: 'NASA GES DISC'
          },
          {
            title: 'MERRA-2 Atmospheric Data',
            description: 'Modern-Era Retrospective analysis for Research and Applications',
            provider: 'NASA GMAO'
          }
        ];
        
        setGiovanniData(giovanni);
        setEarthdataResults(earthdata);
        setWorldviewURL(worldview);
        
      } catch (error) {
        console.error('Error fetching advanced NASA data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvancedNASAData();
  }, [location, coordinates, date, endDate]);

  if (loading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-600/30 overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Advanced NASA veri kaynakları yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-600/30 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-purple-600/90 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 rounded-xl p-3">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Advanced NASA Data Sources</h2>
              <p className="text-blue-100">{location} - {date} {endDate && `to ${endDate}`}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-blue-100">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{coordinates.lat.toFixed(4)}°, {coordinates.lon.toFixed(4)}°</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="flex space-x-1 p-2">
          {[
            { id: 'visualization', label: 'Giovanni', icon: BarChart3 },
            { id: 'datasets', label: 'Data Search', icon: Database }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'visualization' | 'datasets')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white/20 text-white border border-white/30'
                  : 'bg-white/10 text-gray-300 hover:bg-white/15 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'visualization' && giovanniData && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Giovanni Time Series Analysis</span>
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={giovanniData.timeSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickLine={{ stroke: '#6B7280' }}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickLine={{ stroke: '#6B7280' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(17, 24, 39, 0.95)',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: 'white'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                      name="Temperature (°C)"
                    />
                    <Line
                      type="monotone"
                      dataKey="precipitation"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      name="Precipitation (mm)"
                    />
                    <Line
                      type="monotone"
                      dataKey="humidity"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                      name="Humidity (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <ExternalLink className="w-5 h-5" />
                <span>Giovanni Visualization Platform</span>
              </h3>
              <p className="text-gray-300 mb-4">
                Giovanni provides access to multiple datasets and variables, and provides 
                output in data maps and time-series.
              </p>
              <a
                href="https://giovanni.gsfc.nasa.gov/giovanni/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Access Giovanni</span>
              </a>
            </div>
          </div>
        )}

        {activeTab === 'datasets' && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <Database className="w-5 h-5" />
                <span>Available Datasets</span>
              </h3>
              <div className="space-y-4">
                {earthdataResults.map((dataset, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h4 className="text-lg font-semibold text-white mb-2">{dataset.title}</h4>
                    <p className="text-gray-300 mb-2">{dataset.description}</p>
                    <div className="text-sm text-gray-400">
                      <span>Provider: {dataset.provider}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <ExternalLink className="w-5 h-5" />
                <span>NASA Data Access Tools</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a
                  href="https://search.earthdata.nasa.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 rounded-lg p-4 transition-colors duration-200"
                >
                  <Database className="w-6 h-6 text-blue-400" />
                  <div>
                    <div className="text-white font-medium">Earthdata Search</div>
                    <div className="text-gray-300 text-sm">Search all NASA Earth science data</div>
                  </div>
                </a>
                <a
                  href={worldviewURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 rounded-lg p-4 transition-colors duration-200"
                >
                  <Globe className="w-6 h-6 text-green-400" />
                  <div>
                    <div className="text-white font-medium">Worldview</div>
                    <div className="text-gray-300 text-sm">Interactive imagery and data</div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
