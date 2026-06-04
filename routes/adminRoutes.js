const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getAllStudents, uploadCutoffs, getAnalytics, deleteStudent, addSingleCollege } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname) === '.csv') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// Routes
router.get('/students', protect, adminOnly, getAllStudents);
router.get('/analytics', protect, adminOnly, getAnalytics);
router.post('/upload-cutoffs', protect, adminOnly, upload.single('file'), uploadCutoffs);
router.delete('/students/:id', protect, adminOnly, deleteStudent);
router.post('/colleges', protect, adminOnly, addSingleCollege);

module.exports = router;
