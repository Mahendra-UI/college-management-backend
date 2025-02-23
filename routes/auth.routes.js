const express = require('express');
const bcrypt = require('bcrypt'); // ✅ Secure password handling
const pool = require('../models/db');
const router = express.Router();


/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: User Login (Student & Management)
 *     description: Authenticates users based on their user type and credentials.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userType:
 *                 type: string
 *                 enum: [Admin, Student, Faculty, Hostel Admin]
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully logged in
 *       400:
 *         description: Missing fields
 *       401:
 *         description: Unauthorized - Incorrect credentials
 *       500:
 *         description: Internal Server Error
 */

router.post('/login', async (req, res) => {
    try {
        const { userType, username, password } = req.body;

        if (!userType || !username || !password) {
            return res.status(400).json({ success: false, message: "⚠️ All fields are required" });
        }

        let query, params;

        if (userType === "Student") {
            // ✅ Student Login from `login` table
            query = `SELECT l.username, l.password, l.full_name, l.user_type, 
                            s.course_name, s.course_id 
                     FROM login l 
                     LEFT JOIN students s ON l.username = s.username
                     WHERE l.username = $1 AND l.user_type = 'Student'`;
            params = [username];
        } else {
            // ✅ Management Login from `management_login` table
            query = `SELECT username, password, full_name, user_type, email_id, mobile_no 
                     FROM management_login 
                     WHERE username = $1 AND user_type = $2`;
            params = [username, userType];
        }

        const result = await pool.query(query, params);

        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: "⚠️ Incorrect username or user type" });
        }

        if (result.rows[0].password !== password) {
            return res.status(401).json({ success: false, message: "⚠️ Incorrect password" });
        }

        const responsePayload = {
            success: true,
            message: `${userType} login successful`,
            userType: result.rows[0].user_type,
            full_name: result.rows[0].full_name || "User",
            username: result.rows[0].username
        };

        if (userType === "Student") {
            responsePayload.course_name = result.rows[0].course_name || null;
            responsePayload.courseId = result.rows[0].course_id || null;
        } else {
            responsePayload.email = result.rows[0].email_id || null;
            responsePayload.mobile = result.rows[0].mobile_no || null;
        }

        return res.status(200).json(responsePayload);

    } catch (error) {
        console.error("❌ Login Error:", error);
        return res.status(500).json({ success: false, message: "❌ Internal Server Error", error: error.message });
    }
});



/**
 * @swagger
 * /api/change-password:
 *   post:
 *     summary: Change student password
 *     description: Allows students to update their password securely.
 */

router.post('/change-password', async (req, res) => {
    try {
        const { username, currentPassword, newPassword, confirmPassword } = req.body;

        // ✅ Validate all fields
        if (!username || !currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // ✅ Validate new password ≠ old password
        if (currentPassword === newPassword) {
            return res.status(400).json({ success: false, message: "New password must be different from the old password" });
        }

        // ✅ Validate new password = confirm password
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ success: false, message: "New password and confirm password do not match" });
        }

        const result = await pool.query(
            "SELECT change_student_password($1, $2, $3, $4) AS success",
            [username, currentPassword, newPassword, confirmPassword]
        );

        if (!result.rows[0].success) {
            return res.status(401).json({ success: false, message: "Incorrect current password or user not found" });
        }

        res.status(200).json({ success: true, message: "Password changed successfully" });

    } catch (error) {
        console.error("❌ Change Password Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});



module.exports = router;
