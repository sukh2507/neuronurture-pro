const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

router.get('/', (req, res) => {
  const filePath = path.join(__dirname, '../assets/myth_reality.json');
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    const mythsData = JSON.parse(data).myths_vs_reality;
    res.status(200).json(mythsData);
  } catch (error) {
    console.error('Error reading myths file:', error);
    res.status(500).json({ message: 'Failed to load myth-reality data.' });
  }
});

module.exports = router;
