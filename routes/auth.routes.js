const express = require('express');
const pool = require('../models/db');
const router = express.Router();

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: User Login
 *     description: Authenticates Admin or Student based on username and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userType:
 *                 type: string
 *                 enum: [Admin, Student]
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

        console.log("📩 Received Login Request for:", username, "UserType:", userType);

        if (!userType || !username || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        if (userType === 'Admin' && username === 'Admin' && password === 'Admin654') {
            console.log("✅ Admin Login Successful");
            return res.status(200).json({ success: true, message: "Admin login successful", userType: 'Admin', full_name: "Admin" });
        }

        if (userType === 'Student') {
            console.log("🛠 Checking Student Login in Database...");

            const result = await pool.query(
                `SELECT l.username, s.full_name, s.course_name, s.course_id, s.username FROM login l        
                 INNER JOIN students s ON l.username = s.username 
                 WHERE l.username = $1 AND l.password = $2`, 
                [username, password]
            );

            console.log("🔹 SQL Query Result:", result.rows);

            if (result.rows.length > 0) {
                return res.status(200).json({ 
                    success: true, 
                    message: "Student login successful", 
                    userType: 'Student', 
                    full_name: result.rows[0].full_name,
                    courseId: result.rows[0].course_id, // ✅ Return courseId
                    course_name: result.rows[0].course_name
                });
            } else {
                console.warn("⚠️ Invalid Login Attempt for:", username);
                return res.status(401).json({ success: false, message: "Incorrect username or password" });
            }
        }

        return res.status(400).json({ success: false, message: "Invalid userType" });
    } catch (error) {
        console.error("❌ Login Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});

module.exports = router;
