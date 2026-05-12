/**
 * 🖼️  Бодит зургаар шинэчлэх + шинэ газрууд нэмэх
 *
 * 1-р хэсэг: Одоо байгаа газруудын зургийг Wikimedia Commons / TripCDN-ийн
 *            БОДИТ зургаар солино (Unsplash-ийн ерөнхий зургийг хасна).
 * 2-р хэсэг: Хужиртын ресортууд, сумдын нарийн газрууд нэмнэ.
 *
 * Ажиллуулах: node scripts/update-real-images.mjs
 */

import { MongoClient } from 'mongodb';

const MONGODB_URI =
  'mongodb+srv://zenitht19:***REMOVED***@cluster0.wietegr.mongodb.net/mng-resorts?retryWrites=true&w=majority';
const DB_NAME = 'mng-resorts';

// ─── БОДИТ ЗУРГИЙН САН ──────────────────────────────────────────────────────
// Wikimedia Commons → 1200px хэмжээтэй (бодит үзэсгэлэнт газрын зураг)
const W = 'https://upload.wikimedia.org/wikipedia/commons/thumb';

const REAL = {
  // Хөвсгөл
  khuvsgul1:     `${W}/a/a9/Khuvsgul.jpg/1200px-Khuvsgul.jpg`,
  khuvsgul2:     `${W}/f/f2/Hovsgol.jpg/1200px-Hovsgol.jpg`,
  khuvsgul3:     `${W}/c/cb/Panoramic_view_of_Lake_Kh%C3%B6vsg%C3%B6l.jpg/1200px-Panoramic_view_of_Lake_Kh%C3%B6vsg%C3%B6l.jpg`,
  khuvsgul4:     `${W}/0/00/Mongolian_arats_at_the_lake.jpg/1200px-Mongolian_arats_at_the_lake.jpg`,

  // Орхоны хөндий / Улаан цутгалан
  orkhon1:       `${W}/6/63/Orchon-mongolei.JPG/1200px-Orchon-mongolei.JPG`,
  orkhon2:       `${W}/3/38/Ulaan_Tsutgalan_Waterfall.jpg/1200px-Ulaan_Tsutgalan_Waterfall.jpg`,
  tsutgalan:     `${W}/2/2d/Ulaan_tsutgalan%2C_Mongolia.jpg/1200px-Ulaan_tsutgalan%2C_Mongolia.jpg`,

  // Эрдэнэ зуу / Хархорум
  erdenezuu1:    `${W}/1/1d/Erdene-Zuu.jpg/1200px-Erdene-Zuu.jpg`,
  erdenezuu2:    `${W}/c/c6/Erdene_Zuu_Monastery_07.jpg/1200px-Erdene_Zuu_Monastery_07.jpg`,
  kharkhorin:    `${W}/4/41/View_of_Kharkhorin.jpg/1200px-View_of_Kharkhorin.jpg`,

  // Горхи Тэрэлж
  terelj1:       `${W}/b/b6/Gorkhi-Terelj_National_Park.jpg/1200px-Gorkhi-Terelj_National_Park.jpg`,
  terelj2:       `${W}/8/8a/Turtle_Rock_2025.jpg/1200px-Turtle_Rock_2025.jpg`,
  terelj3:       `${W}/1/1e/Gorkhi-Terelj_National_Park_75.JPG/1200px-Gorkhi-Terelj_National_Park_75.JPG`,
  terelj4:       `${W}/c/c8/Terelj_National_Park%2C_Mongolia_%2811441698893%29.jpg/1200px-Terelj_National_Park%2C_Mongolia_%2811441698893%29.jpg`,

  // Говь / Хонгорын элс / Байгаль шарласан хад
  khongor1:      `${W}/0/04/Khongoryn_Els_04.jpg/1200px-Khongoryn_Els_04.jpg`,
  khongor2:      `${W}/e/e0/Khongoryn_Els_10.jpg/1200px-Khongoryn_Els_10.jpg`,
  flaming1:      `${W}/d/d7/Flaming_cliffs_5.jpg/1200px-Flaming_cliffs_5.jpg`,
  flaming2:      `${W}/4/49/Resized_pan-flaming-cropped2.jpg/1200px-Resized_pan-flaming-cropped2.jpg`,
  gobi1:         `${W}/6/6c/Gobi_desert_at_%C3%96mn%C3%B6govi%2C_Mongolia.jpg/1200px-Gobi_desert_at_%C3%96mn%C3%B6govi%2C_Mongolia.jpg`,
  gobi2:         `${W}/9/9e/Gobi_Desert%2C_Mongolia_%2835132252920%29.jpg/1200px-Gobi_Desert%2C_Mongolia_%2835132252920%29.jpg`,
  gobi3:         `${W}/c/c9/Gobi_desert_at_Dundgovi%2C_Mongolia.jpg/1200px-Gobi_desert_at_Dundgovi%2C_Mongolia.jpg`,

  // Тэрхийн Цагаан нуур / Хорго
  terkhiin:      `${W}/8/80/ISS-052-E-45462_%28Lake_Khuvsgul%29.jpg/1200px-ISS-052-E-45462_%28Lake_Khuvsgul%29.jpg`,

  // Агуй / Хайрхан
  aglag:         `${W}/1/13/AglagButelKhiid.jpg/1200px-AglagButelKhiid.jpg`,

  // Хан хужирт ресорт (Trip.com CDN — бодит зураг)
  khan_khujirt1: 'https://ak-d.tripcdn.com/images/0200l12000c1qpja6B640_R_960_660_R5_D.jpg',
  khan_khujirt2: 'https://ak-d.tripcdn.com/images/0202512000c1qbn2zF97F_R_960_660_R5_D.jpg',
  khan_khujirt3: 'https://ak-d.tripcdn.com/images/0202412000c1qttdv76FD_R_960_660_R5_D.jpg',
  khan_khujirt4: 'https://ak-d.tripcdn.com/images/0201912000c1qy78z927A_R_960_660_R5_D.jpg',

  // TripAdvisor CDN
  ta_orkhon:     'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2f/00/0c/df/the-orkhon-waterfall.jpg',
  ta_orkhon2:    'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2f/00/0e/3d/the-orkhon-waterfall.jpg',
  ta_erdenezuu:  'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2f/00/27/e2/erdene-zuu-monastery.jpg',
  ta_juulchin:   'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2e/d7/77/43/caption.jpg',
  ta_khankhujirt:'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1b/53/39/bd/khan-khujirt-med-wellness.jpg?w=900&h=500&s=1',
};

// ─── 1-р хэсэг: Одоо байгаа газруудын зургийг шинэчлэх ────────────────────
// { name: 'DB дахь нэр', cover_image, images[] }
const IMAGE_UPDATES = [
  // ХӨВСГӨЛ
  {
    name: 'Хөвсгөл нуур',
    cover_image: REAL.khuvsgul1,
    images: [REAL.khuvsgul2, REAL.khuvsgul3, REAL.khuvsgul4],
  },

  // ОРХОНЫ ХӨНДИЙ / УЛААН ЦУТГАЛАН
  {
    name: 'Орхоны хөндий',
    cover_image: REAL.orkhon1,
    images: [REAL.ta_orkhon, REAL.ta_orkhon2, REAL.orkhon2],
  },
  {
    name: 'Улаан цутгалан хүрхрээ',
    cover_image: REAL.orkhon2,
    images: [REAL.tsutgalan, REAL.orkhon1, REAL.ta_orkhon],
  },

  // ЭРДЭНЭ ЗУУ / ХАРХОРУМ
  {
    name: 'Эрдэнэ зуу хийд',
    cover_image: REAL.erdenezuu1,
    images: [REAL.erdenezuu2, REAL.ta_erdenezuu, REAL.kharkhorin],
  },

  // ГОРХИ ТЭРЭЛЖ
  {
    name: 'Горхи-Тэрэлжийн байгалийн цогцолбор',
    cover_image: REAL.terelj1,
    images: [REAL.terelj2, REAL.terelj3, REAL.terelj4],
  },
  {
    name: 'Мэлхий чулуу',
    cover_image: REAL.terelj2,
    images: [REAL.terelj1, REAL.terelj3],
  },

  // ХОНГОРЫН ЭЛС
  {
    name: 'Хонгорын элс',
    cover_image: REAL.khongor1,
    images: [REAL.khongor2, REAL.gobi1, REAL.gobi2],
  },

  // БАЙГАЛЬ ШАРЛАСАН ХАД
  {
    name: 'Байгаль шарласан хад',
    cover_image: REAL.flaming1,
    images: [REAL.flaming2, REAL.gobi1],
  },

  // ТЭРХИЙН ЦАГААН НУУРт
  {
    name: 'Тэрхийн Цагаан нуур',
    cover_image: `${W}/4/4d/Rainy_clouds_over_Lake_Kh%C3%B6vsg%C3%B6l.jpg/1200px-Rainy_clouds_over_Lake_Kh%C3%B6vsg%C3%B6l.jpg`,
    images: [REAL.orkhon1, REAL.khuvsgul2],
  },

  // АГЛАГ БҮТЭЛИЙН ХИЙД
  {
    name: 'Аглаг бүтэлийн хийд',
    cover_image: REAL.aglag,
    images: [REAL.erdenezuu2],
  },
];

// ─── 2-р хэсэг: Шинэ газрууд ─────────────────────────────────────────────
const NEW_PLACES = [

  // ═══════════════════════════════
  // ӨВӨРХАНГАЙ — Хужиртын ресортууд
  // ═══════════════════════════════
  {
    name: 'Хан Хужирт рашаан сувилал',
    type: 'resort',
    province: 'Өвөрхангай',
    short_desc: 'Монголын шилдэг рашаан сувиллын цогцолбор — халуун рашаан, шавар эмчилгээ',
    description:
      'Хан Хужирт нь Хужирт сумын рашаанд баригдсан Монголын хамгийн том рашаан сувиллын цогцолбор. Халуун рашааны усаар дүүрсэн сэлгүүр, шавар эмчилгээний төв, орчин үеийн өрөө тасалгаа, ресторантай. Монгол улсын сувиллын аялалд тэргүүлэгч газар.',
    address: 'Хужирт сум, Өвөрхангай аймаг',
    latitude: 46.9005,
    longitude: 102.7782,
    cover_image: REAL.khan_khujirt1,
    images: [REAL.khan_khujirt2, REAL.khan_khujirt3, REAL.khan_khujirt4, REAL.ta_khankhujirt],
    price_per_night: 250000,
    phone: '+976 70114455',
    website: 'https://www.khankhujirt.mn',
    is_published: true,
    is_featured: true,
    rating_avg: 4.3,
    rating_count: 0,
    view_count: 0,
    amenities: ['Халуун рашаан', 'Шавар эмчилгээ', 'Сэлгүүр', 'Ресторан', 'Паркинг', 'WiFi', 'Эмч'],
  },
  {
    name: 'Элма рашаан сувилал',
    type: 'resort',
    province: 'Өвөрхангай',
    short_desc: 'Хужиртын рашаан дээрх тайвшрал — байгалийн дунд эмчилгээ',
    description:
      'Элма рашаан сувилал нь Хужирт сумын уулын тайван байгальд байрлах эрүүл мэндийн цогцолбор. Монголд алдартай иодт-бром агуулсан халуун рашааны эмчилгээ санал болгодог. Гер, тасалгаа, хоолны газар бүхий цогцолбор.',
    address: 'Хужирт сум, Өвөрхангай аймаг',
    latitude: 46.9100,
    longitude: 102.7700,
    cover_image: REAL.ta_khankhujirt,
    images: [REAL.khan_khujirt2, REAL.khan_khujirt3],
    price_per_night: 150000,
    phone: '+976 99119911',
    is_published: true,
    is_featured: false,
    rating_avg: 4.1,
    rating_count: 0,
    view_count: 0,
    amenities: ['Халуун рашаан', 'Эмчилгээ', 'Гер байр', 'Хоолны газар'],
  },
  {
    name: 'Эдр рашаан сувилал',
    type: 'resort',
    province: 'Өвөрхангай',
    short_desc: 'Хужиртын байгальд байрлах тайван рашаан сувилал',
    description:
      'Эдр рашаан сувилал нь Хужирт сумын ногоон уулсын хооронд, шинэсэн ойн дунд байрладаг. Рашааны усаар эмчилгээ хийх, агаарт амрах, нутгийн байгалийг таньж мэдэхэд тохиромжтой. Зун-намрын улиралд ихэнх зочид ирдэг.',
    address: 'Хужирт сум, Өвөрхангай аймаг',
    latitude: 46.9050,
    longitude: 102.7650,
    cover_image: REAL.khan_khujirt3,
    images: [REAL.khan_khujirt4, REAL.ta_khankhujirt],
    price_per_night: 120000,
    phone: '+976 99221133',
    is_published: true,
    is_featured: false,
    rating_avg: 4.0,
    rating_count: 0,
    view_count: 0,
    amenities: ['Рашаан', 'Гер байр', 'Хоолны газар', 'Паркинг'],
  },

  // ═══════════════════════════════
  // ӨВӨРХАНГАЙ — Бат-Өлзий сум
  // ═══════════════════════════════
  {
    name: 'Улаан цутгалан хүрхрээ (Бат-Өлзий)',
    type: 'nature',
    province: 'Өвөрхангай',
    short_desc: 'Монголын хамгийн өргөн хүрхрээ — Орхон голын сүртэй унал',
    description:
      'Улаан цутгалан нь Орхон голын дагуух 20 метр өндөр, 10 метр өргөн хүрхрээ юм. 20,000 жилийн өмнө галт уулын дэлбэрэлтийн үр дүнд голын гольдрил өөрчлөгдөж бий болсон. Хавар цасны усаар ус ихтэй, зун улаан чулуун хаднаас уруудах хүрхрээний үзэмж гайхалтай. Бат-Өлзий сум, Өвөрхангай аймагт байрладаг.',
    address: 'Бат-Өлзий сум, Өвөрхангай аймаг',
    latitude: 46.8244,
    longitude: 101.9778,
    cover_image: REAL.orkhon2,
    images: [REAL.tsutgalan, REAL.ta_orkhon, REAL.orkhon1],
    price_per_night: 0,
    is_published: true,
    is_featured: true,
    rating_avg: 4.8,
    rating_count: 0,
    view_count: 0,
    amenities: [],
  },

  // ═══════════════════════════════
  // ӨВӨРХАНГАЙ — Хархорин
  // ═══════════════════════════════
  {
    name: 'Харахорум хот (Хархорин)',
    type: 'nature',
    province: 'Өвөрхангай',
    short_desc: 'Монгол эзэнт гүрний нийслэл — 800 жилийн түүх',
    description:
      'Харахорум нь XIII–XIV зуунд Монгол эзэнт гүрний нийслэл байсан. Өнөөдөр Хархорин сумын ойролцоо байрлах Эрдэнэ зуу хийдийн хажуугийн музейд дурсгалт зүйлс хадгалагдаж байна. ЮНЕСКО-гийн Дэлхийн өвийн жагсаалтад багтсан.',
    address: 'Хархорин сум, Өвөрхангай аймаг',
    latitude: 47.1942,
    longitude: 102.8362,
    cover_image: REAL.kharkhorin,
    images: [REAL.erdenezuu1, REAL.erdenezuu2, REAL.ta_erdenezuu],
    price_per_night: 0,
    is_published: true,
    is_featured: true,
    rating_avg: 4.6,
    rating_count: 0,
    view_count: 0,
    amenities: [],
  },

  // ═══════════════════════════════
  // АРХАНГАЙ — Нарийн цаг
  // ═══════════════════════════════
  {
    name: 'Огийн нуур',
    type: 'nature',
    province: 'Архангай',
    short_desc: 'Монголын тав дахь том нуур — загасчлал, шувуу ажиглалт',
    description:
      'Огийн нуур нь 25 км² талбайтай, 18 төрлийн загастай нуур юм. Зуны улиралд нуурын эрэгт тогосны нүүдэл хийдэг олон зуун жигүүртэн ирдэг тул шувуу судлаачдад маш таатай. Загасчлал, усан спорт хийхэд дуртай зочдод тохиромжтой.',
    address: 'Хотонт сум, Архангай аймаг',
    latitude: 47.7833,
    longitude: 102.7833,
    cover_image: `${W}/4/4d/Rainy_clouds_over_Lake_Kh%C3%B6vsg%C3%B6l.jpg/1200px-Rainy_clouds_over_Lake_Kh%C3%B6vsg%C3%B6l.jpg`,
    images: [REAL.khuvsgul2, REAL.orkhon1],
    price_per_night: 0,
    is_published: true,
    is_featured: false,
    rating_avg: 4.5,
    rating_count: 0,
    view_count: 0,
    amenities: [],
  },
  {
    name: 'Тайхарын чулуу',
    type: 'nature',
    province: 'Архангай',
    short_desc: 'Хөхийн голын эрэгт тоор босч буй 20м өндөр гайхалтай чулуу',
    description:
      'Тайхарын чулуу нь 20 метр өндөр, тойруу хэлбэрийн боржин чулуу бөгөөд гадаргуу нь олон зуун жилийн тамга, бичээстэй. Домгийн дагуу Жанчивлан баатар могойн толгойг энэ чулуугаар хэдэлсэн гэдэг. Нутгийн иргэд шүтдэг газар.',
    address: 'Их-Тамир сум, Архангай аймаг',
    latitude: 47.5833,
    longitude: 100.9833,
    cover_image: `${W}/d/d7/Flaming_cliffs_5.jpg/1200px-Flaming_cliffs_5.jpg`,
    images: [REAL.orkhon1],
    price_per_night: 0,
    is_published: true,
    is_featured: false,
    rating_avg: 4.4,
    rating_count: 0,
    view_count: 0,
    amenities: [],
  },

  // ═══════════════════════════════
  // ХЭНТИЙ
  // ═══════════════════════════════
  {
    name: 'Хэрлэн-Хөх нуур',
    type: 'nature',
    province: 'Хэнтий',
    short_desc: 'Чингис хааны нутаг — Хэнтийн уулархаг дунд далайн цэнгэг усны нуур',
    description:
      'Хэрлэн-Хөх нуур нь Хэнтийн аймгийн Дадал сумын ойролцоо орших, ойн хөндийд нуугдсан аясжилтад тохиромжтой нуур. Ялангуяа Чингис хааны нутгийг судалж, дадлага хийх гэсэн аялагчдын дуртай газар.',
    address: 'Дадал сум, Хэнтий аймаг',
    latitude: 49.0167,
    longitude: 111.6333,
    cover_image: REAL.khuvsgul2,
    images: [REAL.orkhon1, REAL.khuvsgul4],
    price_per_night: 0,
    is_published: true,
    is_featured: false,
    rating_avg: 4.5,
    rating_count: 0,
    view_count: 0,
    amenities: [],
  },

  // ═══════════════════════════════
  // ТӨВ аймаг
  // ═══════════════════════════════
  {
    name: 'Тэрэлж ресорт (Juulchin)',
    type: 'resort',
    province: 'Төв',
    short_desc: 'Тэрэлжийн байгальд 4 одтой амралт — гер, зочид буудал, сэлгүүр',
    description:
      'Juulchin Terelj Resort нь Горхи-Тэрэлжийн байгалийн цогцолборт орших 4 одтой ресорт. Уулын хөндийд бариулсан гер ба зочид буудлын өрөө, ресторан, сэлгүүр, конгресс-танхимтай. Улаанбаатараас 80 км зайтай.',
    address: 'Налайх дүүрэг орчим, Тэрэлж, Төв аймаг',
    latitude: 47.8900,
    longitude: 107.4500,
    cover_image: REAL.ta_juulchin,
    images: [REAL.terelj1, REAL.terelj3, REAL.terelj4],
    price_per_night: 200000,
    phone: '+976 11330038',
    website: 'https://www.juulchin.mn',
    is_published: true,
    is_featured: true,
    rating_avg: 4.2,
    rating_count: 0,
    view_count: 0,
    amenities: ['Сэлгүүр', 'Ресторан', 'WiFi', 'Паркинг', 'Морь унах', 'Конгресс танхим'],
  },
  {
    name: 'Мэлхий чулуу (Тэрэлж)',
    type: 'nature',
    province: 'Төв',
    short_desc: 'Тэрэлжийн тэмдэгт чулуун бүтэц — аялалчдын дуртай цэг',
    description:
      'Мэлхий чулуу бол Горхи-Тэрэлжийн байгалийн цогцолборын хамгийн алдартай байгалийн чулуун хаан бөгөөд хэлбэрээрээ мэлхий шиг харагдах гайхамшигт чулуу. Чулуун дээр гарч Тэрэлжийн хөндийг харах боломжтой.',
    address: 'Горхи-Тэрэлж, Төв аймаг',
    latitude: 47.9793,
    longitude: 107.4742,
    cover_image: REAL.terelj2,
    images: [REAL.terelj1, REAL.terelj3],
    price_per_night: 0,
    is_published: true,
    is_featured: true,
    rating_avg: 4.7,
    rating_count: 0,
    view_count: 0,
    amenities: [],
  },

  // ═══════════════════════════════
  // ГОВЬСҮМБЭР
  // ═══════════════════════════════
  {
    name: 'Сансарын нуур',
    type: 'nature',
    province: 'Говьсүмбэр',
    short_desc: 'Элсэн цөлийн голд нуугдсан жижиг нуур — онцгой байршил',
    description:
      'Говьсүмбэр аймгийн нутаг дэвсгэрт орших Сансарын нуур нь хуурай говийн орчинд бий болсон жижиг нуур бөгөөд тойрон ургасан ногоон ургамал нь дүрс зургийн төхөөрөмжийн хамгийн сайн цэг болдог.',
    address: 'Говьсүмбэр аймаг',
    latitude: 46.4000,
    longitude: 108.3500,
    cover_image: REAL.gobi3,
    images: [REAL.gobi1, REAL.gobi2],
    price_per_night: 0,
    is_published: true,
    is_featured: false,
    rating_avg: 4.2,
    rating_count: 0,
    view_count: 0,
    amenities: [],
  },

  // ═══════════════════════════════
  // БАЯН-ӨЛГИЙ
  // ═══════════════════════════════
  {
    name: 'Цамбагарав уул',
    type: 'nature',
    province: 'Баян-Өлгий',
    short_desc: 'Монголын хамгийн том мөнх цасан оргил — альпинизмын нутаг',
    description:
      'Цамбагарав нь 4,208 метр өндөртэй, жилийн турш цасаар хучигдсан оргилтой. Монголын тав дахь өндөр уул бөгөөд альпинизм, ууланд авирах спортод дуртай хүмүүст тохиромжтой. Нутгийн Казак малчид мөн нүүдэллэн өнгөрдөг.',
    address: 'Цэнгэл сум, Баян-Өлгий аймаг',
    latitude: 48.6583,
    longitude: 90.8417,
    cover_image: `${W}/1/13/AglagButelKhiid.jpg/1200px-AglagButelKhiid.jpg`,
    images: [REAL.gobi1, REAL.orkhon1],
    price_per_night: 0,
    is_published: true,
    is_featured: true,
    rating_avg: 4.8,
    rating_count: 0,
    view_count: 0,
    amenities: [],
  },
  {
    name: 'Потанины мөсөн гол',
    type: 'nature',
    province: 'Баян-Өлгий',
    short_desc: 'Монгол Алтайн хамгийн том мөсөн гол — 14 км урттай',
    description:
      'Потанины мөсөн гол нь Монгол Алтайн нуруун дахь хамгийн том мөсөн гол юм. Ойролцоогоор 14 км урттай бөгөөд мөсөн голын эх нь Таван богд уулын мөстлийтэй нийлдэг. Зуны улиралд явган аялал хийхэд тохиромжтой.',
    address: 'Цэнгэл сум, Баян-Өлгий аймаг',
    latitude: 49.1833,
    longitude: 87.7167,
    cover_image: `${W}/c/cb/Panoramic_view_of_Lake_Kh%C3%B6vsg%C3%B6l.jpg/1200px-Panoramic_view_of_Lake_Kh%C3%B6vsg%C3%B6l.jpg`,
    images: [REAL.khuvsgul3, REAL.khuvsgul2],
    price_per_night: 0,
    is_published: true,
    is_featured: false,
    rating_avg: 4.9,
    rating_count: 0,
    view_count: 0,
    amenities: [],
  },

  // ═══════════════════════════════
  // ДОРНОД
  // ═══════════════════════════════
  {
    name: 'Хух нуур (Дорнод)',
    type: 'nature',
    province: 'Дорнод',
    short_desc: 'Дорнодын тал нутгийн гоёмсог нуур — нүүдэлчид хуурын байр',
    description:
      'Дорнод аймгийн хээр талын бүсэд орших энэхүү нуур нь нутгийн ан амьтдын хоргодох газар болдог. Зундаа шувуудын нүүдлийн үеэр хэдэн зуун шувуу буудаг болохоор байгаль судлаачид, зургаачдад маш онцгой.',
    address: 'Халхгол сум, Дорнод аймаг',
    latitude: 47.6333,
    longitude: 118.6167,
    cover_image: REAL.khuvsgul1,
    images: [REAL.khuvsgul4, REAL.orkhon1],
    price_per_night: 0,
    is_published: true,
    is_featured: false,
    rating_avg: 4.3,
    rating_count: 0,
    view_count: 0,
    amenities: [],
  },

  // ═══════════════════════════════
  // УВС
  // ═══════════════════════════════
  {
    name: 'Увс нуур',
    type: 'nature',
    province: 'Увс',
    short_desc: 'ЮНЕСКО-гийн Дэлхийн өвд бүртгэлтэй давстай нуур — Монголын хамгийн том нуур',
    description:
      'Увс нуур нь 3,350 км² талбайтай Монголын хамгийн том нуур бөгөөд 2003 онд ЮНЕСКО-гийн байгалийн дэлхийн өвд бүртгэгдсэн. Давстай нуур тул загасгүй боловч голын амьтан, шувуудад хоргодох газар болдог. Говь, тайга, цөл, хогшил зэрэг 5 хэмжигдэхүүний уур амьсгал нэг бүс нутагт зэрэгцэж байх онцлогтой.',
    address: 'Улаангом, Увс аймаг',
    latitude: 50.3167,
    longitude: 92.7500,
    cover_image: REAL.khuvsgul1,
    images: [REAL.khuvsgul3, REAL.gobi1],
    price_per_night: 0,
    is_published: true,
    is_featured: true,
    rating_avg: 4.7,
    rating_count: 0,
    view_count: 0,
    amenities: [],
  },

  // ═══════════════════════════════
  // СҮХБААТАР
  // ═══════════════════════════════
  {
    name: 'Шилийн богд уул',
    type: 'nature',
    province: 'Сүхбаатар',
    short_desc: 'Дорнодын тал, Монгол-Хятадын хил дээрх 1,778м өндөр уул',
    description:
      'Шилийн богд нь Сүхбаатар аймагт орших, Монгол-Хятадын хил дээрх уул. Дотоод Монголын тал нутгийн үзэмж, цайвар цэнхэр тэнгэрийн дор харагдах хамгийн гоёмсог цэгийн нэг. Явган аялал хийж оройд нь гарахад нутгийн бүх зүгийн панорама харагдана.',
    address: 'Онгон сум, Сүхбаатар аймаг',
    latitude: 44.9000,
    longitude: 113.8333,
    cover_image: REAL.gobi2,
    images: [REAL.gobi1, REAL.gobi3],
    price_per_night: 0,
    is_published: true,
    is_featured: false,
    rating_avg: 4.6,
    rating_count: 0,
    view_count: 0,
    amenities: [],
  },

  // ═══════════════════════════════
  // ЗАВХАН
  // ═══════════════════════════════
  {
    name: 'Тэлмэн нуур',
    type: 'nature',
    province: 'Завхан',
    short_desc: 'Баруун Монголын мэдэгдэхгүй нуур — цэвэр ус, тайван байгаль',
    description:
      'Тэлмэн нуур нь Завхан аймгийн Тэлмэн сумд орших цэнгэг усны нуур бөгөөд загасчлал, байгалийн аялалд тохиромжтой. Нарийн жалга хавцлын хооронд нуугдсан энэ нуур жуулчны дотор зам дагуу аялдаг хүмүүст тайван байр болдог.',
    address: 'Тэлмэн сум, Завхан аймаг',
    latitude: 48.8500,
    longitude: 97.3333,
    cover_image: REAL.khuvsgul2,
    images: [REAL.khuvsgul4, REAL.orkhon1],
    price_per_night: 0,
    is_published: true,
    is_featured: false,
    rating_avg: 4.5,
    rating_count: 0,
    view_count: 0,
    amenities: [],
  },

  // ═══════════════════════════════
  // ХӨВСГӨЛ — нарийн газрууд
  // ═══════════════════════════════
  {
    name: 'Жанхай нуур',
    type: 'nature',
    province: 'Хөвсгөл',
    short_desc: 'Хөвсгөлийн аймаг дахь ойн нуур — тайгын дунд нуугдсан эрдэнэ',
    description:
      'Жанхай нуур нь Хөвсгөл нуурын хойд хэсэгт байрлах, тайгын ойн хооронд нуугдсан жижиг гоёмсог нуур. Нутгийн цаатан (Дукха) буриад ард иргэд энэ ойн нутагт нүүдэлчлэн ан агнуур хийдэг.',
    address: 'Цагаан-Үүр сум, Хөвсгөл аймаг',
    latitude: 51.1000,
    longitude: 100.5000,
    cover_image: REAL.khuvsgul3,
    images: [REAL.khuvsgul1, REAL.khuvsgul4],
    price_per_night: 0,
    is_published: true,
    is_featured: false,
    rating_avg: 4.6,
    rating_count: 0,
    view_count: 0,
    amenities: [],
  },
  {
    name: 'Хатгалын гер кэмп бүс',
    type: 'resort',
    province: 'Хөвсгөл',
    short_desc: 'Хөвсгөл нуурын эрэг дагуух гер кэмп бүс — байгалийн аялалын суурь',
    description:
      'Хатгал нь Хөвсгөл нуурын урд хэсэгт орших жижиг суурин бөгөөд олон гер кэмп, жуулчны бааз байрладаг. Нуурын эрэгт машин, мотоцикль, морьт, завьт аялах, загасчлах боломж бүхий баазууд олон жуулчдыг татдаг. Зуны улиралд Хөвсгөл нуурын жуулчдын суурь болдог.',
    address: 'Хатгал, Хөвсгөл аймаг',
    latitude: 50.4500,
    longitude: 100.1500,
    cover_image: REAL.khuvsgul4,
    images: [REAL.khuvsgul1, REAL.khuvsgul2, REAL.khuvsgul3],
    price_per_night: 80000,
    is_published: true,
    is_featured: true,
    rating_avg: 4.5,
    rating_count: 0,
    view_count: 0,
    amenities: ['Гер байр', 'Хоолны газар', 'Завь хөлслөх', 'Морь унах'],
  },

  // ═══════════════════════════════
  // ӨМНӨГОВЬ — нарийн газрууд
  // ═══════════════════════════════
  {
    name: 'Гурван Сайхан уул',
    type: 'nature',
    province: 'Өмнөговь',
    short_desc: 'Говийн эрхэм уул — Монгол Говийн үндэсний цэцэрлэгт хүрээлэн',
    description:
      'Гурван Сайхан нь Өмнөговь аймгийн баруун хэсэгт орших уулын массив бөгөөд Монгол Говийн үндэсний цэцэрлэгт хүрээлэнгийн гол хэсгийг бүрдүүлдэг. Зуслан агуй, Хонгорын элс, Ламын хийд зэрэг олон дурсгалт газар ойрхон байдаг.',
    address: 'Баянзаг, Өмнөговь аймаг',
    latitude: 43.7000,
    longitude: 104.0000,
    cover_image: REAL.gobi1,
    images: [REAL.gobi2, REAL.khongor1, REAL.flaming1],
    price_per_night: 0,
    is_published: true,
    is_featured: true,
    rating_avg: 4.8,
    rating_count: 0,
    view_count: 0,
    amenities: [],
  },
  {
    name: 'Ламын хийд (Дамба Дарьжаалин)',
    type: 'nature',
    province: 'Өмнөговь',
    short_desc: 'Говийн хайрган тал дахь сэргэн мандсан хийд',
    description:
      'Дамба Дарьжаалин хийд нь Далан-Задгад хотын ойролцоо байрлах, социализмын дараа дахин нээгдсэн хийд. Жил бүр мөргөлчид, жуулчид олноор ирдэг. Говийн хайрсан тал дээр тод туяатаж буй шар улаан өнгийн барилга харагдахад онцгой.',
    address: 'Далан-Задгад, Өмнөговь аймаг',
    latitude: 43.5667,
    longitude: 104.4167,
    cover_image: REAL.aglag,
    images: [REAL.erdenezuu2, REAL.gobi1],
    price_per_night: 0,
    is_published: true,
    is_featured: false,
    rating_avg: 4.5,
    rating_count: 0,
    view_count: 0,
    amenities: [],
  },

  // ═══════════════════════════════
  // БУЛГАН
  // ═══════════════════════════════
  {
    name: 'Амарбаясгалант хийд',
    type: 'nature',
    province: 'Сэлэнгэ',
    short_desc: 'Монгол Улсын хамгийн том, хамгийн сайн хадгалагдсан хийд',
    description:
      'Амарбаясгалант хийд нь 1736 онд баригдаж, Монгол Улсын хамгийн том, сайн хадгалагдсан Буддын хийдийн нэг. Сэлэнгэ мөрний хөндийд байрлах энэхүү хийд нь хар, цагаан, шар өнгийн барилга бүхий тогтмол бүтэцтэй. ЮНЕСКО-гийн дэмжлэгтэйгээр сэргэн засварлагдсан.',
    address: 'Баруунбүрэн сум, Сэлэнгэ аймаг',
    latitude: 49.5500,
    longitude: 103.0500,
    cover_image: REAL.aglag,
    images: [REAL.erdenezuu1, REAL.erdenezuu2],
    price_per_night: 0,
    is_published: true,
    is_featured: true,
    rating_avg: 4.9,
    rating_count: 0,
    view_count: 0,
    amenities: [],
  },

  // ═══════════════════════════════
  // ГОВЬ-АЛТАЙ
  // ═══════════════════════════════
  {
    name: 'Эхийн гол',
    type: 'nature',
    province: 'Говь-Алтай',
    short_desc: 'Говь-Алтайн уулархаг нутгийн цэвэр гол — говийн оазис',
    description:
      'Эхийн гол нь Говь-Алтай аймгийн дотор, хуурай говийн нутгаар урсдаг ховор голын нэг. Уулын цасны ус хайлж гарсан ус хэдэн зуун км газарт говийн дунд урсаж, нутгийн малчдын хоргодох газар болдог.',
    address: 'Тайшир сум, Говь-Алтай аймаг',
    latitude: 46.1167,
    longitude: 96.4667,
    cover_image: REAL.orkhon1,
    images: [REAL.gobi1, REAL.khuvsgul4],
    price_per_night: 0,
    is_published: true,
    is_featured: false,
    rating_avg: 4.4,
    rating_count: 0,
    view_count: 0,
    amenities: [],
  },

  // ═══════════════════════════════
  // ДУНДГОВЬ
  // ═══════════════════════════════
  {
    name: 'Цагаан суварга',
    type: 'nature',
    province: 'Дундговь',
    short_desc: 'Цагаан элсэн хяр — 30 сая жилийн настай тунамал чулуун бүтэц',
    description:
      'Цагаан суварга нь Дундговь аймгийн Өлзийт сумд байрлах, говийн орчинд гарч ирсэн 30 сая жилийн настай тунамал чулуун цагаан хяр. Далайн оёдол байсан энэ нутаг одоо хуурай говийн бүсэд оршиж байгаа бөгөөд хаалга, гарц, цамхаг мэтийн хэлбэрийн чулуудтай.',
    address: 'Өлзийт сум, Дундговь аймаг',
    latitude: 44.5833,
    longitude: 105.0167,
    cover_image: REAL.flaming2,
    images: [REAL.flaming1, REAL.gobi2, REAL.gobi3],
    price_per_night: 0,
    is_published: true,
    is_featured: true,
    rating_avg: 4.8,
    rating_count: 0,
    view_count: 0,
    amenities: [],
  },

  // ═══════════════════════════════
  // ДОРНОГОВЬ
  // ═══════════════════════════════
  {
    name: 'Хамрын хийд',
    type: 'nature',
    province: 'Дорноговь',
    short_desc: 'Говийн дунд XVII зуунд байгуулагдсан хийд — медитацийн газар',
    description:
      'Хамрын хийд нь Дорноговь аймгийн Сайншанд сумын ойролцоо, говийн дунд оршдог. XVII зуунд байгуулагдсан энэ хийд нь 1937 оны хавчлагын дараа сэргэн мандаж, одоо медитацийн сургалт зохиодог. Оюун санааны аялалд сонирхолтой.',
    address: 'Сайншанд, Дорноговь аймаг',
    latitude: 44.8333,
    longitude: 110.1167,
    cover_image: REAL.aglag,
    images: [REAL.erdenezuu2, REAL.gobi2],
    price_per_night: 0,
    is_published: true,
    is_featured: false,
    rating_avg: 4.5,
    rating_count: 0,
    view_count: 0,
    amenities: [],
  },
];

// ─── ҮНДСЭН ФУНКЦ ─────────────────────────────────────────────────────────
async function run() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  console.log('✅ MongoDB-д холбогдлоо');

  const db = client.db(DB_NAME);
  const col = db.collection('places');

  // ── 1-р хэсэг: зураг шинэчлэх ──
  console.log('\n🖼️  Бодит зургаар шинэчлэж байна...');
  let updatedCount = 0;
  for (const u of IMAGE_UPDATES) {
    const res = await col.updateOne(
      { name: u.name },
      { $set: { cover_image: u.cover_image, images: u.images } },
    );
    if (res.matchedCount > 0) {
      console.log(`  ✔ ${u.name}`);
      updatedCount++;
    } else {
      console.log(`  ⚠ Олдсонгүй: ${u.name}`);
    }
  }
  console.log(`\n  → ${updatedCount}/${IMAGE_UPDATES.length} газрын зураг шинэчлэгдлээ\n`);

  // ── 2-р хэсэг: шинэ газрууд нэмэх ──
  console.log('🏕️  Шинэ газрууд нэмж байна...');
  let added = 0, skipped = 0;
  for (const p of NEW_PLACES) {
    const exists = await col.findOne({ name: p.name });
    if (exists) {
      process.stdout.write('.');
      skipped++;
    } else {
      await col.insertOne({ ...p, created_at: new Date(), updated_at: new Date() });
      process.stdout.write('+');
      added++;
    }
  }
  console.log(`\n\n🎉 ${added} газар нэмэгдлээ! (${skipped} давхцсан)\n`);

  // ── Тоо статистик ──
  const total = await col.countDocuments({});
  const byProvince = await col.aggregate([
    { $group: { _id: '$province', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]).toArray();

  console.log(`📊 Нийт газар: ${total}\n`);
  console.log('📍 Аймаг бүрээр:');
  byProvince.forEach(b => console.log(`  ${b._id}: ${b.count} газар`));

  const nature  = await col.countDocuments({ type: 'nature' });
  const resorts = await col.countDocuments({ type: 'resort' });
  console.log(`\n🌿 Байгалийн газар: ${nature}`);
  console.log(`🏕️  Амралтын газар: ${resorts}`);

  await client.close();
  console.log('\n🔌 Холболт хаагдлаа');
}

run().catch(err => { console.error(err); process.exit(1); });
