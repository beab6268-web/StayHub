import Hotel from '../models/Hotel.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

export const getAllHotels = (req, res) => {
  try {
    const hotels = Hotel.getAll();
    res.json(hotels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getHotelById = (req, res) => {
  try {
    const hotel = Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }
    res.json(hotel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const searchHotels = (req, res) => {
  try {
    const { location, rating } = req.query;
    const hotels = Hotel.search({ location, rating });
    res.json(hotels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createHotel = async (req, res) => {
  try {
    const { name, description, location, rating, amenities } = req.body;

    let image_url = '';

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'hotels',
        resource_type: 'image'
      });
      image_url = result.secure_url;
      fs.unlinkSync(req.file.path);
    } else {
      return res.status(400).json({ error: 'Hotel image is required' });
    }

    const hotel = Hotel.create({
      name,
      description,
      location,
      image_url,
      rating: rating ? parseFloat(rating) : 0,
      amenities: amenities ? JSON.parse(amenities) : []
    });

    res.status(201).json({ message: 'Hotel created successfully', hotel });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
};

export const updateHotel = async (req, res) => {
  try {
    const { name, description, location, rating, amenities } = req.body;

    const existingHotel = Hotel.findById(req.params.id);
    if (!existingHotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    let image_url = existingHotel.image_url;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'hotels',
        resource_type: 'image'
      });
      image_url = result.secure_url;
      fs.unlinkSync(req.file.path);
    }

    const hotel = Hotel.update(req.params.id, {
      name,
      description,
      location,
      image_url,
      rating: rating ? parseFloat(rating) : existingHotel.rating,
      amenities: amenities ? JSON.parse(amenities) : existingHotel.amenities
    });

    res.json({ message: 'Hotel updated successfully', hotel });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
};

export const deleteHotel = (req, res) => {
  try {
    const hotel = Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    Hotel.delete(req.params.id);
    res.json({ message: 'Hotel deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
