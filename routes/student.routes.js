const express = require('express');
const pool = require('../models/db');
const router = express.Router();




/**
 * @swagger
 * tags:
 *   - name: Student Management
 *     description: APIs related to student operations
 */


/**
 * @swagger
 * /api/savestudents:
 *   post:
 *     summary: Save student details directly using PostgreSQL function
 *     description: Inserts a new student record by calling the database function directly
 *     responses:
 *       201:
 *         description: Student successfully created
 *       400:
 *         description: Bad request due to missing fields or username conflict
 *       500:
 *         description: Internal server error
 */
router.post("/savestudents", async (req, res) => {
    try {
      const studentData = req.body;
  
      // ✅ Call PostgreSQL function directly (no need to pass user_id)
      const result = await pool.query(
        `SELECT insert_student(
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
        ) AS student_id`,
        [
          studentData.full_name,
          studentData.father_name,
          studentData.student_gender,
          studentData.student_date_of_birth,
          studentData.mobile_no,
          studentData.email_id,
          studentData.course_id,
          studentData.academic_course_year_id,
          studentData.student_enrollment_date,
          studentData.student_address,
          studentData.student_status
        ]
      );
  
      if (result.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: "⚠️ Failed to insert student.",
        });
      }
  
      res.status(201).json({
        success: true,
        message: "✅ Student added successfully!",
        student_id: result.rows[0].student_id,
      });
  
    } catch (error) {
      console.error("❌ Error inserting student:", error);
      res.status(500).json({
        success: false,
        message: "❌ Internal Server Error",
        error: error.message,
      });
    }
  });
  


/**
 * @swagger
 * /api/updatestudent:
 *   put:
 *     tags:
 *       - Student Management
 *     summary: Update existing student
 *     description: Calls the stored function `update_student` to update student details.
 */
router.put('/updatestudent', async (req, res) => {
    try {
        const {
            student_id, full_name, father_name, student_gender, 
            student_date_of_birth, mobile_no, email_id, course_id,  // ✅ Changed from `course_name` to `course_id`
            academic_course_year_id, student_enrollment_date, student_address, student_status
        } = req.body;

        if (!student_id) {
            return res.status(400).json({ success: false, message: "Student ID is required for updating" });
        }

        const result = await pool.query(
            `SELECT update_student($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) AS updated`,
            [student_id, full_name, father_name, student_gender, 
            student_date_of_birth, mobile_no, email_id, course_id,  // ✅ Now passing `course_id`
            academic_course_year_id, student_enrollment_date, student_address, student_status]
        );

        if (result.rows[0].updated) {
            res.status(200).json({ success: true, message: "Student updated successfully" });
        } else {
            res.status(400).json({ success: false, message: "Update failed" });
        }
    } catch (error) {
        console.error("❌ Error updating student:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});


/**
 * @swagger
 * /api/getstudents:
 *   get:
 *     tags:
 *       - Student Management
 *     summary: Fetch all students
 *     description: Calls the stored function `get_students` to retrieve student details.
 *     parameters:
 *       - name: p_type
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *         description: "0 to get all students, or a student ID to fetch a specific student"
 */
router.get('/getstudents', async (req, res) => {
    try {
        const p_type = req.query.p_type ? parseInt(req.query.p_type, 10) : 0;

        if (isNaN(p_type)) {
            return res.status(400).json({ success: false, message: 'Invalid p_type. Must be an integer.' });
        }

        const result = await pool.query(`SELECT * FROM get_students($1)`, [p_type]);
        res.status(200).json({ success: true, students: result.rows });
    } catch (error) {
        console.error('❌ Error fetching students:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
});


/**
 * @swagger
 * /api/getacademiccourseyears:
 *   get:
 *     tags:
 *       - Student Management
 *     summary: Fetch academic course years
 *     description: Retrieves a list of all academic course years.
 *     responses:
 *       200:
 *         description: Successfully retrieved academic course years
 */


router.get('/getacademiccourseyears', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT academic_course_year_id, academic_course_year_name FROM academic_course_years ORDER BY academic_course_year_id`
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "No academic course years found." });
        }

        res.status(200).json({ success: true, academicYears: result.rows });
    } catch (error) {
        console.error("❌ Error fetching academic course years:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});


/**
 * @swagger
 * /api/checkduplicate:
 *   get:
 *     summary: Check for duplicate email or mobile number
 *     description: Verifies whether the email or mobile number is already registered in the system.
 */
router.get('/checkduplicate', async (req, res) => {
    try {
        const { mobile_no, email_id, student_id } = req.query;
  
        if (!mobile_no && !email_id) {
            return res.status(400).json({ success: false, message: "Mobile number or Email ID is required." });
        }
  
        const result = await pool.query(
            `SELECT * FROM public.check_duplicate_student($1, $2, $3)`, 
            [mobile_no, email_id, student_id || null]
        );
  
        if (result.rows.length > 0) {
            const duplicateField = result.rows[0].duplicate_field;
            return res.status(400).json({ 
                success: false, 
                message: `${duplicateField === 'mobile_no' ? 'Mobile Number' : 'Email ID'} already exists!` 
            });
        }
  
        res.status(200).json({ success: true, message: "No duplicates found." });
  
    } catch (error) {
        console.error("❌ Error checking duplicate:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
  });
  
  
  /**
 * @swagger
 * /api/getstudentsbyusername/{username}:
 *   get:
 *     summary: Fetch student details by username
 *     description: Retrieves detailed student information based on username.
 *     parameters:
 *       - name: username
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully retrieved student details
 */
router.get('/getstudentsbyusername/:username', async (req, res) => {
    try {
        const { username } = req.params;
  
        if (!username) {
            return res.status(400).json({ success: false, message: "Username is required" });
        }
  
        // ✅ Query Database Function
        const result = await pool.query('SELECT * FROM public.get_students_by_username($1)', [username]);
  
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }
  
        // ✅ Send the complete student data in response
        res.status(200).json({ success: true, student: result.rows[0] });
    } catch (error) {
        console.error('❌ Error fetching student:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
  });
  


/**
 * @swagger
 * /api/deletestudent/{username}:
 *   delete:
 *     summary: Delete a student and remove login credentials
 *     description: Deletes a student record from the database and removes corresponding login credentials.
 *     parameters:
 *       - name: username
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Student deleted successfully
 */
router.delete('/deletestudent/:username', async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({ success: false, message: "Username is required" });
    }

    // ✅ Delete student from students table (Cascade deletes from login table)
    await pool.query('DELETE FROM students WHERE username = $1', [username]);
    await pool.query('DELETE FROM login WHERE username = $1', [username]);

    res.status(200).json({ success: true, message: "Student deleted successfully" });
  } catch (error) {
    console.error('❌ Error deleting student:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

module.exports = router;
