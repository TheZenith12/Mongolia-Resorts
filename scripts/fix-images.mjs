/**
 * Wikimedia зургуудыг Unsplash зургаар солих
 * node scripts/fix-images.mjs
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

// ── Unsplash зургийн сан (найдвартай, hotlink дэмждэг) ───────────────────────
const IMG = {
  // Нуур / усан газар
  lake1:    'https://images.unsplash.com/photo-1476514525405-dbb538c5d8e7?w=1280&q=80',
  lake2:    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1280&q=80',
  lake3:    'https://images.unsplash.com/photo-1504197832061-98a4bf492f89?w=1280&q=80',
  // Уул / өндөрлөг
  mountain1:'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1280&q=80',
  mountain2:'https://images.unsplash.com/photo-1454496522488-7a8e488e66f3?w=1280&q=80',
  mountain3:'https://images.unsplash.com/photo-1606117331085-5760e3b58520?w=1280&q=80',
  // Хээр / тал
  steppe1:  'https://images.unsplash.com/photo-1500534314209-a157d0e700c4?w=1280&q=80',
  steppe2:  'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1280&q=80',
  steppe3:  'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=1280&q=80',
  // Ой / тайга
  forest1:  'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1280&q=80',
  forest2:  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1280&q=80',
  // Цөл / элс
  desert1:  'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1280&q=80',
  desert2:  'https://images.unsplash.com/photo-1547526861-1f57aff60b6d?w=1280&q=80',
  desert3:  'https://images.unsplash.com/photo-1504333638930-c8787321eee0?w=1280&q=80',
  // Хүрхрээ / гол
  river1:   'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1280&q=80',
  river2:   'https://images.unsplash.com/photo-1467890947394-8171244e5410?w=1280&q=80',
  // Амралтын газар / рашаан
  resort1:  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1280&q=80',
  resort2:  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1280&q=80',
  // Цас / мөс / уулын оргил
  glacier1: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1280&q=80',
  glacier2: 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=1280&q=80',
  // Байгалийн гоо
  nature1:  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1280&q=80',
  nature2:  'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=1280&q=80',
};

// ── Slug → зургийн жагсаалт ──────────────────────────────────────────────────
const IMAGE_MAP = {
  // ─ АРХАНГАЙ ─────────────────────────────────────────────────────────────────
  'terkhiin-tsagaan-nuur': {
    cover_image: IMG.lake1,
    images: [IMG.lake1, IMG.lake2, IMG.mountain1, IMG.nature1],
  },
  'khorgo-terkhiin-tsagaan-nuurin-baigaliin-tsogtsolbor': {
    cover_image: IMG.mountain1,
    images: [IMG.mountain1, IMG.lake1, IMG.lake2, IMG.nature1],
  },
  'tsenkheriin-khaluun-rashaan': {
    cover_image: IMG.resort1,
    images: [IMG.resort1, IMG.resort2, IMG.forest1, IMG.mountain1],
  },
  'ogiin-nuur': {
    cover_image: IMG.lake2,
    images: [IMG.lake2, IMG.lake1, IMG.steppe1, IMG.nature1],
  },
  'chuluutin-gol-khavtsal': {
    cover_image: IMG.river1,
    images: [IMG.river1, IMG.river2, IMG.mountain1, IMG.forest1],
  },

  // ─ ӨВӨРХАНГАЙ ───────────────────────────────────────────────────────────────
  'orkhoni-khurkhree': {
    cover_image: IMG.river1,
    images: [IMG.river1, IMG.river2, IMG.steppe1, IMG.nature1],
  },
  'erdenezuu-khiid-kharkhorin': {
    cover_image: IMG.steppe2,
    images: [IMG.steppe2, IMG.steppe1, IMG.nature1, IMG.mountain1],
  },
  'ulaan-tsutgalan-khurkhree-bat-olzii': {
    cover_image: IMG.river2,
    images: [IMG.river2, IMG.river1, IMG.steppe1, IMG.mountain1],
  },
  'khan-khujirt-rashaan-suvilal': {
    cover_image: IMG.resort2,
    images: [IMG.resort2, IMG.resort1, IMG.steppe1, IMG.nature1],
  },
  'edr-rashaan-suvilal': {
    cover_image: IMG.resort1,
    images: [IMG.resort1, IMG.resort2, IMG.steppe2, IMG.nature2],
  },
  'elma-rashaan-suvilal': {
    cover_image: IMG.resort2,
    images: [IMG.resort2, IMG.resort1, IMG.steppe1, IMG.forest1],
  },
  'orkhoni-khondii-yunyesko-delkhiin-ov': {
    cover_image: IMG.steppe1,
    images: [IMG.steppe1, IMG.river1, IMG.steppe2, IMG.nature1],
  },
  'kharakhorum-khot-kharkhorin': {
    cover_image: IMG.steppe3,
    images: [IMG.steppe3, IMG.steppe1, IMG.steppe2, IMG.nature1],
  },

  // ─ ТӨВ АЙМАГ ───────────────────────────────────────────────────────────────
  'gorkhi-terelj-undesnii-tsetserlegt-khureelen': {
    cover_image: IMG.forest2,
    images: [IMG.forest2, IMG.forest1, IMG.mountain1, IMG.river1],
  },
  'chingis-khaani-mort-khoshoonii-tsogtsolbor': {
    cover_image: IMG.steppe2,
    images: [IMG.steppe2, IMG.steppe1, IMG.steppe3, IMG.nature1],
  },
  'khustain-nuruu-takhiin-nutag': {
    cover_image: IMG.steppe1,
    images: [IMG.steppe1, IMG.steppe2, IMG.nature1, IMG.nature2],
  },
  'bogd-khan-uulin-noots-gazar': {
    cover_image: IMG.forest1,
    images: [IMG.forest1, IMG.forest2, IMG.mountain1, IMG.nature1],
  },

  // ─ ХӨВСГӨЛ ─────────────────────────────────────────────────────────────────
  'khovsgol-nuur-mongolin-dalai': {
    cover_image: IMG.lake3,
    images: [IMG.lake3, IMG.lake1, IMG.lake2, IMG.forest1],
  },
  'tsaatan-ardin-nutag-tsagaannuur': {
    cover_image: IMG.forest2,
    images: [IMG.forest2, IMG.forest1, IMG.nature1, IMG.mountain1],
  },

  // ─ ӨМНӨГОВЬ ─────────────────────────────────────────────────────────────────
  'khongorin-els-duulakh-els': {
    cover_image: IMG.desert1,
    images: [IMG.desert1, IMG.desert2, IMG.desert3, IMG.steppe1],
  },
  'bayanzag-tsakhilgaant-khad': {
    cover_image: IMG.desert2,
    images: [IMG.desert2, IMG.desert3, IMG.desert1, IMG.steppe1],
  },
  'gurvan-saikhan-uul': {
    cover_image: IMG.mountain2,
    images: [IMG.mountain2, IMG.desert1, IMG.mountain1, IMG.nature1],
  },

  // ─ БАЯН-ӨЛГИЙ ───────────────────────────────────────────────────────────────
  'altai-tavan-bogd-undesnii-tsetserlegt-khureelen': {
    cover_image: IMG.glacier1,
    images: [IMG.glacier1, IMG.glacier2, IMG.mountain2, IMG.mountain1],
  },
  'bayan-olgiin-kazak-burgedchin-naadam': {
    cover_image: IMG.mountain3,
    images: [IMG.mountain3, IMG.steppe2, IMG.glacier1, IMG.nature1],
  },

  // ─ СЭЛЭНГЭ / БУЛГАН ─────────────────────────────────────────────────────────
  'amarbayasgalant-khiid': {
    cover_image: IMG.nature2,
    images: [IMG.nature2, IMG.nature1, IMG.steppe1, IMG.mountain1],
  },
  'selenge-mornii-khondii': {
    cover_image: IMG.river2,
    images: [IMG.river2, IMG.river1, IMG.steppe1, IMG.nature1],
  },

  // ─ УВС / ХОВД ───────────────────────────────────────────────────────────────
  'uvs-nuur-yunyesko-delkhiin-ov': {
    cover_image: IMG.lake2,
    images: [IMG.lake2, IMG.steppe1, IMG.nature1, IMG.mountain1],
  },
  'khar-us-nuur-undesnii-tsetserlegt-khureelen': {
    cover_image: IMG.lake1,
    images: [IMG.lake1, IMG.lake2, IMG.nature1, IMG.mountain1],
  },

  // ─ ДУНДГОВЬ ─────────────────────────────────────────────────────────────────
  'tsagaan-suvarga': {
    cover_image: IMG.desert3,
    images: [IMG.desert3, IMG.desert2, IMG.steppe1, IMG.nature1],
  },

  // ─ ХЭНТИЙ ───────────────────────────────────────────────────────────────────
  'binder-chingis-khaani-torson-nutag': {
    cover_image: IMG.steppe3,
    images: [IMG.steppe3, IMG.steppe1, IMG.nature1, IMG.river1],
  },
  'onon-golin-khondii': {
    cover_image: IMG.river1,
    images: [IMG.river1, IMG.forest1, IMG.steppe1, IMG.nature1],
  },
};

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB холбогдлоо\n');

  let updated = 0;
  for (const [slug, data] of Object.entries(IMAGE_MAP)) {
    const res = await Place.updateOne({ slug }, { $set: data });
    if (res.matchedCount > 0) {
      console.log(`  ✓ ${slug}`);
      updated++;
    } else {
      console.log(`  ⚠ Олдсонгүй: ${slug}`);
    }
  }

  console.log(`\n✅ ${updated} газрын зураг шинэчлэгдлээ`);
  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
