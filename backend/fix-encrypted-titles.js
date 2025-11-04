// Şifreli title'ları düzeltmek için script
require('dotenv').config();
const mongoose = require('mongoose');
const { decrypt } = require('./utils/encryption');

const letterSchema = new mongoose.Schema({
  title: String,
  message: String,
  photos: [{
    imageUrl: String,
    cloudinaryId: String,
  }],
  openDate: Date,
  isOpened: Boolean,
  openedAt: Date,
  createdAt: Date,
});

const Letter = mongoose.model('Letter', letterSchema);

async function fixEncryptedTitles() {
  try {
    console.log('MongoDB bağlantısı kuruluyor...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB bağlantısı başarılı\n');

    const letters = await Letter.find({});
    console.log(`📝 Toplam ${letters.length} mektup bulundu\n`);

    let fixed = 0;
    let alreadyDecrypted = 0;
    let failed = 0;
    const failedLetters = [];

    for (const letter of letters) {
      try {
        console.log(`\n📧 Mektup ID: ${letter._id}`);
        console.log(`─────────────────────────────────────────`);

        // Title kontrolü
        if (letter.title && letter.title.includes(':')) {
          console.log(`📌 Title (Şifreli): ${letter.title.substring(0, 50)}...`);

          // Title'ı çözmeyi dene
          const decryptedTitle = decrypt(letter.title);

          // Şifre çözülmüş mi kontrol et (hala ':' içeriyorsa başarısız olmuştur)
          if (decryptedTitle.includes(':')) {
            // Şifre çözülemedi - başarısız
            console.log(`⚠️  Title şifre çözülemedi, "Başlıksız Mektup" olarak ayarlanıyor...`);

            await Letter.updateOne(
              { _id: letter._id },
              { $set: { title: 'Başlıksız Mektup' } }
            );

            failed++;
            failedLetters.push(letter._id);
          } else {
            // Başarıyla çözüldü
            console.log(`✅ Title çözüldü: ${decryptedTitle}`);

            await Letter.updateOne(
              { _id: letter._id },
              { $set: { title: decryptedTitle } }
            );

            fixed++;
          }
        } else {
          console.log(`📌 Title: ${letter.title}`);
          alreadyDecrypted++;
        }

        // Message kontrolü - şifreli mi ve çözülebiliyor mu?
        if (letter.message) {
          if (letter.message.includes(':')) {
            console.log(`📝 Message (Şifreli): ${letter.message.substring(0, 50)}...`);

            // Message'ı çözmeyi dene
            const decryptedMessage = decrypt(letter.message);

            if (decryptedMessage.includes(':') && decryptedMessage === letter.message) {
              console.log(`⚠️  Message şifre çözülemedi!`);
            } else {
              console.log(`✅ Message çözüldü: ${decryptedMessage.substring(0, 100)}${decryptedMessage.length > 100 ? '...' : ''}`);
            }
          } else {
            console.log(`📝 Message (Şifresiz): ${letter.message.substring(0, 100)}${letter.message.length > 100 ? '...' : ''}`);
          }
        }

        console.log('');
      } catch (error) {
        console.error(`❌ Hata (${letter._id}):`, error.message);
      }
    }

    console.log('\n📊 Özet:');
    console.log(`  - Düzeltilen: ${fixed}`);
    console.log(`  - Zaten düzgün: ${alreadyDecrypted}`);
    console.log(`  - Şifre çözülemedi: ${failed}`);
    console.log(`  - Toplam: ${letters.length}`);

    if (failedLetters.length > 0) {
      console.log('\n⚠️  Şifre çözülemeyen mektuplar:');
      console.log(`Bu mektupların başlığı "Başlıksız Mektup" olarak ayarlandı.`);
      console.log(`Mektup ID'leri: ${failedLetters.join(', ')}`);
      console.log('\n💡 Bu durum şu nedenlerden kaynaklanabilir:');
      console.log('   1. ENCRYPTION_KEY değişmiş olabilir');
      console.log('   2. Veriler farklı bir key ile şifrelenmiş olabilir');
      console.log('   3. Veritabanındaki şifreli veri bozulmuş olabilir');
    }
    console.log('\n✅ İşlem tamamlandı!');

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB bağlantısı kapatıldı');
    process.exit(0);
  }
}

fixEncryptedTitles();
