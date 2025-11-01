# 💞 Couple App - Çift Uygulaması

React Native (Expo) + Node.js + MongoDB + Cloudinary ile geliştirilmiş sevgi dolu bir mobil uygulama.

## 📱 Özellikler

- **Gün Sayacı**: Tanışma tarihinden bu yana geçen günleri gösterir
- **Yapılacaklar**: Her iki cihazda da senkronize olan todo listesi
- **Sevgi Notları**: Rastgele sevgi notları görüntüleme
- **Anı Galerisi**: Fotoğrafları Cloudinary'e yükleyip paylaşma

## 🛠️ Teknolojiler

### Frontend
- React Native (Expo)
- React Navigation
- Axios
- dayjs
- expo-image-picker
- AsyncStorage

### Backend
- Node.js + Express
- MongoDB (Mongoose)
- Cloudinary
- Multer

---

## 📦 Kurulum Adımları

### 1. Backend Kurulumu

#### a) MongoDB Atlas Hesabı Oluşturma

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) adresine git
2. Ücretsiz hesap oluştur
3. Yeni bir cluster oluştur (M0 - FREE tier)
4. Database Access > Add New Database User
   - Username ve password belirle
   - Built-in Role: Read and write to any database
5. Network Access > Add IP Address
   - "Allow Access from Anywhere" seç (0.0.0.0/0)
6. Clusters > Connect > Connect your application
   - Connection string'i kopyala
   - `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/coupleapp`

#### b) Cloudinary Hesabı Oluşturma

1. [Cloudinary](https://cloudinary.com/) adresine git
2. Ücretsiz hesap oluştur
3. Dashboard'dan şu bilgileri al:
   - Cloud Name
   - API Key
   - API Secret

#### c) Backend Paketlerini Yükle

```bash
cd backend
npm install
```

#### d) .env Dosyasını Düzenle

[backend/.env](backend/.env) dosyasını aç ve bilgileri güncelle:

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/coupleapp?retryWrites=true&w=majority
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=5000
```

#### e) Backend'i Başlat

```bash
npm run dev
```

Tarayıcıda `http://localhost:5000` adresine git, API çalışıyorsa JSON yanıt göreceksin.

---

### 2. Frontend Kurulumu

#### a) Expo CLI Yükleme (Global)

```bash
npm install -g expo-cli
```

#### b) Frontend Paketlerini Yükle

```bash
cd frontend
npm install
```

#### c) API Adresini Güncelle

Bilgisayarının yerel IP adresini öğren:

**Windows:**
```bash
ipconfig
```

**Mac/Linux:**
```bash
ifconfig
```

IPv4 adresini bul (örnek: 192.168.1.100)

[frontend/config/api.js](frontend/config/api.js) dosyasını aç ve güncelle:

```javascript
export const API_BASE_URL = 'http://192.168.1.100:5000/api';
```

#### d) Frontend'i Başlat

```bash
npm start
# veya
expo start
```

Terminal'de QR kod görünecek.

---

### 3. Gerçek Cihazda Test Etme

#### a) Expo Go Uygulamasını İndir

- Android: [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
- iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)

#### b) Uygulamayı Aç

1. Telefonunun Wi-Fi'sinin **bilgisayarınla aynı ağda** olduğundan emin ol
2. Expo Go uygulamasını aç
3. QR kodu tara
4. Uygulama yüklenecek ve açılacak

---

### 4. İlk Veri Ekleme

Backend API'sine örnek veri eklemek için:

#### Sevgi Notu Ekle

```bash
curl -X POST http://localhost:5000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"text": "Seninle geçirdiğim her an çok özel 💕"}'
```

Veya Postman/Insomnia kullanarak POST isteği gönder.

**Birkaç örnek not ekle:**

```json
{"text": "Gülüşün beni her zaman mutlu ediyor 😊"}
{"text": "Seninle olmak hayatımın en güzel hediyesi 🎁"}
{"text": "Her gün seni daha çok seviyorum 💗"}
{"text": "Yanımda olduğun için şanslıyım 🍀"}
```

---

## 📱 APK Oluşturma (Android)

### Yöntem 1: Expo Build (EAS Build)

#### a) EAS CLI Yükle

```bash
npm install -g eas-cli
```

#### b) Expo Hesabına Giriş Yap

```bash
eas login
```

#### c) Projeyi Yapılandır

```bash
cd frontend
eas build:configure
```

#### d) Android APK Oluştur

```bash
eas build -p android --profile preview
```

Build tamamlandığında link gelecek, APK'yı indirebilirsin.

### Yöntem 2: Expo Classic Build (Eski Yöntem)

```bash
expo build:android
```

APK veya AAB seç, build tamamlandığında linki al.

---

## 🎨 Ekran Görüntüleri

### Sekme 1: Gün Sayacı 💞
Tanışma tarihinden bu yana geçen günleri gösterir.

### Sekme 2: Yapılacaklar 📝
Senkronize todo listesi.

### Sekme 3: Sevgi Notları 💌
Rastgele sevgi notu gösterir.

### Sekme 4: Galeri 📸
Fotoğrafları Cloudinary'e yükler.

---

## 🔧 Sorun Giderme

### Backend'e bağlanamıyorum
- Backend'in çalıştığından emin ol: `npm run dev`
- IP adresinin doğru olduğunu kontrol et
- Telefon ve bilgisayar aynı Wi-Fi'de mi?
- Firewall backend portunu (5000) engelliyor olabilir

### Fotoğraf yüklenmiyor
- Cloudinary ayarlarının doğru olduğunu kontrol et
- .env dosyasındaki bilgileri doğrula
- Backend loglarını kontrol et

### MongoDB bağlantı hatası
- MongoDB Atlas'ta IP whitelist kontrol et (0.0.0.0/0)
- Connection string'deki şifreyi kontrol et (özel karakterler URL encode edilmeli)
- Database user'ın yetkilerini kontrol et

---

## 📝 Notlar

- `MEETING_DATE` değişkenini [frontend/screens/CounterScreen.js:10](frontend/screens/CounterScreen.js#L10) dosyasında güncellemeyi unutma
- Production'da API_BASE_URL'yi gerçek sunucu adresine güncelle
- APK oluştururken app.json'da package name ve bundle ID'yi değiştir

---

## 🚀 Geliştirme Fikirleri

- [ ] Bildirimler (doğum günü, özel gün hatırlatıcıları)
- [ ] Mesajlaşma özelliği
- [ ] Özel gün sayacı (yıldönümü, doğum günü)
- [ ] Tema renkleri özelleştirme
- [ ] Kullanıcı profili ve fotoğrafı
- [ ] Sesli mesaj gönderme

---

## 💝 Sevgiyle kodlandı

İyi kullanımlar! 💞
