const express = require('express');
const pool = require('../models/db');
const router = express.Router();


/**
 * @swagger
 * /api/allocateRoom:
 *   post:
 *     tags:
 *       - Hostel Management
 *     summary: Allocate a room to a student
 *     description: Assigns an available room to a passed student in the requested block and room type.
 *     parameters:
 *       - in: body
 *         name: allocationData
 *         description: Student ID and room preferences.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             student_id:
 *               type: integer
 *             requested_block_id:
 *               type: integer
 *             requested_room_type:
 *               type: string
 *               enum: [1-Seater, 3-Seater, 4-Seater]
 *     responses:
 *       200:
 *         description: Room allocated successfully
 *       400:
 *         description: No available rooms or student not eligible
 *       500:
 *         description: Internal Server Error
 */
router.post('/allocateRoom', async (req, res) => {
    try {
        const { student_id, requested_block_id, requested_room_type } = req.body;
        
        const result = await pool.query(
            `SELECT * FROM allocate_room($1, $2, $3)`,
            [student_id, requested_block_id, requested_room_type]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ success: false, message: "No available rooms or student is not eligible." });
        }

        res.status(200).json({ success: true, allocation: result.rows[0] });
    } catch (error) {
        console.error('❌ Error allocating room:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
});


/**
 * @swagger
 * /api/getAllocatedRoom/{student_id}:
 *   get:
 *     tags:
 *       - Hostel Management
 *     summary: Get allocated room for a student
 *     description: Retrieves the allocated room details for a passed student ID.
 *     parameters:
 *       - in: path
 *         name: student_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID to fetch the allocated room.
 *     responses:
 *       200:
 *         description: Room details retrieved successfully
 *       404:
 *         description: No room found for the student
 *       500:
 *         description: Internal Server Error
 */
router.get('/getAllocatedRoom/:student_id', async (req, res) => {
    try {
        const student_id = req.params.student_id;

        const result = await pool.query(
            `SELECT * FROM get_allocated_room($1)`,
            [student_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "No allocated room found for this student." });
        }

        res.status(200).json({ success: true, room: result.rows[0] });
    } catch (error) {
        console.error('❌ Error fetching allocated room:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
});


/**
 * @swagger
 * /api/getPassedStudents:
 *   get:
 *     tags:
 *       - Hostel Management
 *     summary: Get passed students eligible for hostel allocation
 *     description: Retrieves a list of students who passed all subjects and are eligible for hostel allocation.
 *     responses:
 *       200:
 *         description: Passed students retrieved successfully
 *       404:
 *         description: No eligible students found
 *       500:
 *         description: Internal Server Error
 */
router.get('/getPassedStudents', async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM get_passed_students()`);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "No passed students found." });
        }

        res.status(200).json({ success: true, students: result.rows });
    } catch (error) {
        console.error('❌ Error fetching passed students:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
});



module.exports = router;
