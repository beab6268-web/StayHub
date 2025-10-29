# Hotel Reservation System - Backend

Node.js Express backend with SQLite database and Cloudinary image storage.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Add your Cloudinary credentials (cloud name, API key, API secret)
   - JWT secret is already set for development

3. Start the server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (authenticated)
- `PUT /api/auth/profile` - Update user profile (authenticated)

### Hotels
- `GET /api/hotels` - Get all hotels
- `GET /api/hotels/search?location=&rating=` - Search hotels
- `GET /api/hotels/:id` - Get hotel by ID
- `POST /api/hotels` - Create hotel (admin only, with image upload)
- `PUT /api/hotels/:id` - Update hotel (admin only)
- `DELETE /api/hotels/:id` - Delete hotel (admin only)

### Rooms
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/hotel/:hotelId` - Get rooms by hotel ID
- `GET /api/rooms/:id` - Get room by ID
- `GET /api/rooms/availability?room_id=&check_in=&check_out=` - Check room availability
- `POST /api/rooms` - Create room (admin only)
- `PUT /api/rooms/:id` - Update room (admin only)
- `DELETE /api/rooms/:id` - Delete room (admin only)

### Reservations
- `GET /api/reservations` - Get all reservations (admin only)
- `GET /api/reservations/my-reservations` - Get user's reservations (authenticated)
- `GET /api/reservations/:id` - Get reservation by ID (authenticated)
- `POST /api/reservations` - Create reservation (authenticated)
- `PATCH /api/reservations/:id/status` - Update reservation status (authenticated)
- `DELETE /api/reservations/:id` - Delete reservation (authenticated)

## Database

SQLite database is automatically created on first run at `backend/database.db`.

## Image Storage

Images are uploaded to Cloudinary. Configure your Cloudinary credentials in `.env`.
