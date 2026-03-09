# 🇸🇩 فسحة - منصة تعليمية للأطفال السودانيين

تطبيق تعليمي مجاني مدعوم بـ Claude AI للأطفال السودانيين (٣-١٠ سنوات)

---

## 🚀 خطوات الرفع على الإنترنت

### الخطوة 1 — إنشاء حساب GitHub
1. اذهب لـ [github.com](https://github.com) وسجّل حساباً مجانياً
2. اضغط **"New repository"**
3. سمّه: `fos7a-app`
4. اختر **Public**
5. اضغط **"Create repository"**

### الخطوة 2 — رفع الملفات
1. في صفحة المشروع اضغط **"uploading an existing file"**
2. اسحب جميع ملفات المشروع وارفعها
3. اضغط **"Commit changes"**

### الخطوة 3 — ربطه بـ Vercel
1. اذهب لـ [vercel.com](https://vercel.com)
2. سجّل دخول بنفس حساب GitHub
3. اضغط **"Add New Project"**
4. اختر مشروع `fos7a-app`
5. اضغط **"Deploy"** ✅

### الخطوة 4 — إضافة API Key
1. اذهب لـ [console.anthropic.com](https://console.anthropic.com)
2. سجّل حساباً مجانياً
3. اضغط **"API Keys"** ثم **"Create Key"**
4. انسخ الـ Key
5. في Vercel → **Settings** → **Environment Variables**
6. أضف:
   - **Name:** `REACT_APP_ANTHROPIC_KEY`
   - **Value:** ← الـ key اللي نسخته
7. اضغط **"Redeploy"**

---

## 🎯 مميزات التطبيق

- 📖 **عربي** — حروف وكلمات
- 🔤 **English** — Letters & Words  
- 🔢 **رياضيات** — أرقام وحساب
- 🤖 أسئلة ذكية تتجدد بـ Claude AI
- 📊 نظام تتبع تقدم الأطفال
- 👨‍👩‍👧 لوحة تحكم للأهل
- 🔒 محتوى آمن 100% للأطفال
- 📱 يعمل على الموبايل والكمبيوتر

---

## 🛠️ تشغيل محلياً (للمطورين)

```bash
npm install
npm start
```

---

صُنع بـ ❤️ لأطفال السودان
