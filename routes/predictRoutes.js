const express = require('express');
const router = express.Router();
const { getPredictions, getDistricts } = require('../controllers/predictController');

router.get('/districts', getDistricts);
router.get('/', getPredictions);

module.exports = router;
