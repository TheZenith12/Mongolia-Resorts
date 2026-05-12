/**
 * 🌿 Монгол Улсын бүх аймгийн үзэсгэлэнт газар + амралтын газрууд
 * Бодит зурагтай — node scripts/seed-all-places.mjs
 */

import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://zenitht19:***REMOVED***@cluster0.wietegr.mongodb.net/mng-resorts?retryWrites=true&w=majority';
const DB_NAME = 'mng-resorts';

// ─── Зурагны сан (Unsplash — Монголын байгальд тохирсон) ───────────────────
const IMG = {
  lake1:      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80',
  lake2:      'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=900&q=80',
  lake3:      'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=900&q=80',
  lake4:      'https://images.unsplash.com/photo-1548032885-b5e38734688a?w=900&q=80',
  mountain1:  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&q=80',
  mountain2:  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80',
  mountain3:  'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=900&q=80',
  mountain4:  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=900&q=80',
  glacier:    'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=900&q=80',
  desert1:    'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=900&q=80',
  desert2:    'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=900&q=80',
  desert3:    'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=900&q=80',
  desert4:    'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=900&q=80',
  steppe1:    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=900&q=80',
  steppe2:    'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=900&q=80',
  steppe3:    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=900&q=80',
  forest1:    'https://images.unsplash.com/photo-1448375240586-882707db888b?w=900&q=80',
  forest2:    'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=900&q=80',
  river1:     'https://images.unsplash.com/photo-1499363536502-87642509e31b?w=900&q=80',
  river2:     'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=900&q=80',
  cave:       'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=900&q=80',
  cliff:      'https://images.unsplash.com/photo-1510797215324-95aa89f43c33?w=900&q=80',
  monastery1: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=900&q=80',
  monastery2: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=900&q=80',
  resort1:    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&q=80',
  resort2:    'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=900&q=80',
  resort3:    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&q=80',
  resort4:    'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=900&q=80',
  resort5:    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&q=80',
  ger1:       'https://images.unsplash.com/photo-1580502304784-8985b7eb7260?w=900&q=80',
  ger2:       'https://images.unsplash.com/photo-1594495894542-a46cc73e081a?w=900&q=80',
  waterfall:  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80',
  volcano:    'https://images.unsplash.com/photo-1510797215324-95aa89f43c33?w=900&q=80',
  hotspring:  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&q=80',
  eagle:      'https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=900&q=80',
  horse:      'https://images.unsplash.com/photo-1534695215921-52c8cfd0957c?w=900&q=80',
  sunset:     'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=900&q=80',
  sand:       'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=900&q=80',
  rock:       'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&q=80',
};

const places = [

  // ═══════════════════════════════════════════════════
  // 1. АРХАНГАЙ
  // ═══════════════════════════════════════════════════
  {
    name: 'Тэрхийн Цагаан нуур', type: 'nature', province: 'Архангай',
    short_desc: 'Галт уулын гаралтай цэнгэг усны нуур — Хангайн эрдэнэ',
    description: 'Тэрхийн Цагаан нуур нь 61 км² талбайтай, галт уулын дэлбэрэлтээс үүссэн цэнгэг усны нуур юм. Дунд нь Хуйтэн Хад арал байх бөгөөд загасчлал, хийморьт тэргэвчин аялал, усан спорт хийхэд тохиромжтой. Зун нь ногоон эрэг, цэнхэр ус, намар нь улаан-шаргал ойгоор хүрээлэгддэг.',
    address: 'Тариат сум, Архангай аймаг', latitude: 48.1667, longitude: 99.6167,
    cover_image: IMG.lake1,
    images: [IMG.lake3, IMG.forest1, IMG.steppe1],
    price_per_night: 0, is_published: true, is_featured: true,
    rating_avg: 4.9, rating_count: 0, view_count: 0, amenities: [],
  },
  {
    name: 'Хорго галт уул', type: 'nature', province: 'Архангай',
    short_desc: 'Мянга гаруй жилийн настай унтарсан галт уул — 120 агуйтай',
    description: 'Хорго дархан цаазат газар нь Тэрхийн Цагаан нуурын хажууд орших унтарсан галт уул юм. 120 гаруй агуй, нүх бүхий хайлсан чулуулгийн орчин аялагчдыг их татдаг. Галт уулын оройноос Тэрхийн Цагаан нуурыг харах үзэмж гайхалтай.',
    address: 'Тариат сум, Архангай аймаг', latitude: 48.1900, longitude: 99.8200,
    cover_image: IMG.volcano,
    images: [IMG.cave, IMG.rock, IMG.lake1],
    price_per_night: 0, is_published: true, is_featured: false,
    rating_avg: 4.7, rating_count: 0, view_count: 0, amenities: [],
  },
  {
    name: 'Цэнхэрийн халуун рашаан', type: 'resort', province: 'Архангай',
    short_desc: '86°C-ийн байгалийн хүхэрт рашаан — эрүүл мэнд, амралт',
    description: 'Архангай аймгийн Цэнхэр суманд байрлах байгалийн халуун рашаан. 86°C хүртэл халдаг хүхэрт ус нь арьс, яс, үе мөчний өвчинд тустай. Ойролцоох ой тайга, Чулуутын гол, Цэнхэр голын хавийн байгаль нь нэмэлт татах хүч болдог.',
    address: 'Цэнхэр сум, Архангай аймаг', latitude: 47.5167, longitude: 101.6167,
    cover_image: IMG.hotspring,
    images: [IMG.resort1, IMG.forest2, IMG.river1],
    price_per_night: 90000, is_published: true, is_featured: true,
    rating_avg: 4.6, rating_count: 0, view_count: 0,
    amenities: ['Халуун рашаан', 'Хоол', 'Гэр буудал', 'WiFi', 'Явган аялал'],
  },
  {
    name: 'Чулуутын гол — Хавцал', type: 'nature', province: 'Архангай',
    short_desc: 'Базальт чулуулгийн гайхалтай хавцал, Монголын Grand Canyon',
    description: 'Чулуутын гол нь 800 м гүнтэй, 20 км урттай базальт чулуулгийн хавцлаар урсаж одог. Монголын "Grand Canyon" гэж нэрлэгддэг энэ газар рафтинг, хад авирах, загасчлалд тохиромжтой.',
    address: 'Чулуут сум, Архангай аймаг', latitude: 48.0500, longitude: 100.8000,
    cover_image: IMG.river2,
    images: [IMG.cliff, IMG.river1, IMG.mountain1],
    price_per_night: 0, is_published: true, is_featured: false,
    rating_avg: 4.6, rating_count: 0, view_count: 0, amenities: [],
  },
  {
    name: 'Тэнгэр Архангай Жуулчны Баaz', type: 'resort', province: 'Архангай',
    short_desc: 'Тэрхийн Цагаан нуурын эрэгт орчин үеийн амралтын газар',
    description: 'Тэрхийн Цагаан нуурын эрэгт байрлах энэ жуулчны баaz нь Монгол гэр, байшин өрөөтэй. Морин аялал, загасчлал, усан аялал, нуурын эрэгт зугаалах боломжтой. Гэрэлт хоол, орон нутгийн дур булаам хоол.',
    address: 'Тариат сум, Архангай аймаг', latitude: 48.1500, longitude: 99.6500,
    cover_image: IMG.ger1,
    images: [IMG.lake1, IMG.resort2, IMG.horse],
    price_per_night: 75000, is_published: true, is_featured: false,
    rating_avg: 4.4, rating_count: 0, view_count: 0,
    amenities: ['Монгол гэр', 'Хоол', 'Морин аялал', 'Загасчлал', 'WiFi'],
  },

  // ═══════════════════════════════════════════════════
  // 2. БАЯН-ӨЛГИЙ
  // ═══════════════════════════════════════════════════
  {
    name: 'Таван Богд уул', type: 'nature', province: 'Баян-Өлгий',
    short_desc: 'Монголын хамгийн өндөр оргил — мөнх цасны 5 оргилтой',
    description: 'Хүйтэн оргил (4374 м) зэрэг таван оргилоос бүрдэх Таван Богд нь Монгол, Орос, Хятадын хилийн уулзварт оршдог. Потанины болон Александрын мөсөн голтой, альпийн тэнхлэгийн уулын нуруу. Монголын хамгийн томоохон уулчлалын тавцан.',
    address: 'Цэнгэл сум, Баян-Өлгий аймаг', latitude: 49.1500, longitude: 87.8000,
    cover_image: IMG.mountain4,
    images: [IMG.glacier, IMG.mountain1, IMG.mountain3],
    price_per_night: 0, is_published: true, is_featured: true,
    rating_avg: 4.9, rating_count: 0, view_count: 0, amenities: [],
  },
  {
    name: 'Потанины мөсөн гол', type: 'nature', province: 'Баян-Өлгий',
    short_desc: 'Монголын хамгийн том мөсөн гол — 14 км урттай',
    description: 'Таван Богд уулын бэлд байрлах Потанины мөсөн гол нь Монголын хамгийн том 14 км урттай мөсөн гол. Хурдан хайлж байгаа энэхүү байгалийн гайхамшгийг дэлхийн олон уулчид, судлаачид зорин ирдэг.',
    address: 'Цэнгэл сум, Баян-Өлгий аймаг', latitude: 49.1000, longitude: 87.9000,
    cover_image: IMG.glacier,
    images: [IMG.mountain4, IMG.mountain1, IMG.lake2],
    price_per_night: 0, is_published: true, is_featured: false,
    rating_avg: 4.8, rating_count: 0, view_count: 0, amenities: [],
  },
  {
    name: 'Цаган Гол байгалийн нөөц газар', type: 'nature', province: 'Баян-Өлгий',
    short_desc: 'Хар сарьдагтай, Казах нутгийн соёл, бүргэдчинтэй уулзах',
    description: 'Цагаан гол дагуух энэ нөөц газар Казах бүргэдчид, хиргэсүүрийн чулуун хөшөөнүүд, өвгөн галт уулуудаараа алдартай. Намар тэнд бүргэдчинтэй хамт ан хийх тусгай аяллыг зохион байгуулж болно.',
    address: 'Цэнгэл сум, Баян-Өлгий аймаг', latitude: 49.3000, longitude: 88.0000,
    cover_image: IMG.eagle,
    images: [IMG.mountain3, IMG.steppe1, IMG.horse],
    price_per_night: 0, is_published: true, is_featured: false,
    rating_avg: 4.7, rating_count: 0, view_count: 0, amenities: [],
  },
  {
    name: 'Алтай Таван Богд Жуулчны Баaz', type: 'resort', province: 'Баян-Өлгий',
    short_desc: 'Уулын нурууны бэлд — бүргэдчин, тэмээний аялал',
    description: 'Баян-Өлгий аймгийн Алтайн нуруун дор байрлах энэ баaz нь Казах ардын уламжлалтай танилцах боломж олгодог. Уулын аялал, бүргэдчин уулзалт, морин аялал, Казах хоол зэргийг санал болгодог.',
    address: 'Өлгий сум, Баян-Өлгий аймаг', latitude: 48.9700, longitude: 89.9700,
    cover_image: IMG.resort4,
    images: [IMG.eagle, IMG.mountain3, IMG.ger2],
    price_per_night: 85000, is_published: true, is_featured: true,
    rating_avg: 4.5, rating_count: 0, view_count: 0,
    amenities: ['Гэр буудал', 'Бүргэдчин аялал', 'Морин аялал', 'Хоол', 'Гид'],
  },

  // ═══════════════════════════════════════════════════
  // 3. БАЯНХОНГОР
  // ═══════════════════════════════════════════════════
  {
    name: 'Их Богд уул', type: 'nature', province: 'Баянхонгор',
    short_desc: 'Говийн Алтайн нуруун хамгийн өндөр оргил (3957 м)',
    description: 'Говийн Алтайн нуруун хамгийн өндөр цэг болох Их Богд уул нь 3957 метр өндөр. Уулын бэлд хэд хэдэн нуур, рашаан булгаар хүрээлэгдсэн. Хан Хэнтий нуруутай хамт хамгийн аялагчдын дуртай газруудын нэг.',
    address: 'Баян-Өндөр сум, Баянхонгор аймаг', latitude: 45.5000, longitude: 100.4333,
    cover_image: IMG.mountain3,
    images: [IMG.mountain1, IMG.lake3, IMG.steppe2],
    price_per_night: 0, is_published: true, is_featured: false,
    rating_avg: 4.6, rating_count: 0, view_count: 0, amenities: [],
  },
  {
    name: 'Цагаан агуй', type: 'nature', province: 'Баянхонгор',
    short_desc: 'Доод палеолитийн үеийн хүний суурьшлын нотолгоо — 700,000 жил',
    description: 'Монгол Алтайн нуруун Цагаан агуй нь 700,000 жилийн настай хүний суурьшлын нотолгоо олдсон, дэлхийд ховор газруудын нэг. Агуйн доторх чулуун зэвсэг, амьтны яснуудыг музейд харуулдаг.',
    address: 'Баянлиг сум, Баянхонгор аймаг', latitude: 44.5000, longitude: 98.8000,
    cover_image: IMG.cave,
    images: [IMG.cliff, IMG.desert1, IMG.rock],
    price_per_night: 0, is_published: true, is_featured: false,
    rating_avg: 4.5, rating_count: 0, view_count: 0, amenities: [],
  },
  {
    name: 'Шаргийн Говь — Элсний талбай', type: 'nature', province: 'Баянхонгор',
    short_desc: 'Баянхонгорын алтан говийн элсэн дал — тогтуунаар дуугаррдаг элс',
    description: 'Баянхонгор аймгийн говийн бүсэд байрлах Шаргийн говь нь алтан шаргал элстэй, нарийн нам дор харагдах говийн ландшафттай. Тэмээний аялал, говийн байгальтай танилцах хамгийн тохиромжтой газруудын нэг.',
    address: 'Жинст сум, Баянхонгор аймаг', latitude: 44.2000, longitude: 100.6000,
    cover_image: IMG.desert3,
    images: [IMG.desert1, IMG.sand, IMG.steppe1],
    price_per_night: 0, is_published: true, is_featured: false,
    rating_avg: 4.3, rating_count: 0, view_count: 0, amenities: [],
  },

  // ═══════════════════════════════════════════════════
  // 4. БУЛГАН
  // ═══════════════════════════════════════════════════
  {
    name: 'Булган голын хөндий — Тайгийн ой', type: 'nature', province: 'Булган',
    short_desc: 'Хар мод, нарс, хуайсны тайга — Монголын хамгийн нягт ойн бүс',
    description: 'Булган аймгийн хойт нь Монголын хамгийн нягт ой тайгатай бүс нутаг. Булган, Орхон, Эг голуудын хөндийд загасчлал, ойн аялал, жуулчид олноор ирдэг.',
    address: 'Булган аймгийн төв', latitude: 48.8150, longitude: 103.5330,
    cover_image: IMG.forest2,
    images: [IMG.forest1, IMG.river1, IMG.steppe3],
    price_per_night: 0, is_published: true, is_featured: false,
    rating_avg: 4.3, rating_count: 0, view_count: 0, amenities: [],
  },
  {
    name: 'Их Тамирын рашаан', type: 'resort', province: 'Булган',
    short_desc: 'Байгалийн эрдэст рашаан — Хангайн бэлийн амралт',
    description: 'Булган аймгийн Их Тамирын голын хавийн байгалийн рашаан булаг. Ойр орчмын тайга, эрчимтэй урсдаг гол, ногоон нугын тусламжтайгаар эрүүл мэндийн амралт хийхэд хамгийн тохиромжтой.',
    address: 'Тэшиг сум, Булган аймаг', latitude: 49.5000, longitude: 103.2000,
    cover_image: IMG.resort1,
    images: [IMG.forest1, IMG.river2, IMG.ger1],
    price_per_night: 65000, is_published: true, is_featured: false,
    rating_avg: 4.2, rating_count: 0, view_count: 0,
    amenities: ['Рашаан', 'Гэр буудал', 'Хоол', 'Загасчлал'],
  },

  // ═══════════════════════════════════════════════════
  // 5. ГОВЬ-АЛТАЙ
  // ═══════════════════════════════════════════════════
  {
    name: 'Яломт агуй', type: 'nature', province: 'Говь-Алтай',
    short_desc: 'Монголын хамгийн урт агуй — 2000+ жилийн дурсгалтай',
    description: 'Говь-Алтай аймгийн Яломт агуй нь Монголын хамгийн урт, нарийн судлагдсан агуйнуудын нэг. Палеолитийн үеийн чулуун зэвсэг, агны амьтны ясны олдвор бүхий түүхч ач холбогдолтой газар.',
    address: 'Тайшир сум, Говь-Алтай аймаг', latitude: 46.5000, longitude: 96.3000,
    cover_image: IMG.cave,
    images: [IMG.cliff, IMG.rock, IMG.desert2],
    price_per_night: 0, is_published: true, is_featured: false,
    rating_avg: 4.4, rating_count: 0, view_count: 0, amenities: [],
  },
  {
    name: 'Их Газрын Чулуу — Шилийн нуруу', type: 'nature', province: 'Говь-Алтай',
    short_desc: 'Хоёр зуугаад чулуун цамхаг, хад асга, гайхамшигт говийн байгаль',
    description: 'Говь-Алтай аймгийн Их Газрын Чулуу нь хоёр зуугаад чулуун асга, агуй, нарийн жалгаараа аялагчдыг дарайлуулдаг. Монголын говийн харьцангуй нойтон цаг уурт тулгуурлан хэрмэн, зэрлэг ямаа, нохой чоно ийм газарт амьдардаг.',
    address: 'Тонхил сум, Говь-Алтай аймаг', latitude: 45.7000, longitude: 95.5000,
    cover_image: IMG.rock,
    images: [IMG.cliff, IMG.desert1, IMG.mountain2],
    price_per_night: 0, is_published: true, is_featured: false,
    rating_avg: 4.5, rating_count: 0, view_count: 0, amenities: [],
  },

  // ═══════════════════════════════════════════════════
  // 6. ДОРНОГОВЬ
  // ═══════════════════════════════════════════════════
  {
    name: 'Хамрын Хийд', type: 'nature', province: 'Дорноговь',
    short_desc: 'Говийн голомт — XIII зууны Буддийн хийд',
    description: 'Дорноговь аймгийн Хамрын хийд нь XIII зуунд баригдсан, одоо сэргэн мандаж буй буддын хийд. Шилийн дор уулын хормойд оршдог хийдийн ойролцоо нуур, рашаан булгуудтай байгалийн гайхамшигтай орчин.',
    address: 'Сайншанд сум, Дорноговь аймаг', latitude: 44.8000, longitude: 110.1300,
    cover_image: IMG.monastery2,
    images: [IMG.desert1, IMG.steppe2, IMG.monastery1],
    price_per_night: 0, is_published: true, is_featured: false,
    rating_avg: 4.5, rating_count: 0, view_count: 0, amenities: [],
  },
  {
    name: 'Цагаан суварга — Цагаан сувд', type: 'nature', province: 'Дорноговь',
    short_desc: 'Говийн цагаан шавар хадны гайхамшиг — Монголын Белый Мыс',
    description: 'Дундговь аймгийн Цагаан суварга нь эртний далайн ёроолоос гарч ирсэн цагаан өнгийн шавар хадны формаци. 30 метр өндөр цагаан суваргатай төстэй хадан бүрдэл нь харанхуйлахад гайхалтай харагддаг.',
    address: 'Эрдэнэдалай сум, Дундговь аймаг', latitude: 45.5500, longitude: 105.2000,
    cover_image: IMG.cliff,
    images: [IMG.desert3, IMG.rock, IMG.desert1],
    price_per_night: 0, is_published: true, is_featured: true,
    rating_avg: 4.7, rating_count: 0, view_count: 0, amenities: [],
  },

  // ═══════════════════════════════════════════════════
  // 7. ДОРНОД
  // ═══════════════════════════════════════════════════
  {
    name: 'Буйр нуур', type: 'nature', province: 'Дорнод',
    short_desc: 'Монгол-Хятадын хилийн дагуух том нуур — загасны баялаг',
    description: 'Буйр нуур нь 615 км² гадаргуутай, Монгол-Хятадын хиллийн нуур. Онгол загас, булга, туулайн ан агнуур, загасчлалаараа алдартай. Хавар намрын нүүдлийн шувуудын нүүдлийн чухал цэг.',
    address: 'Халхгол сум, Дорнод аймаг', latitude: 47.7800, longitude: 117.8200,
    cover_image: IMG.lake2,
    images: [IMG.lake4, IMG.steppe1, IMG.river1],
    price_per_night: 0, is_published: true, is_featured: false,
    rating_avg: 4.4, rating_count: 0, view_count: 0, amenities: [],
  },
  {
    name: 'Менэнгийн тал — Нутаг тал', type: 'nature', province: 'Дорнод',
    short_desc: 'Дэлхийн хамгийн том ан амьтны хамгаалалтын бүс — Монголын алтан нутаг',
    description: 'Дорнодын тал нь Монголын хамгийн том тэгш тал. Газарт нь харцага, тарвага, хар сүүлт буга нэмэгдэж байдаг. Хүрэн баавгай, чоно, үнэг, тоодог зэрэг ховор амьтад ч амьдардаг.',
    address: 'Халхгол сум, Дорнод аймаг', latitude: 47.5000, longitude: 115.5000,
    cover_image: IMG.steppe3,
    images: [IMG.steppe1, IMG.steppe2, IMG.sunset],
    price_per_night: 0, is_published: true, is_featured: false,
    rating_avg: 4.6, rating_count: 0, view_count: 0, amenities: [],
  },
  {
    name: 'Дорнод тал хээрийн амралт', type: 'resort', province: 'Дорнод',
    short_desc: 'Монголын алтан талын сэтгэл хөдлүүлэм орчинд амралт',
    description: 'Менэнгийн тал дунд байрлах энэ жуулчны баaz нь нүүдлийн Монгол соёлтой ойртох боломж олгодог. Морин аялал, тахийн аялал, нутгийн гэрэлт хоол, дуу бүжгийн тоглолт зэргийг санал болгодог.',
    address: 'Хэрлэн сум, Дорнод аймаг', latitude: 48.0000, longitude: 114.5000,
    cover_image: IMG.ger2,
    images: [IMG.steppe3, IMG.horse, IMG.resort2],
    price_per_night: 70000, is_published: true, is_featured: false,
    rating_avg: 4.3, rating_count: 0, view_count: 0,
    amenities: ['Гэр буудал', 'Морин аялал', 'Хоол', 'Үндэсний хоол', 'WiFi'],
  },

  // ═══════════════════════════════════════════════════
  // 8. ЗАВХАН
  // ═══════════════════════════════════════════════════
  {
    name: 'Отгонтэнгэр уул', type: 'nature', province: 'Завхан',
    short_desc: 'Монголын ариун уул — Хангайн нурууны хамгийн өндөр оргил (4008 м)',
    description: 'Монгол хүн ариун мэтэд хүндэлдэг Отгонтэнгэр уул нь 4008 метр өндөр, Хангайн нурууны хамгийн өндөр цэг. Мөнх цаст оргилыг жилийн дөрвөн улиралд үзэх боломжтой. Уулчлал, ариун шашны аялал хийхэд хамгийн тохиромжтой газар.',
    address: 'Отгон сум, Завхан аймаг', latitude: 47.7600, longitude: 97.3400,
    cover_image: IMG.mountain2,
    images: [IMG.glacier, IMG.mountain4, IMG.steppe2],
    price_per_night: 0, is_published: true, is_featured: true,
    rating_avg: 4.8, rating_count: 0, view_count: 0, amenities: [],
  },
  {
    name: 'Тэлмэн нуур', type: 'nature', province: 'Завхан',
    short_desc: 'Завхан аймгийн хамгийн том нуур — загасаар баян',
    description: 'Тэлмэн нуур нь Завхан аймгийн хамгийн том нуур бөгөөд загасчлал, усан шувуу ажиглахад онцгой газар. Уул нуруу, ногоон бэлчээрт хүрээлэгдсэн тайван нуур.',
    address: 'Тэлмэн сум, Завхан аймаг', latitude: 48.7800, longitude: 97.3200,
    cover_image: IMG.lake3,
    images: [IMG.lake4, IMG.steppe1, IMG.mountain1],
    price_per_night: 0, is_published: true, is_featured: false,
    rating_avg: 4.3, rating_count: 0, view_count: 0, amenities: [],
  },

  // ═══════════════════════════════════════════════════
  // 9. ОРХОН
  // ═══════════════════════════════════════════════════
  {
    name: 'Орхоны хөндий — ЮНЕСКО Дэлхийн өв', type: 'nature', province: 'Орхон',
    short_desc: 'Тюркийн хаадын ордон суурийн газар — дэлхийн соёлын өв',
    description: 'Орхоны хөндий нь ЮНЕСКО-ийн Дэлхийн соёлын өвд бүртгэлтэй. Монголын нүүдэлчдийн 2000 жилийн түүхийг агуулсан газар. Эртний нийслэл Хархорум, Эрдэнэзуу хийд, Тюркийн бичгийн хөшөөд энд оршдог.',
    address: 'Орхон аймгийн хойт хэсэг', latitude: 47.0000, longitude: 102.8000,
    cover_image: IMG.steppe1,
    images: [IMG.river1, IMG.monastery1, IMG.steppe3],
    price_per_night: 0, is_published: true, is_featured: true,
    rating_avg: 4.7, rating_count: 0, view_count: 0, amenities: [],
  },

  // ═══════════════════════════════════════════════════
  // 10. СЭЛЭНГЭ
  // ═══════════════════════════════════════════════════
  {
    name: 'Амарбаясгалант хийд', type: 'nature', province: 'Сэлэнгэ',
    short_desc: 'XVIII зууны гайхалтай уран барилга — Монголын хамгийн том хийд',
    description: 'Амарбаясгалант хийд нь 1727 онд барьж эхэлсэн, Манжийн Эзэн хааны зарлигаар барилцаж дуусгасан. 28 сүм дуган, Монгол, Хятад, Төвдийн уран барилгын хослолтой хийд. Монголын буддизмын гол тэнхлэгүүдийн нэг.',
    address: 'Баруунхараа сум, Сэлэнгэ аймаг', latitude: 49.4167, longitude: 104.0667,
    cover_image: IMG.monastery1,
    images: [IMG.monastery2, IMG.steppe2, IMG.mountain2],
    price_per_night: 0, is_published: true, is_featured: true,
    rating_avg: 4.8, rating_count: 0, view_count: 0, amenities: [],
  },
  {
    name: 'Сэлэнгэ мөрний хөндий', type: 'nature', province: 'Сэлэнгэ',
    short_desc: 'Загасчлал, усан аялал — Байгаль нуурт цутгадаг голын хөндий',
    description: 'Сэлэнгэ мөрөн нь Монголын хамгийн том гол, Байгаль нуурын гол цутгал. Голын хөндий дагуу загасчлал, рафтинг, шувуу ажиглах, байгалийн аялал хийхэд онцгой тохиромжтой.',
    address: 'Сүхбаатар хот, Сэлэнгэ аймаг', latitude: 50.2300, longitude: 106.2100,
    cover_image: IMG.river2,
    images: [IMG.river1, IMG.forest1, IMG.lake4],
    price_per_night: 0, is_published: true, is_featured: false,
    rating_avg: 4.4, rating_count: 0, view_count: 0, amenities: [],
  },

  // ═══════════════════════════════════════════════════
  // 11. СҮХБААТАР
  // ═══════════════════════════════════════════════════
  {
    name: 'Дариганга нутаг — Шилийн богд уул', type: 'nature', province: 'Сүхбаатар',
    short_desc: 'Галт уулын нутаг, Дариганга ардын уран бүтээл, нуурууд',
    description: 'Дариганга нутаг нь Монгол-Хятадын хилийн ойролцоо, унтарсан галт уулын нутаг. Шилийн богд уул, 40 гаруй нуур, эртний дурсгалт газруудаараа онцгой. Монгол Дарь Эхийн суурин соёл энд гүн хадгалагдсан.',
    address: 'Дариганга сум, Сүхбаатар аймаг', latitude: 45.3600, longitude: 113.9000,
    cover_image: IMG.steppe2,
    images: [IMG.lake3, IMG.volcano, IMG.steppe1],
    price_per_night: 0, is_published: true, is_featured: false,
    rating_avg: 4.5, rating_count: 0, view_count: 0, amenities: [],
  },

  // ═══════════════════════════════════════════════════
  // 12. ТӨВ АЙМАГ
  // ═══════════════════════════════════════════════════
  {
    name: 'Горхи-Тэрэлж үндэсний цэцэрлэгт хүрээлэн', type: 'nature', province: 'Төв',
    short_desc: 'Монголын хамгийн алдартай байгалийн цэцэрлэгт хүрээлэн — Улаанбаатараас 80 км',
    description: 'Горхи-Тэрэлж нь Улаанбаатараас ердөө 80 км зайтай, Монголын хамгийн олон жуулчин ирдэг газар. Том хаданцар, ногоон нугас, Тэрэлж голын хөндий нь хад авирах, морин аялал, пикник хийхэд гайхалтай.',
    address: 'Батсүмбэр сум, Төв аймаг', latitude: 47.8600, longitude: 107.4500,
    cover_image: IMG.mountain1,
    images: [IMG.river1, IMG.steppe1, IMG.cliff],
    price_per_night: 0, is_published: true, is_featured: true,
    rating_avg: 4.8, rating_count: 0, view_count: 0, amenities: [],
  },
  {
    name: 'Хустайн нуруу — Тахийн нутаг', type: 'nature', province: 'Төв',
    short_desc: 'Дэлхийд устсан тахийг буцаан нутагшуулсан — экологийн амжилт',
    description: 'Хустайн нуруу нь 1990-ээд оноос Монгол болон Европын хамтын хүчээр дэлхийд устаж байсан тахийг нутагшуулсан газар. Одоо 300 гаруй тахь нуруун бэлд сүрэглэн амьдарч байна. Орой бүр тахийн сүргийг харах боломжтой.',
    address: 'Алтанбулаг сум, Төв аймаг', latitude: 47.7200, longitude: 105.8700,
    cover_image: IMG.horse,
    images: [IMG.steppe2, IMG.mountain2, IMG.steppe3],
    price_per_night: 0, is_published: true, is_featured: true,
    rating_avg: 4.7, rating_count: 0, view_count: 0, amenities: [],
  },
  {
    name: 'Чингис хааны морьт хөшөөний цогцолбор', type: 'nature', province: 'Төв',
    short_desc: 'Дэлхийн хамгийн том морьт хөшөө — 40 метр өндөр ган хөшөө',
    description: '2008 онд барьсан 40 метр өндөр Чингис хааны ган морьт хөшөө дэлхийд хамгийн том морьт хөшөө юм. Хөшөөний дотор цузей, рестораны тавцан, дээр нь харах цэг байдаг. Улаанбаатараас 54 км.',
    address: 'Цонжин болдог, Төв аймаг', latitude: 47.8080, longitude: 107.5340,
    cover_image: IMG.steppe3,
    images: [IMG.steppe1, IMG.mountain2, IMG.sunset],
    price_per_night: 0, is_published: true, is_featured: true,
    rating_avg: 4.7, rating_count: 0, view_count: 0, amenities: [],
  },
  {
    name: 'Тэрэлж Ханхой Ресорт', type: 'resort', province: 'Төв',
    short_desc: 'Тэрэлжийн хаданцарт хүрээлэгдсэн тансаг амралтын газар',
    description: 'Горхи-Тэрэлж үндэсний цэцэрлэгт хүрээлэнгийн дотор байрлах орчин үеийн ресорт. Монгол гэр, log cabin, хад авирах, морин аялал, рафтинг, явган аялал зэрэг үйлчилгээтэй.',
    address: 'Тэрэлж, Төв аймаг', latitude: 47.8800, longitude: 107.4800,
    cover_image: IMG.resort3,
    images: [IMG.mountain1, IMG.resort1, IMG.ger2],
    price_per_night: 120000, is_published: true, is_featured: true,
    rating_avg: 4.7, rating_count: 0, view_count: 0,
    amenities: ['Монгол гэр', 'Log cabin', 'Хоол', 'Морин аялал', 'WiFi', 'Рафтинг', 'Хад авирах'],
  },
  {
    name: 'Тэрэлж Голомт Жуулчны Баaz', type: 'resort', province: 'Төв',
    short_desc: 'Тэрэлж голын эрэгт — Монгол гэрийн уламжлалт амралт',
    description: 'Тэрэлж голын эрэгт байрлах уламжлалт Монгол гэрийн баaz. Шатахуун болон хиамны хоол, морин аялал, нутгийн аялагч гидтэй хамт явах боломжтой.',
    address: 'Тэрэлж, Төв аймаг', latitude: 47.8600, longitude: 107.4600,
    cover_image: IMG.ger1,
    images: [IMG.resort2, IMG.steppe1, IMG.river1],
    price_per_night: 80000, is_published: true, is_featured: false,
    rating_avg: 4.4, rating_count: 0, view_count: 0,
    amenities: ['Монгол гэр', 'Хоол', 'Морин аялал', 'Гал тогоо'],
  },

  // ═══════════════════════════════════════════════════
  // 13. УВС
  // ═══════════════════════════════════════════════════
  {
    name: 'Увс нуур — ЮНЕСКО Дэлхийн өв', type: 'nature', province: 'Увс',
    short_desc: 'Монголын хамгийн том нуур — ЮНЕСКО-ийн нөөц газар',
    description: 'Увс нуур нь 3350 км² гадаргуутай Монголын хамгийн том нуур. ЮНЕСКО-ийн дэлхийн өвд бүртгэлтэй энэ нуур нь далайн гаралтай, маш давстай. 200 гаруй зүйлийн шувуу нэмэгдэг чухал цэг.',
    address: 'Увс аймгийн хойд хэсэг', latitude: 50.3000, longitude: 92.7500,
    cover_image: IMG.lake4,
    images: [IMG.lake1, IMG.steppe2, IMG.sunset],
    price_per_night: 0, is_published: true, is_featured: true,
    rating_avg: 4.7, rating_count: 0, view_count: 0, amenities: [],
  },
  {
    name: 'Хяргас нуур', type: 'nature', province: 'Увс',
    short_desc: 'Монголын гүн ус нуур — загасаар маш баян',
    description: 'Хяргас нуур нь Монголын 2 дахь том нуур бөгөөд маш тунгалаг усаараа, загасчлалаараа онцлог. Монголын хамгийн баян загасны нуур гэж тооцогддог.',
    address: 'Завхан аймаг', latitude: 49.1667, longitude: 93.3333,
    cover_image: IMG.lake3,
    images: [IMG.lake2, IMG.mountain1, IMG.steppe1],
    price_per_night: 0, is_published: true, is_featured: false,
    rating_avg: 4.5, rating_count: 0, view_count: 0, amenities: [],
  },

  // ═══════════════════════════════════════════════════
  // 14. ХОВД
  // ═══════════════════════════════════════════════════
  {
    name: 'Хар ус нуур — Үндэсний цэцэрлэгт хүрээлэн', type: 'nature', province: 'Ховд',
    short_desc: 'Монголын 3 дахь том нуур — Хар Ус нуурын байгалийн цогцолбор',
    description: 'Хар Ус нуур нь 1852 км² гадаргуутай Монголын 3 дахь том нуур. Нуурын хажуу орчим 3 нуур нийлсэн Хар Ус, Хар нуур, Дөрөг нуурын цогцолбор болдог. 200 зүйлийн шувуу, загасны баялаг нь орчин аялалд тохиромжтой.',
    address: 'Ховд аймгийн хойд хэсэг', latitude: 48.0000, longitude: 92.3000,
    cover_image: IMG.lake2,
    images: [IMG.lake4, IMG.steppe1, IMG.mountain3],
    price_per_night: 0, is_published: true, is_featured: false,
    rating_avg: 4.4, rating_count: 0, view_count: 0, amenities: [],
  },

  // ═══════════════════════════════════════════════════
  // 15. ХЭНТИЙ
  // ═══════════════════════════════════════════════════
  {
    name: 'Хан Хэнтий — Чингис хааны нутаг', type: 'nature', province: 'Хэнтий',
    short_desc: 'Чингис хааны төрсөн нутаг — Хэнтийн уулын нуруу',
    description: 'Хан Хэнтийн нуруу нь Чингис хааны бага насыг өнгөрөөсөн нутаг. Он нуур, Балжийн нуур, Хэрлэн гол зэргийн байгалийн гайхамшгийн эх. Хос загас, тайга, уул нуруу, ой шугуйн хосолсон байгаль.',
    address: 'Биндэр сум, Хэнтий аймаг', latitude: 48.7000, longitude: 109.5000,
    cover_image: IMG.forest2,
    images: [IMG.mountain2, IMG.river1, IMG.steppe3],
    price_per_night: 0, is_published: true, is_featured: false,
    rating_avg: 4.6, rating_count: 0, view_count: 0, amenities: [],
  },
  {
    name: 'Онон-Балжийн байгалийн цогцолбор', type: 'nature', province: 'Хэнтий',
    short_desc: 'Сибирийн тайга — Монгол газарт',
    description: 'Онон гол, Балж голын хавийн тайга ой нь Монголын хойт хэсгийн онцгой байгаль. Загасчлал, аглаг тайгад аялах, зэрлэг амьтан ажиглахад маш тохиромжтой.',
    address: 'Биндэр сум, Хэнтий аймаг', latitude: 49.1000, longitude: 110.6000,
    cover_image: IMG.forest1,
    images: [IMG.river2, IMG.forest2, IMG.lake3],
    price_per_night: 0, is_published: true, is_featured: false,
    rating_avg: 4.5, rating_count: 0, view_count: 0, amenities: [],
  },

  // ═══════════════════════════════════════════════════
  // 16. ХӨВСГӨЛ
  // ═══════════════════════════════════════════════════
  {
    name: 'Хөвсгөл нуур — Монголын далай', type: 'nature', province: 'Хөвсгөл',
    short_desc: 'Монголын хамгийн тунгалаг нуур — дэлхийн цэвэр усны 2%',
    description: 'Хөвсгөл нуур нь дэлхийн цэвэр усны 2%, Монголын нийт усны 70%-ийг хадгалдаг. 136 км урт, 2 км гүн, цэвэр цэнгэг усаа хадгалсаар байдаг. Цаатан ардын нутаг, Сарьдаг уул, Жанхай зэргийн орчин нь Монголын үзэсгэлэнт бүс нутаг.',
    address: 'Хатгал сум, Хөвсгөл аймаг', latitude: 51.0000, longitude: 100.5000,
    cover_image: IMG.lake1,
    images: [IMG.lake2, IMG.mountain3, IMG.forest2],
    price_per_night: 0, is_published: true, is_featured: true,
    rating_avg: 4.9, rating_count: 0, view_count: 0, amenities: [],
  },
  {
    name: 'Цаатан ардын нутаг — Цагааннуур', type: 'nature', province: 'Хөвсгөл',
    short_desc: 'Цаагийн маллагаатай Дукха ардын уламжлалт нутаг',
    description: 'Хөвсгөлийн Цагааннуур суманд амьдрах Цаатан (Дукха) ард цаагийн малтай нүүдэлчин амьдралаараа дэлхийд цөөхөн үлдсэн ард юм. 300 гаруй хүн л үлдсэн тэднийг зорин очих нь онцгой туршлага.',
    address: 'Цагааннуур сум, Хөвсгөл аймаг', latitude: 51.4500, longitude: 99.1700,
    cover_image: IMG.steppe2,
    images: [IMG.forest2, IMG.mountain3, IMG.horse],
    price_per_night: 0, is_published: true, is_featured: true,
    rating_avg: 4.8, rating_count: 0, view_count: 0, amenities: [],
  },
  {
    name: 'Жанхай — Хөвсгөлийн тайга', type: 'nature', province: 'Хөвсгөл',
    short_desc: 'Хуш, хус, гацуурын тайга — Монголын хамгийн нягт ойн бүс',
    description: 'Хөвсгөл нуурын эрэгт байрлах Жанхайн ойн бүс нь Монголын хамгийн нягт тайга ойн нэг. Нуурын шаргал намрын ойн хослол гайхалтай байгаль бүрдүүлдэг.',
    address: 'Хатгал сум, Хөвсгөл аймаг', latitude: 51.2000, longitude: 100.3000,
    cover_image: IMG.forest1,
    images: [IMG.forest2, IMG.lake1, IMG.mountain3],
    price_per_night: 0, is_published: true, is_featured: false,
    rating_avg: 4.6, rating_count: 0, view_count: 0, amenities: [],
  },
  {
    name: 'Хөвсгөл нуурын Сарьдаг амралт', type: 'resort', province: 'Хөвсгөл',
    short_desc: 'Хөвсгөл нуурын эрэгт — модон байшин, Монгол гэр',
    description: 'Хөвсгөл нуурын баруун эрэгт байрлах тансаг амралтын газар. Модон байшин, Монгол гэр, нуурын усан завины аялал, морин аялал зэргийг санал болгодог.',
    address: 'Хатгал сум, Хөвсгөл аймаг', latitude: 50.4000, longitude: 100.1600,
    cover_image: IMG.resort5,
    images: [IMG.lake1, IMG.resort3, IMG.forest1],
    price_per_night: 110000, is_published: true, is_featured: true,
    rating_avg: 4.7, rating_count: 0, view_count: 0,
    amenities: ['Нуурын эрэг', 'Модон байшин', 'Монгол гэр', 'Хоол', 'WiFi', 'Завины аялал'],
  },

  // ═══════════════════════════════════════════════════
  // 17. ӨВӨРХАНГАЙ
  // ═══════════════════════════════════════════════════
  {
    name: 'Орхоны хүрхрээ', type: 'nature', province: 'Өвөрхангай',
    short_desc: 'Монголын хамгийн том хүрхрээ — 20 метр өндрөөс унадаг',
    description: 'Орхон гол 20 метр өндрөөс унадаг Монголын хамгийн том хүрхрээ. Хүрхрээний тойром уул нуруу, ногоон нуга, ой шугуйгаар хүрээлэгдсэн гайхалтай байгаль. Зуны улиралд хамгийн үзэсгэлэнтэй байдаг.',
    address: 'Хужирт сум, Өвөрхангай аймаг', latitude: 46.7833, longitude: 102.0000,
    cover_image: IMG.waterfall,
    images: [IMG.river2, IMG.mountain2, IMG.forest1],
    price_per_night: 0, is_published: true, is_featured: true,
    rating_avg: 4.8, rating_count: 0, view_count: 0, amenities: [],
  },
  {
    name: 'Эрдэнэзуу хийд — Хархорин', type: 'nature', province: 'Өвөрхангай',
    short_desc: 'XVI зууны хийд — Чингис хааны нийслэл Хархорумын туурь',
    description: 'Эрдэнэзуу хийд нь 1586 онд Хархорумын туурин дээр барьсан Монголын хамгийн эртний хийдүүдийн нэг. 108 суварга, 3 том дуганд буддийн урлаг, уран зохиолын үнэт дурсгалууд хадгалагдаж байдаг.',
    address: 'Хархорин сум, Өвөрхангай аймаг', latitude: 47.2000, longitude: 102.8417,
    cover_image: IMG.monastery2,
    images: [IMG.monastery1, IMG.steppe1, IMG.river1],
    price_per_night: 0, is_published: true, is_featured: true,
    rating_avg: 4.8, rating_count: 0, view_count: 0, amenities: [],
  },
  {
    name: 'Нарийн Тээлийн рашаан', type: 'resort', province: 'Өвөрхангай',
    short_desc: 'Байгалийн рашаан, морин аялал, Орхоны хүрхрээтэй ойр',
    description: 'Орхоны хүрхрээний ойролцоо байрлах байгалийн рашааны амралтын газар. Морин аялал, Орхоны хүрхрээ үзэх, рашааны эмчилгээ хослуулан авах боломжтой.',
    address: 'Хужирт сум, Өвөрхангай аймаг', latitude: 46.8200, longitude: 102.0500,
    cover_image: IMG.hotspring,
    images: [IMG.resort1, IMG.waterfall, IMG.ger1],
    price_per_night: 75000, is_published: true, is_featured: false,
    rating_avg: 4.4, rating_count: 0, view_count: 0,
    amenities: ['Рашаан', 'Гэр буудал', 'Морин аялал', 'Хоол'],
  },

  // ═══════════════════════════════════════════════════
  // 18. ӨМНӨГОВЬ
  // ═══════════════════════════════════════════════════
  {
    name: 'Хонгорын элс — Дуулах элс', type: 'nature', province: 'Өмнөговь',
    short_desc: 'Монголын хамгийн том элсэн цөл — 180 км урт, 300 м өндөр',
    description: 'Хонгорын элс нь 180 км урт, 300 метр хүртэл өндөр Монголын хамгийн том элсэн дал. Хүчтэй салхинд элс "дуулдаг" учир "Дуулах элс" гэж нэрлэдэг. Элсний толгойгоос Говийн байгалийг харах нь мартагдашгүй.',
    address: 'Сэврэй сум, Өмнөговь аймаг', latitude: 43.6500, longitude: 102.4500,
    cover_image: IMG.desert1,
    images: [IMG.sand, IMG.desert3, IMG.desert2],
    price_per_night: 0, is_published: true, is_featured: true,
    rating_avg: 4.9, rating_count: 0, view_count: 0, amenities: [],
  },
  {
    name: 'Баянзаг — Цахилгаант хад', type: 'nature', province: 'Өмнөговь',
    short_desc: 'Улаан хадны байгаль — динозаврын өндгөний олдвор',
    description: 'Баянзаг нь улаан хадны формацитай, 1922 онд анх динозаврын өндгийг олсон газар. Говийн нар жаргах үед улаан шар болж гийдэг хаданцрыг "Flaming Cliffs" гэж дэлхийд алдартай.',
    address: 'Булган сум, Өмнөговь аймаг', latitude: 44.1400, longitude: 103.7200,
    cover_image: IMG.cliff,
    images: [IMG.desert1, IMG.rock, IMG.sunset],
    price_per_night: 0, is_published: true, is_featured: true,
    rating_avg: 4.8, rating_count: 0, view_count: 0, amenities: [],
  },
  {
    name: 'Хэрмэн цав', type: 'nature', province: 'Өмнөговь',
    short_desc: 'Монголын хамгийн том байгалийн хавцал — 60 км урт',
    description: 'Хэрмэн цав нь Говийн Алтайн бэлд, 60 км урт, 200-400 м гүнтэй байгалийн хавцал. Хавцлын хана дагуух эртний петроглиф, хиргэсүүрүүд онцгой ач холбогдолтой. Тэмээний аялалаар очих нь хамгийн тохиромжтой.',
    address: 'Цогт-Овоо сум, Өмнөговь аймаг', latitude: 43.6000, longitude: 104.7000,
    cover_image: IMG.desert4,
    images: [IMG.cliff, IMG.desert3, IMG.rock],
    price_per_night: 0, is_published: true, is_featured: false,
    rating_avg: 4.6, rating_count: 0, view_count: 0, amenities: [],
  },
  {
    name: 'Говийн Наран Жуулчны Баaz', type: 'resort', province: 'Өмнөговь',
    short_desc: 'Говийн зүрхэнд — тэмээний аялал, одны ажиглалт',
    description: 'Хонгорын элсний ойролцоо байрлах ресорт. Тэмээний аялал, элсний хагас давхраар гулгах, говийн одон орон харах (хамгийн гэрэл бага бүс), Монгол гэрт байрлах боломжтой.',
    address: 'Сэврэй сум, Өмнөговь аймаг', latitude: 43.7000, longitude: 102.5000,
    cover_image: IMG.resort2,
    images: [IMG.desert1, IMG.ger2, IMG.sand],
    price_per_night: 95000, is_published: true, is_featured: true,
    rating_avg: 4.6, rating_count: 0, view_count: 0,
    amenities: ['Монгол гэр', 'Тэмээний аялал', 'Хоол', 'Одны ажиглалт', 'Гид'],
  },
  {
    name: 'Хонгорын элс Говь Ресорт', type: 'resort', province: 'Өмнөговь',
    short_desc: 'Дуулах элсний хажуу — тансаг гэрт буудал',
    description: 'Хонгорын элсний хажуу хормойд байрлах тансаг Монгол гэрийн ресорт. Рестораны үйлчилгээ, дур булаам говийн байгалийн үзэмж, тэмээний аялал зэрэг бүрэн боломж бүхий ресорт.',
    address: 'Сэврэй сум, Өмнөговь аймаг', latitude: 43.6800, longitude: 102.4300,
    cover_image: IMG.ger2,
    images: [IMG.desert1, IMG.resort4, IMG.sand],
    price_per_night: 130000, is_published: true, is_featured: true,
    rating_avg: 4.8, rating_count: 0, view_count: 0,
    amenities: ['Тансаг гэр', 'Ресторан', 'Тэмээний аялал', 'WiFi', 'Агаар хабдар', 'Душ'],
  },
  {
    name: 'Эхийн Голын Аялал Жуулчлалын Баaz', type: 'resort', province: 'Өмнөговь',
    short_desc: 'Говийн цэвэр агаарт — тэмээ, морин аялал, говийн байгаль',
    description: 'Баянзагийн ойролцоо байрлах энэ жуулчны баaz нь Говийн Алтайн өвөрмөц байгальтай ойр. Тэмээний аялал, говийн гол дагуух хагалгаа, динозаврын олдворын газруудад очих боломжтой.',
    address: 'Мандалговь сум, Өмнөговь аймаг', latitude: 44.0000, longitude: 103.8000,
    cover_image: IMG.resort1,
    images: [IMG.desert2, IMG.ger1, IMG.cliff],
    price_per_night: 80000, is_published: true, is_featured: false,
    rating_avg: 4.3, rating_count: 0, view_count: 0,
    amenities: ['Гэр буудал', 'Тэмээний аялал', 'Хоол', 'Гид'],
  },
];

async function main() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    console.log('✅ MongoDB-д холбогдлоо');

    const db = client.db(DB_NAME);
    const col = db.collection('places');

    // Одоо байгаа бичлэгийн тоо
    const existing = await col.countDocuments({});
    console.log(`📊 Одоо байгаа газар: ${existing}`);

    // Зөвхөн шинэ газруудыг нэмнэ (бүхлээр устгахгүй)
    let added = 0;
    let skipped = 0;
    for (const place of places) {
      const exists = await col.findOne({ name: place.name, province: place.province });
      if (!exists) {
        await col.insertOne({ ...place, createdAt: new Date(), updatedAt: new Date() });
        added++;
        process.stdout.write('.');
      } else {
        skipped++;
      }
    }

    console.log(`\n\n🎉 ${added} газар нэмэгдлээ! (${skipped} давхцсан, алгасав)`);
    console.log(`📊 Нийт газар: ${existing + added}`);

    // Аймаг бүрийн тоо
    const byProvince = await col.aggregate([
      { $group: { _id: '$province', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).toArray();

    console.log('\n📍 Аймаг бүрээр:');
    byProvince.forEach(p => console.log(`  ${p._id}: ${p.count} газар`));

    const total = await col.countDocuments({});
    const nature = await col.countDocuments({ type: 'nature' });
    const resort = await col.countDocuments({ type: 'resort' });
    console.log(`\n🌿 Байгалийн газар: ${nature}`);
    console.log(`🏕️  Амралтын газар: ${resort}`);
    console.log(`📊 Нийт: ${total} газар`);

  } finally {
    await client.close();
    console.log('\n🔌 Холболт хаагдлаа');
  }
}

main().catch(console.error);
