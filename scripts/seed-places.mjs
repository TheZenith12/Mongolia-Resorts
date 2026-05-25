// Монгол Улсын 21 аймгийн газруудыг MongoDB-д оруулах
// node scripts/seed-places.mjs

import { MongoClient } from 'mongodb';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
try {
  const env = readFileSync(join(__dirname, '../.env.local'), 'utf8');
  for (const line of env.split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  }
} catch {}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error('MONGODB_URI олдсонгүй'); process.exit(1); }

const DB_NAME = MONGODB_URI.split('/').pop()?.split('?')[0] ?? 'mng-resorts';

const places = [


  // АРХАНГАЙ
  {
    name: 'Тэрхийн Цагаан нуур',
    type: 'nature', province: 'Архангай',
    short_desc: 'Галт уулын гаралтай цэнгэг усны нуур — Хангайн эрдэнэ',
    description: 'Тэрхийн Цагаан нуур нь 61 км² талбайтай, галт уулын дэлбэрэлтээс үүссэн цэнгэг усны нуур. Дунд нь Хуйтэн Хад арал байх бөгөөд загасчлал, хийморьт тэргэвчин аялал хийхэд тохиромжтой.',
    address: 'Тариат сум, Архангай аймаг', latitude: 48.1667, longitude: 99.6167,
    cover_image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    price_per_night: 0, is_published: true, is_featured: true,
    rating_avg: 4.8, rating_count: 0, view_count: 0, images: [], amenities: [],
  },
  {
    name: 'Хорго-Тэрхийн Цагаан нуурын байгалийн цогцолбор',
    type: 'nature', province: 'Архангай',
    short_desc: 'Галт уул, нуур, ойн гайхамшигт цогцолбор',
    description: 'Хорго дархан цаазат газар нь Тэрхийн Цагаан нуурын ойролцоо, 120 агуйтай галт уул, ой тайга, нуурын гайхамшигт хослолтой. Жилийн дөрвөн улиралд аялалд тохиромжтой.',
    address: 'Тариат сум, Архангай аймаг', latitude: 48.1833, longitude: 99.8167,
    cover_image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
    price_per_night: 0, is_published: true, is_featured: false,
    rating_avg: 4.7, rating_count: 0, view_count: 0, images: [], amenities: [],
  },
  {
    name: 'Цэнхэрийн халуун рашаан',
    type: 'resort', province: 'Архангай',
    short_desc: 'Байгалийн халуун рашаан — эрүүл мэндийн амралт',
    description: '86°C хүртэл халдаг байгалийн хүхэрт рашаан. Арьс, яс, үе мөчний өвчинд тустай гэгддэг. Ойролцоогоор олон амралтын газар, гэр буудлууд ажилладаг.',
    address: 'Цэнхэр сум, Архангай аймаг', latitude: 47.5167, longitude: 101.6167,
    cover_image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    price_per_night: 80000, is_published: true, is_featured: true,
    rating_avg: 4.6, rating_count: 0, view_count: 0, images: [], amenities: ['Халуун рашаан', 'Хоол', 'Гэр буудал', 'WiFi'],
  },
  {
    name: 'Архангай Тэнгэр жуулчны баaz',
    type: 'resort', province: 'Архангай',
    short_desc: 'Хангайн нуруун дэргэд ногоон хөгшин модны сүүдэрт амрах',
    description: 'Тэрхийн Цагаан нуурын эрэгт байрлах орчин үеийн жуулчны баaz. Монгол гэр, байшин өрөөтэй, морин аялал, загасчлал, усан аялал зохион байгуулдаг.',
    address: 'Тариат сум, Архангай аймаг', latitude: 48.1500, longitude: 99.6500,
    cover_image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
    price_per_night: 120000, is_published: true, is_featured: false,
    rating_avg: 4.4, rating_count: 0, view_count: 0, images: [], amenities: ['Гэр буудал', 'Хоол', 'Морин аялал', 'WiFi', 'Угаалгын өрөө'],
  },


  // БАЯН-ӨЛГИЙ
  {
    name: 'Таван Богд уул',
    type: 'nature', province: 'Баян-Өлгий',
    short_desc: 'Монголын хамгийн өндөр оргил — 4374м',
    description: 'Таван Богдын нуруу нь Монгол, Орос, Хятадын хилийн уулзварт оршдог. Хүйтэн оргил (4374м) нь Монголын хамгийн өндөр цэг. Уулчлал, мөсөн голын аялалд дэлхийн хэмжээний жуулчдыг татдаг.',
    address: 'Цэнгэл сум, Баян-Өлгий аймаг', latitude: 49.1500, longitude: 87.8167,
    cover_image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
    price_per_night: 0, is_published: true, is_featured: true,
    rating_avg: 4.9, rating_count: 0, view_count: 0, images: [], amenities: [],
  },
  {
    name: 'Потанины мөсөн гол',
    type: 'nature', province: 'Баян-Өлгий',
    short_desc: 'Монголын урт хамгийн урт мөсөн гол',
    description: 'Потанины мөсөн гол нь Таван Богдын нурууны хамгийн том мөсөн гол. Мөсөн голын аялал, хавтгай өндөрлөгийн уулчлал хийхийг хүсэгчдэд тохиромжтой.',
    address: 'Цэнгэл сум, Баян-Өлгий аймаг', latitude: 49.1833, longitude: 87.9500,
    cover_image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800',
    price_per_night: 0, is_published: true, is_featured: false,
    rating_avg: 4.8, rating_count: 0, view_count: 0, images: [], amenities: [],
  },
  {
    name: 'Бүргэдчин соёлын жуулчны баaz',
    type: 'resort', province: 'Баян-Өлгий',
    short_desc: 'Казах бүргэдчин ястаны нутагт соёлын аялал',
    description: 'Казах бүргэдчин гэр бүлийн дэргэд амьдрах, бүргэдээр ан хийх, казахын уламжлалт хоол идэх өвөрмөц туршлага. Жил бүр 10 сард Өлгий хотод бүргэдчинний наадам болдог.',
    address: 'Өлгий хот, Баян-Өлгий аймаг', latitude: 48.9686, longitude: 89.9632,
    cover_image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
    price_per_night: 150000, is_published: true, is_featured: true,
    rating_avg: 4.7, rating_count: 0, view_count: 0, images: [], amenities: ['Хоол', 'Гэр буудал', 'Соёлын аялал', 'Бүргэдчлэх'],
  },


  // БАЯНХОНГОР
  {
    name: 'Их Богд уул',
    type: 'nature', province: 'Баянхонгор',
    short_desc: 'Гоби Алтайн хамгийн өндөр оргил — 3957м',
    description: 'Гоби Алтайн нурууны хамгийн өндөр оргил Их Богд (3957м) нь Баянхонгор, Говь-Алтай аймгийн хилд оршдог. Дархан цаазат газар бөгөөд ховор амьтад, ургамал нутаглана.',
    address: 'Баян-Овоо сум, Баянхонгор аймаг', latitude: 45.5833, longitude: 100.5000,
    cover_image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800',
    price_per_night: 0, is_published: true, is_featured: false,
    rating_avg: 4.6, rating_count: 0, view_count: 0, images: [], amenities: [],
  },
  {
    name: 'Цагаан агуй',
    type: 'nature', province: 'Баянхонгор',
    short_desc: 'Эрт дээр үеийн хүний ул мөртэй агуй',
    description: '700,000 жилийн тэртээ эрт дээр үеийн хүн оршин сууж байсан агуй. Гурав дахь давхрын агуйгаас хамгийн эртний хүний чулуун зэвсэг, ясны олдворууд гарсан.',
    address: 'Баянлиг сум, Баянхонгор аймаг', latitude: 44.8667, longitude: 100.5833,
    cover_image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800',
    price_per_night: 0, is_published: true, is_featured: false,
    rating_avg: 4.5, rating_count: 0, view_count: 0, images: [], amenities: [],
  },


  // ГОВЬ-АЛТАЙ
  {
    name: 'Их Газрын чулуу',
    type: 'nature', province: 'Говь-Алтай',
    short_desc: 'Говийн гайхамшиг — базальт чулуун хот',
    description: '60 км урт, 20 км өргөн талбайд сунасан базальт чулуун массив. Ховор ан амьтад, ургамал нутаглах ба онцгой геологийн бүрэлдэхүүнтэй. Уулчдад, фото зурагчдад тохиромжтой.',
    address: 'Дэлгэр сум, Говь-Алтай аймаг', latitude: 45.5333, longitude: 96.5333,
    cover_image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800',
    price_per_night: 0, is_published: true, is_featured: false,
    rating_avg: 4.5, rating_count: 0, view_count: 0, images: [], amenities: [],
  },


  // ДОРНОД
  {
    name: 'Буйр нуур',
    type: 'nature', province: 'Дорнод',
    short_desc: 'Монгол-Хятадын хилийн дагуух том давстай нуур',
    description: 'Буйр нуур нь талбайгаараа Монгол Улсын хоёрдугаар том нуур. Загасчлал, ан агнуур, нүүдэлчин амьдралтай танилцах аялал хийхэд тохиромжтой.',
    address: 'Халхгол сум, Дорнод аймаг', latitude: 47.8167, longitude: 117.7333,
    cover_image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800',
    price_per_night: 0, is_published: true, is_featured: false,
    rating_avg: 4.4, rating_count: 0, view_count: 0, images: [], amenities: [],
  },
  {
    name: 'Дорнод тал хээрийн амралт',
    type: 'resort', province: 'Дорнод',
    short_desc: 'Зүүн монголын хязгааргүй тал дунд',
    description: 'Монголын зүүн тал хээрийн дунд байрлах жуулчны баaz. Морин аялал, нүүдэлчин гэр бүлийн амьдралтай танилцах, загасчлал зохион байгуулдаг.',
    address: 'Чойбалсан хот, Дорнод аймаг', latitude: 48.0767, longitude: 114.5353,
    cover_image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
    price_per_night: 90000, is_published: true, is_featured: false,
    rating_avg: 4.2, rating_count: 0, view_count: 0, images: [], amenities: ['Гэр буудал', 'Хоол', 'Морин аялал'],
  },


  // ДУНДГОВЬ
  {
    name: 'Цагаан суварга',
    type: 'nature', province: 'Дундговь',
    short_desc: 'Тэнгис далайн эртний ёроолын чулуун хот',
    description: '60 сая жилийн тэртээ тэнгис далайн ёроол байсан газар. Хайлж, шатаж, ялзарч хувирсан олон тооны чулуун баганууд, хавцал, хадан хэрмүүд байгалийн онцгой үзэмжийг бүрдүүлдэг.',
    address: 'Өлзийт сум, Дундговь аймаг', latitude: 44.7833, longitude: 104.0833,
    cover_image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800',
    price_per_night: 0, is_published: true, is_featured: true,
    rating_avg: 4.7, rating_count: 0, view_count: 0, images: [], amenities: [],
  },


  // ЗАВХАН
  {
    name: 'Отгонтэнгэр уул',
    type: 'nature', province: 'Завхан',
    short_desc: 'Монголын эрэгтэй тахилгат уул — 4008м',
    description: 'Отгонтэнгэр уул (4008м) нь Хангайн нурууны хамгийн өндөр оргил. Монголчуудын эрэгтэй тахилгат уул гэж тоотгодог. Оргилдоо мөнх цас, дархан цаазат газар.',
    address: 'Тэс сум, Завхан аймаг', latitude: 47.7500, longitude: 97.3333,
    cover_image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
    price_per_night: 0, is_published: true, is_featured: false,
    rating_avg: 4.7, rating_count: 0, view_count: 0, images: [], amenities: [],
  },
  {
    name: 'Тэлмэн нуур',
    type: 'nature', province: 'Завхан',
    short_desc: 'Хангайн нурууны тэвэрт байгалийн цэвэр нуур',
    description: 'Тэлмэн нуур нь 192 км² талбайтай цэнгэг усны нуур. Нуурыг тойрсон хайлааснаас тогтсон ой, ховор шувуудын нутаглалтай. Загасчлал, хийморьт тэргэвчин аялалд тохиромжтой.',
    address: 'Тэлмэн сум, Завхан аймаг', latitude: 48.3500, longitude: 97.3000,
    cover_image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800',
    price_per_night: 0, is_published: true, is_featured: false,
    rating_avg: 4.5, rating_count: 0, view_count: 0, images: [], amenities: [],
  },


  // ӨВӨРХАНГАЙ
  {
    name: 'Орхоны хүрхрээ',
    type: 'nature', province: 'Өвөрхангай',
    short_desc: 'Монголын хамгийн том хүрхрээ — 20м унадаг',
    description: 'Орхон гол 20 метрийн өндрөөс унадаг Орхоны хүрхрээ нь Монголын хамгийн их мэддэг байгалийн үзэсгэлэн. Хүрхрээний орчимд жуулчны баazууд, морин аялал хийх боломжтой.',
    address: 'Хужирт сум, Өвөрхангай аймаг', latitude: 46.7500, longitude: 102.1167,
    cover_image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    price_per_night: 0, is_published: true, is_featured: true,
    rating_avg: 4.8, rating_count: 0, view_count: 0, images: [], amenities: [],
  },
  {
    name: 'Эрдэнэзуу хийд — Хархорин',
    type: 'nature', province: 'Өвөрхангай',
    short_desc: 'Монголын хамгийн эртний хийд, Дэлхийн өв',
    description: '1586 онд байгуулагдсан Эрдэнэзуу хийд нь ЮНЕСКО-гийн Дэлхийн өвд бүртгэгдсэн Орхоны хөндийн нэг хэсэг. 108 суварга, гурван сүм бүхий уг хийдийг жилд олон мянган жуулчин үзнэ.',
    address: 'Хархорин, Өвөрхангай аймаг', latitude: 47.1944, longitude: 102.8389,
    cover_image: 'https://images.unsplash.com/photo-1568454537842-d933259bb258?w=800',
    price_per_night: 0, is_published: true, is_featured: true,
    rating_avg: 4.9, rating_count: 0, view_count: 0, images: [], amenities: [],
  },
  {
    name: 'Орхоны хүрхрээ жуулчны баaz',
    type: 'resort', province: 'Өвөрхангай',
    short_desc: 'Хүрхрээний дэргэдэх гэр буудал',
    description: 'Орхоны хүрхрээний ойролцоо байрлах орчин үеийн жуулчны баaz. Монгол гэр, хашаа байшингаар хүлээн авна. Хүрхрээ болон орчимд морин аялал, хувцас зөөвөрлөлт зохион байгуулдаг.',
    address: 'Хужирт сум, Өвөрхангай аймаг', latitude: 46.7333, longitude: 102.0833,
    cover_image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
    price_per_night: 110000, is_published: true, is_featured: false,
    rating_avg: 4.4, rating_count: 0, view_count: 0, images: [], amenities: ['Гэр буудал', 'Хоол', 'Морин аялал', 'WiFi'],
  },


  // ӨМНӨГОВЬ
  {
    name: 'Хонгорын элс — Дуулах элс',
    type: 'nature', province: 'Өмнөговь',
    short_desc: 'Монголын хамгийн том элсэн манхан — 180км урт',
    description: 'Хонгорын элс нь 180 км урт, 27 км өргөн, 300 метр хүртэл өндөр элсэн манхан. Салхи шуурганы үед "дуулах" чимээ гаргадаг учраас Дуулах элс хэмээн нэршсэн. Тэмээгээр аялах хамгийн тохиромжтой газар.',
    address: 'Сэврэй сум, Өмнөговь аймаг', latitude: 43.7000, longitude: 102.5833,
    cover_image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800',
    price_per_night: 0, is_published: true, is_featured: true,
    rating_avg: 4.9, rating_count: 0, view_count: 0, images: [], amenities: [],
  },
  {
    name: 'Баянзаг — Цахилгаант хад',
    type: 'nature', province: 'Өмнөговь',
    short_desc: 'Динозаврын өндөг олдсон улаан хад — Галзуудсан хад',
    description: 'Баянзаг буюу "Цахилгаант хад" нь 1922 онд Roy Chapman Andrews динозаврын өндөг анх олсон газар. Улаан цохио хад чулуу, говийн өвөрмөц байгаль, ховор ургамалтай.',
    address: 'Булган сум, Өмнөговь аймаг', latitude: 44.1417, longitude: 103.7333,
    cover_image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800',
    price_per_night: 0, is_published: true, is_featured: true,
    rating_avg: 4.8, rating_count: 0, view_count: 0, images: [], amenities: [],
  },
  {
    name: 'Хэрмэн цав',
    type: 'nature', province: 'Өмнөговь',
    short_desc: 'Говийн Их хавцал — Монголын Гранд каньон',
    description: 'Хэрмэн цав нь 60 км урт, хэд хэдэн км өргөн хавцал. "Монголын Гранд Каньон" гэж нэрлэгддэг бөгөөд ховор амьтан, шувуудын нутаглалтай.',
    address: 'Хэрмэн цав, Өмнөговь аймаг', latitude: 43.3833, longitude: 103.3667,
    cover_image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800',
    price_per_night: 0, is_published: true, is_featured: false,
    rating_avg: 4.7, rating_count: 0, view_count: 0, images: [], amenities: [],
  },
  {
    name: 'Говийн наран жуулчны баaz',
    type: 'resort', province: 'Өмнөговь',
    short_desc: 'Говийн зүрхэнд тэмээ, элстэй амралт',
    description: 'Хонгорын элсний ойролцоо байрлах жуулчны баaz. Тэмээгээр элсэн манхан гарах, жуулчны багийн аялал зохион байгуулдаг. Орой нь одтой тэнгэрийн доор гал ярах тусгай хөтөлбөртэй.',
    address: 'Хонгорын элс, Өмнөговь аймаг', latitude: 43.7333, longitude: 102.6167,
    cover_image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
    price_per_night: 130000, is_published: true, is_featured: true,
    rating_avg: 4.6, rating_count: 0, view_count: 0, images: [], amenities: ['Гэр буудал', 'Хоол', 'Тэмээний аялал', 'Одон харах'],
  },


  // СҮХБААТАР
  {
    name: 'Дариганга нутаг',
    type: 'nature', province: 'Сүхбаатар',
    short_desc: 'Монголын зүүн говийн галт уулын нутаг',
    description: 'Дариганга нутаг нь 200 гаруй галт уулын тогоо, давстай нуурууд, ховор амьтадтай онцгой экосистем. Шилийн богд уул нь хамгийн өндөр оргил (1778м). Дариганга ястны уламжлалт соёл.',
    address: 'Дариганга сум, Сүхбаатар аймаг', latitude: 45.3833, longitude: 113.9167,
    cover_image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800',
    price_per_night: 0, is_published: true, is_featured: false,
    rating_avg: 4.5, rating_count: 0, view_count: 0, images: [], amenities: [],
  },


  // СЭЛЭНГЭ
  {
    name: 'Амарбаясгалант хийд',
    type: 'nature', province: 'Сэлэнгэ',
    short_desc: 'Монголын хамгийн бүрэн бүтэн хадгалагдсан хийд',
    description: '1727-1736 онд Манж хаант улсын үед барьсан Амарбаясгалант хийд нь архитектурын дурсгал. "Тайван баярын хийд" гэх утгатай. Монголын бурханы шашны уран барилгын тод жишээ.',
    address: 'Баруунхараа сум, Сэлэнгэ аймаг', latitude: 49.4667, longitude: 104.2000,
    cover_image: 'https://images.unsplash.com/photo-1568454537842-d933259bb258?w=800',
    price_per_night: 0, is_published: true, is_featured: true,
    rating_avg: 4.8, rating_count: 0, view_count: 0, images: [], amenities: [],
  },


  // ТӨВ АЙМАГ
  {
    name: 'Горхи-Тэрэлж үндэсний цэцэрлэгт хүрээлэн',
    type: 'nature', province: 'Төв',
    short_desc: 'Улаанбаатараас 55км — Монголын хамгийн алдартай аялалын газар',
    description: 'Горхи-Тэрэлж нь Монгол Улсын хамгийн том аялал жуулчлалын газар. Гранит хадан цохио, ой тайга, голын хөндий, тогтвортой байгальтай. Яст мэлхийн хад, Арийабал хийд зэрэг онцгой газруудтай.',
    address: 'Тэрэлж, Төв аймаг', latitude: 47.9789, longitude: 107.4519,
    cover_image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    price_per_night: 0, is_published: true, is_featured: true,
    rating_avg: 4.9, rating_count: 0, view_count: 0, images: [], amenities: [],
  },
  {
    name: 'Хустайн нуруу — Тахийн нутаг',
    type: 'nature', province: 'Төв',
    short_desc: 'Дэлхийд ганцхан зэрлэг адуу — Тахь харах',
    description: 'Хустайн нуруу дархан цаазат газар нь дэлхийн ганц зэрлэг адуу Тахийг байгальдаа буцааж нутагшуулсан газар. 1992 оноос хойш 300 гаруй Тахь нутаглаж байна.',
    address: 'Алтанбулаг сум, Төв аймаг', latitude: 47.7833, longitude: 105.8500,
    cover_image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800',
    price_per_night: 0, is_published: true, is_featured: true,
    rating_avg: 4.9, rating_count: 0, view_count: 0, images: [], amenities: [],
  },
  {
    name: 'Чингис хааны морьт хөшөөний цогцолбор',
    type: 'nature', province: 'Төв',
    short_desc: 'Дэлхийн хамгийн том морьт хөшөө — 40м өндөр',
    description: '40 метр өндөр ган бүтэцтэй энэ хөшөө нь Налайхаас 54км зайтай. Хөшөөний дотор музей, харах тавцан, морин хуурын тоглолт зохион байгуулдаг.',
    address: 'Цонжин болдог, Төв аймаг', latitude: 47.8083, longitude: 107.5333,
    cover_image: 'https://images.unsplash.com/photo-1568454537842-d933259bb258?w=800',
    price_per_night: 0, is_published: true, is_featured: true,
    rating_avg: 4.7, rating_count: 0, view_count: 0, images: [], amenities: [],
  },
  {
    name: 'Тэрэлж Жуулчны Баaz Голомт',
    type: 'resort', province: 'Төв',
    short_desc: 'Тэрэлжийн гол дээр ногоон байгальд амрах',
    description: 'Тэрэлж голын эрэгт байрлах орчин үеийн жуулчны баaz. Морин аялал, дугуйн аялал, хайкинг, загасчлал зохион байгуулдаг. Улаанбаатараас 1.5 цагийн зайтай.',
    address: 'Тэрэлж, Төв аймаг', latitude: 47.9500, longitude: 107.4000,
    cover_image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
    price_per_night: 160000, is_published: true, is_featured: true,
    rating_avg: 4.5, rating_count: 0, view_count: 0, images: [], amenities: ['Гэр буудал', 'Хоол', 'WiFi', 'Морин аялал', 'Дугуй', 'Угаалгын өрөө'],
  },
  {
    name: 'Тэрэлж Ханхой Ресорт',
    type: 'resort', province: 'Төв',
    short_desc: 'Тэрэлжийн хадан цохионы дэргэдэх тансаг амралт',
    description: 'Яст мэлхийн хадны ойролцоо байрлах тансаг зэргийн амралтын газар. Дулаан усны сан, спа, морин аялал, монгол гэрийн иж бүрэн үйлчилгээтэй.',
    address: 'Тэрэлж, Төв аймаг', latitude: 47.9700, longitude: 107.4300,
    cover_image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    price_per_night: 250000, is_published: true, is_featured: false,
    rating_avg: 4.7, rating_count: 0, view_count: 0, images: [], amenities: ['Гэр буудал', 'Хоол', 'WiFi', 'Усан сан', 'Спа', 'Морин аялал', 'Угаалгын өрөө'],
  },


  // УВС
  {
    name: 'Увс нуур — ЮНЕСКО Дэлхийн өв',
    type: 'nature', province: 'Увс',
    short_desc: 'Монголын хамгийн том нуур — давстай, усан шувуудын нутаг',
    description: 'Увс нуур (3350 км²) нь Монгол Улсын хамгийн том нуур бөгөөд ЮНЕСКО-гийн Дэлхийн байгалийн өвд бүртгэгдсэн. 200 гаруй зүйлийн шувуу нутаглах бөгөөд хамгийн ховор шувуудын нутаглалын газруудын нэг.',
    address: 'Увс нуур, Увс аймаг', latitude: 50.3333, longitude: 92.7500,
    cover_image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800',
    price_per_night: 0, is_published: true, is_featured: true,
    rating_avg: 4.8, rating_count: 0, view_count: 0, images: [], amenities: [],
  },


  // ХОВД
  {
    name: 'Хар ус нуур — Үндэсний цэцэрлэгт хүрээлэн',
    type: 'nature', province: 'Ховд',
    short_desc: 'Монголын баруун нутгийн гайхамшигт нуур',
    description: 'Хар ус нуур нь 1852 км² талбайтай шинэхэн усны нуур. Монгол Алтайн нурууны бэлд оршдог энэ нуур загасчлал, усан шувуу харах, байгалийн аялалд нэн тохиромжтой.',
    address: 'Ховд аймаг', latitude: 48.0500, longitude: 92.2500,
    cover_image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800',
    price_per_night: 0, is_published: true, is_featured: false,
    rating_avg: 4.6, rating_count: 0, view_count: 0, images: [], amenities: [],
  },


  // ХӨВСГӨЛ
  {
    name: 'Хөвсгөл нуур — Монголын далай',
    type: 'nature', province: 'Хөвсгөл',
    short_desc: 'Монгол Улсын 1-р цэвэр усны нуур — Тэнгисийн охин нуур',
    description: 'Хөвсгөл нуур нь дэлхийн цэнгэг усны 0.4%-ийг агуулдаг. 136 км урт, 262 метр гүн. Зуны улиралд аялал жуулчлал, өвлийн улиралд мөсөн дээр аялах боломжтой. Цаатан ардын нутаг ойролцоо оршдог.',
    address: 'Хатгал, Хөвсгөл аймаг', latitude: 50.4000, longitude: 100.4000,
    cover_image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    price_per_night: 0, is_published: true, is_featured: true,
    rating_avg: 4.9, rating_count: 0, view_count: 0, images: [], amenities: [],
  },
  {
    name: 'Жанхай — Хөвсгөлийн Ган голт',
    type: 'nature', province: 'Хөвсгөл',
    short_desc: 'Хөвсгөл нуураас урсан гарах голын хамгийн гоё хэсэг',
    description: 'Жанхай нь Хөвсгөл нуурын хойд эргийн ой тайга, уулын хөндий. Явган аялал хийхэд нэн тохиромжтой бөгөөд хамрын ан амьтад, шувуудыг ажиглаж болно.',
    address: 'Хатгал, Хөвсгөл аймаг', latitude: 51.1000, longitude: 100.2500,
    cover_image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
    price_per_night: 0, is_published: true, is_featured: false,
    rating_avg: 4.7, rating_count: 0, view_count: 0, images: [], amenities: [],
  },
  {
    name: 'Хөвсгөл нуурын Сарьдаг амралт',
    type: 'resort', province: 'Хөвсгөл',
    short_desc: 'Нуурын эрэгт байгалийн ойн дунд тансаг амралт',
    description: 'Хөвсгөл нуурын өмнөд эрэгт байрлах жуулчны баaz. Завиар нуур аялах, загасчлал, морин аялал, хайкинг, шөнийн маш гоё од харах боломжтой.',
    address: 'Хатгал тосгон, Хөвсгөл аймаг', latitude: 50.4333, longitude: 100.1667,
    cover_image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
    price_per_night: 180000, is_published: true, is_featured: true,
    rating_avg: 4.8, rating_count: 0, view_count: 0, images: [], amenities: ['Гэр буудал', 'Хоол', 'WiFi', 'Завь', 'Морин аялал', 'Загасчлал'],
  },
  {
    name: 'Цаатан ардын нутаг — Цагааннуур',
    type: 'nature', province: 'Хөвсгөл',
    short_desc: 'Хойд туйлын цаа бугачидтай Цаатан ардын нутаг',
    description: 'Монголын баруун хойд хэсэгт амьдардаг Цаатан ард нь цаа бугыг гэрийн амьтан болгон мал аж ахуй эрхэлдэг. Тэдний дэргэд хэдэн хоног байж, тэдний амьдралтай танилцах өвөрмөц аялал.',
    address: 'Цагааннуур сум, Хөвсгөл аймаг', latitude: 51.4000, longitude: 99.2000,
    cover_image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
    price_per_night: 0, is_published: true, is_featured: true,
    rating_avg: 4.9, rating_count: 0, view_count: 0, images: [], amenities: [],
  },


  // ХЭНТИЙ
  {
    name: 'Онон-Балжийн байгалийн цогцолбор',
    type: 'nature', province: 'Хэнтий',
    short_desc: 'Чингис хааны төрсөн нутаг — Онон голын хөндий',
    description: 'Онон гол нь Чингис хааны нутаг. Онон-Балжийн үндэсний цэцэрлэгт хүрээлэн нь ой тайга, голын хөндий, ховор амьтдын нутаглалтай. Загасчлал, морин аялалд нэн тохиромжтой.',
    address: 'Биндэр сум, Хэнтий аймаг', latitude: 48.7167, longitude: 110.5833,
    cover_image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
    price_per_night: 0, is_published: true, is_featured: true,
    rating_avg: 4.7, rating_count: 0, view_count: 0, images: [], amenities: [],
  },
  {
    name: 'Хэнтий нуруу',
    type: 'nature', province: 'Хэнтий',
    short_desc: 'Монгол-Оросын хилийн Хан Хэнтийн нуруу',
    description: 'Хэнтийн нуруу нь Монгол Улсын зүүн хойд хэсэгт, Оростой хиллэдэг. Хан Хэнтий дархан цаазат газарт ирвэс, хар баавгай, буга нутаглана.',
    address: 'Хэнтий аймаг', latitude: 48.5000, longitude: 109.0000,
    cover_image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
    price_per_night: 0, is_published: true, is_featured: false,
    rating_avg: 4.6, rating_count: 0, view_count: 0, images: [], amenities: [],
  },


  // ДОРНОГОВЬ
  {
    name: 'Хамрын хийд',
    type: 'nature', province: 'Дорноговь',
    short_desc: 'Говийн зүрхэнд оршдог будын шашны хийд',
    description: 'Хамрын хийд нь Сайншандаас 60км зайтай говийн дунд оршдог. Данзанравжаагийн дурсгалт газар бөгөөд зарим давхрын эрчим хүч хуримтлуулдаг гэж тооцогддог.',
    address: 'Хамрын хийд, Дорноговь аймаг', latitude: 44.4667, longitude: 110.3833,
    cover_image: 'https://images.unsplash.com/photo-1568454537842-d933259bb258?w=800',
    price_per_night: 0, is_published: true, is_featured: false,
    rating_avg: 4.5, rating_count: 0, view_count: 0, images: [], amenities: [],
  },


  // БУЛГАН
  {
    name: 'Булган голын хөндий',
    type: 'nature', province: 'Булган',
    short_desc: 'Хойд монголын ногоон хөндий — ойт нуга',
    description: 'Булган гол нь Орхон голд цутгана. Голын хөндий нь тарваган, буга зэрэг ховор амьтадтай, загасчлал, морин аялалд тохиромжтой.',
    address: 'Булган хот, Булган аймаг', latitude: 48.8000, longitude: 103.5167,
    cover_image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800',
    price_per_night: 0, is_published: true, is_featured: false,
    rating_avg: 4.3, rating_count: 0, view_count: 0, images: [], amenities: [],
  },


  // ОРХОН
  {
    name: 'Орхоны хөндий — ЮНЕСКО Дэлхийн өв',
    type: 'nature', province: 'Орхон',
    short_desc: 'Монголын эртний соёлын гол цөм — 1500 жилийн өв',
    description: 'Орхоны хөндий нь Монголын эртний нийслэлүүд, Хүннү, Тюрк, Монголын эзэнт гүрнүүдийн ул мөрийг агуулдаг. ЮНЕСКО Дэлхийн соёлын өвд бүртгэгдсэн.',
    address: 'Орхон аймаг', latitude: 47.5000, longitude: 102.8000,
    cover_image: 'https://images.unsplash.com/photo-1568454537842-d933259bb258?w=800',
    price_per_night: 0, is_published: true, is_featured: false,
    rating_avg: 4.6, rating_count: 0, view_count: 0, images: [], amenities: [],
  },


  // СЭЛЭНГЭ
  {
    name: 'Сэлэнгэ мөрний хөндий',
    type: 'nature', province: 'Сэлэнгэ',
    short_desc: 'Байгал нуурт цутгах Монголын хамгийн урт гол',
    description: 'Сэлэнгэ мөрөн нь 992 км урт, Монгол дахь хамгийн урт гол. Ойт хөндий, загасчлал, усны шувуу харах аялалд тохиромжтой.',
    address: 'Сэлэнгэ аймаг', latitude: 49.5000, longitude: 106.0000,
    cover_image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800',
    price_per_night: 0, is_published: true, is_featured: false,
    rating_avg: 4.4, rating_count: 0, view_count: 0, images: [], amenities: [],
  },


  // ГОВЬСҮМБЭР
  {
    name: 'Хасагт нуур',
    type: 'nature', province: 'Говьсүмбэр',
    short_desc: 'Говийн дунд байгалийн жижиг нуур',
    description: 'Говьсүмбэр аймгийн говийн хэсэгт байрлах Хасагт нуур нь ховор шувуудын нутаглалтай. Орчимд нь газарзүйн онцлог судалгаа хийх боломжтой.',
    address: 'Говьсүмбэр аймаг', latitude: 46.5000, longitude: 108.5000,
    cover_image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800',
    price_per_night: 0, is_published: true, is_featured: false,
    rating_avg: 4.0, rating_count: 0, view_count: 0, images: [], amenities: [],
  },

];

async function seed() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    console.log('connected');

    const db = client.db(DB_NAME);
    const col = db.collection('places');
    const del = await col.deleteMany({
      type: 'nature',
      price_per_night: 0,
      rating_count: 0,
      province: { $exists: true }
    });
    console.log(`  хуучин ${del.deletedCount} бичлэг устгагдлаа`);

    const now = new Date();
    const docs = places.map(p => ({ ...p, createdAt: now, updatedAt: now }));
    const result = await col.insertMany(docs);
    console.log(`${result.insertedCount} газар оруулагдлаа`);

    const byProvince = {};
    places.forEach(p => {
      byProvince[p.province] = (byProvince[p.province] ?? 0) + 1;
    });
    Object.entries(byProvince).sort().forEach(([province, count]) => {
      console.log(`  ${province}: ${count}`);
    });

  } catch (err) {
    console.error('алдаа:', err.message);
  } finally {
    await client.close();
  }
}

seed();
