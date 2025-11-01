// Cloudinary yapılandırması
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Cloudinary ayarları
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer storage ayarı
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'couple-app-gallery', // Cloudinary'de klasör adı
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }], // Boyut sınırlaması
  },
});

const upload = multer({ storage });

module.exports = { cloudinary, upload };
