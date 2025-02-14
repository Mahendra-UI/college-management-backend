const express = require('express');
const pool = require('../models/db');
const router = express.Router();

/**
 * @swagger
 * /api/addstudentresult:
 *   post:
 *     summary: Add a new student result
 *     description: Inserts a student result only if it does not already exist.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               courseId:
 *                 type: integer
 *               semesterId:
 *                 type: integer
 *               subjectId:
 *                 type: integer
 *               studentCredits:
 *                 type: integer
 *               resultStatus:
 *                 type: string
 *                 enum: [Pass, Fail]
 *             required:
 *               - username
 *               - courseId
 *               - semesterId
 *               - subjectId
 *               - studentCredits
 *               - resultStatus
 *     responses:
 *       '201':
 *         description: Successfully added student result
 *       '400':
 *         description: Bad Request - Fields Missing or Duplicate Entry
 *       '500':
 *         description: Internal Server Error
 */
router.post('/addstudentresult', async (req, res) => {
    try {
        const { username, courseId, semesterId, subjectId, studentCredits, resultStatus } = req.body;

        // ✅ Check for missing fields
        if (!username || !courseId || !semesterId || !subjectId || !studentCredits || !resultStatus) {
            return res.status(400).json({ success: false, message: "⚠️ All fields are required." });
        }

        // ✅ Check for duplicate record
        const existingResult = await pool.query(
            `SELECT * FROM student_results 
             WHERE username = $1 AND course_id = $2 AND semester_id = $3 AND subject_id = $4`,
            [username, courseId, semesterId, subjectId]
        );

        if (existingResult.rows.length > 0) {
            return res.status(409).json({ success: false, message: "🚫 Student result already exists for this subject." });
        }

        // ✅ Insert new student result
        await pool.query(
            `INSERT INTO student_results (username, course_id, semester_id, subject_id, credits, result_status)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [username, courseId, semesterId, subjectId, studentCredits, resultStatus]
        );

        res.status(201).json({ success: true, message: "✅ Student result added successfully!" });

    } catch (error) {
        console.error("❌ Error inserting student result:", error);
        res.status(500).json({ success: false, message: "❌ Internal Server Error. Please try again later." });
    }
});



/**
 * @swagger
 * /api/updatestudentresult:
 *   put:
 *     summary: Update an existing student result
 *     description: Updates a student's result by username, courseId, semesterId, and subjectId.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               courseId:
 *                 type: integer
 *               semesterId:
 *                 type: integer
 *               subjectId:
 *                 type: integer
 *               studentCredits:
 *                 type: integer
 *               resultStatus:
 *                 type: string
 *                 enum: [Pass, Fail]
 *             required:
 *               - username
 *               - courseId
 *               - semesterId
 *               - subjectId
 *               - studentCredits
 *               - resultStatus
 *     responses:
 *       '200':
 *         description: Successfully updated student result
 *       '400':
 *         description: Bad Request - Fields Missing or Record Not Found
 *       '500':
 *         description: Internal Server Error
 */

router.put('/updatestudentresult', async (req, res) => {
    try {
        const { username, courseId, semesterId, subjectId, studentCredits, resultStatus } = req.body;

        // ✅ Validate all fields
        if (!username || !courseId || !semesterId || !subjectId || !studentCredits || !resultStatus) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // ✅ Check if the result exists
        const existingResult = await pool.query(
            `SELECT * FROM student_results WHERE username = $1 AND course_id = $2 AND semester_id = $3 AND subject_id = $4`,
            [username, courseId, semesterId, subjectId]
        );

        if (existingResult.rows.length === 0) {
            return res.status(400).json({ success: false, message: "Student result not found for update" });
        }

        // ✅ Update student result
        await pool.query(
            `UPDATE student_results 
             SET credits = $5, result_status = $6 
             WHERE username = $1 AND course_id = $2 AND semester_id = $3 AND subject_id = $4`,
            [username, courseId, semesterId, subjectId, studentCredits, resultStatus]
        );

        res.status(200).json({ success: true, message: "Student result updated successfully" });

    } catch (error) {
        console.error("❌ Error updating student result:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});


/**
 * @swagger
 * /api/getstudentresults:
 *   get:
 *     summary: Fetch all student results
 *     description: Retrieves a list of student results with full details including total credits and earned credits.
 *     responses:
 *       200:
 *         description: Successfully retrieved student results
 */
router.get('/getstudentresults', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                sr.result_id,
                sr.username,
                s.full_name,
                c.course_name,
                sem.semester_name,
                sub.subject_name,
                sub.subject_code,
                sub.subject_credits AS total_credits,  -- ✅ Total credits from subject
                sr.credits AS earned_credits,  -- ✅ Earned credits by student
                sr.result_status,
                sr.created_at,
                sr.updated_at  -- ✅ Last updated timestamp
            FROM student_results sr
            JOIN students s ON sr.username = s.username
            JOIN courses c ON sr.course_id = c.course_id
            JOIN semesters sem ON sr.semester_id = sem.semester_id
            JOIN subjects sub ON sr.subject_id = sub.subject_id
            ORDER BY sr.updated_at DESC;  -- ✅ Order by last update time
        `);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "No student results found" });
        }

        res.status(200).json({ success: true, results: result.rows });

    } catch (error) {
        console.error("❌ Error Fetching Student Results:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});


/**
 * @swagger
 * /api/getstudentresult/{result_id}:
 *   get:
 *     summary: Get student result by result_id
 *     description: Fetches student result data based on result_id.
 *     parameters:
 *       - in: path
 *         name: result_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique ID of the student result.
 *     responses:
 *       200:
 *         description: Successfully fetched student result.
 *       400:
 *         description: Invalid request, missing result_id.
 *       404:
 *         description: Student result not found.
 *       500:
 *         description: Internal server error.
 */

router.get('/getstudentresult/:result_id', async (req, res) => {
    try {
        const { result_id } = req.params;

        if (!result_id) {
            return res.status(400).json({ success: false, message: "Missing result_id parameter" });
        }

        const result = await pool.query(
            `SELECT sr.result_id, sr.username, s.full_name, c.course_name, sr.course_id, sr.semester_id, sem.semester_name, 
                    sr.subject_id, sub.subject_name, sr.credits, sr.result_status, sr.created_at, sr.updated_at
             FROM student_results sr
             JOIN students s ON sr.username = s.username
             JOIN courses c ON sr.course_id = c.course_id
             JOIN semesters sem ON sr.semester_id = sem.semester_id
             JOIN subjects sub ON sr.subject_id = sub.subject_id
             WHERE sr.result_id = $1`,
            [result_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Student result not found" });
        }

        res.status(200).json({ success: true, result: result.rows[0] });

    } catch (error) {
        console.error("❌ Error fetching student result:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});


/**
 * @swagger
 * /api/getstudentsbycourse/{courseId}:
 *   get:
 *     summary: Fetch students by course ID
 *     description: Retrieves a list of students enrolled in a specific course.
 *     parameters:
 *       - name: courseId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Successfully retrieved student list
 *       '404':
 *         description: No students found for the given course
 *       '500':
 *         description: Internal Server Error
 */
router.get('/getstudentsbycourse/:courseId', async (req, res) => {
    try {
        const { courseId } = req.params;
        const parsedCourseId = parseInt(courseId, 10);

        if (isNaN(parsedCourseId)) {
            return res.status(400).json({ success: false, message: "Invalid course ID" });
        }

        const result = await pool.query(
            `SELECT * FROM students WHERE course_id = $1`, 
            [parsedCourseId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "No students found for the given course." });
        }

        res.status(200).json({ success: true, students: result.rows });
    } catch (error) {
        console.error("❌ Error fetching students:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});


/**
 * @swagger
 * /api/getStudentResults/{username}/{semesterId}:
 *   get:
 *     summary: Get student results by username and semester
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: semesterId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved results
 *       404:
 *         description: No results found
 *       500:
 *         description: Internal Server Error
 */
router.get('/getStudentResults/:username/:semesterId', async (req, res) => {
    try {
        const { username, semesterId } = req.params;

        console.log(`🔎 Fetching results for Username: ${username}, Semester: ${semesterId}`);

        const results = await pool.query(
            `SELECT 
                r.result_id, 
                r.username, 
                s.subject_name, 
                s.subject_code, 
                s.subject_credits AS total_credits, 
                r.credits AS earned_credits, 
                r.result_status, 
                c.course_name, 
                sm.semester_name, 
                r.created_at, 
                r.updated_at
            FROM student_results r
            JOIN subjects s ON r.subject_id = s.subject_id
            JOIN courses c ON r.course_id = c.course_id
            JOIN semesters sm ON r.semester_id = sm.semester_id
            WHERE r.username = $1 AND r.semester_id = $2
            ORDER BY r.updated_at DESC`, // Sorting by latest updates
            [username, semesterId]
        );

        if (results.rows.length > 0) {
            console.log("✅ Results Found:", results.rows);
            res.json({ success: true, results: results.rows });
        } else {
            console.warn("⚠ No results found for this semester.");
            res.status(404).json({ success: false, message: "No results found for this semester." });
        }
    } catch (error) {
        console.error("❌ Error fetching student results:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});


module.exports = router;
