import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { BookingForm } from '../components/BookingForm';
import { MapPin, Star, Wifi, Coffee, Dumbbell, UtensilsCrossed, Car, Waves, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const amenityIcons = {
  'Wi-Fi': Wifi,
  'Free Breakfast': Coffee,
  'Gym': Dumbbell,
  'Restaurant': UtensilsCrossed,
  'Parking': Car,
  'Pool': Waves,
};

export const HotelDetails = () => {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchHotelDetails();
      fetchRooms();
    }
  }, [id]);

  const fetchHotelDetails = async () => {
    try {
      const data = await api.hotels.getById(id);
      setHotel(data);
    } catch (error) {
      console.error('Error fetching hotel:', error);
      toast.error('Failed to load hotel details');
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const data = await api.rooms.getByHotelId(id);
      const sorted = data.sort((a, b) => a.price_per_night - b.price_per_night);
      setRooms(sorted);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const handleBooking = async (bookingData) => {
    if (!user) {
      toast.error('Please sign in to make a booking');
      navigate('/login');
      return;
    }

    try {
      await api.reservations.create({
        hotel_id: id,
        room_id: bookingData.roomId,
        check_in: bookingData.checkIn,
        check_out: bookingData.checkOut,
        guests: bookingData.guests,
        total_price: bookingData.totalPrice,
      });

      toast.success('Booking confirmed!');
      navigate('/my-bookings');
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error.message || 'Failed to create booking');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-cyan-600" />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Hotel Not Found</h2>
          <p className="text-gray-600">The hotel you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative h-96 overflow-hidden">
        <img
          src={hotel.image_url}
          alt={hotel.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-3 mb-3">
              <div className="flex items-center bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-1" />
                <span className="font-semibold">{hotel.rating.toFixed(1)}</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-2">{hotel.name}</h1>
            <div className="flex items-center text-white/90">
              <MapPin className="h-5 w-5 mr-2" />
              <span className="text-lg">{hotel.location}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Hotel</h2>
              <p className="text-gray-600 leading-relaxed">{hotel.description}</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {hotel.amenities.map((amenity, index) => {
                  const Icon = amenityIcons[amenity] || Wifi;
                  return (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Icon className="h-5 w-5 text-cyan-600" />
                      <span className="text-gray-700">{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Rooms</h2>
              {rooms.length === 0 ? (
                <p className="text-gray-600">No rooms available at the moment.</p>
              ) : (
                <div className="space-y-4">
                  {rooms.map((room) => (
                    <div
                      key={room.id}
                      className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                        selectedRoom?.id === room.id
                          ? 'border-cyan-500 bg-cyan-50'
                          : 'border-gray-200 hover:border-cyan-300'
                      }`}
                      onClick={() => setSelectedRoom(room)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{room.type}</h3>
                          <p className="text-gray-600">Up to {room.capacity} guests</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-cyan-600">${room.price_per_night}</p>
                          <p className="text-sm text-gray-600">per night</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {room.available_rooms} rooms available
                        </span>
                        <button
                          onClick={() => setSelectedRoom(room)}
                          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                            selectedRoom?.id === room.id
                              ? 'bg-cyan-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {selectedRoom?.id === room.id ? 'Selected' : 'Select'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            {selectedRoom ? (
              <BookingForm room={selectedRoom} hotelId={hotel.id} onBook={handleBooking} />
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center">
                <p className="text-gray-600">Select a room to continue with your booking</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
