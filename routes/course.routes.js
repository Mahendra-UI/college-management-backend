const express = require('express');
const pool = require('../models/db');
const router = express.Router();

/**
 * @swagger
 * /api/getcourses:
 *   get:
 *     summary: Fetch all courses
 *     description: Retrieves a list of all courses.
 *     responses:
 *       200:
 *         description: Successfully retrieved course list
 */
router.get('/getcourses', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM courses');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching courses:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

module.exports = router;
