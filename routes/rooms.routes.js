

const express = require('express');
const router = express.Router();
const pool = require('../models/db');

/**
 * @swagger
 * tags:
 *   name: Room Management
 *   description: APIs for managing rooms
 */


/**
 * @swagger
 * /api/rooms:
 *   post:
 *     summary: Insert a new room
 *     tags: [Room Management]
 */
router.post('/rooms', async (req, res) => {
    try {
        const { room_name, seats, floor_id } = req.body;

        if (!room_name || !seats || !floor_id) {
            return res.status(400).json({ success: false, message: "room_name, seats, and floor_id are required" });
        }

        const result = await pool.query(
            'SELECT * FROM public.insert_room($1, $2, $3);', 
            [room_name, seats, floor_id]
        );

        if (result.rows.length === 0) {
            return res.status(500).json({ success: false, message: "Room insertion failed" });
        }

        res.status(201).json({ success: true, message: "Room added successfully", room: result.rows[0] });
    } catch (error) {
        console.error("❌ API Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});




/**
 * @swagger
 * /api/rooms/{room_id}:
 *   get:
 *     summary: Get room details by room ID
 *     tags: [Room Management]
 *     parameters:
 *       - name: room_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the room to retrieve.
 *     responses:
 *       200:
 *         description: Successfully retrieved room details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 room:
 *                   type: object
 *                   properties:
 *                     room_id:
 *                       type: integer
 *                     room_name:
 *                       type: string
 *                     seats:
 *                       type: integer
 *                     floor_id:
 *                       type: integer
 *                     floor_name:
 *                       type: string
 *                     block_id:
 *                       type: integer
 *                     block_name:
 *                       type: string
 *                     hostel_id:
 *                       type: integer
 *                     hostel_name:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Room not found.
 *       500:
 *         description: Internal Server Error.
 */

router.get('/rooms/:room_id', async (req, res) => {
    try {
        const { room_id } = req.params;

        if (!room_id || isNaN(room_id)) {
            return res.status(400).json({ success: false, message: "Invalid room_id" });
        }

        const result = await pool.query('SELECT * FROM public.get_room_by_room_id($1);', [parseInt(room_id, 10)]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Room not found" });
        }

        res.status(200).json({ success: true, room: result.rows[0] });
    } catch (error) {
        console.error("❌ API Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});

/**
 * @swagger
 * /api/rooms:
 *   put:
 *     summary: Update room by ID
 *     tags: [Room Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               room_id:
 *                 type: integer
 *                 example: 1
 *               room_name:
 *                 type: string
 *                 example: "Updated Room 101"
 *               seats:
 *                 type: integer
 *                 example: 4
 *               floor_id:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Room updated successfully.
 *       400:
 *         description: Bad request.
 *       500:
 *         description: Internal Server Error.
 */
router.put('/rooms', async (req, res) => {
    try {
        const { room_id, room_name, seats, floor_id } = req.body;

        if (!room_id || !room_name || !seats || !floor_id) {
            return res.status(400).json({ success: false, message: "room_id, room_name, seats, and floor_id are required" });
        }

        const result = await pool.query(
            'SELECT * FROM public.update_room_by_id($1, $2, $3, $4);', 
            [parseInt(room_id, 10), room_name, parseInt(seats, 10), parseInt(floor_id, 10)]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Room not found" });
        }

        res.status(200).json({ success: true, message: "Room updated successfully", room: result.rows[0] });
    } catch (error) {
        console.error("❌ API Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});


/**
 * @swagger
 * /api/rooms/{room_id}:
 *   delete:
 *     summary: Delete a room
 *     tags: [Room Management]
 *     parameters:
 *       - name: room_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully deleted room.
 *       404:
 *         description: Room not found.
 *       500:
 *         description: Internal Server Error.
 */

router.delete('/rooms/:room_id', async (req, res) => {
    try {
        const { room_id } = req.params;

        if (!room_id) {
            return res.status(400).json({ success: false, message: "room_id is required" });
        }

        await pool.query('DELETE FROM rooms WHERE room_id = $1;', [parseInt(room_id, 10)]);

        res.status(200).json({ success: true, message: "Room deleted successfully" });
    } catch (error) {
        console.error("❌ API Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});


/**
 * @swagger
 * /api/rooms:
 *   get:
 *     summary: Get all rooms with floor, block, and hostel details
 *     tags: [Room Management]
 *     responses:
 *       200:
 *         description: Successfully retrieved all rooms.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 rooms:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       room_id:
 *                         type: integer
 *                         example: 1
 *                       room_name:
 *                         type: string
 *                         example: "Room 101"
 *                       seats:
 *                         type: integer
 *                         example: 4
 *                       floor_id:
 *                         type: integer
 *                         example: 1
 *                       floor_name:
 *                         type: string
 *                         example: "First Floor"
 *                       block_id:
 *                         type: integer
 *                         example: 1
 *                       block_name:
 *                         type: string
 *                         example: "A Block"
 *                       hostel_id:
 *                         type: integer
 *                         example: 1
 *                       hostel_name:
 *                         type: string
 *                         example: "Boys Hostel"
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Internal Server Error.
 */

router.get('/rooms', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM public.get_rooms();');
        res.status(200).json({ success: true, rooms: result.rows });
    } catch (error) {
        console.error("❌ API Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});


/**
 * @swagger
 * /api/getAvailableRooms:
 *   get:
 *     summary: Get available rooms
 *     tags: [Room Management]
 *     responses:
 *       200:
 *         description: List of available rooms
 *       500:
 *         description: Internal Server Error
 */

router.get('/getAvailableRooms', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM get_available_rooms();");
        res.status(200).json({ success: true, rooms: result.rows });
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});


// router.get('/getAvailableRooms', async (req, res) => {
//     try {
//         const result = await pool.query("SELECT * FROM get_available_rooms();");
//         res.status(200).json({ success: true, rooms: result.rows });
//     } catch (error) {
//         console.error("API Error:", error);
//         res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
//     }
// });



/**
 * @swagger
 * /api/allocateStudentsToRooms:
 *   post:
 *     summary: Allocate multiple students to rooms
 *     tags: [Room Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               allocations:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     student_id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     full_name:
 *                       type: string
 *                     room_id:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Students allocated successfully
 *       500:
 *         description: Internal Server Error
 */


router.post('/allocateStudentsToRooms', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN'); // 🔹 Start transaction

        const allocations = req.body.allocations;
        if (!allocations || allocations.length === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ success: false, message: "❌ Allocations data is required." });
        }

        let alreadyAllocatedStudents = [];
        let unavailableRooms = [];

        for (const allocation of allocations) {
            const { student_id, room_id, username, full_name, academic_course_year_id, gender, request_id, requested_by } = allocation;

            // ✅ Validate required fields including gender
            if (!student_id || !room_id || !academic_course_year_id || !username || !full_name || !gender) {
                await client.query('ROLLBACK');
                return res.status(400).json({ success: false, message: "❌ Missing required fields (student_id, room_id, academic_course_year_id, username, full_name, gender)." });
            }

            // ✅ Check if the student already has an allocation in the same academic year
            const checkExisting = await client.query(
                "SELECT room_id FROM student_room_allocations WHERE student_id = $1 AND academic_course_year_id = $2",
                [student_id, academic_course_year_id]
            );

            if (checkExisting.rows.length > 0) {
                alreadyAllocatedStudents.push(full_name);
                continue; // Skip allocation for this student
            }

            // ✅ Check room availability before allocation
            const roomCheck = await client.query(
                "SELECT available_seats, room_name FROM room_availability WHERE room_id = $1",
                [room_id]
            );

            if (roomCheck.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ success: false, message: `🚫 Room '${room_id}' not found.` });
            }

            let availableSeats = roomCheck.rows[0].available_seats;
            let roomName = roomCheck.rows[0].room_name;

            if (availableSeats <= 0) {
                unavailableRooms.push(`${roomName} (Room ID: ${room_id})`);
                continue; // Skip allocation for this room
            }

            // ✅ Allocate Student with gender
await client.query(
  "SELECT allocate_student_to_room($1, $2, $3, $4, $5, $6, $7);",
  [student_id, username, full_name, room_id, academic_course_year_id, request_id || null, requested_by || 'Hostel Admin']
);

        }

        // ✅ If any students were already allocated, return a detailed message
        if (alreadyAllocatedStudents.length > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: `❌ One or more students already have an allocated room for this academic year: ${alreadyAllocatedStudents.join(", ")}`
            });
        }

        // ✅ If any rooms were unavailable, return a proper error message
        if (unavailableRooms.length > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: `🚫 The following rooms are already full: ${unavailableRooms.join(", ")}`
            });
        }

        await client.query('COMMIT'); // ✅ Ensure transaction commits properly
        res.status(200).json({ success: true, message: "✅ Students allocated successfully!" });

    } catch (error) {
        await client.query('ROLLBACK'); // Rollback on error
        console.error("❌ API Error:", error);
        res.status(500).json({ success: false, message: "🚫 Internal Server Error. Please try again later.", error: error.message });
    } finally {
        client.release();
    }
});


/**
 * @swagger
 * /api/rooms/hostel/{hostelId}/block/{blockId}/floor/{floorId}:
 *   get:
 *     summary: Fetch available rooms by hostel, block, and floor
 *     tags: [Room Management]
 *     parameters:
 *       - in: path
 *         name: hostelId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: blockId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: floorId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved rooms
 *       500:
 *         description: Internal Server Error
 */
router.get('/rooms/hostel/:hostelId/block/:blockId/floor/:floorId', async (req, res) => {
    try {
        const { hostelId, blockId, floorId } = req.params;
        console.log(`Fetching rooms for hostel ${hostelId}, block ${blockId}, floor ${floorId}`);

        const result = await pool.query(
            "SELECT * FROM get_rooms_by_hostel_block_floor($1, $2, $3);",
            [parseInt(hostelId), parseInt(blockId), parseInt(floorId)]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "No rooms found" });
        }

        res.status(200).json({ success: true, rooms: result.rows });
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});



// 06-03-2025 new apis


/**
 * @swagger
 * /api/requestRoom:
 *   post:
 *     summary: Submit a Room Request
 *     tags: [Room Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "B122001"
 *               academic_course_year_id:
 *                 type: integer
 *                 example: 2
 *               selected_students:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: "B122001"
 *     responses:
 *       201:
 *         description: Room request submitted successfully.
 *       400:
 *         description: Bad request.
 *       500:
 *         description: Internal Server Error.
 */

router.post('/requestRoom', async (req, res) => {
    const client = await pool.connect();
    try {
        let { username, academic_course_year_id, selected_students, hostel_id } = req.body;

        console.log("DEBUG: Received Request Payload:", req.body);

        if (!username || !academic_course_year_id || !selected_students.length || !hostel_id) {
            console.error("❌ Missing required fields.");
            return res.status(400).json({ success: false, message: "❌ Username, academic year, students, hostel details are required." });
        }

        // ✅ Convert all student IDs to integers
        selected_students = selected_students.map(s => Number(s));

        // ✅ Ensure logged-in user is in the selected_students list
        const userStudentIdResult = await client.query(
            `SELECT student_id FROM students WHERE username = $1`, [username]
        );

        if (userStudentIdResult.rows.length === 0) {
            console.error("❌ User not found in the database.");
            return res.status(400).json({ success: false, message: "❌ User not found in the database." });
        }

        const userStudentId = userStudentIdResult.rows[0].student_id;
        
        if (!selected_students.includes(userStudentId)) {
            console.log("DEBUG: User ID not found in selected students list!", userStudentId, selected_students);
            return res.status(400).json({ success: false, message: "❌ You must include yourself in the selected students list." });
        }

        await client.query('BEGIN');

        const result = await client.query(
            "SELECT * FROM request_room($1, $2, $3::jsonb, $4);",  // Added hostel_id
            [username, academic_course_year_id, JSON.stringify(selected_students), hostel_id]
        );

        await client.query('COMMIT');
        console.log("✅ Request Room API Success:", result.rows[0]);
        res.status(201).json({ success: true, request_id: result.rows[0].new_request_id, status: result.rows[0].request_status });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("❌ Request Room API Error:", error);

        if (error.message.includes('❌')) {
            return res.status(400).json({ success: false, message: error.message });
        }

        res.status(500).json({ success: false, message: "❌ Internal Server Error", error: error.message });
    } finally {
        client.release();
    }
});




/**
 * @swagger
 * /api/admin/toggleRoomRequests:
 *   put:
 *     summary: Toggle status of room requests for an academic year (Admin only)
 *     tags: [Room Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - academic_course_year_id
 *               - status
 *             properties:
 *               academic_course_year_id:
 *                 type: integer
 *                 example: 2
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive]
 *                 example: "Inactive"
 *     responses:
 *       200:
 *         description: Room requests status updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 updated_requests:
 *                   type: integer
 *       400:
 *         description: Invalid input data.
 *       500:
 *         description: Internal server error.
 */


router.put('/admin/toggleRoomRequests', async (req, res) => {
    const client = await pool.connect();
    try {
        const { academic_course_year_id, status } = req.body;

        if (!academic_course_year_id || !['Active', 'Inactive'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "❌ Provide valid academic_course_year_id and status ('Active' or 'Inactive')."
            });
        }

        const result = await client.query(
            "SELECT * FROM toggle_room_request_status_by_year($1, $2);",
            [academic_course_year_id, status]
        );

        res.status(200).json({
            success: true,
            message: result.rows[0].message,
            updated_requests: result.rows[0].updated_requests
        });

    } catch (error) {
        console.error("❌ Admin toggle error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    } finally {
        client.release();
    }
});


/**
 * @swagger
 * /api/roomRequestStatus:
 *   post:
 *     summary: Create new room request status for a specific academic year
 *     tags: [Room Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - academic_course_year_id
 *               - status
 *             properties:
 *               academic_course_year_id:
 *                 type: integer
 *                 example: 2
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive]
 *                 example: Active
 *     responses:
 *       200:
 *         description: Status successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 status_id:
 *                   type: integer
 *       400:
 *         description: Bad request or constraint violation.
 *       500:
 *         description: Internal Server Error.
 */
router.post('/roomRequestStatus', async (req, res) => {
  const client = await pool.connect();
  try {
    const { academic_course_year_id, status, gender } = req.body;

    if (!academic_course_year_id || !status || !gender) {
      return res.status(400).json({
        success: false,
        message: "Missing academic_course_year_id, status, or gender."
      });
    }

    const result = await client.query(
      "SELECT * FROM insert_room_request_academic_course_year_status($1, $2, $3);",
      [parseInt(academic_course_year_id), status, gender]
    );

    res.status(200).json({
      success: true,
      message: result.rows[0].message,
      status_id: result.rows[0].status_id
    });

  } catch (error) {
    console.error("❌ Error creating room request status:", error);

    // ✅ Catch UNIQUE constraint violation
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: "❌ A record with the same academic year and gender already exists.",
        error: error.detail
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  } finally {
    client.release();
  }
});



/**
 * @swagger
 * /admin/roomRequestForAcademicCourseStatuses:
 *   get:
 *     summary: Get all room request statuses by academic course year
 *     tags: [Room Management]
 *     responses:
 *       200:
 *         description: Returns a list of academic years with their request statuses.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 statuses:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       status_id:
 *                         type: integer
 *                         example: 1
 *                       academic_course_year_id:
 *                         type: integer
 *                         example: 2
 *                       academic_course_year_name:
 *                         type: string
 *                         example: "Second Year"
 *                       status:
 *                         type: string
 *                         example: "Active"
 *       500:
 *         description: Internal Server Error
 */
// ✅ Express GET Endpoint to fetch all room request statuses for academic years
router.get('/admin/roomRequestForAcademicCourseStatuses', async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query("SELECT * FROM get_room_request_for_academic_course_status_by_year();");
    res.status(200).json({ success: true, statuses: result.rows });
  } catch (error) {
    console.error("❌ Error fetching statuses:", error);
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  } finally {
    client.release();
  }
});




/**
 * @swagger
 * /admin/roomRequestStatusByStatusId/{status_id}:
 *   put:
 *     summary: Update room request status by Status ID
 *     tags: [Room Management]
 *     parameters:
 *       - in: path
 *         name: status_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The unique ID representing the status record
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - new_status
 *             properties:
 *               new_status:
 *                 type: string
 *                 enum: [Active, Inactive, Pending, Allocated]
 *                 example: "Inactive"
 *     responses:
 *       200:
 *         description: Status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Status updated to 'Inactive' successfully."
 *                 updated_status:
 *                   type: object
 *                   properties:
 *                     status_id:
 *                       type: integer
 *                       example: 1
 *                     academic_course_year_id:
 *                       type: integer
 *                       example: 1
 *                     academic_course_year_name:
 *                       type: string
 *                       example: "First Year"
 *                     status:
 *                       type: string
 *                       example: "Inactive"
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid status provided
 *       404:
 *         description: Status ID not found
 *       500:
 *         description: Internal Server Error
 */

router.put('/admin/roomRequestStatusByStatusId/:status_id', async (req, res) => {
  const client = await pool.connect();
  try {
    const { status_id } = req.params;
    const { new_status } = req.body;

    if (!['Active', 'Inactive', 'Pending', 'Allocated'].includes(new_status)) {
      return res.status(400).json({ success: false, message: "Invalid status provided." });
    }

    const result = await client.query(
      "SELECT * FROM update_room_request_academic_course_status($1, $2);",
      [parseInt(status_id), new_status]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Status ID not found." });
    }

    res.status(200).json({
      success: true,
      message: `Status updated to '${new_status}' successfully.`,
      updated_status: result.rows[0]
    });
  } catch (error) {
    console.error("❌ Error updating status:", error);
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  } finally {
    client.release();
  }
});



/**
 * @swagger
 * /api/roomRequestStatusByStatusId/{status_id}:
 *   get:
 *     summary: Get room request status by Status ID
 *     tags: [Room Management]
 *     parameters:
 *       - in: path
 *         name: status_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The unique ID representing the status record
 *     responses:
 *       200:
 *         description: Status record retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: object
 *                   properties:
 *                     status_id:
 *                       type: integer
 *                       example: 1
 *                     academic_course_year_id:
 *                       type: integer
 *                       example: 1
 *                     academic_course_year_name:
 *                       type: string
 *                       example: "First Year"
 *                     status:
 *                       type: string
 *                       example: "Active"
 *       404:
 *         description: Status ID not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/roomRequestStatusByStatusId/:status_id', async (req, res) => {
  const client = await pool.connect();
  try {
    const { status_id } = req.params;

    const result = await client.query(
      "SELECT * FROM get_room_request_for_academic_course_status_by_status_id($1);",
      [parseInt(status_id, 10)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "No status found for the given status ID." });
    }

    res.status(200).json({ success: true, status: result.rows[0] });
  } catch (error) {
    console.error("❌ Error fetching room request status by status ID:", error);
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  } finally {
    client.release();
  }
});




/**
 * @swagger
 * /api/roomRequests:
 *   get:
 *     summary: Get All Room Requests
 *     tags: [Room Management]
 *     responses:
 *       200:
 *         description: List of room requests.
 *       500:
 *         description: Internal Server Error.
 */


// router.get('/roomRequests', async (req, res) => {
//     try {
//         // Fetch all room requests with hostel details
//         const result = await pool.query(
//             `SELECT request_id, username AS requested_by, academic_course_year_id, selected_students, 
//                     requested_at, status, requested_for, remarks, 
//                     r.hostel_id, h.hostel_name  -- Added hostel_id and hostel_name
//              FROM room_requests r
//              LEFT JOIN hostels h ON r.hostel_id = h.hostel_id  -- Join with hostels table
//              ORDER BY request_id ASC`
//         );

//         if (result.rows.length === 0) {
//             console.warn("⚠️ No room requests found.");
//             return res.status(200).json({ 
//                 success: true, 
//                 requests: [], 
//                 message: "No room requests available." 
//             });
//         }

//         // Convert JSON fields and store them in a new array
//         let formattedRequests = result.rows.map(row => ({
//             ...row,
//             requested_for: Array.isArray(row.requested_for) ? row.requested_for : JSON.parse(row.requested_for || '[]'),
//             selected_students: Array.isArray(row.selected_students) ? row.selected_students : JSON.parse(row.selected_students || '[]'),
//             hostel_name: row.hostel_name || "Not Assigned"  // Handle null/empty hostel_name
//         }));

//         // ✅ **Batch Query for Allocations**
//         const requestIds = formattedRequests.map(req => req.request_id);
//         const allocationResult = await pool.query(
//             `SELECT request_id, COUNT(*) as allocated_count 
//              FROM student_room_allocations 
//              WHERE request_id = ANY($1) AND status = 'Allocated'
//              GROUP BY request_id`,
//             [requestIds]
//         );

//         // Create a map of request_id -> allocated count
//         const allocationMap = {};
//         allocationResult.rows.forEach(row => {
//             allocationMap[row.request_id] = parseInt(row.allocated_count);
//         });

//         // ✅ **Update Request Status Based on Allocations**
//         for (let request of formattedRequests) {
//             const allocatedCount = allocationMap[request.request_id] || 0;
//             const totalStudents = request.requested_for.length;

//             if (allocatedCount === totalStudents && request.status !== 'Allocated') {
//                 request.status = 'Allocated';

//                 await pool.query(
//                     `UPDATE room_requests SET status = 'Allocated' WHERE request_id = $1`,
//                     [request.request_id]
//                 );
//             }
//         }

//         res.status(200).json({ success: true, requests: formattedRequests });

//     } catch (error) {
//         console.error("❌ Fetch Room Requests API Error:", error);
//         res.status(500).json({ success: false, message: "Internal Server Error" });
//     }
// });


router.get('/roomRequests', async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT * FROM get_room_requests();');

        const formatted = result.rows.map(row => ({
            ...row,
            requested_for: Array.isArray(row.requested_for)
                ? row.requested_for
                : JSON.parse(row.requested_for || '[]'),
            selected_students: Array.isArray(row.selected_students)
                ? row.selected_students
                : JSON.parse(row.selected_students || '[]'),
            hostel_name: row.hostel_name || "Not Assigned",
            gender: row.gender || "Unknown"
        }));

        return res.status(200).json({ success: true, requests: formatted });

    } catch (error) {
        console.error("❌ Fetch Room Requests API Error:", error.stack || error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message || "Unexpected Error"
        });
    } finally {
        client.release();
    }
});



/**
 * @swagger
 * /api/approveRequest/{request_id}:
 *   put:
 *     summary: Approve a Room Request
 *     tags: [Room Management]
 *     parameters:
 *       - name: request_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Room request approved successfully.
 *       500:
 *         description: Internal Server Error.
 */
router.put('/approveRequest/:request_id', async (req, res) => {
    try {
        const { request_id } = req.params;
        await pool.query("UPDATE room_requests SET status = 'Approved' WHERE request_id = $1;", [request_id]);
        res.status(200).json({ success: true, message: "Request Approved" });
    } catch (error) {
        console.error("❌ Approval API Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});


/**
 * @swagger
 * /api/allocateWithRequest:
 *   post:
 *     summary: Allocate Room After Request Approval
 *     tags: [Room Management]
 *     description: Allocates students to a room based on an approved request.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               request_id:
 *                 type: integer
 *               hostel_id:
 *                 type: integer
 *               block_id:
 *                 type: integer
 *               floor_id:
 *                 type: integer
 *               room_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Room allocated successfully.
 *       400:
 *         description: Validation error or room full.
 *       500:
 *         description: Internal Server Error.
 */


router.post('/allocateWithRequest', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN'); // 🔹 Start transaction

        const { request_id, hostel_id, block_id, floor_id, room_id } = req.body;

        // ✅ Validate required fields
        if (!request_id || !hostel_id || !block_id || !floor_id || !room_id) {
            await client.query('ROLLBACK');
            return res.status(400).json({ success: false, message: "❌ All fields are required." });
        }

        // ✅ Fetch Request Details
        const requestResult = await client.query(
            `SELECT requested_for, academic_course_year_id, status FROM room_requests WHERE request_id = $1`,
            [request_id]
        );

        if (requestResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ success: false, message: `❌ Invalid request ID.` });
        }

        const { requested_for, academic_course_year_id, status } = requestResult.rows[0];

        if (status !== 'Approved') {
            await client.query('ROLLBACK');
            return res.status(400).json({ success: false, message: `❌ Request ID ${request_id} is not approved. Current Status: ${status}` });
        }

        const studentUsernames = Array.isArray(requested_for) ? requested_for : JSON.parse(requested_for || '[]');

        if (studentUsernames.length === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ success: false, message: "❌ No students found in request." });
        }

        // ✅ Allocate Room to Each Student
        for (const username of studentUsernames) {
            const studentCheck = await client.query(
                `SELECT student_id, full_name FROM students WHERE username = $1`,
                [username]
            );

            if (studentCheck.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({ success: false, message: `❌ Student not found: ${username}` });
            }

            const { student_id, full_name } = studentCheck.rows[0];

            await client.query(
                `SELECT allocate_student_with_request($1, $2, $3, $4, $5, $6);`,
                [request_id, student_id, username, full_name, room_id, academic_course_year_id]
            );
        }

        await client.query('COMMIT'); // ✅ Commit transaction
        res.status(200).json({ success: true, message: `✅ Room allocated successfully!` });

    } catch (error) {
        await client.query('ROLLBACK'); // Rollback transaction on error
        console.error("❌ Room Allocation API Error:", error);
        res.status(500).json({ success: false, message: error.message || "❌ Internal Server Error" });
    } finally {
        client.release();
    }
});





/**
 * @swagger
 * /api/getAllocatedRooms:
 *   get:
 *     summary: Fetch allocated rooms
 *     tags: [Room Management]
 *     responses:
 *       200:
 *         description: Successfully retrieved allocated rooms.
 *       500:
 *         description: Internal Server Error.
 */
router.get('/getAllocatedRooms', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM public.get_allocated_rooms();");
        res.status(200).json({ success: true, allocatedRooms: result.rows });
    } catch (error) {
        console.error("❌ API Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

/**
 * @swagger
 * /api/getAllocatedRoomsByUsername/{username}:
 *   get:
 *     summary: Fetch allocated rooms for a given username
 *     tags: [Room Management]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Username of the student
 *     responses:
 *       200:
 *         description: Successfully retrieved allocated rooms.
 *       404:
 *         description: No allocated rooms found.
 *       500:
 *         description: Internal Server Error.
 */

router.get('/getAllocatedRoomsByUsername/:username', async (req, res) => {
    try {
        const { username } = req.params;

        if (!username) {
            return res.status(400).json({ success: false, message: "Username is required" });
        }

        const formattedUsername = username.trim();
        console.log("🔍 Checking allocated rooms for username:", formattedUsername);

        const result = await pool.query("SELECT * FROM public.get_allocated_rooms_by_username($1);", [formattedUsername]);

        console.log("🟢 Query Result:", result.rows);  // ✅ Log Query Response

        // ✅ Instead of 404, return 200 with empty array
        res.status(200).json({
            success: true,
            allocatedRooms: result.rows,
            message: result.rows.length === 0 ? "No allocated rooms found for this username." : "Rooms retrieved successfully."
        });

    } catch (error) {
        console.error("❌ API Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});



/**
 * @swagger
 * /api/rooms/hostel/{hostelId}/block/{blockId}/floor/{floorId}:
 *   get:
 *     summary: Get Available Rooms by Hostel, Block, and Floor
 *     tags: [Room Management]
 *     parameters:
 *       - name: hostelId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *       - name: blockId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *       - name: floorId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of available rooms.
 *       500:
 *         description: Internal Server Error.
 */
router.get('/rooms/hostel/:hostelId/block/:blockId/floor/:floorId', async (req, res) => {
    try {
        const { hostelId, blockId, floorId } = req.params;
        const result = await pool.query(
            "SELECT * FROM get_rooms_by_hostel_block_floor($1, $2, $3);",
            [parseInt(hostelId), parseInt(blockId), parseInt(floorId)]
        );

        res.status(200).json({ success: true, rooms: result.rows });
    } catch (error) {
        console.error("❌ API Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});


/**
 * @swagger
 * /api/roomRequests/{username}:
 *   get:
 *     summary: Get all room requests for a specific student
 *     description: Fetches all room requests submitted by a student using their username.
 *     tags: [Room Management]
 *     parameters:
 *       - name: username
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The username of the student whose room requests need to be fetched.
 *     responses:
 *       200:
 *         description: Successfully retrieved the room requests.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 requests:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       request_id:
 *                         type: integer
 *                       requested_by:
 *                         type: string
 *                         example: "B122001"
 *                       academic_course_year_id:
 *                         type: integer
 *                       selected_students:
 *                         type: array
 *                         items:
 *                           type: integer
 *                         example: [1, 2, 3]
 *                       requested_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-03-06T11:13:04.397Z"
 *                       status:
 *                         type: string
 *                         example: "Pending"
 *       400:
 *         description: Username is required.
 *       404:
 *         description: No room requests found for this user.
 *       500:
 *         description: Internal Server Error.
 */


// router.get('/roomRequests/:username', async (req, res) => {
//     const client = await pool.connect();
//     try {
//         const { username } = req.params;

//         if (!username) {
//             return res.status(400).json({ success: false, message: "Username is required" });
//         }

//         console.log(`🔍 Fetching room requests for: ${username}`);

//         const result = await client.query(
//             `SELECT request_id, requested_by, academic_course_year_id, selected_students, 
//                     requested_at, status, requested_for, remarks, 
//                     r.hostel_id, h.hostel_name  -- Added hostel_id and hostel_name
//              FROM room_requests r
//              LEFT JOIN hostels h ON r.hostel_id = h.hostel_id  -- Join with hostels table
//              WHERE requested_by = $1 OR requested_for @> to_jsonb(ARRAY[$1]::text[])
//              ORDER BY requested_at DESC`,
//             [username]
//         );

//         if (result.rows.length === 0) {
//             console.warn("⚠️ No room requests found for this user:", username);
//             return res.status(200).json({ success: true, requests: [], message: "No room requests found for this user" });
//         }

//         let formattedRequests = result.rows.map(row => ({
//             ...row,
//             requested_for: Array.isArray(row.requested_for) ? row.requested_for : JSON.parse(row.requested_for || '[]'),
//             selected_students: Array.isArray(row.selected_students) ? row.selected_students : JSON.parse(row.selected_students || '[]'),
//             hostel_name: row.hostel_name || "Not Assigned"  // Handle null/empty hostel_name
//         }));

//         // ✅ **Batch Query for Allocations**
//         const requestIds = formattedRequests.map(req => req.request_id);
//         const allocationResult = await client.query(
//             `SELECT request_id, COUNT(*) as allocated_count 
//              FROM student_room_allocations 
//              WHERE request_id = ANY($1) AND status = 'Allocated'
//              GROUP BY request_id`,
//             [requestIds]
//         );

//         // Create a map of request_id -> allocated count
//         const allocationMap = {};
//         allocationResult.rows.forEach(row => {
//             allocationMap[row.request_id] = parseInt(row.allocated_count);
//         });

//         // ✅ **Update Request Status Based on Allocations**
//         for (let request of formattedRequests) {
//             const allocatedCount = allocationMap[request.request_id] || 0;
//             const totalStudents = request.requested_for.length;

//             if (allocatedCount === totalStudents && request.status !== 'Allocated') {
//                 request.status = 'Allocated';

//                 await client.query(
//                     `UPDATE room_requests SET status = 'Allocated' WHERE request_id = $1`,
//                     [request.request_id]
//                 );
//             }
//         }

//         console.log("✅ Returning Room Requests:", formattedRequests);

//         res.status(200).json({ success: true, requests: formattedRequests });

//     } catch (error) {
//         console.error("❌ Fetch Room Requests API Error:", error);
//         res.status(500).json({ success: false, message: "Internal Server Error" });
//     } finally {
//         client.release();
//     }
// });



router.get('/roomRequests/:username', async (req, res) => {
    const client = await pool.connect();
    try {
        const { username } = req.params;

        if (!username) {
            return res.status(400).json({ success: false, message: "Username is required" });
        }

        console.log(`🔍 Fetching room requests via function for: ${username}`);

        const result = await client.query('SELECT * FROM get_room_requests_by_username($1)', [username]);

        if (result.rows.length === 0) {
            return res.status(200).json({ success: true, requests: [], message: "No room requests found for this user" });
        }

        // ✅ Format JSON fields safely
        const formattedRequests = result.rows.map(row => ({
            ...row,
            requested_for: Array.isArray(row.requested_for) ? row.requested_for : JSON.parse(row.requested_for || '[]'),
            selected_students: Array.isArray(row.selected_students) ? row.selected_students : JSON.parse(row.selected_students || '[]'),
            hostel_name: row.hostel_name || "Not Assigned"
        }));

        res.status(200).json({ success: true, requests: formattedRequests });

    } catch (error) {
        console.error("❌ Fetch Room Requests (by username) API Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    } finally {
        client.release();
    }
});





/**
 * @swagger
 * /api/updateRoomRequestStatus:
 *   put:
 *     summary: Approve or Reject Room Requests
 *     tags: [Room Management]
 *     description: Updates the status of a room request (Approved/Rejected) with remarks.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               request_id:
 *                 type: integer
 *                 example: 1
 *               status:
 *                 type: string
 *                 example: "Approved"
 *               remarks:
 *                 type: string
 *                 example: "Approved for room request"
 *     responses:
 *       200:
 *         description: Successfully updated the room request.
 *       400:
 *         description: Missing required fields.
 *       500:
 *         description: Internal Server Error.
 */

router.put('/updateRoomRequestStatus', async (req, res) => {
    try {
        const { request_id, status, remarks, performed_by } = req.body;

        if (!request_id || !status || !remarks || !performed_by) {
            return res.status(400).json({ success: false, message: "All fields (including performed_by) are required." });
        }

        // ✅ Call PostgreSQL function
        await pool.query(
            "SELECT public.update_room_request_status($1, $2, $3, $4);",
            [request_id, status, remarks, performed_by]
        );

        res.status(200).json({ success: true, message: `Room request ${status} successfully updated!` });
    } catch (error) {
        console.error("❌ Update Room Request API Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});


/**
 * @swagger
 * /api/getRoomRequestByRequestId/{requestId}:
 *   get:
 *     summary: Get Room Request by Request ID
 *     tags: [Room Management]
 *     description: Fetches details of a room request using the request ID.
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unique ID of the room request.
 *     responses:
 *       200:
 *         description: Room request details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 request:
 *                   type: object
 *                   properties:
 *                     request_id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     academic_course_year_id:
 *                       type: integer
 *                     selected_students:
 *                       type: array
 *                       items:
 *                         type: integer
 *                     requested_at:
 *                       type: string
 *                       format: date-time
 *                     status:
 *                       type: string
 *                     requested_for:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Missing or invalid Request ID
 *       404:
 *         description: No request found with this ID
 *       500:
 *         description: Internal Server Error
 */


router.get("/getRoomRequestByRequestId/:requestId", async (req, res) => {
    try {
        const { requestId } = req.params;

        if (!requestId || isNaN(requestId)) {
            return res.status(400).json({ success: false, message: "Invalid Request ID" });
        }

        console.log(`🔍 Fetching room request for request_id: ${requestId}`);

        // ✅ Query to fetch room request along with hostel details
const result = await pool.query(
    `SELECT rr.request_id, rr.username, rr.academic_course_year_id, rr.selected_students, rr.requested_at, rr.status, rr.requested_for, rr.remarks,
            rr.hostel_id, s.student_gender AS gender, h.hostel_name
     FROM room_requests rr
     LEFT JOIN hostels h ON rr.hostel_id = h.hostel_id
     LEFT JOIN students s ON rr.username = s.username
     WHERE rr.request_id = $1`, 
    [parseInt(requestId)]
);


        if (result.rows.length === 0) {
            console.warn("⚠️ No room request found for request_id:", requestId);
            return res.status(404).json({ success: false, message: "No request found with this ID" });
        }

        // ✅ Ensure `requested_for` and `selected_students` are always arrays
        const formattedRequest = {
            ...result.rows[0],
            requested_for: Array.isArray(result.rows[0].requested_for) ? result.rows[0].requested_for : JSON.parse(result.rows[0].requested_for || '[]'),
            selected_students: Array.isArray(result.rows[0].selected_students) ? result.rows[0].selected_students : JSON.parse(result.rows[0].selected_students || '[]')
        };

        console.log("✅ Returning Room Request:", formattedRequest);

        return res.status(200).json({ success: true, request: formattedRequest });

    } catch (error) {
        console.error("❌ Fetch Request API Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});



/**
 * @swagger
 * /api/getRoomRequestByRoomId/{roomId}:
 *   get:
 *     summary: Get Room Request by Room ID
 *     tags: [Room Management]
 *     description: Fetches room request details based on the room ID.
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unique Room ID associated with a request.
 *     responses:
 *       200:
 *         description: Room request details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 requests:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       request_id:
 *                         type: integer
 *                       username:
 *                         type: string
 *                       academic_course_year_id:
 *                         type: integer
 *                       requested_at:
 *                         type: string
 *                       status:
 *                         type: string
 *                       room_id:
 *                         type: integer
 *       400:
 *         description: Missing Room ID
 *       404:
 *         description: No request found for this Room ID
 *       500:
 *         description: Internal Server Error
 */
router.get("/getRoomRequestByRoomId/:roomId", async (req, res) => {
    try {
        const { roomId } = req.params;

        if (!roomId || isNaN(roomId)) {
            return res.status(400).json({ success: false, message: "Invalid Room ID" });
        }

        const result = await pool.query(
            `SELECT rr.request_id, rr.username, rr.academic_course_year_id, rr.requested_at, rr.status, ra.room_id
             FROM room_requests rr
             JOIN room_allocations ra ON rr.request_id = ra.request_id
             WHERE ra.room_id = $1`, 
            [parseInt(roomId)]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "No request found for this Room ID" });
        }

        return res.status(200).json({ success: true, requests: result.rows });
    } catch (error) {
        console.error("❌ Fetch Room Request by Room ID API Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});


/**
 * @swagger
 * /api/requestHistory/{request_id}:
 *   get:
 *     tags: [Room Management]
 *     summary: Fetch full request history for a given request_id
 *     parameters:
 *       - name: request_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: The request_id to track history
 *     responses:
 *       200:
 *         description: Successfully retrieved request history
 *       404:
 *         description: No history found for this request_id
 *       500:
 *         description: Internal Server Error
 */

router.get('/requestHistory/:request_id', async (req, res) => {
    try {
        const { request_id } = req.params;
        const result = await pool.query(
            `SELECT DISTINCT ON (action) * FROM public.get_request_history($1) ORDER BY action, action_timestamp ASC;`, 
            [request_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "⚠️ No history found for this request." });
        }

        res.status(200).json({ success: true, history: result.rows });
    } catch (error) {
        console.error("❌ Error fetching request history:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});




module.exports = router;
