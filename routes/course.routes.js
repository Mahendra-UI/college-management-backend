const express = require('express');
const pool = require('../models/db');
const router = express.Router();

/**
 * @swagger
 * /api/getcourses:
 *   get:
 *     tags:
 *       - Course Management
 *     summary: Fetch all courses
 *     description: Retrieves a list of all courses.
 *     responses:
 *       200:
 *         description: Successfully retrieved courses
 *       404:
 *         description: No courses found
 *       500:
 *         description: Internal Server Error
 */
router.get('/getcourses', async (req, res) => {
  try {
    // Call the database function directly
    const result = await pool.query(`SELECT * FROM public.get_courses()`);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No courses found.' });
    }

    res.status(200).json({ success: true, courses: result.rows });

  } catch (error) {
    console.error('❌ Error fetching courses:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
});


module.exports = router;
