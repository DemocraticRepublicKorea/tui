require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user');
const TravelOffer = require('../models/TravelOffer');
const Destination = require('../models/Destination');

async function seedDatabase() {
  try {
    console.log('🌱 Starte Database Seeding...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/reisegruppen');
    console.log('✅ MongoDB verbunden zu:', process.env.MONGODB_URI || 'mongodb://localhost:27017/reisegruppen');

    await TravelOffer.deleteMany({});
    await Destination.deleteMany({});
    console.log('🗑️ Alte Daten gelöscht');

    let adminUser = await User.findOne({ email: 'admin@tui.com' });
    if (!adminUser) {
      adminUser = await User.create({
        email: 'admin@tui.com',
        password: 'admin123',
        name: 'TUI Admin',
        role: 'admin',
        profile: {
          firstName: 'TUI',
          lastName: 'Admin'
        }
      });
      console.log('👤 Admin User erstellt');
    }

    let demoUser = await User.findOne({ email: 'demo@tui.com' });
    if (!demoUser) {
      demoUser = await User.create({
        email: 'demo@tui.com',
        password: 'demo123',
        name: 'Demo User',
        role: 'user',
        profile: {
          firstName: 'Demo',
          lastName: 'User'
        }
      });
      console.log('👤 Demo User erstellt');
    }

    // --- Destinations ---
    const destinations = await Destination.create([
      {
        name: 'Toskana',
        country: 'Italien',
        city: 'Florenz',
        description: 'Malerische Landschaft mit Weinbergen und historischen Städten',
        images: ['https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80'],
        avgPricePerPerson: 800,
        tags: ['culture', 'relaxation', 'romantic'],
        coordinates: { lat: 43.7711, lng: 11.2486 }
      },
      {
        name: 'Tromsø',
        country: 'Norwegen',
        city: 'Tromsø',
        description: 'Nordlichter und arktische Abenteuer',
        images: ['https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'],
        avgPricePerPerson: 1200,
        tags: ['adventure', 'mountains'],
        coordinates: { lat: 69.6492, lng: 18.9553 }
      },
      {
        name: 'Kykladen',
        country: 'Griechenland',
        city: 'Santorini',
        description: 'Traumhafte griechische Inseln mit weißen Häusern',
        images: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'],
        avgPricePerPerson: 900,
        tags: ['beach', 'relaxation', 'romantic'],
        coordinates: { lat: 36.3932, lng: 25.4615 }
      },
      {
        name: 'Barcelona',
        country: 'Spanien',
        city: 'Barcelona',
        description: 'Lebendige Metropole mit Kultur und Kulinarik',
        images: ['https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=800&q=80'],
        avgPricePerPerson: 600,
        tags: ['city', 'culture'],
        coordinates: { lat: 41.3851, lng: 2.1734 }
      },
      {
        name: 'Tirol',
        country: 'Österreich',
        city: 'Innsbruck',
        description: 'Bergwelt und Wanderparadies',
        images: ['https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80'],
        avgPricePerPerson: 700,
        tags: ['mountains', 'adventure'],
        coordinates: { lat: 47.2692, lng: 11.4041 }
      }
    ]);
    console.log(`✅ ${destinations.length} Destinations erstellt`);

    // --- TravelOffers ---
    const travelOffers = [
      {
        title: 'Traumhafte Toskana Tour',
        description: 'Entdecken Sie die malerische Landschaft der Toskana, besuchen Sie historische Städte und genießen Sie die italienische Küche.',
        destination: 'Toskana',
        country: 'Italien',
        city: 'Florenz',
        category: 'Hotel',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
            title: 'Hotel mit Pool in der Toskana',
            isMain: true
          },
          {
            url: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80',
            title: 'Weinberge Toskana',
            isMain: false
          }
        ],
        pricePerPerson: 980,
        pricePerNight: 140,
        minPersons: 2,
        maxPersons: 8,
        stars: 4,
        amenities: ['WLAN', 'Pool', 'Restaurant', 'Halbpension', 'Parkplatz'],
        tags: ['culture', 'relaxation', 'romantic'],
        location: {
          latitude: 43.7711,
          longitude: 11.2486,
          address: 'Via dei Vini 12, 50125 Florenz, Italien'
        },
        cancellationPolicy: 'moderate',
        checkInTime: '15:00',
        checkOutTime: '11:00',
        createdBy: adminUser._id,
        available: true,
        rating: {
          average: 4.8,
          count: 124
        }
      },
      {
        title: 'Nordlichter in Norwegen',
        description: 'Erleben Sie das magische Naturschauspiel der Nordlichter und entdecken Sie die atemberaubende norwegische Landschaft.',
        destination: 'Tromsø',
        country: 'Norwegen',
        city: 'Tromsø',
        category: 'Hotel',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1519817650390-64a93db511ed?auto=format&fit=crop&w=800&q=80',
            title: 'Hotel in Tromsø mit Nordlichtern',
            isMain: true
          }
        ],
        pricePerPerson: 1450,
        pricePerNight: 290,
        minPersons: 2,
        maxPersons: 6,
        stars: 4,
        amenities: ['WLAN', 'Spa', 'Restaurant', 'Vollpension', 'Fitness'],
        tags: ['adventure', 'mountains'],
        location: {
          latitude: 69.6492,
          longitude: 18.9553,
          address: 'Arctic Hotel, Tromsø, Norwegen'
        },
        cancellationPolicy: 'moderate',
        createdBy: adminUser._id,
        available: true,
        rating: {
          average: 4.9,
          count: 87
        }
      },
      {
        title: 'Griechische Inselträume',
        description: 'Entspannen Sie auf den schönsten Inseln Griechenlands, besuchen Sie antike Stätten und genießen Sie das mediterrane Flair.',
        destination: 'Kykladen',
        country: 'Griechenland',
        city: 'Santorini',
        category: 'Resort',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
            title: 'Santorini Resort',
            isMain: true
          }
        ],
        pricePerPerson: 1680,
        pricePerNight: 168,
        minPersons: 2,
        maxPersons: 10,
        stars: 5,
        amenities: ['WLAN', 'Pool', 'Strand', 'All-Inclusive', 'Spa'],
        tags: ['beach', 'relaxation', 'romantic'],
        location: {
          latitude: 36.3932,
          longitude: 25.4615,
          address: 'Santorini Resort, Kykladen, Griechenland'
        },
        cancellationPolicy: 'free',
        createdBy: adminUser._id,
        available: true,
        rating: {
          average: 4.7,
          count: 203
        }
      },
      {
        title: 'Spanische Tapas Tour',
        description: 'Entdecken Sie die kulinarische Vielfalt Spaniens und erleben Sie die lebendige Kultur der spanischen Metropolen.',
        destination: 'Barcelona',
        country: 'Spanien',
        city: 'Barcelona',
        category: 'Hotel',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=800&q=80',
            title: 'Hotel in Barcelona',
            isMain: true
          }
        ],
        pricePerPerson: 520,
        pricePerNight: 130,
        minPersons: 2,
        maxPersons: 8,
        stars: 4,
        amenities: ['WLAN', 'Restaurant', 'Bar', 'Halbpension', 'Klimaanlage'],
        tags: ['city', 'culture'],
        location: {
          latitude: 41.3851,
          longitude: 2.1734,
          address: 'Hotel Barcelona Centro, Barcelona, Spanien'
        },
        cancellationPolicy: 'moderate',
        createdBy: adminUser._id,
        available: true,
        rating: {
          average: 4.6,
          count: 156
        }
      },
      {
        title: 'Alpen Wanderparadies',
        description: 'Wandern Sie durch die malerische Bergwelt Tirols und genießen Sie die frische Bergluft und traditionelle Hüttengastronomie.',
        destination: 'Tirol',
        country: 'Österreich',
        city: 'Innsbruck',
        category: 'Pension',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80',
            title: 'Pension in den Alpen',
            isMain: true
          }
        ],
        pricePerPerson: 540,
        pricePerNight: 90,
        minPersons: 2,
        maxPersons: 12,
        stars: 3,
        amenities: ['WLAN', 'Restaurant', 'Halbpension', 'Balkon', 'Parkplatz'],
        tags: ['mountains', 'adventure'],
        location: {
          latitude: 47.2692,
          longitude: 11.4041,
          address: 'Alpenpension Tirol, Innsbruck, Österreich'
        },
        cancellationPolicy: 'moderate',
        createdBy: adminUser._id,
        available: true,
        rating: {
          average: 4.8,
          count: 98
        }
      },
      {
        title: 'Mittelmeer Kreuzfahrt',
        description: 'Entspannte Kreuzfahrt durch das Mittelmeer mit Stopps in den schönsten Häfen Europas.',
        destination: 'Mittelmeer',
        country: 'International',
        city: 'Verschiedene Häfen',
        category: 'Kreuzfahrt',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=800&q=80',
            title: 'Luxus Kreuzfahrtschiff',
            isMain: true
          }
        ],
        pricePerPerson: 1200,
        pricePerNight: 150,
        minPersons: 1,
        maxPersons: 20,
        stars: 5,
        amenities: ['WLAN', 'Pool', 'Spa', 'All-Inclusive', 'Restaurant', 'Bar', 'Fitness'],
        tags: ['luxury', 'relaxation', 'beach'],
        location: {
          latitude: 42.0,
          longitude: 12.0,
          address: 'Verschiedene Mittelmeerhäfen'
        },
        cancellationPolicy: 'moderate',
        createdBy: adminUser._id,
        available: true,
        rating: {
          average: 4.9,
          count: 312
        }
      },
      {
        title: 'Schwarzwald Wellness',
        description: 'Entspannung pur im Schwarzwald mit Wellness, Wandern und regionaler Küche.',
        destination: 'Schwarzwald',
        country: 'Deutschland',
        city: 'Baden-Baden',
        category: 'Wellness Hotel',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80',
            title: 'Wellness Hotel Schwarzwald',
            isMain: true
          }
        ],
        pricePerPerson: 420,
        pricePerNight: 120,
        minPersons: 2,
        maxPersons: 6,
        stars: 4,
        amenities: ['WLAN', 'Spa', 'Pool', 'Restaurant', 'Halbpension', 'Fitness'],
        tags: ['relaxation', 'mountains', 'family'],
        location: {
          latitude: 48.7606,
          longitude: 8.2401,
          address: 'Wellness Resort Schwarzwald, Baden-Baden'
        },
        cancellationPolicy: 'free',
        createdBy: adminUser._id,
        available: true,
        rating: {
          average: 4.5,
          count: 89
        }
      },
      {
        title: 'Städtetrip London',
        description: 'Entdecken Sie die britische Hauptstadt mit ihren Sehenswürdigkeiten, Museen und dem typischen Flair.',
        destination: 'London',
        country: 'Großbritannien',
        city: 'London',
        category: 'Hotel',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80',
            title: 'London City Hotel',
            isMain: true
          }
        ],
        pricePerPerson: 680,
        pricePerNight: 95,
        minPersons: 1,
        maxPersons: 8,
        stars: 4,
        amenities: ['WLAN', 'Restaurant', 'Bar', 'Nur Frühstück', 'TV'],
        tags: ['city', 'culture', 'adventure'],
        location: {
          latitude: 51.5074,
          longitude: -0.1278,
          address: 'Central London Hotel, London'
        },
        cancellationPolicy: 'moderate',
        createdBy: adminUser._id,
        available: true,
        rating: {
          average: 4.4,
          count: 267
        }
      }
    ];

    const createdOffers = await TravelOffer.create(travelOffers);
    console.log(`✅ ${createdOffers.length} TravelOffers erstellt`);

    console.log('🎉 Database Seeding erfolgreich abgeschlossen!');
    console.log(`📊 Erstellte Daten:
    - ${destinations.length} Destinations
    - ${createdOffers.length} Travel Offers
    - 2 Test Users (admin@tui.com / demo@tui.com)`);

    console.log('\n📋 Erstellte Reiseangebote:');
    createdOffers.forEach((offer, index) => {
      console.log(`   ${index + 1}. ${offer.title} - ${offer.destination} (€${offer.pricePerPerson})`);
    });

  } catch (error) {
    console.error('❌ Fehler beim Seeding:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Datenbankverbindung geschlossen');
    process.exit(0);
  }
}

seedDatabase();
