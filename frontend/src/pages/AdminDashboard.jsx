import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Plus, Edit2, Trash2, Hotel as HotelIcon, Loader2, DoorOpen } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminDashboard = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('hotels');   // 'hotels' | 'rooms' | 'reservations'
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHotelForm, setShowHotelForm] = useState(false);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast.error('Access denied: Admin only');
      navigate('/');
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchHotels();
      fetchRooms();
    }
  }, [isAdmin]);

  const fetchHotels = async () => {
    try {
      const { data, error } = await supabase.from('hotels').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setHotels(data || []);
    } catch (error) {
      console.error('Error fetching hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase.from('rooms').select('*, hotel:hotels(name)').order('created_at', { ascending: false });
      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const handleDeleteHotel = async (id) => {
    if (!confirm('Are you sure you want to delete this hotel?')) return;

    try {
      const { error } = await supabase.from('hotels').delete().eq('id', id);
      if (error) throw error;
      toast.success('Hotel deleted successfully');
      fetchHotels();
    } catch (error) {
      toast.error(error.message || 'Failed to delete hotel');
    }
  };

  const handleDeleteRoom = async (id) => {
    if (!confirm('Are you sure you want to delete this room?')) return;

    try {
      const { error } = await supabase.from('rooms').delete().eq('id', id);
      if (error) throw error;
      toast.success('Room deleted successfully');
      fetchRooms();
    } catch (error) {
      toast.error(error.message || 'Failed to delete room');
    }
  };

  if (authLoading || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-cyan-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-cyan-100 mt-2">Manage your hotels, rooms, and reservations</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('hotels')}
                className={`px-6 py-4 font-semibold border-b-2 transition-colors ${
                  activeTab === 'hotels'
                    ? 'border-cyan-600 text-cyan-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <HotelIcon className="inline h-5 w-5 mr-2" />
                Hotels
              </button>
              <button
                onClick={() => setActiveTab('rooms')}
                className={`px-6 py-4 font-semibold border-b-2 transition-colors ${
                  activeTab === 'rooms'
                    ? 'border-cyan-600 text-cyan-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <DoorOpen className="inline h-5 w-5 mr-2" />
                Rooms
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'hotels' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Hotels Management</h2>
                  <button
                    onClick={() => {
                      setEditingHotel(null);
                      setShowHotelForm(true);
                    }}
                    className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Add Hotel</span>
                  </button>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-12 w-12 animate-spin text-cyan-600" />
                  </div>
                ) : hotels.length === 0 ? (
                  <div className="text-center py-12">
                    <HotelIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No hotels added yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Location</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Rating</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hotels.map((hotel) => (
                          <tr key={hotel.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4 px-4 font-medium text-gray-900">{hotel.name}</td>
                            <td className="py-4 px-4 text-gray-600">{hotel.location}</td>
                            <td className="py-4 px-4 text-gray-600">{hotel.rating.toFixed(1)}</td>
                            <td className="py-4 px-4 text-right space-x-2">
                              <button
                                onClick={() => {
                                  setEditingHotel(hotel);
                                  setShowHotelForm(true);
                                }}
                                className="text-cyan-600 hover:text-cyan-700"
                              >
                                <Edit2 className="h-5 w-5 inline" />
                              </button>
                              <button
                                onClick={() => handleDeleteHotel(hotel.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-5 w-5 inline" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'rooms' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Rooms Management</h2>
                  <button
                    onClick={() => {
                      setEditingRoom(null);
                      setShowRoomForm(true);
                    }}
                    className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Add Room</span>
                  </button>
                </div>

                {rooms.length === 0 ? (
                  <div className="text-center py-12">
                    <DoorOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No rooms added yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Hotel</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Price/Night</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Capacity</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Available</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rooms.map((room) => (
                          <tr key={room.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4 px-4 text-gray-900">{room.hotel?.name}</td>
                            <td className="py-4 px-4 font-medium text-gray-900">{room.type}</td>
                            <td className="py-4 px-4 text-gray-600">${room.price_per_night}</td>
                            <td className="py-4 px-4 text-gray-600">{room.capacity}</td>
                            <td className="py-4 px-4 text-gray-600">{room.available_rooms}</td>
                            <td className="py-4 px-4 text-right space-x-2">
                              <button
                                onClick={() => {
                                  setEditingRoom(room);
                                  setShowRoomForm(true);
                                }}
                                className="text-cyan-600 hover:text-cyan-700"
                              >
                                <Edit2 className="h-5 w-5 inline" />
                              </button>
                              <button
                                onClick={() => handleDeleteRoom(room.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-5 w-5 inline" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showHotelForm && (
        <HotelFormModal
          hotel={editingHotel}
          onClose={() => {
            setShowHotelForm(false);
            setEditingHotel(null);
          }}
          onSuccess={() => {
            fetchHotels();
            setShowHotelForm(false);
            setEditingHotel(null);
          }}
        />
      )}

      {showRoomForm && (
        <RoomFormModal
          room={editingRoom}
          hotels={hotels}
          onClose={() => {
            setShowRoomForm(false);
            setEditingRoom(null);
          }}
          onSuccess={() => {
            fetchRooms();
            setShowRoomForm(false);
            setEditingRoom(null);
          }}
        />
      )}
    </div>
  );
};

const HotelFormModal = ({
  hotel,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: hotel?.name || '',
    description: hotel?.description || '',
    location: hotel?.location || '',
    image_url: hotel?.image_url || '',
    rating: hotel?.rating || 4.5,
    amenities: hotel?.amenities?.join(', ') || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const amenitiesArray = formData.amenities.split(',').map((a) => a.trim()).filter(Boolean);

      const hotelData = {
        name: formData.name,
        description: formData.description,
        location: formData.location,
        image_url: formData.image_url,
        rating: formData.rating,
        amenities: amenitiesArray,
      };

      if (hotel) {
        const { error } = await supabase.from('hotels').update(hotelData).eq('id', hotel.id);
        if (error) throw error;
        toast.success('Hotel updated successfully');
      } else {
        const { error } = await supabase.from('hotels').insert(hotelData);
        if (error) throw error;
        toast.success('Hotel added successfully');
      }

      onSuccess();
    } catch (error) {
      toast.error(error.message || 'Failed to save hotel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {hotel ? 'Edit Hotel' : 'Add New Hotel'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hotel Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              required
              placeholder="https://images.pexels.com/..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <input
              type="number"
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
              required
              min="0"
              max="5"
              step="0.1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amenities (comma-separated)</label>
            <input
              type="text"
              value={formData.amenities}
              onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
              placeholder="Wi-Fi, Pool, Gym, Restaurant"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : hotel ? 'Update' : 'Add Hotel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const RoomFormModal = ({
  room,
  hotels,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    hotel_id: room?.hotel_id || '',
    type: room?.type || '',
    price_per_night: room?.price_per_night || 0,
    capacity: room?.capacity || 2,
    available_rooms: room?.available_rooms || 1,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (room) {
        const { error } = await supabase.from('rooms').update(formData).eq('id', room.id);
        if (error) throw error;
        toast.success('Room updated successfully');
      } else {
        const { error } = await supabase.from('rooms').insert(formData);
        if (error) throw error;
        toast.success('Room added successfully');
      }

      onSuccess();
    } catch (error) {
      toast.error(error.message || 'Failed to save room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {room ? 'Edit Room' : 'Add New Room'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hotel</label>
            <select
              value={formData.hotel_id}
              onChange={(e) => setFormData({ ...formData, hotel_id: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
            >
              <option value="">Select a hotel</option>
              {hotels.map((hotel) => (
                <option key={hotel.id} value={hotel.id}>
                  {hotel.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
            <input
              type="text"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
              placeholder="e.g., Single, Double, Suite"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price Per Night ($)</label>
            <input
              type="number"
              value={formData.price_per_night}
              onChange={(e) => setFormData({ ...formData, price_per_night: Number(e.target.value) })}
              required
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Capacity (Guests)</label>
            <input
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
              required
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Available Rooms</label>
            <input
              type="number"
              value={formData.available_rooms}
              onChange={(e) => setFormData({ ...formData, available_rooms: Number(e.target.value) })}
              required
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : room ? 'Update' : 'Add Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
