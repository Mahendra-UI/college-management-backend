const express = require('express');
const pool = require('../models/db'); // Database connection
const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: Student Promotion
 *   description: API endpoints for managing student promotions
 */

/**
 * @swagger
 * /api/promotions:
 *   post:
 *     tags: [Student Promotion]
 *     summary: Promote students to the next academic year
 *     description: Inserts promotion details for students and updates their current academic year.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               students:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                       example: "B322001"
 *                     courseId:
 *                       type: integer
 *                       example: 3
 *                     academicCourseYearId:
 *                       type: integer
 *                       example: 2
 *     responses:
 *       201:
 *         description: Student promotions recorded successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Internal Server Error
 */


router.post('/promotions', async (req, res) => {
    try {
        const { students } = req.body;

        if (!students || students.length === 0) {
            return res.status(400).json({ success: false, message: "⚠️ At least one student must be provided." });
        }

        let promotionIds = [];

        for (const student of students) {
            let { username, courseId, academicCourseYearId } = student;

            // ✅ Convert to integers
            courseId = parseInt(courseId, 10);
            academicCourseYearId = parseInt(academicCourseYearId, 10);

            // ✅ Validate input
            if (!username || isNaN(courseId) || isNaN(academicCourseYearId)) {
                return res.status(400).json({ success: false, message: "⚠️ Missing or invalid course/year selection." });
            }

            // ✅ Fetch Student ID using Username
            const studentQuery = await pool.query(
                "SELECT student_id FROM students WHERE username = $1",
                [username]
            );

            if (studentQuery.rows.length === 0) {
                return res.status(404).json({ success: false, message: `⚠️ No student found with username: ${username}` });
            }

            const studentId = studentQuery.rows[0].student_id;

            try {
                // ✅ Call PostgreSQL Function
                const result = await pool.query(
                    "SELECT insert_student_promotion($1, $2, $3) AS promotion_id",
                    [studentId, courseId, academicCourseYearId]
                );

                if (result.rows[0] && result.rows[0].promotion_id) {
                    promotionIds.push(result.rows[0].promotion_id);
                }
            } catch (err) {
                console.error(`❌ Error inserting promotion for student ${username}:`, err.message);
                return res.status(500).json({ success: false, message: err.message });
            }
        }

        if (promotionIds.length === 0) {
            return res.status(400).json({ success: false, message: "⚠️ No valid promotions were added." });
        }

        res.status(201).json({ success: true, message: `✅ ${promotionIds.length} student(s) promoted successfully!`, promotionIds });

    } catch (error) {
        console.error("❌ Error processing promotions:", error);
        res.status(500).json({ success: false, message: "❌ Internal Server Error", error: error.message });
    }
});



/**
 * @swagger
 * /api/promotion-history/{username}:
 *   get:
 *     tags: [Student Promotion]
 *     summary: Fetch student promotion history
 *     description: Retrieves the entire promotion history for a student by username
 *     parameters:
 *       - name: username
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The username of the student
 *     responses:
 *       200:
 *         description: Successfully retrieved student promotion history
 *       404:
 *         description: No promotion history found for this student
 *       500:
 *         description: Internal Server Error
 */


router.get('/promotion-history/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const result = await pool.query(
            "SELECT * FROM public.promotion_history WHERE username = $1 ORDER BY created_at DESC", 
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "⚠️ No promotion history found for this student." });
        }

        res.status(200).json({ success: true, history: result.rows });
    } catch (error) {
        console.error("❌ Error fetching promotion history:", error);
        res.status(500).json({ success: false, message: "❌ Internal Server Error", error: error.message });
    }
});




/**
 * @swagger
 * /api/getpromotions:
 *   get:
 *     tags: [Student Promotion]
 *     summary: Fetch all student promotions
 *     description: Retrieves all promotion records with student details including course years.
 *     responses:
 *       200:
 *         description: Successfully retrieved promotion records
 *       404:
 *         description: No promotions found
 *       500:
 *         description: Internal Server Error
 */
router.get('/getpromotions', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM public.get_promotions()');

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "No promotions found" });
        }

        res.status(200).json({ success: true, promotions: result.rows });
    } catch (error) {
        console.error('❌ Error fetching promotions:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
});



/**
 * @swagger
 * /api/promotions/{promotionId}:
 *   get:
 *     tags: [Student Promotion]
 *     summary: Fetch promotion details by ID
 *     description: Retrieves a promotion record by its ID, including enrollment and updated course year.
 *     parameters:
 *       - name: promotionId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the promotion
 *     responses:
 *       200:
 *         description: Successfully retrieved promotion record
 *       404:
 *         description: Promotion not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/promotions/:promotionId', async (req, res) => {
    try {
        const { promotionId } = req.params;
        const result = await pool.query('SELECT * FROM public.get_promotion_by_id($1)', [promotionId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Promotion not found" });
        }

        return res.status(200).json({ success: true, promotion: result.rows[0] });
    } catch (error) {
        console.error("❌ Error fetching promotion by ID:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});



/**
 * @swagger
 * /api/getstudentsbycourseandyear/{courseId}/{yearId}:
 *   get:
 *     tags: [Student Management]
 *     summary: Fetch students by course and academic course year
 *     description: Retrieves students based on the selected course and academic year.
 *     parameters:
 *       - name: courseId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the course.
 *       - name: yearId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the academic course year.
 *     responses:
 *       200:
 *         description: Successfully retrieved students.
 *       400:
 *         description: Invalid input parameters.
 *       404:
 *         description: No students found for the given course and year.
 *       500:
 *         description: Internal Server Error.
 */
router.get('/getstudentsbycourseandyear/:courseId/:yearId', async (req, res) => {
    try {
        const { courseId, yearId } = req.params;
        const parsedCourseId = parseInt(courseId, 10);
        const parsedYearId = parseInt(yearId, 10);

        if (isNaN(parsedCourseId) || isNaN(parsedYearId)) {
            return res.status(400).json({ success: false, message: "Invalid input parameters" });
        }

        const result = await pool.query(
            `SELECT * FROM students WHERE course_id = $1 AND academic_course_year_id = $2`, 
            [parsedCourseId, parsedYearId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "No students found for the given course and year." });
        }

        res.status(200).json({ success: true, students: result.rows });
    } catch (error) {
        console.error("❌ Error fetching students by course and year:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});



/**
 * @swagger
 * /api/promotions/username/{username}:
 *   get:
 *     tags: [Student Promotion]
 *     summary: Fetch promotions by Username
 *     description: Retrieves all promotion records for a given student username
 *     parameters:
 *       - name: username
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The username of the student
 *     responses:
 *       200:
 *         description: Successfully retrieved promotion records
 *       404:
 *         description: No promotions found for the given username
 *       500:
 *         description: Internal Server Error
 */
router.get('/promotions/username/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const result = await pool.query('SELECT * FROM public.get_promotions_by_username($1)', [username]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "No promotions found for the given username." });
        }

        return res.status(200).json({ success: true, promotions: result.rows });

    } catch (error) {
        console.error("❌ Error fetching promotions by username:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});


module.exports = router;
