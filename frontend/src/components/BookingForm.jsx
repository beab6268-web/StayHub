import { useState, useEffect } from 'react';
import { Calendar, Users, DollarSign, AlertCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';


export const BookingForm = ({ room, hotelId, onBook }) => {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [loading, setLoading] = useState(false);
  const [alternatives, setAlternatives] = useState(null);
  const [showAlternatives, setShowAlternatives] = useState(false);

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateTotal = () => {
    return calculateNights() * room.price_per_night;
  };

  useEffect(() => {
    if (checkIn && checkOut && new Date(checkIn) < new Date(checkOut)) {
      checkAvailabilityAndAlternatives();
    }
  }, [checkIn, checkOut]);

  const checkAvailabilityAndAlternatives = async () => {
    try {
      const availabilityData = await api.rooms.checkAvailability(room.id, checkIn, checkOut);

      if (!availabilityData.available) {
        const altData = await api.reservations.getAlternatives(room.id, checkIn, checkOut, 7);
        setAlternatives(altData);
        setShowAlternatives(true);
      } else {
        setAlternatives(null);
        setShowAlternatives(false);
      }
    } catch (error) {
      console.error('Error checking availability:', error);
    }
  };

  const handleAlternativeSelect = (alternative) => {
    setCheckIn(alternative.check_in);
    setCheckOut(alternative.check_out);
    setShowAlternatives(false);
    setAlternatives(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!checkIn || !checkOut) {
      toast.error('Please select check-in and check-out dates');
      return;
    }

    if (new Date(checkIn) >= new Date(checkOut)) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

    if (guests > room.capacity) {
      toast.error(`This room can accommodate maximum ${room.capacity} guests`);
      return;
    }

    if (alternatives && !alternatives.available) {
      toast.error('This room is not available for the selected dates. Please choose alternative dates.');
      return;
    }

    setLoading(true);
    try {
      await onBook({
        roomId: room.id,
        checkIn,
        checkOut,
        guests,
        totalPrice: calculateTotal(),
      });
    } catch (error) {
      console.error('Booking error:', error);
    } finally {
      setLoading(false);
    }
  };

  const nights = calculateNights();
  const total = calculateTotal();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 sticky top-24">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Book This Room</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline h-4 w-4 mr-1 text-cyan-500" />
            Check-in
          </label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline h-4 w-4 mr-1 text-cyan-500" />
            Check-out
          </label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            min={checkIn || new Date().toISOString().split('T')[0]}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Users className="inline h-4 w-4 mr-1 text-cyan-500" />
            Number of Guests
          </label>
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
          >
            {Array.from({ length: room.capacity }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? 'Guest' : 'Guests'}
              </option>
            ))}
          </select>
        </div>

        {nights > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>${room.price_per_night} × {nights} nights</span>
              <span>${room.price_per_night * nights}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900">
              <span>Total</span>
              <span className="text-cyan-600 text-xl">${total}</span>
            </div>
          </div>
        )}

        {showAlternatives && alternatives && alternatives.suggestions?.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-900">
                  Room not available for selected dates
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Here are some alternative dates you can consider:
                </p>
              </div>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {alternatives.suggestions.map((alt, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleAlternativeSelect(alt)}
                  className="w-full text-left p-3 bg-white border border-yellow-200 rounded-lg hover:bg-yellow-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-cyan-600" />
                      <div className="text-sm">
                        <span className="font-medium text-gray-900">
                          {new Date(alt.check_in).toLocaleDateString()} - {new Date(alt.check_out).toLocaleDateString()}
                        </span>
                        <span className="text-gray-500 ml-2">
                          ({alt.days_difference} day{alt.days_difference !== 1 ? 's' : ''} difference)
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || (alternatives && !alternatives.available)}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Reserve Now'}
        </button>
      </form>

      <p className="text-xs text-gray-500 text-center mt-4">
        You won't be charged yet
      </p>
    </div>
  );
};
