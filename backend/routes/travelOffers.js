// backend/routes/travelOffers.js - KORRIGIERT für Bild-URLs mit robuster User-Handhabung

const express = require('express');
const router = express.Router();
const TravelOffer = require('../models/TravelOffer');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Hilfsfunktion zur URL-Validierung
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

// Hilfsfunktion zur Ermittlung der User ID
function getUserId(req) {
  // Versuche verschiedene Wege, die User ID zu finden
  return req.user?.id || req.user?._id || req.userId || req.user || 'system';
}

// GET /api/travel-offers - Alle verfügbaren Reiseangebote abrufen
router.get('/', auth, async (req, res) => {
  try {
    const { search, country, category, minPrice, maxPrice, minStars, tags } = req.query;
    
    let query = { available: true };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (country) query.country = { $regex: country, $options: 'i' };
    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.pricePerPerson = {};
      if (minPrice) query.pricePerPerson.$gte = Number(minPrice);
      if (maxPrice) query.pricePerPerson.$lte = Number(maxPrice);
    }
    if (minStars) query.stars = { $gte: Number(minStars) };
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray };
    }
    
    const offers = await TravelOffer.find(query)
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      total: offers.length,
      offers: offers
    });

  } catch (error) {
    console.error('❌ Fehler beim Abrufen der TravelOffers:', error);
    res.status(500).json({ 
      success: false,
      message: 'Fehler beim Abrufen der Reiseangebote', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server Error'
    });
  }
});

// POST /api/travel-offers - Neues Reiseangebot erstellen (nur Admins)
router.post('/', adminAuth, async (req, res) => {
  try {
    console.log('📝 POST /api/travel-offers - User:', req.user, 'UserId:', req.userId);
    
    const {
      title,
      description,
      destination,
      country,
      city,
      category,
      images, // Array von URLs
      pricePerPerson,
      pricePerNight,
      minPersons,
      maxPersons,
      stars,
      amenities,
      tags,
      location,
      availabilityPeriods,
      cancellationPolicy,
      checkInTime,
      checkOutTime
    } = req.body;

    // Validierung der Pflichtfelder
    if (!title || !description || !destination || !country || !category || !pricePerPerson) {
      return res.status(400).json({ 
        success: false,
        message: 'Pflichtfelder fehlen',
        required: ['title', 'description', 'destination', 'country', 'category', 'pricePerPerson']
      });
    }

    // Verarbeite Bilder-Array
    let processedImages = [];
    if (images && Array.isArray(images)) {
      processedImages = images
        .filter(url => isValidUrl(url))
        .map((url, index) => ({
          url: url,
          title: `Bild ${index + 1}`,
          isMain: index === 0
        }));
    }

    // Ermittle User ID
    const userId = getUserId(req);
    console.log('📌 Ermittelte User ID:', userId);

    // Erstelle neues TravelOffer
    const newOffer = new TravelOffer({
      title: title.trim(),
      description: description.trim(),
      destination: destination.trim(),
      country: country.trim(),
      city: city ? city.trim() : '',
      category,
      images: processedImages,
      pricePerPerson: Number(pricePerPerson),
      pricePerNight: pricePerNight ? Number(pricePerNight) : undefined,
      minPersons: minPersons ? Number(minPersons) : 1,
      maxPersons: maxPersons ? Number(maxPersons) : 10,
      stars: stars ? Number(stars) : 3,
      amenities: amenities || [],
      tags: tags || [],
      location: location || {},
      availabilityPeriods: availabilityPeriods || [],
      cancellationPolicy: cancellationPolicy || 'moderate',
      checkInTime: checkInTime || '15:00',
      checkOutTime: checkOutTime || '11:00',
      createdBy: userId,
      available: true,
      bookingCount: 0,
      rating: {
        average: 0,
        count: 0
      }
    });

    const savedOffer = await newOffer.save();
    
    console.log('✅ TravelOffer erstellt:', savedOffer._id);
    
    res.status(201).json({
      success: true,
      message: 'Reiseangebot erfolgreich erstellt',
      offer: savedOffer
    });

  } catch (error) {
    console.error('❌ Fehler beim Erstellen des TravelOffers:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validierungsfehler',
        errors: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Fehler beim Erstellen des Reiseangebots', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server Error'
    });
  }
});

// GET /api/travel-offers/:id - Einzelnes Reiseangebot abrufen
router.get('/:id', auth, async (req, res) => {
  try {
    const offer = await TravelOffer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: 'Reiseangebot nicht gefunden' });
    }
    res.json(offer);
  } catch (error) {
    console.error('Fehler beim Abrufen des Reiseangebots:', error);
    res.status(500).json({ message: 'Fehler beim Abrufen des Reiseangebots' });
  }
});

// PUT /api/travel-offers/:id - Reiseangebot aktualisieren
router.put('/:id', adminAuth, async (req, res) => {
  try {
    console.log('📝 PUT /api/travel-offers/:id - User:', req.user, 'UserId:', req.userId);
    
    const {
      title,
      description,
      destination,
      country,
      city,
      category,
      images, // Array von URLs
      pricePerPerson,
      pricePerNight,
      minPersons,
      maxPersons,
      stars,
      amenities,
      tags
    } = req.body;

    // Ermittle User ID
    const userId = getUserId(req);
    console.log('📌 Ermittelte User ID für Update:', userId);
    
    const update = { lastModifiedBy: userId };

    if (title !== undefined) update.title = title.trim();
    if (description !== undefined) update.description = description.trim();
    if (destination !== undefined) update.destination = destination.trim();
    if (country !== undefined) update.country = country.trim();
    if (city !== undefined) update.city = city.trim();
    if (category !== undefined) update.category = category;
    if (pricePerPerson !== undefined) update.pricePerPerson = Number(pricePerPerson);
    if (pricePerNight !== undefined) update.pricePerNight = Number(pricePerNight);
    if (minPersons !== undefined) update.minPersons = Number(minPersons);
    if (maxPersons !== undefined) update.maxPersons = Number(maxPersons);
    if (stars !== undefined) update.stars = Number(stars);
    if (amenities !== undefined) update.amenities = amenities;
    if (tags !== undefined) update.tags = tags;

    // Verarbeite Bilder-Array
    if (images !== undefined && Array.isArray(images)) {
      update.images = images
        .filter(url => isValidUrl(url))
        .map((url, index) => ({
          url: url,
          title: `Bild ${index + 1}`,
          isMain: index === 0
        }));
      
      console.log(`✅ ${update.images.length} gültige Bilder verarbeitet`);
    }

    const offer = await TravelOffer.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!offer) {
      return res.status(404).json({ message: 'Reiseangebot nicht gefunden' });
    }

    console.log('✅ TravelOffer aktualisiert:', offer._id);

    res.json({ 
      success: true, 
      message: 'Reiseangebot aktualisiert', 
      offer 
    });
  } catch (error) {
    console.error('❌ Fehler beim Aktualisieren des Reiseangebots:', error);
    res.status(500).json({ 
      message: 'Fehler beim Aktualisieren des Reiseangebots', 
      error: error.message 
    });
  }
});

// DELETE /api/travel-offers/:id - Reiseangebot löschen
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const offer = await TravelOffer.findByIdAndDelete(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: 'Reiseangebot nicht gefunden' });
    }
    
    console.log('🗑️ TravelOffer gelöscht:', req.params.id);
    
    res.json({ success: true, message: 'Reiseangebot gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen des Reiseangebots:', error);
    res.status(500).json({ message: 'Fehler beim Löschen des Reiseangebots' });
  }
});

module.exports = router;