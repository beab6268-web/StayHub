import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { HotelCard } from '../components/HotelCard';
import { api } from '../lib/api';
import { Loader2, SlidersHorizontal } from 'lucide-react';

export const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('rating');
  const [minRating, setMinRating] = useState(0);

  const location = searchParams.get('location') || '';
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guests = searchParams.get('guests') || '1';

  useEffect(() => {
    fetchFilteredHotels();
  }, [location, sortBy, minRating]);

  const fetchFilteredHotels = async () => {
    try {
      let results = [];

      if (location) {
        results = await api.hotels.search(location, minRating || null);
      } else {
        results = await api.hotels.getAll();
        if (minRating > 0) {
          results = results.filter(hotel => hotel.rating >= minRating);
        }
      }

      if (sortBy === 'price-low') {
        results.sort((a, b) => {
          const aMin = Math.min(...(a).rooms?.map((r) => r.price_per_night) || [0]);
          const bMin = Math.min(...(b).rooms?.map((r) => r.price_per_night) || [0]);
          return aMin - bMin;
        });
      } else if (sortBy === 'rating') {
        results.sort((a, b) => b.rating - a.rating);
      }

      setHotels(results);
    } catch (error) {
      console.error('Error fetching hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-2">Search Results</h1>
          <p className="text-cyan-100">
            {location && `Hotels in ${location}`}
            {checkIn && checkOut && ` • ${checkIn} to ${checkOut}`}
            {` • ${guests} ${Number(guests) === 1 ? 'Guest' : 'Guests'}`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="md:w-64 space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center space-x-2 mb-4">
                <SlidersHorizontal className="h-5 w-5 text-cyan-600" />
                <h2 className="text-lg font-bold text-gray-900">Filters</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                  >
                    <option value="rating">Highest Rating</option>
                    <option value="price-low">Price: Low to High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Rating
                  </label>
                  <select
                    value={minRating}
                    onChange={(e) => setMinRating(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                  >
                    <option value="0">Any Rating</option>
                    <option value="3">3+ Stars</option>
                    <option value="4">4+ Stars</option>
                    <option value="4.5">4.5+ Stars</option>
                  </select>
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <div className="mb-6">
              <p className="text-gray-600">
                {hotels.length} {hotels.length === 1 ? 'hotel' : 'hotels'} found
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-12 w-12 animate-spin text-cyan-600" />
              </div>
            ) : hotels.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No Hotels Found</h2>
                <p className="text-gray-600">Try adjusting your search criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hotels.map((hotel) => (
                  <HotelCard key={hotel.id} hotel={hotel} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
