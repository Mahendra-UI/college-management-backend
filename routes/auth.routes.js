const express = require('express');
const bcrypt = require('bcrypt'); // ✅ Secure password handling
const pool = require('../models/db');
const router = express.Router();

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: User Login
 *     description: Authenticates Admin, Student, Faculty, or Hostel Admin based on username and password.
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
 */

router.post('/login', async (req, res) => {
    try {
        const { userType, username, password } = req.body;

        if (!userType || !username || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // ✅ Fetch user details with hashed password
        const result = await pool.query(
            `SELECT username, password, full_name, user_type, course_name 
             FROM login WHERE username = $1 AND user_type = $2`,
            [username, userType]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: "Incorrect username or user type" });
        }

        const storedHashedPassword = result.rows[0].password;
        console.log("🔍 Stored Hashed Password:", storedHashedPassword);

        // ✅ Correct password verification
        const passwordMatchResult = await pool.query(
            `SELECT crypt($1, $2) = $2 AS match`,
            [password, storedHashedPassword]
        );

        console.log("🔍 Password Match Result:", passwordMatchResult.rows[0].match);

        if (!passwordMatchResult.rows[0].match) {
            return res.status(401).json({ success: false, message: "Incorrect password" });
        }

        return res.status(200).json({ 
            success: true, 
            message: "Login successful", 
            userType: result.rows[0].user_type,
            full_name: result.rows[0].full_name,
            course_name: result.rows[0].course_name
        });

    } catch (error) {
        console.error("❌ Login Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
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
        const { username, currentPassword, newPassword } = req.body;

        if (!username || !currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // ✅ Fetch stored password hash
        const result = await pool.query(
            `SELECT password FROM login WHERE username = $1`,
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const storedHashedPassword = result.rows[0].password;

        // ✅ Check if current password matches
        const passwordMatch = await pool.query(
            `SELECT password = crypt($1, password) AS match FROM login WHERE username = $2`,
            [currentPassword, username]
        );

        if (!passwordMatch.rows[0].match) {
            return res.status(401).json({ success: false, message: "Incorrect current password" });
        }

        // ✅ Hash the new password before updating
        const newHashedPassword = await pool.query(
            `SELECT crypt($1, gen_salt('bf')) AS hashed_password`,
            [newPassword]
        );

        await pool.query(
            `UPDATE login SET password = $1 WHERE username = $2`,
            [newHashedPassword.rows[0].hashed_password, username]
        );

        return res.status(200).json({ success: true, message: "Password changed successfully" });

    } catch (error) {
        console.error("❌ Password Change Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});


module.exports = router;
