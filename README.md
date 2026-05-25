# Монгол Нутаг

Монгол Улсын амралтын болон байгалийн үзэсгэлэнт газруудын каталог, захиалгийн платформ.

## Технологи

- **Next.js 14** (App Router, Server Actions)
- **MongoDB** + Mongoose
- **NextAuth.js v4** — credentials auth, JWT
- **Cloudinary** — зургийн хадгалалт
- **QPay / Stripe** — төлбөр
- **Tailwind CSS**
- **Vercel** — deploy

## Хурдан эхлүүлэх

```bash
git clone https://github.com/TheZenith12/Mongolia-Resorts.git
cd Mongolia-Resorts
npm install
cp .env.example .env.local
npm run dev
```

`.env.local`-д дараах орчны хувьсагчдыг бөглөнө — `.env.example` файл лавлана уу.

## Орчны хувьсагч

```env
MONGODB_URI=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
QPAY_USERNAME=
QPAY_PASSWORD=
QPAY_INVOICE_CODE=
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Super Admin болгох

Бүртгүүлсний дараа MongoDB дотор role-ийг гараар өөрчлөх:

```js
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "super_admin" } }
)
```

## Cloudinary тохируулах

Dashboard → Settings → Upload → "Add upload preset" → Unsigned → Name: `mongolian_resorts`

## Скрипт ажиллуулах

```bash
# Газруудад slug үүсгэх (нэг удаа ажиллуулна)
node scripts/generate-slugs.mjs

# Газруудын зурагийг Unsplash-аар шинэчлэх
node scripts/fix-images.mjs

# Бодит мэдээлэл + зургаар газруудыг шинэчлэх
node scripts/update-all-places.mjs
```

## Файлын бүтэц

```
app/
  (public)/          — нийтийн хуудсууд (нүүр, газрууд, захиалга, профайл)
  admin/             — удирдлагын самбар
  api/               — API routes
  auth/              — нэвтрэх, бүртгэл
components/
  admin/             — admin UI
  home/              — нүүр хуудасны блокууд
  places/            — газрын дэлгэрэнгүй, захиалга
  layout/            — header, footer
lib/
  models/            — Mongoose models
  actions/           — Server Actions
  auth.ts            — NextAuth config
  mongodb.ts         — DB connection
scripts/             — нэг удаагийн migration скриптүүд
```

## Эрхийн систем

- **super_admin** — бүх мэдээлэл, хэрэглэгчдийн эрх
- **manager** — өөрийн газрын мэдээлэл, захиалга
- **user** — захиалга, сэтгэгдэл, like
- **guest** — харах, хайх

## Deploy

Vercel дээр deploy хийхэд `.env.local`-ын бүх хувьсагчдыг Vercel dashboard → Environment Variables-д нэмэх хэрэгтэй.
