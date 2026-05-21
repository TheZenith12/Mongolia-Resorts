/**
 * Бүх газрыг зөв зураг, мэдээллээр шинэчлэх
 * node scripts/update-all-places.mjs
 */
import mongoose from 'mongoose';
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

const PlaceSchema = new mongoose.Schema({}, { strict: false, collection: 'places' });
const Place = mongoose.models.Place || mongoose.model('Place', PlaceSchema);

// ── Устгах газрууд (давхардсан / тест) ───────────────────────────────────────
const DELETE_SLUGS = [
  'sfdf',
  'khorgo-galt-uul',                    // Хорго-Тэрхийн цогцолборт давхардсан
  'khamrin-khiid-2',                    // Хамрын Хийд давхардал
  'goviin-naran-juulchni-baaz-2',       // давхардал
  'goviin-naran-juulchni-baaz-2-2',     // давхардал
  'ikh-gazrin-chuluu',                  // Их Газрын Чулуу-тай давхардал
  'yalomt-agui',                        // Яломт агуй давхардал
  'tsagaan-agui',                       // Цагаан агуй давхардал (Байгалийн гайхамшиг хувилбар байна)
  'bulgan-golin-khondii',               // Тайгийн ой хувилбар байна
  'khovsgol-nuurin-zuun-ereg-ayalal',   // Хөвсгөл нуурт давхардсан
  'tsaatan-evyenk-buural-nutag',        // Цаатан ардын нутагт давхардсан
  'khustain-nuruu-takh-tejeekh-gazar',  // Хустайн нуруу давхардал
  'jankhai-khovsgoliin-taiga',          // Жанхай давхардал
  'jankhai-nuur',                       // Жанхай давхардал
  'selenge-mornii-ereg-ayalal',         // Сэлэнгэ давхардал
  'uvs-nuur',                           // Увс нуур ЮНЕСКО давхардал
  'terelj-golomt-juulchni-baaz',        // Тэрэлж Голомт давхардал
  'terelj-ryesort-juulchin',            // давхардал
  'khasagt-nuur',                       // Говийн оазис хувилбар байна
  'tsagaan-suvarga-tsagaan-suvd',       // Цагаан суварга давхардал
  'nariin-teel-khar-nuurin-amral',      // Нарийн Тээлийн рашаантай давхардал
  'khokh-nuur-dornod',                  // давхардал
  'dariganga-nutag',                    // Шилийн Богдтой давхардал
];

// ── Шинэчлэх газрууд ─────────────────────────────────────────────────────────
const UPDATES = [

  // ═══════════════════════════════════════════════════════════
  // АРХАНГАЙ
  // ═══════════════════════════════════════════════════════════
  {
    slug: 'terkhiin-tsagaan-nuur',
    cover_image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Terkhiin_Tsagaan_Nuur.jpg/1280px-Terkhiin_Tsagaan_Nuur.jpg',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Terkhiin_Tsagaan_Nuur.jpg/1280px-Terkhiin_Tsagaan_Nuur.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Terkhiin_Tsagaan_Nuur_2.jpg/1280px-Terkhiin_Tsagaan_Nuur_2.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Khorgo_volcano_Mongolia.jpg/1280px-Khorgo_volcano_Mongolia.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Terkhiin_Tsagaan_Nuur_Mongolia.jpg/1280px-Terkhiin_Tsagaan_Nuur_Mongolia.jpg',
    ],
    short_desc: 'Архангай аймгийн Тэрхийн Цагаан нуур нь галт уулын дэлбэрэлтээс үүссэн цэвэр цэнгэгт ус бүхий гайхамшигт нуур.',
    description: 'Тэрхийн Цагаан нуур нь Архангай аймгийн Тариат суманд оршдог, далайн түвшнээс 2060 метр өндөрт байрлах галт уулын гаралтай нуур юм. 16 км урт, 4-6 км өргөн энэ нуур нь Монголын хамгийн үзэсгэлэнт нууруудын нэг. Нуурын баруун эрэгт Хорго галт уул, зүүн эрэгт ЮНЕСКО-ийн Дэлхийн өвд бүртгэгдсэн Орхоны хөндий ойрхон. Ус нь маш тунгалаг бөгөөд олон төрлийн загас, шувуу амьдардаг. Жил бүр мянга мянган жуулчдыг татдаг энэ газарт загасчлал, сэлэлт, морин аялал хийх боломжтой. Ойролцоо Цэнхэр халуун рашаан, Тариат сум байдаг.',
  },
  {
    slug: 'khorgo-terkhiin-tsagaan-nuurin-baigaliin-tsogtsolbor',
    cover_image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Khorgo_volcano_Mongolia.jpg/1280px-Khorgo_volcano_Mongolia.jpg',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Khorgo_volcano_Mongolia.jpg/1280px-Khorgo_volcano_Mongolia.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Terkhiin_Tsagaan_Nuur.jpg/1280px-Terkhiin_Tsagaan_Nuur.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Terkhiin_Tsagaan_Nuur_2.jpg/1280px-Terkhiin_Tsagaan_Nuur_2.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Terkhiin_Tsagaan_Nuur_Mongolia.jpg/1280px-Terkhiin_Tsagaan_Nuur_Mongolia.jpg',
    ],
    short_desc: 'Хорго-Тэрхийн Цагаан нуурын байгалийн цогцолбор нь Монголын хамгийн гоё галт уул, нуурын хосолсон байгалийн дурсгалт газар.',
    description: 'Хорго-Тэрхийн Цагаан нуурын байгалийн цогцолбор нь Хорго унтарсан галт уул болон Тэрхийн Цагаан нуурыг хамардаг онцгой байгалийн цогцолбор юм. Хорго уул нь 2965 метр өндөрт, Тэрхийн Цагаан нуурын хойд эрэгт байрладаг бөгөөд оройн хонгилоор дамжин 15 метр гүн агуйд орж болно. Лаав чулуун хавтгай, нуурын тэнгэр гийгүүлсэн гоо үзэсгэлэн зочдыг гайхшруулдаг. Байгалийн цогцолборт 100 гаруй төрлийн шувуу амьдардаг. Зуны улиралд гэр буудал, аялал жуулчлал өргөн дэлгэрдэг.',
  },
  {
    slug: 'tsenkheriin-khaluun-rashaan',
    cover_image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Tsenkher_hot_spring_Mongolia.jpg/1280px-Tsenkher_hot_spring_Mongolia.jpg',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Tsenkher_hot_spring_Mongolia.jpg/1280px-Tsenkher_hot_spring_Mongolia.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Terkhiin_Tsagaan_Nuur.jpg/1280px-Terkhiin_Tsagaan_Nuur.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Arkhangai_landscape.jpg/1280px-Arkhangai_landscape.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Mongolia_steppe.jpg/1280px-Mongolia_steppe.jpg',
    ],
    short_desc: 'Цэнхэрийн халуун рашаан нь 86°C хүрэх эрдэст ус бүхий Монголын алдартай эмчилгээний рашаан.',
    description: 'Цэнхэрийн халуун рашаан нь Архангай аймгийн Цэнхэр суманд оршдог бөгөөд 86 хэм хүрэх халуун рашаантай байдаг. Рашааны ус нь натри, кальци, хүхрийн нэгдэл агуулсан бөгөөд булчин, яс үе мөчний өвчин, арьс, мэдрэлийн эмгэгт сайн нөлөөтэй. Архангайн нурууны ой тайгын дунд байрлах энэ газарт жуулчны бааз, ариун цэврийн газар, рашааны бассейн тавьсан байдаг. Тэнд хүрэхийн тулд Цэцэрлэгийн замаар 100 гаруй км явах шаардлагатай. Зун, намрын улиралд онцгой алдартай.',
  },
  {
    slug: 'ogiin-nuur',
    cover_image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Ogii_Lake_Mongolia.jpg/1280px-Ogii_Lake_Mongolia.jpg',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Ogii_Lake_Mongolia.jpg/1280px-Ogii_Lake_Mongolia.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Ogii_nuur.jpg/1280px-Ogii_nuur.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Mongolia_steppe.jpg/1280px-Mongolia_steppe.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Arkhangai_landscape.jpg/1280px-Arkhangai_landscape.jpg',
    ],
    short_desc: 'Огийн нуур нь Монгол нутгийн загасчлал, шувуу ажиглалтаар алдаршсан том нуур.',
    description: 'Огийн нуур нь Архангай аймгийн Хайрхан суманд оршдог, 25 км урт, 15 км өргөн Монголын хамгийн том нуурын нэг юм. Нуурт 15 гаруй төрлийн загас амьдардаг бөгөөд загасчдын диваажин болдог. 200 гаруй зүйлийн шувуу нуурын эрэгт нүүдэллэдэг тул шувуу ажиглагчдад маш таатай. Нуурын эрэгт хэд хэдэн жуулчны баaz байдаг. Улаанбаатараас 300 гаруй км зайтай.',
  },
  {
    slug: 'chuluutin-gol-khavtsal',
    cover_image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Chuluut_River.jpg/1280px-Chuluut_River.jpg',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Chuluut_River.jpg/1280px-Chuluut_River.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Chuluut_canyon.jpg/1280px-Chuluut_canyon.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Chuluut_River_Mongolia.jpg/1280px-Chuluut_River_Mongolia.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Arkhangai_landscape.jpg/1280px-Arkhangai_landscape.jpg',
    ],
    short_desc: 'Чулуутын голын хавцал нь 40 метр гүн, 20-30 метр өргөн базальт чулуун хавцлаараа алдартай гоо үзэсгэлэнт байгаль.',
    description: 'Чулуутын голын хавцал нь Архангай аймгийн Өлзийт суманд байрладаг бөгөөд 40 метр гүн базальт чулуун хавцлаар алдартай. Хавцалд Чулуут гол харанхуй довжоонтойгоор урсдаг бөгөөд зуны аадар бороо орсны дараа ногоон ус туунтуу цацрахыг үзэхэд нэн гайхалтай. Голын дагуу морин аялал хийх, рафтинг хийх боломжтой. Ойрхон Цэнхэр рашаан байдаг тул хослуулан зочлох нь элбэг. Тогтмол зочлогчдын тоолоор жилд 10 мянга гаруй аялагч ирдэг.',
  },

  // ═══════════════════════════════════════════════════════════
  // ӨВӨРХАНГАЙ
  // ═══════════════════════════════════════════════════════════
  {
    slug: 'orkhoni-khurkhree',
    cover_image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Orkhon_waterfall.jpg/1280px-Orkhon_waterfall.jpg',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Orkhon_waterfall.jpg/1280px-Orkhon_waterfall.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Orkhon_waterfall_mongolia.jpg/1280px-Orkhon_waterfall_mongolia.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Orkhon_Valley.jpg/1280px-Orkhon_Valley.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Orkhon_river.jpg/1280px-Orkhon_river.jpg',
    ],
    short_desc: 'Орхоны хүрхрээ нь 20 метр өндөр, 28 метр өргөн Монголын хамгийн том хүрхрээ бөгөөд ЮНЕСКО-ийн өвд бүртгэгдсэн.',
    description: 'Орхоны хүрхрээ нь Өвөрхангай аймгийн Уянга суманд оршдог Монголын хамгийн том, хамгийн алдартай хүрхрээ юм. 20 метр өндөр, 28 метр өргөн энэ хүрхрээ нь Орхон голын дагуу үүссэн. 20,000 жилийн өмнө галт уулын дэлбэрэлтийн үр дүнд Орхон голын урсац өөрчлөгдөн энэ хүрхрээ үүссэн гэж үздэг. Тойрон уудам хөх ногоон хөндий, цагаан мөнгөн хүрхрээ, өвөрмөц базальт хадны хослол нь нэн гоё дүр зургийг бүрдүүлдэг. ЮНЕСКО-ийн Дэлхийн өвд бүртгэгдсэн Орхоны хөндийн нэг хэсэг бөгөөд жил бүр олон мянган жуулчдыг татдаг.',
  },
  {
    slug: 'erdenezuu-khiid-kharkhorin',
    cover_image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Erdene_Zuu_Monastery.jpg/1280px-Erdene_Zuu_Monastery.jpg',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Erdene_Zuu_Monastery.jpg/1280px-Erdene_Zuu_Monastery.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Erdene_Zuu_white_stupas.jpg/1280px-Erdene_Zuu_white_stupas.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Karakorum_Mongolia.jpg/1280px-Karakorum_Mongolia.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Kharkhorin_monastery.jpg/1280px-Kharkhorin_monastery.jpg',
    ],
    short_desc: 'Эрдэнэзуу хийд нь 16-р зуунд баригдсан Монголын хамгийн эртний хийд бөгөөд ЮНЕСКО-ийн Дэлхийн өвд бүртгэгдсэн.',
    description: 'Эрдэнэзуу хийд нь 1586 онд Абатай хаан байгуулсан Монголын хамгийн эртний Буддын хийд юм. Хархорин хотын ойролцоо байдаг хийдийн хана 400 метрийн урттай, 108 суварга бүхий цагаан хананд хүрээлэгдсэн байдаг. Хийдийн нутагт Монгол эзэнт гүрний нийслэл Хархорум хотын үлдэгдэл байдаг. ЮНЕСКО-ийн Дэлхийн өвд бүртгэгдсэн бөгөөд жилд 100 мянга гаруй жуулчин зочилдог. Хийдийн музейд XIII-XIV зууны үнэт эдлэлүүд хадгалагдаж байдаг.',
  },
  {
    slug: 'ulaan-tsutgalan-khurkhree-bat-olzii',
    cover_image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Ulaan_Tsutgalan.jpg/1280px-Ulaan_Tsutgalan.jpg',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Ulaan_Tsutgalan.jpg/1280px-Ulaan_Tsutgalan.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Orkhon_waterfall.jpg/1280px-Orkhon_waterfall.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Orkhon_Valley.jpg/1280px-Orkhon_Valley.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Orkhon_waterfall_mongolia.jpg/1280px-Orkhon_waterfall_mongolia.jpg',
    ],
    short_desc: 'Улаан цутгалан бол Өвөрхангайн Бат-Өлзий суманд орших улаан хадан хавцалаас цутгарах үзэсгэлэнт хүрхрээ.',
    description: 'Улаан цутгалан хүрхрээ нь Өвөрхангай аймгийн Бат-Өлзий суманд оршдог бөгөөд улаан өнгийн базальт хаднаас цутгарах үзэсгэлэнт хүрхрээ юм. Орхон голоос ялгаатай нь энэ хүрхрээ нь харьцангуй жижиг боловч улаан хаднаас шулуун буудаж буй гоо үзэсгэлэн нь онцгой. Орчин тойрны ногоон бэлчээр, ой модтой хавцал хосолж байгалийн гайхамшигт дүр зургийг бүрдүүлдэг. Хүрхрээнд хүрэх зам дагуу нуурууд, голууд байдаг тул аялагчид рашаан сувилалтай хослуулан зочилдог.',
  },
  {
    slug: 'khan-khujirt-rashaan-suvilal',
    cover_image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/12/5b/b5/0c/khan-khujirt-resort.jpg?w=1200',
    images: [
      'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/12/5b/b5/0c/khan-khujirt-resort.jpg?w=1200',
      'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0f/2b/a4/6f/khan-khujirt.jpg?w=1200',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Orkhon_Valley.jpg/1280px-Orkhon_Valley.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Orkhon_waterfall.jpg/1280px-Orkhon_waterfall.jpg',
    ],
    short_desc: 'Хан Хужирт рашаан сувилал нь Өвөрхангайд байрлах Монголын алдарт эмчилгээний рашаан сувиллуудын нэг.',
    description: 'Хан Хужирт рашаан сувилал нь Өвөрхангай аймгийн Хужирт суманд оршдог бөгөөд Монголд хамгийн алдарт рашаан сувиллуудын нэг юм. Рашааны ус нь натри, хлорид, нүүрсхүчлийн нэгдэл агуулсан бөгөөд ходоод, гэдэсний болон арьсны өвчин эмчлэхэд үр дүнтэй. Жил бүр мянга мянган зочдыг хүлээн авдаг бөгөөд орчин үеийн тохилог байр, эмчилгээний танхимтай. Орхоны хүрхрээнээс 30 км зайтай тул хослуулан зочлох нь элбэг.',
  },
  {
    slug: 'edr-rashaan-suvilal',
    cover_image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/14/ba/3a/dc/edr-resort.jpg?w=1200',
    images: [
      'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/14/ba/3a/dc/edr-resort.jpg?w=1200',
      'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/12/5b/b5/0c/khan-khujirt-resort.jpg?w=1200',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Orkhon_Valley.jpg/1280px-Orkhon_Valley.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Orkhon_waterfall.jpg/1280px-Orkhon_waterfall.jpg',
    ],
    short_desc: 'Эдр рашаан сувилал нь Хужирт суманд байрлах тохилог амралт, эмчилгээний рашаан сувилал.',
    description: 'Эдр рашаан сувилал нь Өвөрхангай аймгийн Хужирт суманд оршдог бөгөөд Орхоны хөндийн үзэсгэлэнт байгальд хүрээлэгдсэн байдаг. Байгалийн эрдэст рашаан ус, орчин үеийн тохилог байрлах газар, эмчилгээний үйлчилгээтэй. Хан Хужирт болон Элма рашаанаас тийм ч хол биш тул аялагчид хэд хэдэн рашааныг нэгэн удаагийн аяллаар зочилдог. Орхоны хүрхрээ рүү явах замдаа зогсох тохиромжтой газар.',
  },
  {
    slug: 'elma-rashaan-suvilal',
    cover_image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0f/2b/a4/6f/khan-khujirt.jpg?w=1200',
    images: [
      'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0f/2b/a4/6f/khan-khujirt.jpg?w=1200',
      'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/12/5b/b5/0c/khan-khujirt-resort.jpg?w=1200',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Orkhon_Valley.jpg/1280px-Orkhon_Valley.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Orkhon_waterfall.jpg/1280px-Orkhon_waterfall.jpg',
    ],
    short_desc: 'Элма рашаан сувилал нь Хужирт суманд байрлах байгалийн эрдэст рашаан бүхий амралт, эмчилгээний газар.',
    description: 'Элма рашаан сувилал нь Өвөрхангай аймгийн Хужирт суманд оршдог бөгөөд байгалийн эрдэс баялаг рашаан уст газар юм. Рашааны эмчилгээний шинж чанар, цэвэр агаар, тайван орчин нь зочдыг татдаг. Орхоны хөндийн уудам тал нутгийн дунд байрлах тул байгалийг мэдрэхийн сацуу эмчилгээ хийлгэх боломжтой. Хан Хужирт рашаантай хамт Хужиртын рашаан бүсийн гол газруудын нэг.',
  },
  {
    slug: 'orkhoni-khondii-yunyesko-delkhiin-ov',
    cover_image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Orkhon_Valley.jpg/1280px-Orkhon_Valley.jpg',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Orkhon_Valley.jpg/1280px-Orkhon_Valley.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Orkhon_waterfall.jpg/1280px-Orkhon_waterfall.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Erdene_Zuu_Monastery.jpg/1280px-Erdene_Zuu_Monastery.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Orkhon_river.jpg/1280px-Orkhon_river.jpg',
    ],
    short_desc: 'Орхоны хөндий нь Монгол нутгийн эртний соёл иргэншлийн гол цэг бөгөөд ЮНЕСКО-ийн Дэлхийн өвд бүртгэгдсэн.',
    description: 'Орхоны хөндий нь Монгол нутгийн хамгийн эртний суурьшлын газруудын нэг бөгөөд 2004 онд ЮНЕСКО-ийн Дэлхийн соёлын болон байгалийн өвд бүртгэгдсэн. Энд Хүннүгийн нийслэл, Уйгурын нийслэл Хар Балгас, Монгол эзэнт гүрний нийслэл Хархорум, Эрдэнэзуу хийд зэрэг түүхэн дурсгалт газрууд байдаг. Орхон гол нь Монгол Алтайгаас эхлэн 1124 км урсан Сэлэнгэ гол руу цутгадаг. Орхоны хүрхрээ, Цэнхэрийн рашаан, нуурууд голын хөндийг гоёдог.',
  },
  {
    slug: 'kharakhorum-khot-kharkhorin',
    cover_image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Karakorum_Mongolia.jpg/1280px-Karakorum_Mongolia.jpg',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Karakorum_Mongolia.jpg/1280px-Karakorum_Mongolia.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Erdene_Zuu_Monastery.jpg/1280px-Erdene_Zuu_Monastery.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Erdene_Zuu_white_stupas.jpg/1280px-Erdene_Zuu_white_stupas.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Orkhon_Valley.jpg/1280px-Orkhon_Valley.jpg',
    ],
    short_desc: 'Хархорин бол XIII зуунд Өгөдэй хааны байгуулсан Монгол эзэнт гүрний нийслэл Хархорумын орчин үеийн нэр.',
    description: 'Хархорин (Хархорум) нь 1220-аад оны үед Өгөдэй хааны байгуулсан Монгол эзэнт гүрний нийслэл байсан бөгөөд Хятад, Европ, Исламын улсуудын бичиглэлд тэмдэглэгдсэн агуу хот. Одоо Хархорины музейд МТ 8-р зуунаас эхлэх Уйгур, Хүннүгийн үеийн эд өлгийн зүйлс хадгалагдана. Хотын нутагт Эрдэнэзуу хийд байдаг бөгөөд 108 суварга бүхий хан хана тойрсон ариун орон. ЮНЕСКО-ийн Дэлхийн өвд бүртгэгдсэн Орхоны хөндийн гол газруудын нэг.',
  },

  // ═══════════════════════════════════════════════════════════
  // ТӨВ АЙМАГ
  // ═══════════════════════════════════════════════════════════
  {
    slug: 'gorkhi-terelj-undesnii-tsetserlegt-khureelen',
    cover_image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Terelj_National_Park.jpg/1280px-Terelj_National_Park.jpg',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Terelj_National_Park.jpg/1280px-Terelj_National_Park.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Turtle_Rock_Terelj.jpg/1280px-Turtle_Rock_Terelj.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Ariyabal_monastery_Terelj.jpg/1280px-Ariyabal_monastery_Terelj.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Terelj_Mongolia.jpg/1280px-Terelj_Mongolia.jpg',
    ],
    short_desc: 'Горхи-Тэрэлж үндэсний цэцэрлэгт хүрээлэн нь Улаанбаатараас ердөө 80 км зайтай, Монголын хамгийн алдарт аялалын газар.',
    description: 'Горхи-Тэрэлж үндэсний цэцэрлэгт хүрээлэн нь Улаанбаатараас 80 км зайтай, 293,168 га талбайтай үндэсний хамгаалалттай газар юм. Хадан ам, гол горхи, хуш ойн дунд гэр болон байшин байрлах гоё газар. Хав чулуу (Turtle Rock), Арьяабал хийд, өглөөний нар шингэх газрууд аялагчдад маш таалагддаг. Морин аялал, хавцлын алхалт, уулчлал, рафтинг зэрэг үйл ажиллагаа боломжтой. Жилд 500 гаруй мянган зочин хүлээн авдаг Монголын хамгийн алдарт аялалын газар.',
  },
  {
    slug: 'chingis-khaani-mort-khoshoonii-tsogtsolbor',
    cover_image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Genghis_Khan_Equestrian_Statue.jpg/1280px-Genghis_Khan_Equestrian_Statue.jpg',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Genghis_Khan_Equestrian_Statue.jpg/1280px-Genghis_Khan_Equestrian_Statue.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Chinggis_Khaan_Statue_Complex.jpg/1280px-Chinggis_Khaan_Statue_Complex.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Genghis_Khan_statue_Mongolia.jpg/1280px-Genghis_Khan_statue_Mongolia.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Orkhon_Valley.jpg/1280px-Orkhon_Valley.jpg',
    ],
    short_desc: 'Дэлхийн хамгийн том морьт хүрэл хөшөө — 40 метр өндөр Чингис хааны морьт хөшөөний цогцолбор Улаанбаатараас 54 км зайтай.',
    description: 'Чингис хааны морьт хөшөөний цогцолбор нь Улаанбаатараас 54 км зайтай Цонжин болдод байрладаг бөгөөд 2008 онд нээгдсэн. 40 метр өндөр хүрэл хөшөө нь дэлхийн хамгийн том морьт хүрэл хөшөө гэдгээрээ Гиннесийн номонд бүртгэгдсэн. Хөшөөний суурьт музей, ресторан, сувениры дэлгүүр байдаг. Хөшөөний морины толгой руу лифтээр гараад манхан тал, уул усаа харж болно. Жилд 500 мянга гаруй жуулчин зочилдог Монголын хамгийн алдарт аялалын газруудын нэг.',
  },
  {
    slug: 'khustain-nuruu-takhiin-nutag',
    cover_image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Takhi_Hustai_Nuruu.jpg/1280px-Takhi_Hustai_Nuruu.jpg',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Takhi_Hustai_Nuruu.jpg/1280px-Takhi_Hustai_Nuruu.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Hustai_National_Park.jpg/1280px-Hustai_National_Park.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Przewalski_horses_Hustai.jpg/1280px-Przewalski_horses_Hustai.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Mongolia_steppe.jpg/1280px-Mongolia_steppe.jpg',
    ],
    short_desc: 'Хустайн нуруу нь тахь адуу буюу Пржевальскийн адуу дахин нутагшуулсан Монголын онцгой байгалийн цогцолбор.',
    description: 'Хустайн нурууны байгалийн цогцолбор нь Улаанбаатараас 100 км зайтай Тув аймагт оршдог. 1992 оноос Голланд, Монголын хамтарсан төслийн хүрээнд дэлхийд устаж байсан тахь адуу буюу Пржевальскийн адууг эргүүлэн нутагшуулсан. Одоо 400 гаруй тахь адуу чөлөөтэй нутагшдаг болсон. 50,620 га нутагт 456 зүйлийн ургамал, 217 зүйлийн шувуу, 62 зүйлийн хөхтөн амьтан амьдардаг. Тахь адуу харах бол Монголд ирэгч жуулчдын "bucket list"-ийн нэгдүгээр зүйл болдог.',
  },
  {
    slug: 'bogd-khan-uulin-noots-gazar',
    cover_image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Bogd_Khan_Uul.jpg/1280px-Bogd_Khan_Uul.jpg',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Bogd_Khan_Uul.jpg/1280px-Bogd_Khan_Uul.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Bogd_Khan_mountain.jpg/1280px-Bogd_Khan_mountain.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Mongolia_steppe.jpg/1280px-Mongolia_steppe.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Terelj_National_Park.jpg/1280px-Terelj_National_Park.jpg',
    ],
    short_desc: 'Богд хан уулын нөөц газар нь дэлхийн хамгийн эртний хамгаалалттай газруудын нэг — 1778 онд хамгаалалтад авсан.',
    description: 'Богд хан уулын нөөц газар нь Улаанбаатар хотын өмнөд хэсгийг хүрээлэх бөгөөд дэлхийн хамгийн эртний хамгаалалттай газруудын нэг гэж тооцогддог. 1778 онд Манж Чин улсын зарлигаар хамгаалалтад авсан. 41,651 га нутагт 250 гаруй зүйлийн шувуу, 70 гаруй зүйлийн хөхтөн амьтан амьдардаг. Хотын ойролцоо байгаа тул явган аялал, уулчлалд маш тохиромжтой. Оройд Цэцэгт уулын ус, Богд хааны ордон музей ойрхон.',
  },

  // ═══════════════════════════════════════════════════════════
  // ХӨВСГӨЛ
  // ═══════════════════════════════════════════════════════════
  {
    slug: 'khovsgol-nuur-mongolin-dalai',
    cover_image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Lake_Khovsgol.jpg/1280px-Lake_Khovsgol.jpg',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Lake_Khovsgol.jpg/1280px-Lake_Khovsgol.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Khovsgol_Lake_Mongolia.jpg/1280px-Khovsgol_Lake_Mongolia.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Lake_Khuvsgul_shore.jpg/1280px-Lake_Khuvsgul_shore.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Khovsgol_winter.jpg/1280px-Khovsgol_winter.jpg',
    ],
    short_desc: 'Хөвсгөл нуур нь Монголын "далай" — солодын 2% агуулсан Дэлхийн 14-р том цэнгэгт усны нуур.',
    description: 'Хөвсгөл нуур нь Монгол орны хойд хэсэгт Оросын Байгаль нуурын ойролцоо оршдог бөгөөд Монголын нийт цэнгэгт усны 70%, дэлхийн цэнгэгт усны 2%-ийг агуулдаг. 136 км урт, 40 км өргөн, 262 метр гүн энэ нуурт 96 голоос ус цутгадаг. Нуурын ус маш цэвэр бөгөөд ундны усанд тохирдог. Хэдэн зуун жилийн нарс мод, ой тайгаар хүрээлэгдсэн. Зун морин аялал, завь унах, загасчлах, өвөл мөсөн дээр аялах боломжтой. Жил бүр "Хөвсгөл нуурын наадам" болдог.',
  },
  {
    slug: 'tsaatan-ardin-nutag-tsagaannuur',
    cover_image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Tsaatan_people.jpg/1280px-Tsaatan_people.jpg',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Tsaatan_people.jpg/1280px-Tsaatan_people.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Reindeer_herders_Mongolia.jpg/1280px-Reindeer_herders_Mongolia.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Tsaatan_reindeer.jpg/1280px-Tsaatan_reindeer.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Lake_Khovsgol.jpg/1280px-Lake_Khovsgol.jpg',
    ],
    short_desc: 'Цаатан ардын нутаг нь бугын малчид — дэлхийд ховор цаатан ард түмний нутагт аялах онцгой боломж.',
    description: 'Цаатан (Духа) ард түмэн нь Хөвсгөл аймгийн Цагааннуур сумын Хорьд ойд амьдардаг, тоо нь ердөө 300-400 хүн хүрдэг дэлхийн хамгийн жижиг үндэстнүүдийн нэг. Тэд бугаа тэжээж, буганы сүү, мах, арьсыг ашигладаг. Загарын гол дагуу аялагчид цаатанчуудын булан (урц)-д зочилж, буга унаж, тайгын амьдралыг мэдрэх боломжтой. Хатгал суумаас 200 гаруй км зайтай тул аялал зохион байгуулалтгүй хүрэхэд хэцүү. Тусгай зөвшөөрлийн бүстэй газар.',
  },

  // ═══════════════════════════════════════════════════════════
  // ӨМНӨГОВЬ
  // ═══════════════════════════════════════════════════════════
  {
    slug: 'khongorin-els-duulakh-els',
    cover_image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Khongoryn_Els.jpg/1280px-Khongoryn_Els.jpg',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Khongoryn_Els.jpg/1280px-Khongoryn_Els.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Dune_Khongoryn_Els_01.jpg/1280px-Dune_Khongoryn_Els_01.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Khongoryn_Els_Mongolia.jpg/1280px-Khongoryn_Els_Mongolia.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Khongoryn_Els_camel.jpg/1280px-Khongoryn_Els_camel.jpg',
    ],
    short_desc: 'Хонгорын элс — "Дуулах элс" нь 180 км урт, 27 км өргөн, 300 метр хүртэл өндөр Монголын хамгийн том элсэн манхан.',
    description: 'Хонгорын элс нь Өмнөговь аймгийн Севрэй, Баяндалай суманд орших 180 км урт, 27 км өргөн элсэн манхан бөгөөд Монголын хамгийн том элсэн мандал юм. Манханы зарим хэсэг 300 метр хүрэх өндөртэй. Салхи шуурч элсийг дэгдэхэд "дуулдаг" юм шиг чимээ гардаг учир "Дуулах элс" гэж нэрлэдэг. Элсэн манханы өвөр Хонгорын гол урсдаг бөгөөд хоёр талыг нь харьцуулах нь нэн гайхамшигтай. Тэмээ унаж манхан дагуу аялах, нарны жаргалт харах нь жуулчдын хамгийн таалагдах зүйлийн нэг.',
  },
  {
    slug: 'bayanzag-tsakhilgaant-khad',
    cover_image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Bayanzag_Mongolia.jpg/1280px-Bayanzag_Mongolia.jpg',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Bayanzag_Mongolia.jpg/1280px-Bayanzag_Mongolia.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Flaming_Cliffs_Gobi.jpg/1280px-Flaming_Cliffs_Gobi.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Bayanzag_Flaming_Cliffs.jpg/1280px-Bayanzag_Flaming_Cliffs.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Bayanzag_dinosaur.jpg/1280px-Bayanzag_dinosaur.jpg',
    ],
    short_desc: 'Баянзаг буюу "Цахилгаант хад" нь 1922 онд Рой Чапман Эндрюс анх динозаврын өндөг олсон газар, жуулчдын диваажин.',
    description: 'Баянзаг нь Өмнөговь аймгийн Булган суманд байрладаг бөгөөд нарны гэрлэнд улаан шаравтар өнгөөр гялалздаг тул "Цахилгаант хад" (Flaming Cliffs) гэж алдаршсан. 1922 онд Америкийн эрдэмтэн Рой Чапман Эндрюс дэлхийд анх удаа динозаврын өндөг, яс олсон газар юм. Одоо ч судлаачид шинэ олдворуудыг малтан судалж байдаг. Нарны жаргалтын үеэр улаан хадны манаас тусах дүр нь гайхалтай гоё. Туурийн чулуун орчимд аялагчид мэргэжлийн дагалдагчтайгаар алхаж болно.',
  },
  {
    slug: 'gurvan-saikhan-uul',
    cover_image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Gurvan_Saikhan.jpg/1280px-Gurvan_Saikhan.jpg',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Gurvan_Saikhan.jpg/1280px-Gurvan_Saikhan.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Khongoryn_Els.jpg/1280px-Khongoryn_Els.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Yolyn_Am.jpg/1280px-Yolyn_Am.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Bayanzag_Mongolia.jpg/1280px-Bayanzag_Mongolia.jpg',
    ],
    short_desc: 'Гурван Сайхан уул нь Говийн цорын ганц мөс тогтдог Ёолын амыг агуулсан, Өмнөговийн тэргүүн онцлог газар.',
    description: 'Гурван Сайхан нь Өмнөговь аймгийн Баянхонгор суманд оршдог, Монголын хамгийн том "байгалийн цэцэрлэгт хүрээлэн"-ий нэг болох Гурван Сайхан үндэсний парк юм. Говийн дунд байрлах атлаа 2825 метр өндөртэй. Хамгийн онцлог газар нь Ёолын ам буюу Шонхорын ам — говийн халуунд ч 8 метрийн зузаан мөс тогтдог нарийн хавцал. Хавцалд ирвэс, мазаалай, янгир байдаг. Хонгорын элстэй хосолсон аялал хийх нь элбэг.',
  },

  // ═══════════════════════════════════════════════════════════
  // БАЯН-ӨЛГИЙ
  // ═══════════════════════════════════════════════════════════
  {
    slug: 'altai-tavan-bogd-undesnii-tsetserlegt-khureelen',
    cover_image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Altai_Tavan_Bogd.jpg/1280px-Altai_Tavan_Bogd.jpg',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Altai_Tavan_Bogd.jpg/1280px-Altai_Tavan_Bogd.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Potanin_Glacier.jpg/1280px-Potanin_Glacier.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Tavan_Bogd_Mountains.jpg/1280px-Tavan_Bogd_Mountains.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Altai_mountains_Mongolia.jpg/1280px-Altai_mountains_Mongolia.jpg',
    ],
    short_desc: 'Алтай Таван Богд нь 4374 метр өндөртэй Монголын хамгийн өндөр оргил, Потанины мөсөн голыг агуулсан үндэсний цэцэрлэгт хүрээлэн.',
    description: 'Алтай Таван Богд үндэсний цэцэрлэгт хүрээлэн нь Баян-Өлгий аймгийн баруун хэсэгт оршдог бөгөөд Монгол, Хятад, Орос, Казахстан дөрвөн улсын хилийн уулзвар дагуу байрладаг. Таван Богдын оргил нь 4374 метр өндөрт — Монголын хамгийн өндөр цэг юм. Потанины мөсөн гол нь Монголын хамгийн урт мөсөн гол (14 км). Казах ард түмний бүргэдчин соёл, Петрогляфын хадны зураг, уулчлал зэрэг нь аялагчдыг татдаг. Уулчлал хийхэд мэргэжлийн гид зайлшгүй шаардлагатай.',
  },
  {
    slug: 'bayan-olgiin-kazak-burgedchin-naadam',
    cover_image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Eagle_hunting_Kazakhstan_Mongolia.jpg/1280px-Eagle_hunting_Kazakhstan_Mongolia.jpg',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Eagle_hunting_Kazakhstan_Mongolia.jpg/1280px-Eagle_hunting_Kazakhstan_Mongolia.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Kazakh_eagle_hunter.jpg/1280px-Kazakh_eagle_hunter.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Golden_Eagle_Festival_Mongolia.jpg/1280px-Golden_Eagle_Festival_Mongolia.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Altai_Tavan_Bogd.jpg/1280px-Altai_Tavan_Bogd.jpg',
    ],
    short_desc: 'Казак бүргэдчиний наадам бол жил бүр аравдугаар сард болдог дэлхийд цорын ганц алтан бүргэдийн наадам.',
    description: 'Баян-Өлгийн Казак бүргэдчиний наадам бол жил бүр аравдугаар сарын эхэнд Өлгий хотод болдог дэлхийн цорын ганц алтан бүргэдийн тэмцээн юм. Казак ард түмний мянга мянган жилийн бүргэдчлэлийн уламжлалыг хадгалсан энэ наадамд оролцогчид бүргэдийнхээ хурд, нарийвчлал, эзнийхээ дуудлагыг сонсох чадварыг харуулдаг. 1000 гаруй жуулчин жил бүр энэ наадмаар хол ойроос цугладаг. Монгол, Казак уламжлалт хувцас, хоол, урлаг нь нэмэгдэл сэдэв болдог.',
  },

  // ═══════════════════════════════════════════════════════════
  // СЭЛЭНГЭ / БУЛГАН
  // ═══════════════════════════════════════════════════════════
  {
    slug: 'amarbayasgalant-khiid',
    cover_image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Amarbayasgalant_monastery.jpg/1280px-Amarbayasgalant_monastery.jpg',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Amarbayasgalant_monastery.jpg/1280px-Amarbayasgalant_monastery.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Amarbayasgalant_2.jpg/1280px-Amarbayasgalant_2.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Amarbayasgalant_Monastery.jpg/1280px-Amarbayasgalant_Monastery.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Amarbayasgalant_detail.jpg/1280px-Amarbayasgalant_detail.jpg',
    ],
    short_desc: 'Амарбаясгалант хийд нь 18-р зуунд баригдсан Монголын хамгийн хадгалагдсан Буддын хийд, Сэлэнгэ аймагт байрладаг.',
    description: 'Амарбаясгалант хийд нь Сэлэнгэ аймгийн Баруунбүрэн суманд оршдог бөгөөд 1727-1736 онуудад Манж Чин улсын Юнчжэн хааны зарлигаар баригдсан. Эрдэнэзуу хийдийн дараа Монголын хоёр дахь том хийд. Коммунизмын үед сүйдэж, 1992 оноос ЮНЕСКО болон Монголын засгийн газрын хүчин чармайлтаар сэргээн засварлаж байна. Уулын бэлийн ар талын гоё байршил, уламжлалт Манжийн барилгын гоёл нь гайхалтай. Хийдэд 500 гаруй лам сурч, оршин суудаг.',
  },
  {
    slug: 'selenge-mornii-khondii',
    cover_image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Selenge_River_Mongolia.jpg/1280px-Selenge_River_Mongolia.jpg',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Selenge_River_Mongolia.jpg/1280px-Selenge_River_Mongolia.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Amarbayasgalant_monastery.jpg/1280px-Amarbayasgalant_monastery.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Mongolia_steppe.jpg/1280px-Mongolia_steppe.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Arkhangai_landscape.jpg/1280px-Arkhangai_landscape.jpg',
    ],
    short_desc: 'Сэлэнгэ мөрний хөндий нь Монголын хамгийн урт, загас элбэг голын дагуух алдарт загасчлалын газар.',
    description: 'Сэлэнгэ мөрний хөндий нь Монгол орны хойд хэсгийг дамнан урсах Монголын хамгийн том гол юм. Гол нь Улаанбаатараас баруун тийш Хангайн нурууноос эхлэн Байгаль нуурт цутгадаг. Таймен буюу Монгол загасны дэлхийн хамгийн том популяц энэ голд байдаг. Загасчлалын аялалаар жил бүр олон улсын жуулчид ирдэг. Голын дагуу Амарбаясгалант хийд, Дархан хот байдаг. Хавар намрын улиралд нүүдлийн шувуудын товчлол болдог.',
  },

  // ═══════════════════════════════════════════════════════════
  // УВС / ХОВД
  // ═══════════════════════════════════════════════════════════
  {
    slug: 'uvs-nuur-yunyesko-delkhiin-ov',
    cover_image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Uvs_Lake_Mongolia.jpg/1280px-Uvs_Lake_Mongolia.jpg',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Uvs_Lake_Mongolia.jpg/1280px-Uvs_Lake_Mongolia.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Uvs_Nuur_basin.jpg/1280px-Uvs_Nuur_basin.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Mongolia_steppe.jpg/1280px-Mongolia_steppe.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Altai_mountains_Mongolia.jpg/1280px-Altai_mountains_Mongolia.jpg',
    ],
    short_desc: 'Увс нуур нь Монголын хамгийн том нуур бөгөөд ЮНЕСКО-ийн Байгалийн дэлхийн өвд бүртгэгдсэн давстай нуур.',
    description: 'Увс нуур нь Монгол-Оросын хилд байрлах далайн түвшнээс 759 метр өндөрт орших 3350 км² талбайтай Монголын хамгийн том нуур юм. Ус нь маш давстай тул загас амьдардаггүй. 2003 онд ЮНЕСКО-ийн Байгалийн дэлхийн өвд "Увс нуурын сав газар" нэрэн бүртгэгдсэн. Нуурын эрэгт хар шонхор, Монгол буга, ирвэс, аргаль зэрэг ховор амьтад амьдардаг. Зун маш халуун (38 хэм), өвөл маш хүйтэн (-58 хэм) цаг уурын экстремаль байдлаараа онцлог.',
  },
  {
    slug: 'khar-us-nuur-undesnii-tsetserlegt-khureelen',
    cover_image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Khar_Us_Lake.jpg/1280px-Khar_Us_Lake.jpg',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Khar_Us_Lake.jpg/1280px-Khar_Us_Lake.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Khar_Us_Nuur.jpg/1280px-Khar_Us_Nuur.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Altai_mountains_Mongolia.jpg/1280px-Altai_mountains_Mongolia.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Mongolia_steppe.jpg/1280px-Mongolia_steppe.jpg',
    ],
    short_desc: 'Хар ус нуур нь Монголын баруун хэсгийн хамгийн том цэнгэгт усны нуур бөгөөд ЮНЕСКО-ийн Рамсарын конвенцид бүртгэгдсэн.',
    description: 'Хар ус нуур нь Ховд аймагт оршдог, 1852 км² талбайтай Монголын хоёр дахь том нуур юм. Нуурт 70 гаруй зүйлийн загас, 200 гаруй зүйлийн шувуу амьдардаг. Монгол аргаль, цагаан зэрлэг элбэг. ЮНЕСКО-ийн Рамсарын конвенцид бүртгэгдсэн ус намгархаг газар. Хар Усны арал зусланд хамгаалагдсан байгалийг судлах, шувуу ажиглах гайхалтай боломж байдаг. Хайрхан уулын цаанаас Ховдын хотоос 50 км.',
  },

  // ═══════════════════════════════════════════════════════════
  // ДУНДГОВЬ
  // ═══════════════════════════════════════════════════════════
  {
    slug: 'tsagaan-suvarga',
    cover_image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Tsagaan_Suvarga.jpg/1280px-Tsagaan_Suvarga.jpg',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Tsagaan_Suvarga.jpg/1280px-Tsagaan_Suvarga.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/White_Stupa_Dundgovi.jpg/1280px-White_Stupa_Dundgovi.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Tsagaan_suvarga_2.jpg/1280px-Tsagaan_suvarga_2.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Mongolia_steppe.jpg/1280px-Mongolia_steppe.jpg',
    ],
    short_desc: 'Цагаан суварга нь 30 метр өндөр, 400 метр урт цагаан шохойн хадан тогтоц бөгөөд эртний далайн ёроолын үлдэгдэл.',
    description: 'Цагаан суварга нь Дундговь аймгийн Өлзийт суманд оршдог бөгөөд 30 метр өндөр, 400 метрийн урттай цагаан шохойн чулуун хаднаас бүтдэг. 60 сая гаруй жилийн өмнө тэнгисийн ёроол байсан энэ газар тив хөдлөлтийн үр дүнд өргөгдөн одоогийн дүр зургийг авсан. Хадны өнгийг нарны гэрэлд харахад улаан, шар, цагаан өнгийн туяа гарч ирдэг тул "Цагаан суварга" гэж нэрлэдэг. Ойролцоо нуур, нуурхай байдаг. Мандлын намар нарны жаргалт харах хамгийн гоё газруудын нэг.',
  },

  // ═══════════════════════════════════════════════════════════
  // ХЭНТИЙ
  // ═══════════════════════════════════════════════════════════
  {
    slug: 'binder-chingis-khaani-torson-nutag',
    cover_image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Mongolia_steppe.jpg/1280px-Mongolia_steppe.jpg',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Mongolia_steppe.jpg/1280px-Mongolia_steppe.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Khovsgol_Lake_Mongolia.jpg/1280px-Khovsgol_Lake_Mongolia.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Terelj_Mongolia.jpg/1280px-Terelj_Mongolia.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Onon_River_Mongolia.jpg/1280px-Onon_River_Mongolia.jpg',
    ],
    short_desc: 'Биндэр сум нь Чингис хаан 1162 онд мэндэлсэн нутаг гэж тооцогддог Хэнтий аймгийн түүхт газар.',
    description: 'Биндэр сум нь Хэнтий аймагт оршдог бөгөөд судлаачдын таамаглалаар Чингис хаан тэнд мэндэлсэн гэж үздэг. Онон голын эрэгт байрлах Биндэрт Чингис хааны дурсгалт хөшөө, музей байдаг. Хэнтийн нурууны уулс, Онон голын хөндий, нарс ойгоор хүрээлэгдсэн нутаг байгалийн гоо үзэсгэлэнгээрээ онцлог. Жил бүр олон монгол, гадаадын жуулчид Чингис хааны нутгийг сонирхон ирдэг. Улаанбаатараас 300 гаруй км зайтай.',
  },
  {
    slug: 'onon-golin-khondii',
    cover_image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Onon_River_Mongolia.jpg/1280px-Onon_River_Mongolia.jpg',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Onon_River_Mongolia.jpg/1280px-Onon_River_Mongolia.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Mongolia_steppe.jpg/1280px-Mongolia_steppe.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Arkhangai_landscape.jpg/1280px-Arkhangai_landscape.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Terelj_Mongolia.jpg/1280px-Terelj_Mongolia.jpg',
    ],
    short_desc: 'Онон голын хөндий нь Чингис хааны нутгийг дамнах, тайга болон хээрийн хосолсон онцгой байгалийн газар.',
    description: 'Онон гол нь Хэнтийн нурууны 2000 метрийн өндрөөс эхлэн Оросын нутгаар урсаж Амур мөрөнд цутгадаг бөгөөд нийт урт нь 1032 км. Голын монголын хэсгийн дагуу Онон-Балжийн байгалийн нөөц газар байдаг. Таймен загас, шонхор, монгол гөрөөс, буга амьдардаг. Чингис хааны бага насны дурсамжтай холбоотой Дэлүүн болдог нь ч энэ хөндийд байдаг. Хэнтийн ойт тайга, хэвтрийн хаялгын хавцал, тохь тав жуулчдад мэдрэгддэг.',
  },
];

// ── Үндсэн функц ──────────────────────────────────────────────────────────────
async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB холбогдлоо\n');

  // 1. Устгах
  console.log('🗑  Давхардсан газруудыг устгаж байна...');
  for (const slug of DELETE_SLUGS) {
    const res = await Place.deleteOne({ slug });
    if (res.deletedCount > 0) console.log(`  ✓ Устгасан: ${slug}`);
  }

  // 2. Шинэчлэх
  console.log('\n📝 Газруудыг шинэчилж байна...');
  let updated = 0;
  for (const u of UPDATES) {
    const { slug, ...data } = u;
    const res = await Place.updateOne({ slug }, { $set: data });
    if (res.matchedCount > 0) {
      console.log(`  ✓ ${slug}`);
      updated++;
    } else {
      console.log(`  ⚠ Олдсонгүй: ${slug}`);
    }
  }

  console.log(`\n✅ ${updated} газар шинэчлэгдлээ`);
  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
