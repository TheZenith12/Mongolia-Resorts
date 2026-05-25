/**
 * Бүх газарт slug үүсгэх migration script
 * Ажиллуулах: node scripts/generate-slugs.mjs
 */
import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
// .env.local-ийг гараар уншина
try {
  const env = readFileSync(join(__dirname, '../.env.local'), 'utf8');
  for (const line of env.split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  }
} catch { /* production-д env var шууд тохируулагдсан байна */ }

const CYR = {
  а:'a',б:'b',в:'v',г:'g',д:'d',е:'ye',ё:'yo',ж:'j',з:'z',
  и:'i',й:'i',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',
  с:'s',т:'t',у:'u',ф:'f',х:'kh',ц:'ts',ч:'ch',ш:'sh',
  щ:'shch',ъ:'',ы:'i',ь:'',э:'e',ю:'yu',я:'ya',
  ө:'o',ү:'u',ң:'ng',
};

function toSlug(name) {
  return name
    .toLowerCase()
    .split('')
    .map(c => CYR[c] !== undefined ? CYR[c] : c)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

const PlaceSchema = new mongoose.Schema({
  name: String,
  slug: String,
  type: String,
}, { collection: 'places', strict: false });

const Place = mongoose.models.Place || mongoose.model('Place', PlaceSchema);

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('connected');

  const places = await Place.find({ slug: { $in: [null, '', undefined] } }).lean();
  console.log(`${places.length} газарт slug байхгүй байна`);

  const usedSlugs = new Set(
    (await Place.find({ slug: { $nin: [null, '', undefined] } }).select('slug').lean()).map(p => p.slug)
  );

  let updated = 0;
  for (const place of places) {
    let base = toSlug(place.name);
    let slug = base;
    let suffix = 2;
    while (usedSlugs.has(slug)) {
      slug = `${base}-${suffix++}`;
    }
    usedSlugs.add(slug);

    await Place.updateOne({ _id: place._id }, { $set: { slug } });
    console.log(`  ✓ "${place.name}" → "${slug}"`);
    updated++;
  }

  console.log(`${updated} газарт slug үүсгэгдлээ`);
  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
