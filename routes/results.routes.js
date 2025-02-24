const express = require('express');
const pool = require('../models/db');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Student Results
 *   description: API endpoints for managing student results
 */


/**
 * @swagger
 * /api/addstudentresult:
 *   post:
 *     summary: Add a new student result
 *     tags: [Student Results]
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
 *     responses:
 *       201:
 *         description: Successfully added student result
 *       400:
 *         description: Bad Request - Student result already exists
 *       500:
 *         description: Internal Server Error
 */
router.post('/addstudentresult', async (req, res) => {
    try {
        const { username, courseId, semesterId, subjectId, studentCredits, resultStatus } = req.body;

        if (!username || !courseId || !semesterId || !subjectId || !studentCredits || !resultStatus) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const result = await pool.query(
            `SELECT insert_student_result($1, $2, $3, $4, $5, $6) AS response`,
            [username, courseId, semesterId, subjectId, studentCredits, resultStatus]
        );

        const responseMessage = result.rows[0].response;

        if (responseMessage === 'Student result already exists') {
            return res.status(400).json({ success: false, message: responseMessage });
        }

        res.status(201).json({ success: true, message: responseMessage });
    } catch (error) {
        if (error.code === '23505') {  // Catch the duplicate entry error
            return res.status(400).json({ success: false, message: "Student result already exists" });
        }
        console.error("❌ Error adding student result:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});


/**
 * @swagger
 * /api/updatestudentresult:
 *   put:
 *     summary: Update a student result
 *     tags: [Student Results]
 */
router.put('/updatestudentresult', async (req, res) => {
    try {
        const { username, courseId, semesterId, subjectId, studentCredits, resultStatus } = req.body;

        if (!username || !courseId || !semesterId || !subjectId || !studentCredits || !resultStatus) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const result = await pool.query(
            `SELECT update_student_result($1, $2, $3, $4, $5, $6) AS response`,
            [username, courseId, semesterId, subjectId, studentCredits, resultStatus]
        );

        res.status(200).json({ success: true, message: result.rows[0].response });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});

/**
 * @swagger
 * /api/getstudentresult/{result_id}:
 *   get:
 *     summary: Get student result by result_id
 *     tags: [Student Results]
 *     parameters:
 *       - in: path
 *         name: result_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully fetched student result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 result:
 *                   type: object
 *                   properties:
 *                     result_id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     full_name:
 *                       type: string
 *                     course_name:
 *                       type: string
 *                     semester_name:
 *                       type: string
 *                     subject_name:
 *                       type: string
 *                     subject_code:
 *                       type: string
 *                     earned_credits:
 *                       type: integer
 *                     result_status:
 *                       type: string
 *       400:
 *         description: Invalid request, missing result_id
 *       404:
 *         description: Student result not found
 *       500:
 *         description: Internal server error
 */

router.get('/getstudentresult/:result_id', async (req, res) => {
    try {
        const { result_id } = req.params;

        if (!result_id) {
            return res.status(400).json({ success: false, message: "result_id parameter is required" });
        }

        const result = await pool.query(`SELECT * FROM get_student_result_by_id($1)`, [result_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Student result not found" });
        }

        res.status(200).json({ success: true, result: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});

/**
 * @swagger
 * /api/getstudentresults:
 *   get:
 *     summary: Fetch all student results
 *     tags: [Student Results]
 *     description: Retrieves a list of all student results with full details.
 *     responses:
 *       200:
 *         description: Successfully retrieved student results
 */
router.get('/getstudentresults', async (req, res) => {
    try {
        console.log("🔍 Fetching student results...");
        const result = await pool.query("SELECT * FROM get_all_student_results()");
        console.log("📌 Query Result:", result.rows);

        // ✅ Return 200 OK with an empty array if no results
        if (result.rows.length === 0) {
            return res.status(200).json({ success: true, results: [], message: "No student results found" });
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
 *     tags: [Student Results]
 */
router.get('/getstudentresult/:result_id', async (req, res) => {
    try {
        const { result_id } = req.params;

        if (!result_id) {
            return res.status(400).json({ success: false, message: "result_id parameter is required" });
        }

        const result = await pool.query(`SELECT * FROM get_student_result_by_id($1)`, [result_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Student result not found" });
        }

        res.status(200).json({ success: true, result: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});
/**
 * @swagger
 * /api/getStudentResults/{username}/{semesterId}:
 *   get:
 *     summary: Get student results by username and semester
 *     tags: [Student Results]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: The student's username.
 *       - in: path
 *         name: semesterId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The semester ID.
 *     responses:
 *       200:
 *         description: Successfully retrieved results.
 *       404:
 *         description: No results found for the specified username and semester.
 *       500:
 *         description: Internal Server Error.
 */
router.get('/getStudentResults/:username/:semesterId', async (req, res) => {
    try {
        const { username, semesterId } = req.params;

        if (!username || isNaN(semesterId)) {
            return res.status(400).json({ success: false, message: "Invalid username or semesterId" });
        }

        console.log(`🔍 Fetching results for Username: ${username}, Semester: ${semesterId}`);

        const results = await pool.query(
            `SELECT * FROM get_student_results_by_username($1) WHERE semester_name = (SELECT semester_name FROM semesters WHERE semester_id = $2)`, 
            [username, semesterId]
        );

        if (results.rows.length > 0) {
            console.log("✅ Results Found:", results.rows);
            res.status(200).json({ success: true, results: results.rows });
        } else {
            console.warn("⚠ No results found for this semester.");
            res.status(404).json({ success: false, message: "No results found for this semester." });
        }
    } catch (error) {
        console.error("❌ Error fetching student results:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});


/**
 * @swagger
 * /api/deletestudentresult/{result_id}:
 *   delete:
 *     summary: Delete a student result by result_id
 *     tags: [Student Results]
 *     parameters:
 *       - in: path
 *         name: result_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique result ID of the student result to be deleted.
 *     responses:
 *       200:
 *         description: Successfully deleted student result
 *       404:
 *         description: Student result not found
 *       500:
 *         description: Internal Server Error
 */
router.delete('/deletestudentresult/:result_id', async (req, res) => {
    try {
        const { result_id } = req.params;

        if (!result_id || isNaN(result_id)) {
            return res.status(400).json({ success: false, message: "Invalid result_id parameter" });
        }

        console.log(`🔍 Deleting student result with ID: ${result_id}`);

        const result = await pool.query(`SELECT delete_student_result_by_id($1) AS response`, [result_id]);

        if (result.rows[0].response === 'Student result not found') {
            console.warn("⚠ Student result not found.");
            return res.status(404).json({ success: false, message: "Student result not found" });
        }

        console.log("✅ Student result deleted successfully.");
        res.status(200).json({ success: true, message: result.rows[0].response });

    } catch (error) {
        console.error("❌ Error deleting student result:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});


/**
 * @swagger
 * /api/getstudentresultsbyusername/{username}:
 *   get:
 *     summary: Get student results by username
 *     tags: [Student Results]
 *     description: Fetches student result data based on the username using the stored function.
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: The username of the student whose results are to be fetched.
 *     responses:
 *       200:
 *         description: Successfully fetched student results.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       result_id:
 *                         type: integer
 *                       username:
 *                         type: string
 *                       full_name:
 *                         type: string
 *                       course_name:
 *                         type: string
 *                       semester_name:
 *                         type: string
 *                       subject_name:
 *                         type: string
 *                       subject_code:
 *                         type: string
 *                       total_credits:
 *                         type: integer
 *                       earned_credits:
 *                         type: integer
 *                       result_status:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Invalid request, missing username
 *       404:
 *         description: Student results not found
 *       500:
 *         description: Internal server error
 */
router.get('/getstudentresultsbyusername/:username', async (req, res) => {
    try {
        const { username } = req.params;

        if (!username) {
            return res.status(400).json({ success: false, message: "Username parameter is required" });
        }

        console.log(`🔍 Fetching student results for username: ${username}`);

        // Call the PostgreSQL function
        const result = await pool.query(`SELECT * FROM get_student_results_by_username($1)`, [username]);

        if (result.rows.length === 0) {
            console.warn("⚠ No student results found.");
            return res.status(404).json({ success: false, message: "Student results not found" });
        }

        console.log("✅ Student results found:", result.rows);
        res.status(200).json({ success: true, results: result.rows });

    } catch (error) {
        console.error("❌ Error fetching student results:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});



module.exports = router;
