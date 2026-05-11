# 🌿 Монгол Нутаг — Resort & Nature Platform

Монгол Улсын амралтын газрууд болон байгалийн үзэсгэлэнт газруудын нэгдсэн Full-Stack платформ.

---

## 🛠 Технологийн стек

| Давхарга | Технологи |
|---------|-----------|
| Framework | Next.js 14 (App Router) |
| UI | Tailwind CSS + Custom Design System |
| Database | MongoDB (Mongoose ODM) |
| Auth | NextAuth.js v4 (Credentials + bcryptjs) |
| Media | Cloudinary |
| Payments | QPay + Stripe |
| Deploy | Vercel |

---

## 🚀 Эхлүүлэх

### 1. Repository clone хийх

```bash
git clone https://github.com/TheZenith12/Mongolia-Resorts.git
cd Mongolia-Resorts
npm install
```

### 2. Environment variables тохируулах

```bash
cp .env.example .env.local
```

`.env.local` файлд дараах утгуудыг бөглөнө:

```env
# MongoDB — https://cloud.mongodb.com
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority

# NextAuth
NEXTAUTH_SECRET=your-random-32-char-secret-key
NEXTAUTH_URL=http://localhost:3000

# Cloudinary — https://cloudinary.com/console
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Stripe — https://dashboard.stripe.com/apikeys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# QPay — QPay merchant dashboard-аас авна
QPAY_USERNAME=
QPAY_PASSWORD=
QPAY_INVOICE_CODE=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. MongoDB Atlas тохируулах

1. [cloud.mongodb.com](https://cloud.mongodb.com) дээр бүртгэл үүсгэнэ
2. Шинэ **Cluster** үүсгэнэ (M0 Free tier ашиглаж болно)
3. **Database Access** → User нэмнэ (username + password)
4. **Network Access** → `0.0.0.0/0` IP whitelist хийнэ (эсвэл Vercel IP)
5. **Connect → Drivers** → Connection string-ийг `MONGODB_URI`-д оруулна

> MongoDB-д тусдаа schema/migration ажиллуулах шаардлагагүй —  
> Mongoose models автоматаар collection үүсгэнэ.

### 4. Super Admin үүсгэх

Бүртгэл үүсгэсний дараа MongoDB Compass эсвэл Atlas дээр:

```js
// users collection дотор role-ийг өөрчлөх
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "super_admin" } }
)
```

Эсвэл `/api/auth/signup` хийгээд first user-ийг Atlas дээр super_admin болгоно.

### 5. Cloudinary Upload Preset үүсгэх

1. Cloudinary dashboard → Settings → Upload
2. "Add upload preset" → Unsigned → Name: `mongolian_resorts`

### 6. Development эхлүүлэх

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) дээр нээнэ.

---

## 📁 Файлын бүтэц

```
mongolian-resorts/
├── app/
│   ├── (public)/              # Public routes
│   │   ├── page.tsx           # Нүүр хуудас
│   │   ├── places/            # Газруудын жагсаалт, дэлгэрэнгүй
│   │   ├── booking/           # Захиалга, төлбөр, баталгаажуулалт
│   │   └── profile/           # Хэрэглэгчийн профайл, засах
│   ├── admin/                 # Admin хэсэг
│   │   ├── page.tsx           # Dashboard (орлого, захиалга)
│   │   ├── places/            # Газрууд удирдах
│   │   ├── bookings/          # Захиалгууд
│   │   ├── availability/      # Огноо блоклох
│   │   └── users/             # Хэрэглэгчид (super admin)
│   ├── auth/                  # Login, Register
│   └── api/
│       ├── auth/              # NextAuth + signup
│       ├── payment/           # QPay, Stripe
│       ├── places/            # Search, view count
│       └── admin/             # Admin API
├── components/
│   ├── layout/                # Header, Footer, DarkModeToggle
│   ├── home/                  # Hero, PlacesSection
│   ├── places/                # PlaceDetailClient, BookingPanel, ShareButton
│   ├── search/                # SearchAutocomplete
│   ├── auth/                  # AuthPage (login/register)
│   └── admin/                 # Admin компонентууд
├── lib/
│   ├── mongodb.ts             # MongoDB connection singleton
│   ├── auth.ts                # NextAuth config
│   ├── auth-server.ts         # Server-side session helpers
│   ├── session.ts             # getCurrentUser, requireAuth...
│   ├── models/                # Mongoose models
│   │   ├── User.ts
│   │   ├── Place.ts
│   │   ├── Room.ts
│   │   ├── Booking.ts
│   │   ├── Review.ts
│   │   ├── Like.ts
│   │   ├── Message.ts
│   │   ├── AvailabilityBlock.ts
│   │   ├── SiteSettings.ts
│   │   └── ManagerAssignment.ts
│   ├── actions/               # Server Actions
│   │   ├── auth.ts
│   │   ├── places.ts
│   │   ├── rooms.ts
│   │   └── settings.ts
│   ├── types.ts               # TypeScript types
│   └── utils.ts               # Helper functions
```

---

## 🔐 Эрхийн систем

| Эрх | Чадавхи |
|-----|---------|
| **Super Admin** | Бүх мэдээлэл, хэрэглэгчдийн эрх тохируулах |
| **Manager** | Өөрийн газрын мэдээлэл засах, захиалгууд харах |
| **User** | Захиалга хийх, сэтгэгдэл үлдээх, like хийх |
| **Guest** | Газруудыг харах, хайх |

---

## 💳 Төлбөрийн систем

### QPay
- Монгол банкнуудтай нэгтгэгдсэн
- QR кодоор төлөх
- `QPAY_USERNAME`, `QPAY_PASSWORD`, `QPAY_INVOICE_CODE` шаардлагатай

### Stripe
- Олон улсын карт (Visa, MC, Amex)
- Webhook endpoint: `/api/payment/stripe/webhook`
- Stripe CLI: `stripe listen --forward-to localhost:3000/api/payment/stripe/webhook`

---

## 🌐 Deploy (Vercel)

```bash
npm i -g vercel
vercel --prod
```

Vercel dashboard → Environment Variables дотор дараах зүйлсийг нэмнэ:
- `MONGODB_URI`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (production URL)
- Cloudinary, Stripe, QPay variables

---

## 📝 API Endpoints

| Endpoint | Method | Тайлбар |
|---------|--------|---------|
| `/api/auth/signup` | POST | Бүртгэл |
| `/api/auth/[...nextauth]` | GET/POST | NextAuth (login/logout/session) |
| `/api/payment/qpay` | POST | QPay invoice үүсгэх |
| `/api/payment/qpay/check` | GET | Төлбөр шалгах |
| `/api/payment/stripe` | POST | Stripe checkout session |
| `/api/payment/stripe/webhook` | POST | Stripe webhook |
| `/api/places/search` | GET | Газар хайх (autocomplete) |
| `/api/places/view` | POST | Үзэлт нэмэх |
| `/api/admin/users/role` | POST | Хэрэглэгчийн эрх өөрчлөх |

---

## 🧑‍💻 Хөгжүүлэлт

```bash
# Type check
npx tsc --noEmit

# Lint
npm run lint

# Build test
npm run build
```
