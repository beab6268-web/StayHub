# StayHub - Hotel Reservation System

A modern, full-featured hotel reservation system built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

### User Features
- Browse and search hotels by location, dates, and guest count
- View detailed hotel information with amenities and room types
- Make reservations with date selection and guest count
- View and manage personal bookings
- Cancel active reservations
- User authentication (sign up / sign in)

### Admin Features
- Manage hotels (create, edit, delete)
- Manage rooms for each hotel
- View all reservations
- Access via admin dashboard

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Lucide React icons
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Notifications**: React Hot Toast
- **State Management**: React Context API

## Getting Started

### Prerequisites
- Node.js 16+ installed
- A Supabase account and project

### Installation

1. Install dependencies:
```bash
npm install
```

2. The Supabase configuration is already set up in `.env`

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Creating an Admin User

To create an admin user:

1. Sign up for a new account through the UI at `/register`
2. After signing up, run this SQL query in your Supabase SQL editor to promote the user to admin:

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

Replace `your-email@example.com` with the email you used to sign up.

## Database Schema

The application uses the following tables:

- **hotels**: Stores hotel information
- **rooms**: Stores room types and pricing for each hotel
- **reservations**: Stores booking information
- **profiles**: Extended user profile with role management

All tables have Row Level Security (RLS) enabled for data protection.

## Sample Data

The database includes 6 sample hotels with various room types to help you explore the application immediately.

## Pages

- **Home** (`/`): Browse featured hotels with search functionality
- **Hotel Details** (`/hotel/:id`): View hotel details, rooms, and make bookings
- **Search Results** (`/search`): Filtered hotel search results
- **My Bookings** (`/my-bookings`): View and manage user reservations (protected)
- **Admin Dashboard** (`/admin`): Manage hotels and rooms (admin only)
- **Login** (`/login`): User authentication
- **Register** (`/register`): New user registration

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── SearchBar.tsx
│   ├── HotelCard.tsx
│   ├── BookingForm.tsx
│   └── AuthForm.tsx
├── pages/            # Page components
│   ├── Home.tsx
│   ├── HotelDetails.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── MyBookings.tsx
│   ├── SearchResults.tsx
│   └── AdminDashboard.tsx
├── context/          # React Context providers
│   └── AuthContext.tsx
├── lib/              # Utilities and configurations
│   └── supabase.ts
├── App.tsx           # Main app with routing
└── main.tsx          # Application entry point
```

## Design Features

- Clean, modern interface inspired by Airbnb and Booking.com
- Fully responsive design (mobile-first approach)
- Cyan/blue gradient color scheme
- Smooth transitions and hover effects
- Accessible form controls and navigation
- Toast notifications for user feedback
- Loading states and error handling

## Security

- Row Level Security (RLS) policies on all tables
- Authentication required for bookings and admin functions
- Protected routes for authenticated users
- Admin-only access to management features
- Secure password handling via Supabase Auth

## License

This project is open source and available for educational purposes.
