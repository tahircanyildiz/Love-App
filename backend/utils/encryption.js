// Şifreleme fonksiyonları (AES-256-GCM)
const crypto = require('crypto');

// Şifreleme anahtarı - .env dosyasından alınmalı, yoksa rastgele oluşturulur
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY
  ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex')
  : crypto.randomBytes(32); // 32 byte = 256 bit
const ALGORITHM = 'aes-256-gcm';

/**
 * Metni şifreler
 * @param {string} text - Şifrelenecek metin
 * @returns {string} - Şifrelenmiş metin (iv:authTag:encryptedData formatında)
 */
function encrypt(text) {
  if (!text) return text;

  // Rastgele IV (Initialization Vector) oluştur
  const iv = crypto.randomBytes(16);

  // Cipher oluştur
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

  // Metni şifrele
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Auth tag al (GCM modu için)
  const authTag = cipher.getAuthTag();

  // iv:authTag:encryptedData formatında birleştir
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Şifreli metni çözer
 * @param {string} encryptedData - Şifrelenmiş metin (iv:authTag:encryptedData formatında)
 * @returns {string} - Çözülmüş metin
 */
function decrypt(encryptedData) {
  if (!encryptedData) return encryptedData;

  try {
    // iv:authTag:encryptedData formatını ayır
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      // Eski format veya şifrelenmemiş veri
      return encryptedData;
    }

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    // Decipher oluştur
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);

    // Şifreyi çöz
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error.message);
    // Şifre çözülemezse orijinal veriyi döndür
    return encryptedData;
  }
}

module.exports = {
  encrypt,
  decrypt,
};
