/**
 * Одоо байгаа газруудын зургийг бодит Wikimedia Commons зургаар солих
 */
import { MongoClient } from 'mongodb';

const URI = 'mongodb+srv://zenitht19:***REMOVED***@cluster0.wietegr.mongodb.net/mng-resorts?retryWrites=true&w=majority';
const W = 'https://upload.wikimedia.org/wikipedia/commons/thumb';

const R = {
  khuvsgul1:   `${W}/a/a9/Khuvsgul.jpg/1200px-Khuvsgul.jpg`,
  khuvsgul2:   `${W}/f/f2/Hovsgol.jpg/1200px-Hovsgol.jpg`,
  khuvsgul3:   `${W}/c/cb/Panoramic_view_of_Lake_Kh%C3%B6vsg%C3%B6l.jpg/1200px-Panoramic_view_of_Lake_Kh%C3%B6vsg%C3%B6l.jpg`,
  khuvsgul4:   `${W}/0/00/Mongolian_arats_at_the_lake.jpg/1200px-Mongolian_arats_at_the_lake.jpg`,
  orkhon1:     `${W}/6/63/Orchon-mongolei.JPG/1200px-Orchon-mongolei.JPG`,
  orkhon2:     `${W}/3/38/Ulaan_Tsutgalan_Waterfall.jpg/1200px-Ulaan_Tsutgalan_Waterfall.jpg`,
  tsutgalan:   `${W}/2/2d/Ulaan_tsutgalan%2C_Mongolia.jpg/1200px-Ulaan_tsutgalan%2C_Mongolia.jpg`,
  erdenezuu1:  `${W}/1/1d/Erdene-Zuu.jpg/1200px-Erdene-Zuu.jpg`,
  erdenezuu2:  `${W}/c/c6/Erdene_Zuu_Monastery_07.jpg/1200px-Erdene_Zuu_Monastery_07.jpg`,
  kharkhorin:  `${W}/4/41/View_of_Kharkhorin.jpg/1200px-View_of_Kharkhorin.jpg`,
  terelj1:     `${W}/b/b6/Gorkhi-Terelj_National_Park.jpg/1200px-Gorkhi-Terelj_National_Park.jpg`,
  terelj2:     `${W}/8/8a/Turtle_Rock_2025.jpg/1200px-Turtle_Rock_2025.jpg`,
  terelj3:     `${W}/1/1e/Gorkhi-Terelj_National_Park_75.JPG/1200px-Gorkhi-Terelj_National_Park_75.JPG`,
  terelj4:     `${W}/c/c8/Terelj_National_Park%2C_Mongolia_%2811441698893%29.jpg/1200px-Terelj_National_Park%2C_Mongolia_%2811441698893%29.jpg`,
  khongor1:    `${W}/0/04/Khongoryn_Els_04.jpg/1200px-Khongoryn_Els_04.jpg`,
  khongor2:    `${W}/e/e0/Khongoryn_Els_10.jpg/1200px-Khongoryn_Els_10.jpg`,
  flaming1:    `${W}/d/d7/Flaming_cliffs_5.jpg/1200px-Flaming_cliffs_5.jpg`,
  flaming2:    `${W}/4/49/Resized_pan-flaming-cropped2.jpg/1200px-Resized_pan-flaming-cropped2.jpg`,
  gobi1:       `${W}/6/6c/Gobi_desert_at_%C3%96mn%C3%B6govi%2C_Mongolia.jpg/1200px-Gobi_desert_at_%C3%96mn%C3%B6govi%2C_Mongolia.jpg`,
  gobi2:       `${W}/9/9e/Gobi_Desert%2C_Mongolia_%2835132252920%29.jpg/1200px-Gobi_Desert%2C_Mongolia_%2835132252920%29.jpg`,
  gobi3:       `${W}/c/c9/Gobi_desert_at_Dundgovi%2C_Mongolia.jpg/1200px-Gobi_desert_at_Dundgovi%2C_Mongolia.jpg`,
  aglag:       `${W}/1/13/AglagButelKhiid.jpg/1200px-AglagButelKhiid.jpg`,
  clouds:      `${W}/4/4d/Rainy_clouds_over_Lake_Kh%C3%B6vsg%C3%B6l.jpg/1200px-Rainy_clouds_over_Lake_Kh%C3%B6vsg%C3%B6l.jpg`,
  ta_orkhon:   'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2f/00/0c/df/the-orkhon-waterfall.jpg',
  ta_orkhon2:  'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2f/00/0e/3d/the-orkhon-waterfall.jpg',
  ta_erdene:   'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2f/00/27/e2/erdene-zuu-monastery.jpg',
  ta_juulchin: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2e/d7/77/43/caption.jpg',
  kh1:         'https://ak-d.tripcdn.com/images/0200l12000c1qpja6B640_R_960_660_R5_D.jpg',
  kh2:         'https://ak-d.tripcdn.com/images/0202512000c1qbn2zF97F_R_960_660_R5_D.jpg',
  kh3:         'https://ak-d.tripcdn.com/images/0202412000c1qttdv76FD_R_960_660_R5_D.jpg',
};

// name → { cover_image, images }
const UPDATES = [
  // Хөвсгөл
  { name: 'Хөвсгөл нуур — Монголын далай',          ci: R.khuvsgul1, imgs: [R.khuvsgul2, R.khuvsgul3, R.khuvsgul4] },
  { name: 'Жанхай — Хөвсгөлийн Ган голт',            ci: R.khuvsgul3, imgs: [R.khuvsgul1, R.khuvsgul4] },
  { name: 'Жанхай — Хөвсгөлийн тайга',               ci: R.khuvsgul4, imgs: [R.khuvsgul3, R.khuvsgul1] },
  { name: 'Цаатан ардын нутаг — Цагааннуур',          ci: R.khuvsgul2, imgs: [R.khuvsgul4, R.khuvsgul3] },

  // Орхон
  { name: 'Орхоны хөндий — ЮНЕСКО Дэлхийн өв',       ci: R.orkhon1,   imgs: [R.ta_orkhon, R.orkhon2, R.tsutgalan] },
  { name: 'Орхоны хүрхрээ',                           ci: R.orkhon2,   imgs: [R.tsutgalan, R.orkhon1, R.ta_orkhon] },
  { name: 'Орхоны хүрхрээ жуулчны баaz',              ci: R.ta_orkhon, imgs: [R.orkhon1, R.orkhon2] },

  // Эрдэнэ зуу / Харахорум
  { name: 'Эрдэнэзуу хийд — Хархорин',               ci: R.erdenezuu1, imgs: [R.erdenezuu2, R.ta_erdene, R.kharkhorin] },

  // Тэрэлж
  { name: 'Горхи-Тэрэлж үндэсний цэцэрлэгт хүрээлэн', ci: R.terelj1, imgs: [R.terelj2, R.terelj3, R.terelj4] },
  { name: 'Хустайн нуруу — Тахийн нутаг',             ci: R.terelj1,  imgs: [R.orkhon1, R.khuvsgul4] },
  { name: 'Тэрэлж Жуулчны Баaz Голомт',               ci: R.terelj3,  imgs: [R.terelj1, R.terelj4] },
  { name: 'Тэрэлж Голомт Жуулчны Баaz',               ci: R.terelj3,  imgs: [R.terelj1, R.terelj4] },
  { name: 'Тэрэлж Ханхой Ресорт',                     ci: R.terelj4,  imgs: [R.terelj1, R.terelj3, R.ta_juulchin] },
  { name: 'Тэрэлж ресорт (Juulchin)',                  ci: R.ta_juulchin, imgs: [R.terelj1, R.terelj3, R.terelj4] },
  { name: 'Мэлхий чулуу (Тэрэлж)',                    ci: R.terelj2,  imgs: [R.terelj1, R.terelj3] },

  // Хонгорын элс
  { name: 'Хонгорын элс — Дуулах элс',                ci: R.khongor1, imgs: [R.khongor2, R.gobi1, R.gobi2] },
  { name: 'Хонгорын элс Говь Ресорт',                 ci: R.khongor2, imgs: [R.khongor1, R.gobi1] },

  // Говь шарласан газрууд
  { name: 'Баянзаг — Цахилгаант хад',                 ci: R.flaming1, imgs: [R.flaming2, R.gobi1] },
  { name: 'Хэрмэн цав',                               ci: R.flaming2, imgs: [R.flaming1, R.gobi2] },
  { name: 'Цагаан суварга',                           ci: R.flaming2, imgs: [R.flaming1, R.gobi2, R.gobi3] },
  { name: 'Цагаан суварга — Цагаан сувд',             ci: R.flaming1, imgs: [R.flaming2, R.gobi1] },
  { name: 'Говийн наран жуулчны баaz',                 ci: R.gobi1,   imgs: [R.gobi2, R.khongor2] },
  { name: 'Говийн Наран Жуулчны Баaz',                 ci: R.gobi1,   imgs: [R.gobi2, R.khongor2] },
  { name: 'Эхийн Голын Аялал Жуулчлалын Баaz',         ci: R.gobi2,   imgs: [R.gobi1, R.orkhon1] },
  { name: 'Шаргийн Говь — Элсний талбай',              ci: R.gobi3,   imgs: [R.gobi1, R.gobi2] },

  // Архангай
  { name: 'Хорго-Тэрхийн Цагаан нуурын байгалийн цогцолбор', ci: R.clouds, imgs: [R.khuvsgul2, R.orkhon1] },
  { name: 'Хорго галт уул',                           ci: R.gobi2,   imgs: [R.flaming1, R.khongor1] },
  { name: 'Цэнхэрийн халуун рашаан',                  ci: R.kh1,     imgs: [R.kh2, R.kh3] },
  { name: 'Чулуутын гол — Хавцал',                    ci: R.orkhon1, imgs: [R.khuvsgul4, R.terelj1] },

  // Хийд / оюун санаа
  { name: 'Аглаг бүтэлийн хийд',                      ci: R.aglag,   imgs: [R.erdenezuu2] },
  { name: 'Хамрын хийд',                              ci: R.aglag,   imgs: [R.erdenezuu2, R.gobi2] },
  { name: 'Хамрын Хийд',                              ci: R.aglag,   imgs: [R.erdenezuu2, R.gobi1] },
  { name: 'Ламын хийд (Дамба Дарьжаалин)',             ci: R.aglag,   imgs: [R.erdenezuu2, R.gobi1] },
  { name: 'Амарбаясгалант хийд',                       ci: R.aglag,   imgs: [R.erdenezuu1, R.erdenezuu2] },

  // Увс, Хяргас
  { name: 'Увс нуур — ЮНЕСКО Дэлхийн өв',             ci: R.khuvsgul1, imgs: [R.khuvsgul3, R.gobi1] },
  { name: 'Увс нуур',                                  ci: R.khuvsgul2, imgs: [R.khuvsgul1, R.gobi1] },
  { name: 'Хяргас нуур',                               ci: R.khuvsgul3, imgs: [R.khuvsgul1, R.khuvsgul4] },

  // Хан Хужирт
  { name: 'Хан Хужирт рашаан сувилал',                 ci: R.kh1,     imgs: [R.kh2, R.kh3] },
  { name: 'Элма рашаан сувилал',                       ci: R.kh2,     imgs: [R.kh1, R.kh3] },
  { name: 'Эдр рашаан сувилал',                        ci: R.kh3,     imgs: [R.kh2, R.kh1] },
  { name: 'Нарийн Тээлийн рашаан',                     ci: R.kh2,     imgs: [R.kh1, R.orkhon1] },

  // Баруун Монгол
  { name: 'Таван Богд уул',                            ci: R.khuvsgul3, imgs: [R.khuvsgul2, R.orkhon1] },
  { name: 'Цамбагарав уул',                            ci: R.clouds,   imgs: [R.khuvsgul3, R.khuvsgul2] },
  { name: 'Потанины мөсөн гол',                        ci: R.khuvsgul3, imgs: [R.clouds, R.khuvsgul2] },
  { name: 'Цаган Гол байгалийн нөөц газар',            ci: R.khuvsgul4, imgs: [R.khuvsgul2, R.orkhon1] },

  // Дорнод хэсэг
  { name: 'Буйр нуур',                                 ci: R.khuvsgul1, imgs: [R.khuvsgul4, R.gobi1] },
  { name: 'Менэнгийн тал — Нутаг тал',                 ci: R.gobi2,   imgs: [R.gobi3, R.orkhon1] },
];

const client = new MongoClient(URI);
await client.connect();
console.log('✅ MongoDB-д холбогдлоо\n🖼️  Зургуудыг шинэчилж байна...');

const col = client.db('mng-resorts').collection('places');
let ok = 0, miss = 0;
for (const u of UPDATES) {
  const r = await col.updateOne(
    { name: u.name },
    { $set: { cover_image: u.ci, images: u.imgs } },
  );
  if (r.matchedCount > 0) { console.log(`  ✔ ${u.name}`); ok++; }
  else                     { console.log(`  ⚠ ${u.name}`); miss++; }
}

console.log(`\n✅ ${ok} газрын зураг бодит болгогдлоо`);
console.log(`⚠  ${miss} газар олдсонгүй (нэр зөрсөн байж болно)`);
await client.close();
