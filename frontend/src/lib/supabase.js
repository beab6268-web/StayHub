import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;


const supabaseUrl = 'https://qanymqlmitbccskpqbjt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhbnltcWxtaXRiY2Nza3BxYmp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NzgwODgsImV4cCI6MjA3NzI1NDA4OH0.7bl4R_Aeo79coa1OI2tEKIcp7Ow6Khjy4KjVRGzLhNA';


export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * @typedef {Object} Hotel
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} location
 * @property {string} image_url
 * @property {number} rating
 * @property {string[]} amenities
 * @property {string} created_at
 */

/**
 * @typedef {Object} Room
 * @property {string} id
 * @property {string} hotel_id
 * @property {string} type
 * @property {number} price_per_night
 * @property {number} capacity
 * @property {number} available_rooms
 * @property {string} created_at
 */

/**
 * @typedef {Object} Reservation
 * @property {string} id
 * @property {string} user_id
 * @property {string} hotel_id
 * @property {string} room_id
 * @property {string} check_in
 * @property {string} check_out
 * @property {number} guests
 * @property {number} total_price
 * @property {'active'|'cancelled'|'completed'} status
 * @property {string} created_at
 */

/**
 * @typedef {Object} Profile
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {'user'|'admin'} role
 * @property {string} created_at
 */
