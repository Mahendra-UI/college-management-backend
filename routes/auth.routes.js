const express = require('express');
const bcrypt = require('bcrypt'); // ✅ Secure password handling
const pool = require('../models/db');
const router = express.Router();

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: User Login
 *     description: Authenticates Admin, Student, or Hostel Admin based on username.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userType:
 *                 type: string
 *                 enum: [Admin, Student, Hostel Admin]
 *               username:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully logged in
 */

router.post('/login', async (req, res) => {
    try {
        const { userType, username } = req.body;

        console.log("📩 Received Login Request for:", username, "UserType:", userType);

        if (!userType || !username) {
            return res.status(400).json({ success: false, message: "Username and userType are required" });
        }

        // ✅ Hardcoded Admin Check (No Password)
        if (userType === 'Admin' && username === 'Admin') {
            console.log("✅ Admin Login Successful");
            return res.status(200).json({ success: true, message: "Admin login successful", userType: 'Admin', full_name: "Admin" });
        }

        // ✅ Hardcoded Hostel Admin Check (No Password)
        if (userType === 'Hostel Admin' && username === 'HostelAdmin') {
            console.log("✅ Hostel Admin Login Successful");
            return res.status(200).json({ success: true, message: "Hostel Admin login successful", userType: 'Hostel Admin', full_name: "Hostel Admin" });
        }

        if (userType === 'Student') {
            console.log("🛠 Checking Student Login in Database...");

            // ✅ Fetch student details from `students` table
            const result = await pool.query(
                `SELECT l.username, s.full_name, s.course_name, s.username 
                 FROM login l        
                 INNER JOIN students s ON l.username = s.username 
                 WHERE l.username = $1`, 
                [username]
            );

            console.log("🔹 SQL Query Result:", result.rows);

            if (result.rows.length > 0) {
                return res.status(200).json({ 
                    success: true, 
                    message: "Student login successful", 
                    userType: 'Student', 
                    full_name: result.rows[0].full_name,
                    course_name: result.rows[0].course_name
                });
            } else {
                console.warn("⚠️ Invalid Login Attempt for:", username);
                return res.status(401).json({ success: false, message: "Incorrect username" });
            }
        }

        return res.status(400).json({ success: false, message: "Invalid userType" });
    } catch (error) {
        console.error("❌ Login Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});


module.exports = router;
