import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';
import { HotelCard } from '../components/HotelCard';
import { api } from '../lib/api';
import { Loader2 } from 'lucide-react';

export const Home = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const data = await api.hotels.getAll();
      const sorted = data.sort((a, b) => b.rating - a.rating);
      setHotels(sorted);
    } catch (error) {
      console.error('Error fetching hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (filters) => {
    const params = new URLSearchParams({
      location: filters.location,
      checkIn: filters.checkIn,
      checkOut: filters.checkOut,
      guests: filters.guests.toString(),
    });
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div
        className="relative bg-gradient-to-br from-cyan-600 to-blue-700 text-white py-20"
        style={{
          backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.9), rgba(37, 99, 235, 0.9)), url(https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=1920)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">
              Find Your Perfect Stay
            </h1>
            <p className="text-xl text-cyan-50 max-w-2xl mx-auto">
              Discover amazing hotels around the world at unbeatable prices
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Featured Hotels</h2>
          <span className="text-gray-600">{hotels.length} hotels available</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-cyan-600" />
          </div>
        ) : hotels.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">No hotels available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hotels.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
