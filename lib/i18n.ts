// lib/i18n.ts — Хялбар i18n: Монгол / English

export type Lang = 'mn' | 'en';

export const translations = {
  mn: {
    // Navigation
    home:         'Нүүр',
    resorts:      '🏕 Амралтын газар',
    nature:       '🌿 Байгалийн газар',
    map:          '🗺️ Газрын зураг',
    login:        'Нэвтрэх',
    register:     'Бүртгүүлэх',
    logout:       'Гарах',
    // Place
    bookNow:      'Захиалах',
    reviews:      'Сэтгэгдэл',
    pricePerNight:'/ шөнө',
    viewCount:    'үзэлт',
    // Search
    search:       'Хайх',
    allPlaces:    'Бүх газрууд',
    filter:       'Шүүлтүүр',
    // Booking
    checkIn:      'Ирэх өдөр',
    checkOut:     'Явах өдөр',
    guests:       'Зочдын тоо',
    total:        'Нийт дүн',
    // Submit
    submitPlace:  'Газар нэмэх',
  },
  en: {
    home:         'Home',
    resorts:      '🏕 Resorts',
    nature:       '🌿 Nature',
    map:          '🗺️ Map',
    login:        'Sign In',
    register:     'Sign Up',
    logout:       'Sign Out',
    bookNow:      'Book Now',
    reviews:      'Reviews',
    pricePerNight:'/ night',
    viewCount:    'views',
    search:       'Search',
    allPlaces:    'All Places',
    filter:       'Filters',
    checkIn:      'Check-in',
    checkOut:     'Check-out',
    guests:       'Guests',
    total:        'Total',
    submitPlace:  'Add a Place',
  },
} as const;

export type TranslationKey = keyof typeof translations.mn;
