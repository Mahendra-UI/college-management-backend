

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
    try {
        const allocations = req.body.allocations;

        if (!allocations || allocations.length === 0) {
            return res.status(400).json({ success: false, message: "Allocations data is required" });
        }

        for (const allocation of allocations) {
            const { student_id, room_id, username, full_name, academic_course_year_id } = allocation;

            // ✅ Validate required fields
            if (!student_id || !room_id || !academic_course_year_id || !username || !full_name) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Missing required fields: student_id, room_id, academic_course_year_id, username, full_name" 
                });
            }

            // ✅ Check if the student is already allocated in the same academic course year
            const checkExisting = await pool.query(
                "SELECT room_id FROM student_room_allocations WHERE student_id = $1 AND academic_course_year_id = $2",
                [student_id, academic_course_year_id]
            );

            if (checkExisting.rows.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `❌ Student '${full_name}' is already allocated to room '${checkExisting.rows[0].room_id}' in the same academic year!`
                });
            }

            // ✅ Check available seats (using `rooms` instead of `room_availability`)
            const roomCheck = await pool.query(
                `SELECT r.seats - COALESCE((SELECT COUNT(*) FROM student_room_allocations sra WHERE sra.room_id = r.room_id), 0) AS available_seats 
                FROM rooms r WHERE r.room_id = $1`, 
                [room_id]
            );

            if (roomCheck.rows.length === 0) {
                return res.status(404).json({ success: false, message: "🚫 Room not found." });
            }

            if (roomCheck.rows[0].available_seats <= 0) {
                return res.status(400).json({ success: false, message: `🚫 Room '${room_id}' is full. No available seats.` });
            }

            // ✅ Allocate Student to Room
            await pool.query("SELECT allocate_student_to_room($1, $2, $3, $4, $5);", 
                [student_id, username, full_name, room_id, academic_course_year_id]
            );
        }

        res.status(200).json({ success: true, message: "✅ Students allocated successfully!" });
    } catch (error) {
        console.error("❌ API Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});



// /**
//  * @swagger
//  * /api/getAllocatedRooms:
//  *   get:
//  *     summary: Fetch allocated rooms
//  *     tags: [Room Management]
//  *     responses:
//  *       200:
//  *         description: Successfully retrieved allocated rooms
//  *       500:
//  *         description: Internal Server Error
//  */

// router.get('/getAllocatedRooms', async (req, res) => {
//     try {
//         const { username } = req.query; // ✅ Get username from query params

//         let query = 'SELECT * FROM public.get_allocated_rooms()';
//         let values = [];

//         if (username) {
//             query += ' WHERE username = $1';
//             values.push(username);
//         }

//         const result = await pool.query(query, values);

//         res.status(200).json({ 
//             success: true, 
//             allocatedRooms: result.rows 
//         });

//     } catch (error) {
//         console.error("❌ API Error:", error);
//         res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
//     }
// });



// router.get('/getAllocatedRooms', async (req, res) => {
//     try {
//         const result = await pool.query('SELECT * FROM public.get_allocated_rooms();');

//         // ✅ Return 200 OK with an empty array instead of 404
//         res.status(200).json({ 
//             success: true, 
//             allocatedRooms: result.rows 
//         });

//     } catch (error) {
//         console.error("❌ API Error:", error);
//         res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
//     }
// });


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
    try {
        const { username, academic_course_year_id, selected_students } = req.body;

        if (!username || !academic_course_year_id || !selected_students.length) {
            return res.status(400).json({ success: false, message: "Username, academic year, and students are required" });
        }

        // ✅ Fetch usernames for selected students
        const studentUsernames = await pool.query(
            `SELECT username FROM students WHERE student_id = ANY($1)`,
            [selected_students]
        );

        const requestedForUsernames = studentUsernames.rows.map(row => row.username);

        // ✅ Ensure arrays are correctly formatted
        const selectedStudentsArray = Array.isArray(selected_students) ? selected_students : [];
        const requestedForUsernamesArray = Array.isArray(requestedForUsernames) ? requestedForUsernames : [];

        // ✅ Check for duplicate requests
        const checkExisting = await pool.query(
            `SELECT * FROM room_requests 
             WHERE academic_course_year_id = $1 
             AND requested_for @> $2::jsonb
             AND status IN ('Pending', 'Approved', 'Allocated')`,
            [academic_course_year_id, JSON.stringify(requestedForUsernamesArray)]
        );

        if (checkExisting.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: "❌ One or more students already have a pending, approved, or allocated room request for this academic year."
            });
        }

        // ✅ Insert new request with JSONB
        const result = await pool.query(
            `INSERT INTO room_requests (username, academic_course_year_id, selected_students, requested_by, requested_for, status, requested_at) 
             VALUES ($1, $2, $3::jsonb, $4, $5::jsonb, 'Pending', NOW()) RETURNING request_id;`,
            [username, academic_course_year_id, JSON.stringify(selectedStudentsArray), username, JSON.stringify(requestedForUsernamesArray)]
        );

        res.status(201).json({ success: true, request_id: result.rows[0].request_id });

    } catch (error) {
        console.error("❌ Request Room API Error:", error);

        if (error.code === '23505') {
            return res.status(400).json({
                success: false,
                message: "❌ Duplicate request detected. You already have an active request for this academic year."
            });
        }

        res.status(500).json({ success: false, message: "Internal Server Error" });
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

router.get('/roomRequests', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT request_id, username AS requested_by, academic_course_year_id, selected_students, requested_at, status, requested_for
             FROM room_requests
             ORDER BY requested_at DESC`
        );

        // ✅ Ensure `requested_for` is parsed properly (it should already contain usernames)
        for (let row of result.rows) {
            row.requested_for = Array.isArray(row.requested_for) ? row.requested_for : JSON.parse(row.requested_for);
        }

        res.status(200).json({ success: true, requests: result.rows });
    } catch (error) {
        console.error("❌ Fetch Room Requests API Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
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
 *     description: Allocates a student to a room based on an approved request.
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
 *         description: Missing required fields or invalid data.
 *       500:
 *         description: Internal Server Error.
 */

router.post('/allocateWithRequest', async (req, res) => {
    try {
        const { request_id, hostel_id, block_id, floor_id, room_id } = req.body;

        // ✅ Validate required fields
        if (!request_id || !hostel_id || !block_id || !floor_id || !room_id) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // ✅ Fetch Request Details
        const requestCheck = await pool.query(
            `SELECT username, academic_course_year_id FROM room_requests WHERE request_id = $1 AND status = 'Approved'`, 
            [request_id]
        );

        if (requestCheck.rows.length === 0) {
            return res.status(400).json({ success: false, message: "Invalid request ID or request is not approved" });
        }

        const { username, academic_course_year_id } = requestCheck.rows[0];

        // ✅ Fetch student_id from students table
        const studentCheck = await pool.query(
            `SELECT student_id, full_name FROM students WHERE username = $1`, 
            [username]
        );

        if (studentCheck.rows.length === 0) {
            return res.status(400).json({ success: false, message: "Student not found" });
        }

        const { student_id, full_name } = studentCheck.rows[0];

        // ✅ Fetch hostel, block, floor, and room names
        const roomDetails = await pool.query(
            `SELECT h.hostel_name, b.block_name, f.floor_name, r.room_name 
             FROM hostels h, blocks b, floors f, rooms r 
             WHERE h.hostel_id = $1 AND b.block_id = $2 AND f.floor_id = $3 AND r.room_id = $4`, 
            [hostel_id, block_id, floor_id, room_id]
        );

        if (roomDetails.rows.length === 0) {
            return res.status(400).json({ success: false, message: "Invalid room details" });
        }

        const { hostel_name, block_name, floor_name, room_name } = roomDetails.rows[0];

        // ✅ Allocate Room to Student
        await pool.query(
            `INSERT INTO student_room_allocations 
             (request_id, student_id, username, full_name, hostel_id, hostel_name, block_id, block_name, floor_id, floor_name, room_id, room_name, allocated_at, academic_course_year_id) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), $13)`,
            [request_id, student_id, username, full_name, hostel_id, hostel_name, block_id, block_name, floor_id, floor_name, room_id, room_name, academic_course_year_id]
        );

        // ✅ Update Request Status to "Allocated"
        await pool.query(`UPDATE room_requests SET status = 'Allocated' WHERE request_id = $1`, [request_id]);

        res.status(200).json({ success: true, message: "Room allocated successfully!" });

    } catch (error) {
        console.error("❌ API Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
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

router.get('/roomRequests/:username', async (req, res) => {
    try {
        const { username } = req.params;

        if (!username) {
            return res.status(400).json({ success: false, message: "Username is required" });
        }

        console.log(`🔍 Fetching room requests for: ${username}`);

        const result = await pool.query(
            `SELECT request_id, requested_by, academic_course_year_id, selected_students, requested_at, status, requested_for
             FROM room_requests
             WHERE requested_by = $1 OR requested_for @> to_jsonb(ARRAY[$1]::text[])
             ORDER BY requested_at DESC`,
            [username]
        );

        if (result.rows.length === 0) {
            console.warn("⚠️ No room requests found for this user:", username);
            return res.status(404).json({ success: false, message: "No room requests found for this user" });
        }

        // ✅ Ensure `requested_for` is always an array
        const formattedRequests = result.rows.map(row => ({
            ...row,
            requested_for: Array.isArray(row.requested_for) ? row.requested_for : JSON.parse(row.requested_for || '[]')
        }));

        console.log("✅ Returning Room Requests:", formattedRequests);

        res.status(200).json({ success: true, requests: formattedRequests });
    } catch (error) {
        console.error("❌ Fetch Room Requests API Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
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
        const { request_id, status, remarks } = req.body;

        if (!request_id || !status || !remarks) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        // ✅ Update the room_requests table with status and remarks
        const result = await pool.query(
            "UPDATE room_requests SET status = $1, remarks = $2 WHERE request_id = $3 RETURNING *;",
            [status, remarks, request_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: "Room request not found." });
        }

        res.status(200).json({ success: true, message: `Room request ${status} successfully!` });
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
 *                     requested_at:
 *                       type: string
 *                     status:
 *                       type: string
 *       400:
 *         description: Missing Request ID
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

        const result = await pool.query(
            `SELECT request_id, username, academic_course_year_id, requested_at, status 
             FROM room_requests 
             WHERE request_id = $1`, 
            [parseInt(requestId)]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "No request found with this ID" });
        }

        return res.status(200).json({ success: true, request: result.rows[0] });
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


module.exports = router;
