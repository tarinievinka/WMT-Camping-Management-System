const multer = require('multer');
const path   = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
  const mimetype = file.mimetype ? file.mimetype.toLowerCase() : '';
  if (allowed.includes(mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Only JPG, PNG and WEBP images are allowed. Received: ${file.mimetype}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }  // 10MB max
});

module.exports = upload;