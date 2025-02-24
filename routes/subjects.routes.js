const express = require('express');
const pool = require('../models/db');
const router = express.Router();

/**
 * @swagger
 * /api/addsubject:
 *   post:
 *     summary: Add a new subject
 *     description: Adds a subject and generates a subject code automatically.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               courseId:
 *                 type: integer
 *               semesterId:
 *                 type: integer
 *               subjectName:
 *                 type: string
 *               subjectCredits:
 *                 type: number
 *             required:
 *               - courseId
 *               - semesterId
 *               - subjectName
 *               - subjectCredits
 *     responses:
 *       '201':
 *         description: Successfully added subject
 */
router.post('/addsubject', async (req, res) => {
    try {
        const { courseId, semesterId, subjectName, subjectCredits } = req.body;

        if (!courseId || !semesterId || !subjectName || !subjectCredits) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // ✅ Generate a new subjectCode (only for new subjects)
        const subjectCode = `SUB-${courseId}-${semesterId}-${Date.now().toString().slice(-5)}`;

        // ✅ Insert new subject and return the subject_id
        const result = await pool.query(
            `INSERT INTO subjects (course_id, semester_id, subject_name, subject_code, subject_credits)
             VALUES ($1, $2, $3, $4, $5) RETURNING subject_id`,
            [courseId, semesterId, subjectName, subjectCode, subjectCredits]
        );

        res.status(201).json({ 
            success: true, 
            message: "Subject added successfully", 
            subject_id: result.rows[0].subject_id 
        });

    } catch (error) {
        console.error("❌ Error inserting subject:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});


/**
 * @swagger
 * /api/getsubjects/{courseId}/{semesterId}:
 *   get:
 *     summary: Fetch subjects based on Course ID and Semester ID
 *     description: Retrieves subjects based on course and semester. Pass 0 to fetch all.
 *     parameters:
 *       - name: courseId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: "Course ID (0 for all courses)"
 *       - name: semesterId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: "Semester ID (0 for all semesters)"
 *     responses:
 *       '200':
 *         description: Successfully retrieved subjects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 subjects:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       subject_id:
 *                         type: integer
 *                         example: 5
 *                       subject_name:
 *                         type: string
 *                         example: "Mathematics"
 *                       subject_code:
 *                         type: string
 *                         example: "MATH101"
 *                       subject_credits:
 *                         type: integer
 *                         example: 4
 *                       course_name:
 *                         type: string
 *                         example: "Computer Science"
 *                       semester_name:
 *                         type: string
 *                         example: "First Semester"
 *       '400':
 *         description: Invalid input data (Non-numeric values)
 *       '500':
 *         description: Internal Server Error
 */
router.get('/getsubjects/:courseId/:semesterId', async (req, res) => {
    try {
        const { courseId, semesterId } = req.params;

        // ✅ Debugging - Log the values received
        console.log("📩 Received Request with courseId:", courseId, "semesterId:", semesterId);

        // ✅ Convert parameters to numbers & Validate
        const parsedCourseId = Number(courseId);
        const parsedSemesterId = Number(semesterId);

        if (isNaN(parsedCourseId) || isNaN(parsedSemesterId)) {
            console.error("🚨 Error: Received NaN for courseId or semesterId");
            return res.status(400).json({ success: false, message: "Invalid courseId or semesterId. Must be an integer." });
        }

        // ✅ Query Database
        const result = await pool.query('SELECT * FROM public.get_subjects($1, $2)', [parsedCourseId, parsedSemesterId]);

        res.status(200).json({ success: true, subjects: result.rows });
    } catch (error) {
        console.error("❌ Error fetching subjects:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});






/**
 * @swagger
 * /api/updatesubject/{subjectId}:
 *   put:
 *     summary: Update an existing subject
 *     description: Update subject details using the subject ID.
 *     parameters:
 *       - name: subjectId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             subjectName:
 *               type: string
 *             subjectCode:
 *               type: string
 *             subjectCredits:
 *               type: integer
 *             courseId:
 *               type: integer
 *             semesterId:
 *               type: integer
 *     responses:
 *       '200':
 *         description: Successfully updated subject
 */
router.put('/updatesubject/:subject_id', async (req, res) => {
    try {
        const subject_id = parseInt(req.params.subject_id, 10);
        let { courseId, semesterId, subjectName, subjectCode, subjectCredits } = req.body;

        if (isNaN(subject_id) || subject_id <= 0) {
            return res.status(400).json({ success: false, message: "Invalid Subject ID" });
        }

        // ✅ Fetch the existing subjectCode if not provided
        if (!subjectCode || subjectCode.trim() === '') {
            const existingSubject = await pool.query(
                "SELECT subject_code FROM subjects WHERE subject_id = $1",
                [subject_id]
            );

            if (existingSubject.rows.length > 0) {
                subjectCode = existingSubject.rows[0].subject_code; // ✅ Keep existing subjectCode
            } else {
                return res.status(400).json({ success: false, message: "subjectCode is required" });
            }
        }

        // ✅ Update subject without modifying subject_id or subject_code
        await pool.query(
            `UPDATE subjects SET 
                course_id = $1, 
                semester_id = $2, 
                subject_name = $3, 
                subject_code = $4, 
                subject_credits = $5
             WHERE subject_id = $6`,
            [courseId, semesterId, subjectName, subjectCode, subjectCredits, subject_id]
        );

        res.status(200).json({ success: true, message: "Subject updated successfully" });

    } catch (error) {
        console.error("❌ Error updating subject:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});

/**
 * @swagger
 * /api/getsubject/{subject_id}:
 *   get:
 *     summary: Fetch a subject by subject ID
 *     tags: [Subjects]
 *     description: Retrieve subject details based on a given subject ID.
 *     parameters:
 *       - name: subject_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved subject details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 subject:
 *                   type: object
 *                   properties:
 *                     subject_id:
 *                       type: integer
 *                     subject_name:
 *                       type: string
 *                     subject_code:
 *                       type: string
 *                     subject_credits:
 *                       type: integer
 *                     course_id:
 *                       type: integer
 *                     course_name:
 *                       type: string
 *                     semester_id:
 *                       type: integer
 *                     semester_name:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid request, missing or invalid subject_id
 *       404:
 *         description: Subject not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/getsubject/:subject_id', async (req, res) => {
    try {
        const subject_id = parseInt(req.params.subject_id, 10);

        if (isNaN(subject_id) || subject_id <= 0) {
            return res.status(400).json({ success: false, message: "Invalid Subject ID" });
        }

        console.log(`📌 Fetching subject details for Subject ID: ${subject_id}`);

        // Call the function directly
        const result = await pool.query(`SELECT * FROM get_subject_by_id($1)`, [subject_id]);

        if (result.rows.length === 0) {
            console.warn("⚠ Subject not found.");
            return res.status(404).json({ success: false, message: "Subject not found" });
        }

        console.log("✅ Subject found:", result.rows[0]);
        res.status(200).json({ success: true, subject: result.rows[0] });

    } catch (error) {
        console.error("❌ API Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});



/**
 * @swagger
 * /api/getsubjects/{courseId}:
 *   get:
 *     summary: Get subjects by course ID
 *     description: Fetch all subjects for a specific course and semester.
 *     parameters:
 *       - name: courseId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully fetched subjects
 */
router.get('/getsubjects/:courseId', async (req, res) => {
    try {
        const { courseId } = req.params;
        const result = await pool.query(`SELECT * FROM subjects WHERE course_id = $1`, [courseId]);
        res.status(200).json({ success: true, subjects: result.rows });
    } catch (error) {
        console.error("❌ API Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});


/**
 * @swagger
 * /api/getsemesters:
 *   get:
 *     summary: Fetch all semesters
 *     description: Retrieves the list of semesters.
 *     responses:
 *       200:
 *         description: Successfully fetched semesters
 */

router.get('/getsemesters', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM public.get_semesters()');

        if (result.rows.length > 0) {
            res.status(200).json({ success: true, semesters: result.rows });
        } else {
            res.status(404).json({ success: false, message: 'No semesters found' });
        }
    } catch (error) {
        console.error('❌ API Error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
});


/**
 * @swagger
 * /api/getsubjects/{course_id}/{semester_id}:
 *   get:
 *     summary: Fetch subjects based on course and semester
 *     description: Retrieves subjects based on course and semester. Pass 0 to fetch all.
 *     parameters:
 *       - name: course_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID (0 for all)
 *       - name: semester_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Semester ID (0 for all)
 *     responses:
 *       '200':
 *         description: Successfully retrieved subjects
 */
router.get('/getsubjects/:course_id/:semester_id', async (req, res) => {
    try {
        const { course_id, semester_id } = req.params;
        const parsedCourseId = parseInt(course_id, 10);
        const parsedSemesterId = parseInt(semester_id, 10);

        if (isNaN(parsedCourseId) || isNaN(parsedSemesterId)) {
            return res.status(400).json({ success: false, message: "Invalid course or semester ID" });
        }

        const result = await pool.query(
            'SELECT * FROM public.get_subjects($1, $2)', 
            [parsedCourseId, parsedSemesterId]
        );

        res.status(200).json({ success: true, subjects: result.rows });
    } catch (error) {
        console.error("❌ Error fetching subjects:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});

/**
 * @swagger
 * /api/getsubjects/user/{username}:
 *   get:
 *     summary: Fetch subjects by student username
 *     description: Retrieves subjects based on username.
 *     parameters:
 *       - name: username
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Student username
 *     responses:
 *       '200':
 *         description: Successfully retrieved subjects
 *       '400':
 *         description: Invalid input format
 *       '404':
 *         description: No subjects found
 *       '500':
 *         description: Internal Server Error
 */

router.get('/getsubjects/user/:username', async (req, res) => {
    try {
        const { username } = req.params;

        // ✅ Debugging logs
        console.log("📩 Received API Request for username:", username);
        console.log("🛠 Type of username:", typeof username);

        // ✅ Validate input
        if (!username || typeof username !== 'string') {
            return res.status(400).json({ success: false, message: "Invalid username format" });
        }

        // ✅ Query database
        const result = await pool.query(
            `SELECT * FROM public.get_subjects_by_username($1)`, 
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "No subjects found for the given username" });
        }

        res.status(200).json({ success: true, subjects: result.rows });

    } catch (error) {
        console.error("❌ API Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});


/**
 * @swagger
 * /api/getsubjects/user/{username}/{courseId}:
 *   get:
 *     summary: Fetch subjects by student username and course ID
 *     description: Retrieves subjects based on username and course ID.
 *     parameters:
 *       - name: username
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Student username
 *       - name: courseId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *     responses:
 *       '200':
 *         description: Successfully retrieved subjects
 *       '400':
 *         description: Invalid input format
 *       '404':
 *         description: No subjects found
 *       '500':
 *         description: Internal Server Error
 */

router.get('/getsubjects/user/:username/:courseId', async (req, res) => {
    try {
        const { username, courseId } = req.params;

        // ✅ Debugging logs
        console.log("📩 Received API Request:");
        console.log("Username:", username, "Course ID:", courseId);

        // ✅ Validate inputs
        const parsedCourseId = parseInt(courseId, 10);
        if (!username || typeof username !== 'string' || isNaN(parsedCourseId)) {
            return res.status(400).json({ success: false, message: "Invalid username or course ID format" });
        }

        // ✅ Query database
        const result = await pool.query(
            `SELECT * FROM public.get_subjects_by_username_course($1, $2)`, 
            [username, parsedCourseId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "No subjects found for the given username and course ID" });
        }

        res.status(200).json({ success: true, subjects: result.rows });

    } catch (error) {
        console.error("❌ API Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});


/**
 * @swagger
 * /api/getsubjects/user/{username}/{courseId}/{semesterId}:
 *   get:
 *     summary: Fetch subjects by student username, course ID, and semester ID
 *     description: Retrieves subjects based on username, course ID, and semester ID.
 *     parameters:
 *       - name: username
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Student username
 *       - name: courseId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *       - name: semesterId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Semester ID
 *     responses:
 *       '200':
 *         description: Successfully retrieved subjects
 *       '400':
 *         description: Invalid input format
 *       '404':
 *         description: No subjects found
 *       '500':
 *         description: Internal Server Error
 */

router.get('/getsubjects/user/:username/:courseId/:semesterId', async (req, res) => {
    try {
        const { username, courseId, semesterId } = req.params;
        console.log("📩 Received API Request:", username, courseId, semesterId);

        // Convert to integers
        const parsedCourseId = parseInt(courseId, 10);
        const parsedSemesterId = parseInt(semesterId, 10);

        // Validate inputs
        if (!username || typeof username !== 'string' || isNaN(parsedCourseId) || isNaN(parsedSemesterId)) {
            return res.status(400).json({ success: false, message: "Invalid username, course ID, or semester ID format" });
        }

        // Fetch subjects from PostgreSQL
        const result = await pool.query(
            `SELECT * FROM public.get_subjects_by_username_course_semester($1, $2, $3)`, 
            [username, parsedCourseId, parsedSemesterId]
        );

        // Check if subjects exist
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "No subjects found for the given filters" });
        }

        res.status(200).json({ success: true, subjects: result.rows });
    } catch (error) {
        console.error("❌ API Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});


/**
 * @swagger
 * /api/deletesubject/{subject_id}:
 *   delete:
 *     summary: Delete a subject
 *     description: Deletes a subject based on `subject_id`.
 *     parameters:
 *       - in: path
 *         name: subject_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique subject ID to be deleted.
 *     responses:
 *       200:
 *         description: Successfully deleted subject.
 *       400:
 *         description: Invalid request, missing subject_id.
 *       404:
 *         description: Subject not found.
 *       500:
 *         description: Internal server error.
 */
router.delete('/deletesubject/:subject_id', async (req, res) => {
    try {
        const { subject_id } = req.params;

        if (!subject_id) {
            return res.status(400).json({ success: false, message: "Missing subject_id parameter" });
        }

        const result = await pool.query(`SELECT delete_subject($1) AS message`, [subject_id]);

        if (result.rows[0].message === 'Subject not found') {
            return res.status(404).json({ success: false, message: "Subject not found" });
        }

        res.status(200).json({ success: true, message: "Subject deleted successfully" });

    } catch (error) {
        console.error("❌ Error deleting subject:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});



module.exports = router;
