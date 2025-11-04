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
        // Title şifreli mi kontrol et (şifreli veri ':' içerir)
        if (letter.title && letter.title.includes(':')) {
          console.log(`🔓 Şifreli title bulundu: ${letter.title.substring(0, 30)}...`);

          try {
            // Title'ı çöz
            const decryptedTitle = decrypt(letter.title);
            console.log(`✅ Çözüldü: ${decryptedTitle}`);

            // Doğrudan veritabanında güncelle (pre-save hook'u bypass et)
            await Letter.updateOne(
              { _id: letter._id },
              { $set: { title: decryptedTitle } }
            );

            fixed++;
            console.log('');
          } catch (decryptError) {
            // Şifre çözülemiyorsa, title'ı "Untitled" yap ve kaydı işaretle
            console.log(`⚠️  Şifre çözülemedi, "Başlıksız Mektup" olarak ayarlanıyor...`);

            await Letter.updateOne(
              { _id: letter._id },
              { $set: { title: 'Başlıksız Mektup' } }
            );

            failed++;
            failedLetters.push(letter._id);
            console.log('');
          }
        } else {
          console.log(`✓ Zaten düzgün: ${letter.title}`);
          alreadyDecrypted++;
        }
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
