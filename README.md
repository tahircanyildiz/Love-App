# 💞 Couple App - Aşk Uygulaması

Sevgilinizle özel anılarınızı paylaşabileceğiniz, birlikte yapılacaklar listesi oluşturabileceğiniz ve zaman kapsülü mektupları gönderebileceğiniz tam özellikli bir çift uygulaması.

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)

## 📱 Özellikler

### ❤️ Sevgi Notları
- Rastgele sevgi notları görüntüleme
- Yeni sevgi notu ekleme
- Tüm notları listeleme ve silme
- Akıllı tekrar önleme sistemi (tüm notlar bitmeden aynı not tekrar etmez)
- **Push bildirimleri ile sevgi notu gönderme** (OneSignal entegrasyonu)
  - Sadece bildirim gönderme (database'e kaydetmeden)
  - Bildirim + database'e kaydetme seçeneği

### 💌 Aşk Mektupları (Zaman Kapsülü)
- Gelecekteki bir tarih için mektup yazma
- Fotoğraf ekleme (5 adete kadar)
- Açılış tarihine göre otomatik sıralama
- Tarih geldiğinde mektup açma
- Geri sayım gösterimi

### 📸 Anı Galerisi
- Cloudinary entegrasyonu ile fotoğraf yükleme
- Grid görünüm
- Detaylı görüntüleme
- Fotoğraf silme

### ✅ Yapılacaklar Listesi
- Tarih ekleyebilme
- Tamamlama işaretleme
- Düzenleme ve silme
- Tarihli görevler için sıralama

### 💝 Aşk Sayacı
- Birlikte geçirilen gün sayısı
- Tarih seçimi ve güncelleme
- Kalp animasyonu

## 🏗️ Proje Yapısı

```
usApp/
├── backend/                 # Node.js + Express API
│   ├── config/             # Veritabanı ve Cloudinary ayarları
│   ├── models/             # MongoDB şemaları
│   ├── routes/             # API endpoint'leri
│   ├── utils/              # Yardımcı fonksiyonlar (şifreleme)
│   ├── .env.example        # Çevre değişkenleri şablonu
│   └── server.js           # Ana sunucu dosyası
│
└── frontend/               # React Native (Expo) Mobil Uygulama
    ├── config/             # API ayarları
    ├── screens/            # Uygulama ekranları
    ├── assets/             # Görseller ve ikonlar
    ├── app.json            # Expo yapılandırması
    └── App.js              # Ana uygulama bileşeni
```

## 🚀 Kurulum

### Ön Gereksinimler

- **Node.js** (v16 veya üzeri)
- **npm** veya **yarn**
- **MongoDB Atlas** hesabı (ücretsiz)
- **Cloudinary** hesabı (ücretsiz)
- **OneSignal** hesabı (ücretsiz - push bildirimleri için)
- **Expo CLI** (mobil uygulama için)
- **EAS CLI** (APK build için - opsiyonel)

### 1. Projeyi Klonlayın

```bash
git clone <repository-url>
cd usApp
```

### 2. Backend Kurulumu

```bash
cd backend
npm install
```

#### .env Dosyası Oluşturma

1. `.env.example` dosyasını kopyalayın:
```bash
cp .env.example .env
```

2. `.env` dosyasını düzenleyin:

```env
# MongoDB Atlas'tan connection string alın
MONGODB_URI=mongodb+srv://kullanici:sifre@cluster.mongodb.net/veritabani

# Cloudinary Dashboard'dan alın (https://cloudinary.com)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

PORT=5000

# Güvenlik için rastgele bir token
API_TOKEN=rastgele-güvenli-token-123

# Şifreleme anahtarı oluşturun:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY=sizin-64-karakterlik-hex-anahtariniz
```

#### MongoDB Atlas Kurulumu

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) hesabı oluşturun
2. Ücretsiz cluster oluşturun (M0)
3. **Database Access** → Add New Database User
   - Username ve password belirleyin
   - Built-in Role: Read and write to any database
4. **Network Access** → Add IP Address
   - "Allow Access from Anywhere" seçin (0.0.0.0/0)
5. **Clusters** → Connect → Connect your application
   - Connection string'i kopyalayın
   - `.env` dosyasına yapıştırın

#### Cloudinary Kurulumu

1. [Cloudinary](https://cloudinary.com) hesabı oluşturun (ücretsiz)
2. Dashboard'dan şu bilgileri alın:
   - **Cloud Name**
   - **API Key**
   - **API Secret**
3. `.env` dosyasına ekleyin

#### OneSignal Kurulumu (Push Bildirimleri)

1. [OneSignal](https://onesignal.com) hesabı oluşturun (ücretsiz)
2. **New App/Website** → **Google Android (FCM)** seçin
3. Firebase yapılandırması (gerekli):
   - [Firebase Console](https://console.firebase.google.com) → Yeni proje oluşturun
   - Project Settings → Cloud Messaging → **Server Key** kopyalayın
   - OneSignal'de "Firebase Server Key" alanına yapıştırın
4. OneSignal Dashboard'dan **App ID**'yi kopyalayın
5. `frontend/app.json` dosyasını açın ve OneSignal App ID'yi ekleyin:
   ```json
   {
     "expo": {
       "extra": {
         "oneSignalAppId": "buraya-app-id-yapistirin"
       }
     }
   }
   ```

**Önemli:** OneSignal için MongoDB'de `devices` collection'ına cihazlar otomatik kaydedilecek. Her cihaz için:
- `playerId`: OneSignal Player ID (unique)
- `userName`: Kullanıcı adı
- `deviceName`: Cihaz modeli
- `platform`: android/ios
- `isActive`: true/false
- `lastSeen`: Son görülme tarihi

**MongoDB Index Sorunu:** Eğer eski bir Firebase `pushToken` index'i varsa, cihaz kaydı başarısız olabilir. Bu durumda MongoDB Atlas'ta:
1. Collections → `devices` → Indexes
2. `pushToken_1` index'ini bulun ve silin
3. Veya tüm `devices` collection'ını drop edin (veriler silinir!)

#### Şifreleme Anahtarı Oluşturma

Terminal'de çalıştırın:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Çıkan 64 karakterlik kodu `.env` dosyasındaki `ENCRYPTION_KEY` alanına yapıştırın.

#### Backend'i Çalıştırma

```bash
npm start
# veya development mode için
npm run dev
```

Sunucu `http://localhost:5000` adresinde çalışacak.

### 3. Frontend Kurulumu

```bash
cd ../frontend
npm install
```

#### Bağımlılık Kontrolü ve Düzeltme

```bash
# Bağımlılık kontrolü
npx expo-doctor

# Sorunları otomatik düzelt
npx expo install --check
npx expo install --fix
```

#### API Bağlantısını Yapılandırma

1. `.env.example` dosyasını kopyalayın:
```bash
cp .env.example .env
```

2. `.env` dosyasını düzenleyin:

**Production (APK Build) için:**
```env
API_BASE_URL=https://your-app-name.onrender.com/api
```

**Geliştirme (Local Development) için:**
```env
# Production satırını yorum satırı yapın ve local IP'yi aktif edin
# API_BASE_URL=https://your-app-name.onrender.com/api
API_BASE_URL=http://192.168.1.9:5000/api
```

> **💡 IP Adresinizi Bulmak:**
>
> **Windows:**
> ```bash
> ipconfig
> ```
> "Wireless LAN adapter Wi-Fi" altındaki "IPv4 Address" değerini kullanın
>
> **Mac/Linux:**
> ```bash
> ifconfig
> # veya
> ip addr
> ```

> **⚠️ Önemli:** APK build almadan önce `.env` dosyasında production URL'ini aktif edin!

#### Frontend'i Çalıştırma

```bash
npx expo start
```

QR kod terminalde görünecek. Expo Go uygulamasıyla telefonunuzdan tarayın.

**Önemli:** Telefon ve bilgisayar aynı Wi-Fi ağında olmalı!

## 📦 APK Build Alma

### 1. EAS CLI Kurulumu

```bash
npm install -g eas-cli
eas login
```

### 2. Projeyi Yapılandırma

```bash
cd frontend
eas build:configure
```

### 3. .env Dosyasını Production'a Çevirin ⚠️

**ÇOK ÖNEMLİ:** APK build almadan önce `frontend/.env` dosyasını düzenleyin:

```env
# Production URL aktif olmalı
API_BASE_URL=https://your-app.onrender.com/api

# Local URL yorum satırında olmalı
# API_BASE_URL=http://192.168.1.9:5000/api
```

Bu ayar yapılmazsa APK local IP'ye bağlanmaya çalışır ve çalışmaz!

### 4. Build Başlatma

```bash
# Preview build (hızlı test için)
eas build --platform android --profile preview

# Production build (Play Store için)
eas build --platform android --profile production
```

Build tamamlandığında EAS size bir link verecek, oradan APK'yı indirebilirsiniz.

### Build Sorunları

Eğer build sırasında hata alırsanız:

```bash
cd frontend

# Node modules temizle
rm -rf node_modules
npm install

# Bağımlılıkları düzelt
npx expo install --fix

# Native klasörleri temizle ve yeniden oluştur
rm -rf android ios
npx expo prebuild

# Build'i cache temizleyerek tekrar dene
eas build --platform android --profile preview --clear-cache
```

## 🔧 Yapılandırma

### Tarihi Değiştirme (Aşk Sayacı)

Uygulamayı açın → **Aşk Sayacı** sekmesine gidin → Tarihe tıklayın → Yeni tarih seçin.

Tarih local storage'da saklanır, böylece değişiklik kalıcı olur.

### Backend URL'sini Değiştirme

**Render veya başka bir servis kullanıyorsanız:**

`frontend/config/api.js`:
```javascript
export const API_BASE_URL = IS_PRODUCTION
  ? 'https://sizin-backend-urliniz.com/api'  // ← Burası değişecek
  : `http://${LOCAL_IP}:5000/api`;
```

### Uygulama İsmini ve İkonunu Değiştirme

`frontend/app.json`:
```json
{
  "expo": {
    "name": "Yeni İsim",           // ← Uygulama adı
    "slug": "yeni-slug",            // ← URL slug
    "version": "1.0.0",             // ← Versiyon
    "icon": "./assets/icon.png",    // ← İkon yolu
    "android": {
      "package": "com.example.app"  // ← Paket adı
    }
  }
}
```

### Renk Temasını Değiştirme

Her ekran dosyasında (`frontend/screens/*.js`) `StyleSheet` içinde renkler tanımlı:

```javascript
// Örnek: LoveNotesScreen.js
styles = StyleSheet.create({
  header: {
    backgroundColor: '#FFB6C1',  // ← Pembe header
  },
  // ...
})
```

Ana renk paleti:
- `#FFB6C1` - Açık pembe (headerlar)
- `#FF69B4` - Koyu pembe (butonlar)
- `#FF1493` - Derin pembe (vurgular)

## 🌐 Deployment

### Backend (Render.com - Ücretsiz)

1. [Render.com](https://render.com) hesabı oluşturun
2. "New Web Service" oluşturun
3. GitHub reposunu bağlayın
4. Ayarlar:
   - **Name:** couple-app-backend
   - **Environment:** Node
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Root Directory:** `/` (boş bırakın)
5. **Environment Variables** ekleyin (`.env` dosyasındaki tüm değişkenler):
   - `MONGODB_URI`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `PORT` → `10000` (Render default)
   - `API_TOKEN`
   - `ENCRYPTION_KEY`
6. "Create Web Service" tıklayın

Render size bir URL verecek (örn: `https://your-app.onrender.com`). Bu URL'yi frontend'de kullanın:

`frontend/config/api.js`:
```javascript
export const API_BASE_URL = IS_PRODUCTION
  ? 'https://your-app.onrender.com/api'  // ← Render URL'iniz
  : `http://${LOCAL_IP}:5000/api`;
```

**Not:** Render ücretsiz planında 15 dakika hareketsizlikten sonra sunucu uyur. İlk istekte yavaş olabilir.

## 📝 API Endpoints

### Sevgi Notları
- `GET /api/notes` - Tüm notları getir
- `GET /api/notes/random` - Rastgele not getir
- `POST /api/notes` - Yeni not ekle (database'e kaydet)
  ```json
  {
    "text": "Sevgi notu içeriği",
    "senderPlayerId": "xxx-xxx-xxx" // OPSIYONEL - Eklenirse bildirim de gönderilir
  }
  ```
- `POST /api/notes/notify` - Sadece bildirim gönder (database'e kaydetmez)
  ```json
  {
    "text": "Bildirim mesajı",
    "senderPlayerId": "xxx-xxx-xxx" // ZORUNLU
  }
  ```
- `DELETE /api/notes/:id` - Not sil

### Cihaz Yönetimi (OneSignal)
- `POST /api/devices/register` - Yeni cihaz kaydet
  ```json
  {
    "playerId": "onesignal-player-id",
    "userName": "Kullanıcı Adı",
    "deviceName": "Samsung Galaxy S21",
    "platform": "android"
  }
  ```
- `GET /api/devices` - Tüm kayıtlı cihazları getir
- `DELETE /api/devices/:playerId` - Cihaz kaydını sil

### Aşk Mektupları
- `GET /api/letters` - Tüm mektupları getir (tarih sıralı)
- `POST /api/letters` - Yeni mektup ekle (multipart/form-data)
  - `title`: string
  - `message`: string
  - `openDate`: ISO date string
  - `photos`: File[] (max 5)
- `PATCH /api/letters/:id/open` - Mektubu aç
- `DELETE /api/letters/:id` - Mektup sil

### Galeri
- `GET /api/gallery` - Tüm fotoğrafları getir
- `POST /api/gallery` - Fotoğraf yükle (multipart/form-data)
  - `image`: File
  - `description`: string (optional)
- `DELETE /api/gallery/:id` - Fotoğraf sil

### Yapılacaklar
- `GET /api/todos` - Tüm görevleri getir
- `POST /api/todos` - Yeni görev ekle
  ```json
  {
    "title": "Görev başlığı",
    "date": "2024-01-01T12:00:00.000Z" // optional
  }
  ```
- `PATCH /api/todos/:id` - Görevi güncelle
  ```json
  {
    "title": "Yeni başlık",
    "completed": true,
    "date": "2024-01-01T12:00:00.000Z"
  }
  ```
- `DELETE /api/todos/:id` - Görev sil

## 🔔 Push Bildirim Sistemi (OneSignal)

### Nasıl Çalışır?

Uygulama OneSignal kullanarak cihazlar arası push bildirimleri gönderir. İşleyiş şu şekilde:

#### 1. Cihaz Kaydı
- Uygulama ilk açıldığında OneSignal otomatik bir **Player ID** oluşturur
- Bu Player ID, kullanıcı adıyla birlikte backend'e kaydedilir
- Her cihaz MongoDB'deki `devices` collection'ında saklanır
- Ayarlar ekranında Player ID ve cihaz bilgileri görülebilir

#### 2. İki Farklı Bildirim Modu

**Mod 1: Sadece Bildirim Gönder (Database'e Kaydetme)**
- Sevgi Notları ekranında **kağıt uçağı ikonu** (📧) ile açılan modal
- Yazılan mesaj sadece bildirim olarak gönderilir
- Database'e kaydedilmez, geçici bir mesajdır
- Kullanım: `POST /api/notes/notify`
- Frontend: `sendLoveNote()` fonksiyonu

**Mod 2: Database'e Kaydet (Bildirim Gönderme)**
- Sevgi Notları ekranında **artı ikonu** (+) ile açılan modal
- Yazılan not database'e kaydedilir
- Bildirim gönderilmez, sadece not listesine eklenir
- Tüm notlar arasında görünür
- Kullanım: `POST /api/notes` (senderPlayerId olmadan)
- Frontend: `addNote()` fonksiyonu

#### 3. Bildirim Akışı

```
Cihaz 1 (Gönderen)                    Backend                    Cihaz 2 (Alıcı)
     |                                   |                              |
     | 1. Bildirim gönder isteği         |                              |
     |---------------------------------->|                              |
     |    POST /notes/notify             |                              |
     |    { text, senderPlayerId }       |                              |
     |                                   |                              |
     |                                   | 2. Devices collection'dan    |
     |                                   |    diğer cihazları bul       |
     |                                   |    (senderPlayerId hariç)    |
     |                                   |                              |
     |                                   | 3. OneSignal API'ye istek    |
     |                                   |    gönder                    |
     |                                   |-------------------------------->
     |                                   |                              |
     |                                   |                              | 4. Push bildirim al
     |                                   |                              |    💕 "Sana bir sevgi
     |                                   |                              |        notu gönderdi"
     |                                   |                              |    "Mesaj içeriği"
```

#### 4. Backend Fonksiyonları

**notifyOtherDevices()** - `backend/routes/notes.js`
```javascript
// Gönderen hariç tüm cihazlara bildirim gönder
await notifyOtherDevices(senderPlayerId, {
  title: '💕 Sana bir sevgi notu gönderdi',
  body: text,
  data: { type: 'notification_only' }
});
```

Bu fonksiyon:
1. MongoDB'den gönderen hariç tüm aktif cihazları bulur
2. Her cihazın Player ID'sine OneSignal üzerinden bildirim gönderir
3. OneSignal REST API kullanır (`https://onesignal.com/api/v1/notifications`)

#### 5. Frontend Entegrasyonu

**OneSignal Başlatma** - `frontend/utils/oneSignal.js`
```javascript
// Uygulama açılışında
await OneSignal.initialize(oneSignalAppId);
const playerId = await OneSignal.User.getOnesignalId();
await registerDevice(playerId, userName);
```

**Bildirim Gönderme** - `frontend/screens/LoveNotesScreen.js`
```javascript
// Sadece bildirim gönder
await api.post('/notes/notify', {
  text: sendNoteText,
  senderPlayerId: playerId
});

// Sadece database'e kaydet
await api.post('/notes', {
  text: newNoteText
  // senderPlayerId yok = bildirim gönderilmez
});
```

### Önemli Notlar

1. **Player ID Gerekliliği**: Bildirim göndermek için gönderen cihazın Player ID'si gereklidir
2. **En Az 2 Cihaz**: Bildirimleri test etmek için en az 2 cihazda uygulama yüklü olmalı
3. **Internet Bağlantısı**: Hem gönderen hem alan cihaz online olmalı
4. **MongoDB Index**: Eski `pushToken` index'i varsa cihaz kaydı başarısız olur (yukarıda çözümü var)
5. **OneSignal Limitleri**: Ücretsiz plan 10,000 bildirim/ay sağlar
6. **Firebase FCM**: Android için Firebase Server Key gereklidir

### Debug ve Test

**Player ID Kontrolü:**
```bash
# Settings ekranında görüntüle veya AsyncStorage'dan kontrol et
```

**Backend Cihaz Listesi:**
```bash
curl https://your-backend.onrender.com/api/devices
```

**Manuel Bildirim Testi:**
```bash
curl -X POST https://your-backend.onrender.com/api/notes/notify \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Test bildirimi",
    "senderPlayerId": "cihaz-1-player-id"
  }'
```

## 🛠️ Sorun Giderme

### "API bağlantısı yok" hatası

**Kontrol listesi:**
1. ✅ Backend çalışıyor mu? → `npm start` ile başlatın
2. ✅ `frontend/config/api.js` içinde `IS_PRODUCTION` doğru mu?
   - Development: `false` + doğru `LOCAL_IP`
   - Production: `true`
3. ✅ Telefon ve bilgisayar aynı Wi-Fi'de mi?
4. ✅ Firewall backend portunu (5000) engelliyor mu?
5. ✅ Backend console'da hata var mı?

### Build hatası: "Could not resolve project"

```bash
cd frontend

# Temizlik
rm -rf node_modules
npm install

# Bağımlılıkları düzelt
npx expo install --fix
npx expo install expo-font @react-native-community/datetimepicker expo

# Native klasörleri temizle
rm -rf android ios
npx expo prebuild --clean

# Build'i tekrar dene
eas build --platform android --profile preview --clear-cache
```

### "Dependency validation" hatası

```bash
npx expo-doctor          # Sorunları göster
npx expo install --check # Detaylı rapor
npx expo install --fix   # Otomatik düzelt
```

### MongoDB bağlantı hatası

1. **IP Whitelist:** MongoDB Atlas → Network Access → 0.0.0.0/0 ekli mi?
2. **Credentials:** Username/password doğru mu? Özel karakterler varsa URL encode edin
3. **Database Access:** User'ın "Read and write to any database" yetkisi var mı?
4. **Connection String:** `mongodb+srv://` ile başlıyor mu? Database adı ekli mi?

Test etmek için:
```bash
node -e "require('mongoose').connect('YOUR_URI').then(() => console.log('✅ Connected')).catch(e => console.log('❌', e))"
```

### Cloudinary fotoğraf yükleme hatası

1. **Credentials:** Cloud Name, API Key ve Secret doğru mu?
2. **Account:** Cloudinary hesabınız aktif mi? (Ücretsiz limiti aşmadınız mı?)
3. **Logs:** Backend console'da Cloudinary hatası var mı?

### APK local IP'ye bağlanıyor

APK build almadan önce mutlaka:
```javascript
// frontend/config/api.js
const IS_PRODUCTION = true; // ✅ true olmalı!
```

### Bildirimler çalışmıyor

**1. Player ID alınamıyor:**
- Ayarlar ekranında "Player ID alınıyor..." yazıyorsa:
  - OneSignal App ID doğru mu? (`app.json` kontrol edin)
  - Firebase Server Key OneSignal'e doğru girilmiş mi?
  - İnternet bağlantısı var mı?
  - Logları kontrol edin: `npx expo start` terminal output

**2. "Player ID alındı ama backend'e kaydedilemedi" hatası:**
- Backend çalışıyor mu?
- API URL doğru mu? (app.json'da `apiBaseUrl`)
- MongoDB'de `pushToken` index'i var mı? → Silin
- Backend logs'a bakın: `E11000 duplicate key error` var mı?

**3. Bildirim gönderiliyor ama alınmıyor:**
- Her iki cihaz da database'de kayıtlı mı? → `GET /api/devices` ile kontrol edin
- Alıcı cihazın `isActive: true` mi?
- OneSignal Dashboard → Messages → Delivery bölümünde bildirim gönderilmiş mi?
- Player ID'ler doğru mu?

**4. İkinci cihaz database'e kaydolmuyor:**
```bash
# MongoDB Atlas'ta eski index'i silin
# Collections → devices → Indexes → pushToken_1 → Delete

# Veya tüm collection'ı drop edin (veriler silinir!)
# Collections → devices → Drop Collection
```

**5. OneSignal API hatası:**
- Backend `.env` dosyasında `ONESIGNAL_APP_ID` ve `ONESIGNAL_REST_API_KEY` var mı?
- OneSignal Dashboard → Settings → Keys/IDs → REST API Key kopyalandı mı?
- Backend'i yeniden başlatın: `npm start`

## 💡 İpuçları

### Development'da Hızlı Test

1. Terminal 1: Backend
```bash
cd backend && npm start
```

2. Terminal 2: Frontend
```bash
cd frontend && npx expo start
```

### İlk Veri Ekleme

Backend çalışıyorken örnek notlar ekleyin:

```bash
# Not 1
curl -X POST http://localhost:5000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"text": "Seninle geçirdiğim her an çok özel 💕"}'

# Not 2
curl -X POST http://localhost:5000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"text": "Gülüşün beni her zaman mutlu ediyor 😊"}'

# Not 3
curl -X POST http://localhost:5000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"text": "Her gün seni daha çok seviyorum 💗"}'
```

Veya Postman/Insomnia kullanın.

### Cache Temizleme

```bash
# Expo cache
npx expo start --clear

# Metro bundler cache
rm -rf /tmp/metro-*

# Watchman cache (Mac/Linux)
watchman watch-del-all
```

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/harika-ozellik`)
3. Commit atın (`git commit -m 'Harika özellik eklendi'`)
4. Push yapın (`git push origin feature/harika-ozellik`)
5. Pull Request oluşturun

## 🚀 Geliştirme Fikirleri

- [x] Push bildirimleri (OneSignal - Tamamlandı ✅)
- [ ] Mesajlaşma özelliği
- [ ] Özel gün hatırlatıcıları (doğum günü, yıldönümü)
- [ ] Tema özelleştirme (koyu mod, renk seçimi)
- [ ] Kullanıcı profilleri ve kimlik doğrulama
- [ ] Sesli mesaj kaydetme
- [ ] Video yükleme
- [ ] Widget desteği (Android)

## 📄 Lisans

Bu proje MIT lisansı altındadır.


Bu uygulama sevgililer için özel anlar yaratmak amacıyla geliştirilmiştir.

---

**Destek İçin:** Herhangi bir sorun yaşarsanız veya öneriniz varsa lütfen issue açın!

