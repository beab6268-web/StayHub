const API_URL = 'http://localhost:5000/api';

const getAuthToken = () => {
  return localStorage.getItem('token');
};

const authHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  auth: {
    register: async (name, email, password) => {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registration failed');
      return data;
    },

    login: async (email, password) => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');
      return data;
    },

    getProfile: async () => {
      const response = await fetch(`${API_URL}/auth/profile`, {
        headers: authHeaders()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch profile');
      return data;
    },

    updateProfile: async (name, email) => {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders()
        },
        body: JSON.stringify({ name, email })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update profile');
      return data;
    }
  },

  hotels: {
    getAll: async () => {
      const response = await fetch(`${API_URL}/hotels`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch hotels');
      return data;
    },

    getById: async (id) => {
      const response = await fetch(`${API_URL}/hotels/${id}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch hotel');
      return data;
    },

    search: async (location, rating) => {
      const params = new URLSearchParams();
      if (location) params.append('location', location);
      if (rating) params.append('rating', rating);
      const response = await fetch(`${API_URL}/hotels/search?${params}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to search hotels');
      return data;
    },

    create: async (formData) => {
      const response = await fetch(`${API_URL}/hotels`, {
        method: 'POST',
        headers: authHeaders(),
        body: formData
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create hotel');
      return data;
    },

    update: async (id, formData) => {
      const response = await fetch(`${API_URL}/hotels/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: formData
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update hotel');
      return data;
    },

    delete: async (id) => {
      const response = await fetch(`${API_URL}/hotels/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete hotel');
      return data;
    }
  },

  rooms: {
    getAll: async () => {
      const response = await fetch(`${API_URL}/rooms`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch rooms');
      return data;
    },

    getById: async (id) => {
      const response = await fetch(`${API_URL}/rooms/${id}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch room');
      return data;
    },

    getByHotelId: async (hotelId) => {
      const response = await fetch(`${API_URL}/rooms/hotel/${hotelId}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch rooms');
      return data;
    },

    checkAvailability: async (roomId, checkIn, checkOut) => {
      const params = new URLSearchParams({ room_id: roomId, check_in: checkIn, check_out: checkOut });
      const response = await fetch(`${API_URL}/rooms/availability?${params}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to check availability');
      return data;
    },

    create: async (roomData) => {
      const response = await fetch(`${API_URL}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders()
        },
        body: JSON.stringify(roomData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create room');
      return data;
    },

    update: async (id, roomData) => {
      const response = await fetch(`${API_URL}/rooms/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders()
        },
        body: JSON.stringify(roomData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update room');
      return data;
    },

    delete: async (id) => {
      const response = await fetch(`${API_URL}/rooms/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete room');
      return data;
    }
  },

  reservations: {
    getAll: async () => {
      const response = await fetch(`${API_URL}/reservations`, {
        headers: authHeaders()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch reservations');
      return data;
    },

    getMyReservations: async () => {
      const response = await fetch(`${API_URL}/reservations/my-reservations`, {
        headers: authHeaders()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch reservations');
      return data;
    },

    getById: async (id) => {
      const response = await fetch(`${API_URL}/reservations/${id}`, {
        headers: authHeaders()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch reservation');
      return data;
    },

    create: async (reservationData) => {
      const response = await fetch(`${API_URL}/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders()
        },
        body: JSON.stringify(reservationData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create reservation');
      return data;
    },

    updateStatus: async (id, status) => {
      const response = await fetch(`${API_URL}/reservations/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders()
        },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update reservation');
      return data;
    },

    delete: async (id) => {
      const response = await fetch(`${API_URL}/reservations/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete reservation');
      return data;
    }
  }
};
