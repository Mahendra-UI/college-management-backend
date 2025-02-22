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
 *     summary: Insert student promotions
 *     description: Inserts multiple student promotion records
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               courseId:
 *                 type: integer
 *                 example: 2
 *               students:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     studentId:
 *                       type: integer
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: "B224001"
 *                     fullName:
 *                       type: string
 *                       example: "Mahendra"
 *                     currentYear:
 *                       type: string
 *                       example: "First Year"
 *               updatedYear:
 *                 type: string
 *                 example: "Second Year"
 *     responses:
 *       201:
 *         description: Students promoted successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Internal Server Error
 */


router.post('/promotions', async (req, res) => {
    try {
        const { courseId, currentYear, updatedYear, students } = req.body;

        if (!courseId || !currentYear || !updatedYear || !students || students.length === 0) {
            return res.status(400).json({ success: false, message: "All fields are required, and at least one student must be selected." });
        }

        let values = [];

        for (const username of students) {
            // ✅ Fetch student_id from `students` table
            const studentQuery = await pool.query(
                "SELECT student_id, full_name, enrollment_year FROM students WHERE username = $1",
                [username]
            );

            if (studentQuery.rows.length === 0) {
                console.error(`❌ No student found with username: ${username}`);
                continue;
            }

            const student = studentQuery.rows[0];

            values.push([
                student.student_id,
                courseId,
                username,
                student.full_name,
                currentYear,
                updatedYear,
                student.enrollment_year
            ]);
        }

        if (values.length === 0) {
            return res.status(400).json({ success: false, message: "No valid students found." });
        }

        // ✅ Insert all students into `student_promotion`
        const insertQuery = `
            INSERT INTO student_promotion (
                student_id, course_id, username, full_name, 
                current_year, updated_year, enrollment_year, 
                created_at, updated_at
            ) VALUES ${values.map((_, i) => `($${i * 7 + 1}, $${i * 7 + 2}, $${i * 7 + 3}, $${i * 7 + 4}, $${i * 7 + 5}, $${i * 7 + 6}, $${i * 7 + 7}, NOW(), NOW())`).join(", ")}
            RETURNING promotion_id
        `;

        const insertValues = values.flat();
        const result = await pool.query(insertQuery, insertValues);

        res.status(200).json({ success: true, message: "Student promotions added successfully!", promotionIds: result.rows });

    } catch (error) {
        console.error("❌ Error inserting student promotions:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});


/**
 * @swagger
 * /api/promotions:
 *   get:
 *     tags: [Student Promotion]
 *     summary: Fetch all student promotions
 *     description: Retrieves all promotion records with student details including course years.
 *     responses:
 *       200:
 *         description: Successfully retrieved promotion records
 *       500:
 *         description: Internal Server Error
 */
router.get('/promotions', async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM public.get_promotions();`);

        return res.status(200).json({ success: true, promotions: result.rows });

    } catch (error) {
        console.error("❌ Error fetching promotions:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});


/**
 * @swagger
 * /api/promotions/{promotionId}:
 *   get:
 *     tags: [Student Promotion]
 *     summary: Fetch promotion details by ID
 *     description: Retrieves a promotion record by its ID, including enrollment course year and updated course year.
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
 * /api/getstudentsbycourseandyear/{courseId}/{currentYear}:
 *   get:
 *     summary: Fetch students by course and current year
 *     description: Retrieves students filtered by course and year.
 *     parameters:
 *       - name: courseId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *       - name: currentYear
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully retrieved students.
 *       '404':
 *         description: No students found for the given course and year.
 *       '500':
 *         description: Internal Server Error.
 */

router.get('/getstudentsbycourseandyear/:courseId/:currentYear', async (req, res) => {
    try {
        const { courseId, currentYear } = req.params;
        const parsedCourseId = parseInt(courseId, 10);

        if (isNaN(parsedCourseId) || !currentYear) {
            return res.status(400).json({ success: false, message: "Invalid input parameters" });
        }

        const result = await pool.query(
            `SELECT * FROM students WHERE course_id = $1 AND course_year = $2`, 
            [parsedCourseId, currentYear]
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
