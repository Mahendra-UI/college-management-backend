

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



module.exports = router;
