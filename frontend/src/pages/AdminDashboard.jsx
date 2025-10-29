import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Plus, Edit2, Trash2, Hotel as HotelIcon, Loader2, DoorOpen, Users, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminDashboard = () => {
  const { isAdmin, isHotelManager, canManageHotels, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('hotels');
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHotelForm, setShowHotelForm] = useState(false);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    if (!authLoading && !canManageHotels) {
      toast.error('Access denied: Manager access required');
      navigate('/');
    }
  }, [canManageHotels, authLoading, navigate]);

  useEffect(() => {
    if (canManageHotels) {
      fetchHotels();
      fetchRooms();
      if (isAdmin) {
        fetchUsers();
      }
      fetchReservations();
    }
  }, [canManageHotels, isAdmin]);

  const fetchHotels = async () => {
    try {
      const data = isAdmin ? await api.hotels.getAll() : await api.hotels.getManagedHotels();
      setHotels(data);
    } catch (error) {
      console.error('Error fetching hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const data = await api.rooms.getAll();
      const managedHotelIds = new Set(hotels.map(h => h.id));
      const filteredRooms = isHotelManager
        ? data.filter(room => managedHotelIds.has(room.hotel_id))
        : data;

      const roomsWithHotel = await Promise.all(
        filteredRooms.map(async (room) => {
          try {
            const hotel = await api.hotels.getById(room.hotel_id);
            return { ...room, hotel: { name: hotel.name } };
          } catch {
            return { ...room, hotel: { name: 'Unknown' } };
          }
        })
      );
      setRooms(roomsWithHotel);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await api.admin.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchReservations = async () => {
    try {
      if (isAdmin) {
        const data = await api.reservations.getAll();
        setReservations(data);
      } else if (isHotelManager) {
        const allReservations = [];
        for (const hotel of hotels) {
          const data = await api.reservations.getHotelReservations(hotel.id);
          allReservations.push(...data);
        }
        setReservations(allReservations);
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  const handleDeleteHotel = async (id) => {
    if (!confirm('Are you sure you want to delete this hotel?')) return;

    try {
      await api.hotels.delete(id);
      toast.success('Hotel deleted successfully');
      fetchHotels();
    } catch (error) {
      toast.error(error.message || 'Failed to delete hotel');
    }
  };

  const handleDeleteRoom = async (id) => {
    if (!confirm('Are you sure you want to delete this room?')) return;

    try {
      await api.rooms.delete(id);
      toast.success('Room deleted successfully');
      fetchRooms();
    } catch (error) {
      toast.error(error.message || 'Failed to delete room');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await api.admin.deleteUser(id);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      toast.error(error.message || 'Failed to delete user');
    }
  };

  const handleUpdateReservationStatus = async (id, status) => {
    try {
      await api.reservations.updateStatus(id, status);
      toast.success('Reservation status updated successfully');
      fetchReservations();
    } catch (error) {
      toast.error(error.message || 'Failed to update reservation status');
    }
  };

  if (authLoading || !canManageHotels) {
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
          <h1 className="text-3xl font-bold">{isAdmin ? 'Admin' : 'Manager'} Dashboard</h1>
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
              {isAdmin && (
                <button
                  onClick={() => setActiveTab('users')}
                  className={`px-6 py-4 font-semibold border-b-2 transition-colors ${
                    activeTab === 'users'
                      ? 'border-cyan-600 text-cyan-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Users className="inline h-5 w-5 mr-2" />
                  Users
                </button>
              )}
              <button
                onClick={() => setActiveTab('reservations')}
                className={`px-6 py-4 font-semibold border-b-2 transition-colors ${
                  activeTab === 'reservations'
                    ? 'border-cyan-600 text-cyan-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Calendar className="inline h-5 w-5 mr-2" />
                Reservations
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'hotels' && (
              <HotelsTab
                isAdmin={isAdmin}
                hotels={hotels}
                loading={loading}
                onEdit={(hotel) => {
                  setEditingHotel(hotel);
                  setShowHotelForm(true);
                }}
                onDelete={handleDeleteHotel}
                onAdd={() => {
                  setEditingHotel(null);
                  setShowHotelForm(true);
                }}
              />
            )}

            {activeTab === 'rooms' && (
              <RoomsTab
                rooms={rooms}
                onEdit={(room) => {
                  setEditingRoom(room);
                  setShowRoomForm(true);
                }}
                onDelete={handleDeleteRoom}
                onAdd={() => {
                  setEditingRoom(null);
                  setShowRoomForm(true);
                }}
              />
            )}

            {activeTab === 'users' && isAdmin && (
              <UsersTab
                users={users}
                hotels={hotels}
                onEdit={(user) => {
                  setEditingUser(user);
                  setShowUserForm(true);
                }}
                onDelete={handleDeleteUser}
                onAdd={() => {
                  setEditingUser(null);
                  setShowUserForm(true);
                }}
                onRefresh={fetchUsers}
              />
            )}

            {activeTab === 'reservations' && (
              <ReservationsTab
                reservations={reservations}
                isAdmin={isAdmin}
                onUpdateStatus={handleUpdateReservationStatus}
              />
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

      {showUserForm && isAdmin && (
        <UserFormModal
          user={editingUser}
          hotels={hotels}
          onClose={() => {
            setShowUserForm(false);
            setEditingUser(null);
          }}
          onSuccess={() => {
            fetchUsers();
            setShowUserForm(false);
            setEditingUser(null);
          }}
        />
      )}
    </div>
  );
};

const HotelsTab = ({ isAdmin, hotels, loading, onEdit, onDelete, onAdd }) => (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-gray-900">Hotels Management</h2>
      {isAdmin && (
        <button
          onClick={onAdd}
          className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg"
        >
          <Plus className="h-5 w-5" />
          <span>Add Hotel</span>
        </button>
      )}
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
                    onClick={() => onEdit(hotel)}
                    className="text-cyan-600 hover:text-cyan-700"
                  >
                    <Edit2 className="h-5 w-5 inline" />
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => onDelete(hotel.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-5 w-5 inline" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

const RoomsTab = ({ rooms, onEdit, onDelete, onAdd }) => (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-gray-900">Rooms Management</h2>
      <button
        onClick={onAdd}
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
                    onClick={() => onEdit(room)}
                    className="text-cyan-600 hover:text-cyan-700"
                  >
                    <Edit2 className="h-5 w-5 inline" />
                  </button>
                  <button
                    onClick={() => onDelete(room.id)}
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
);

const UsersTab = ({ users, hotels, onEdit, onDelete, onAdd, onRefresh }) => (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-gray-900">Users Management</h2>
      <button
        onClick={onAdd}
        className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg"
      >
        <Plus className="h-5 w-5" />
        <span>Add User</span>
      </button>
    </div>

    {users.length === 0 ? (
      <div className="text-center py-12">
        <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">No users found</p>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4 font-medium text-gray-900">{user.name}</td>
                <td className="py-4 px-4 text-gray-600">{user.email}</td>
                <td className="py-4 px-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.role === 'admin'
                      ? 'bg-red-100 text-red-800'
                      : user.role === 'hotel_manager'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role.replace('_', ' ').toUpperCase()}
                  </span>
                </td>
                <td className="py-4 px-4 text-right space-x-2">
                  <button
                    onClick={() => onEdit(user)}
                    className="text-cyan-600 hover:text-cyan-700"
                  >
                    <Edit2 className="h-5 w-5 inline" />
                  </button>
                  <button
                    onClick={() => onDelete(user.id)}
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
);

const ReservationsTab = ({ reservations, isAdmin, onUpdateStatus }) => (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-gray-900">Reservations Management</h2>
    </div>

    {reservations.length === 0 ? (
      <div className="text-center py-12">
        <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">No reservations found</p>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Guest</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Hotel</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Room</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Check In</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Check Out</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((reservation) => (
              <tr key={reservation.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4 text-gray-900">
                  <div>{reservation.user_name}</div>
                  <div className="text-sm text-gray-500">{reservation.user_email}</div>
                </td>
                <td className="py-4 px-4 text-gray-900">{reservation.hotel_name}</td>
                <td className="py-4 px-4 text-gray-600">{reservation.room_type}</td>
                <td className="py-4 px-4 text-gray-600">{reservation.check_in}</td>
                <td className="py-4 px-4 text-gray-600">{reservation.check_out}</td>
                <td className="py-4 px-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    reservation.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : reservation.status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {reservation.status.toUpperCase()}
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <select
                    value={reservation.status}
                    onChange={(e) => onUpdateStatus(reservation.id, e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

const HotelFormModal = ({ hotel, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: hotel?.name || '',
    description: hotel?.description || '',
    location: hotel?.location || '',
    image_file: null,
    image_preview: hotel?.image_url || '',
    rating: hotel?.rating || 4.5,
    amenities: hotel?.amenities?.join(', ') || '',
  });
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setFormData((s) => ({ ...s, image_file: file, image_preview: preview }));
    } else {
      setFormData((s) => ({ ...s, image_file: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const amenitiesArray = formData.amenities.split(',').map((a) => a.trim()).filter(Boolean);

      const hotelData = {
        name: formData.name,
        description: formData.description,
        location: formData.location,
        rating: formData.rating,
        amenities: amenitiesArray,
      };

      const formDataToSend = new FormData();
      Object.keys(hotelData).forEach((key) => {
        if (key === 'amenities') {
          formDataToSend.append(key, JSON.stringify(hotelData[key]));
        } else {
          formDataToSend.append(key, hotelData[key]);
        }
      });

      if (formData.image_file) {
        formDataToSend.append('file', formData.image_file);
      } else if (!hotel) {
        toast.error('Hotel image is required');
        setLoading(false);
        return;
      }

      if (hotel) {
        await api.hotels.update(hotel.id, formDataToSend);
        toast.success('Hotel updated successfully');
      } else {
        await api.hotels.create(formDataToSend);
        toast.success('Hotel added successfully');
      }

      if (formData.image_preview && formData.image_file) {
        URL.revokeObjectURL(formData.image_preview);
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              required={!hotel}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
            />
            {formData.image_preview && (
              <img
                src={formData.image_preview}
                alt="preview"
                className="mt-3 max-h-40 rounded-md object-cover"
              />
            )}
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

const RoomFormModal = ({ room, hotels, onClose, onSuccess }) => {
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
        await api.rooms.update(room.id, formData);
        toast.success('Room updated successfully');
      } else {
        await api.rooms.create(formData);
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

const UserFormModal = ({ user, hotels, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'user',
    hotel_id: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (user) {
        await api.admin.updateUserRole(user.id, formData.role);
        if (formData.role === 'hotel_manager' && formData.hotel_id) {
          await api.admin.assignHotelManager(user.id, formData.hotel_id);
        }
        toast.success('User updated successfully');
      } else {
        const userData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        };
        const response = await api.admin.createUser(userData);

        if (formData.role === 'hotel_manager' && formData.hotel_id) {
          await api.admin.assignHotelManager(response.user.id, formData.hotel_id);
        }

        toast.success('User created successfully');
      }

      onSuccess();
    } catch (error) {
      toast.error(error.message || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {user ? 'Edit User' : 'Add New User'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!user && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
            >
              <option value="user">User</option>
              <option value="hotel_manager">Hotel Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {formData.role === 'hotel_manager' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign Hotel {user ? '(Optional)' : '(Required)'}
              </label>
              <select
                value={formData.hotel_id}
                onChange={(e) => setFormData({ ...formData, hotel_id: e.target.value })}
                required={!user}
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
          )}

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
              {loading ? 'Saving...' : user ? 'Update' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
