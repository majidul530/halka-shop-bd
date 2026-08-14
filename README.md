# বাংলাদেশ E-commerce Website — Free-Tier (Netlify + Firebase Spark)

এই ভার্সনটি সম্পূর্ণ ফ্রি চালানোর জন্য ডিজাইন করা — **কোনো Cloud Functions ব্যবহার করা হয়নি**, তাই Firebase-এর Blaze (paid) প্ল্যানে upgrade করার দরকার নেই।

## যা ফ্রি, যা না

- ✅ Netlify hosting, Firebase Auth, Firestore, Storage — সব ফ্রি (Spark plan)
- ⚠️ Custom domain (yourshop.com) — চাইলে কিনতে হবে, না হলে Netlify subdomain ফ্রি
- ⚠️ SMS/Email notification বাদ দেওয়া হয়েছে (এগুলোর জন্য সাধারণত Cloud Functions বা paid API লাগে)

## Setup ধাপ

### ১. Firebase Project তৈরি
1. https://console.firebase.google.com এ যান, নতুন প্রজেক্ট বানান
2. Authentication চালু করুন → Email/Password ও Google প্রোভাইডার enable করুন
3. Firestore Database তৈরি করুন (production mode)
4. Storage চালু করুন
5. Project Settings থেকে Web App যোগ করে config values কপি করুন

### ২. Environment Variables
`.env.example` কপি করে `.env` বানান এবং Firebase config বসান।
Netlify-তে deploy করার সময় এই একই variable গুলো Netlify Dashboard → Site Settings → Environment Variables-এ যোগ করতে হবে।

### ৩. প্রথম Super Admin তৈরি (ম্যানুয়াল — গুরুত্বপূর্ণ)
যেহেতু কোনো Cloud Function নেই, তাই প্রথম admin অ্যাকাউন্ট নিজে হাতে বানাতে হবে:

1. ওয়েবসাইটে গিয়ে সাধারণ `/register` পেজ দিয়ে একটি অ্যাকাউন্ট খুলুন (এটি এখনো শুধু কাস্টমার অ্যাকাউন্ট)
2. Firebase Console → Authentication থেকে সেই ইউজারের **UID** কপি করুন
3. Firebase Console → Firestore Database-এ গিয়ে ম্যানুয়ালি একটি ডকুমেন্ট বানান:
   - Collection: `admins`
   - Document ID: (আপনার কপি করা UID)
   - Field: `role` (string) = `superadmin`
4. এখন `/admin/login` দিয়ে সেই একই email/password দিয়ে লগইন করুন — এবার Admin Panel access পাবেন

পরবর্তী staff/admin তৈরি Admin Panel-এর Staff & Roles পেজ থেকেই করা যাবে (superadmin login থাকা অবস্থায়), কারণ `firestore.rules`-এ শুধু superadmin-কে `/admins/*` write করার অনুমতি দেওয়া আছে।

### ৪. Firestore Rules ও Storage Rules deploy
Firebase CLI ইনস্টল থাকলে:
```
firebase deploy --only firestore:rules,storage:rules
```
CLI না থাকলে, `firestore.rules` ও `storage.rules`-এর কন্টেন্ট Firebase Console-এর Rules ট্যাবে সরাসরি কপি-পেস্ট করা যায়।

### ৫. প্রাথমিক ডেটা
Admin Panel-এ ঢুকে ম্যানুয়ালি Category ও Product যোগ করুন, অথবা Firestore Console থেকে সরাসরি demo ডেটা import করুন।

`settings/shipping` নামে একটা ডকুমেন্ট বানাতে হবে shipping charge কাজ করার জন্য:
```
insideCityAreas: ["Dhaka"]
insideCityCharge: 60
outsideCityCharge: 120
freeShippingThreshold: 2000
```

### ৬. Local Development
```
npm install
npm run dev
```

### ৭. Netlify Deploy
```
npm run build
```
তারপর `dist/` ফোল্ডার Netlify-তে deploy করুন (অথবা GitHub repo connect করে auto-deploy সেট করুন)। `netlify.toml`-এ build command ও SPA redirect আগে থেকেই কনফিগার করা আছে।

## ফ্রি-টিয়ার লিমিটেশন যা মাথায় রাখতে হবে

- **Order/coupon/price validation** পুরোপুরি server-side (Cloud Function) না হয়ে Firestore transaction + rules দিয়ে best-effort করা হয়েছে (`src/services/orderService.js`-এ বিস্তারিত কমেন্ট আছে)
- **Dashboard-এর sales/order সংখ্যা** সর্বশেষ ১০০টি অর্ডারের উপর ভিত্তি করে হিসেব হয় (scheduled aggregation নেই)
- ব্যবসা বড় হলে ভবিষ্যতে Blaze plan-এ upgrade করে Cloud Functions যোগ করলে এই দুর্বলতাগুলো পুরোপুরি বন্ধ করা যাবে — বাকি পুরো architecture (Firestore schema, rules, UI) অপরিবর্তিত থেকে যাবে, শুধু সেই দুটো জায়গায় Function কল যোগ হবে

## এখনো বাকি (পরবর্তী ধাপে যোগ হবে)

Category management UI, Order management UI, Coupon/Review/Banner/Shipping/Supplier admin pages, Reports, Staff & Roles UI, Wishlist page, Customer address book, demo data seed script।
