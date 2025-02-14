const express = require('express');
const pool = require('../models/db');
const router = express.Router();

/**
 * @swagger
 * /api/addnotification:
 *   post:
 *     summary: Add a new notification
 *     description: Inserts a new notification with title and description.
 */
router.post('/addnotification', async (req, res) => {
    try {
        const { title, title_description } = req.body;

        if (!title || !title_description) {
            return res.status(400).json({ success: false, message: "Title and description are required" });
        }

        await pool.query(`SELECT insert_notification($1, $2)`, [title, title_description]);

        res.status(201).json({ success: true, message: "Notification created" });
    } catch (error) {
        console.error("❌ Error creating notification:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});

/**
 * @swagger
 * /api/updatenotification/{notification_id}:
 *   put:
 *     summary: Update a notification
 */
router.put('/updatenotification/:notification_id', async (req, res) => {
    try {
        const { notification_id } = req.params;
        const { title, title_description } = req.body;

        if (!title || !title_description) {
            return res.status(400).json({ success: false, message: "Title and description are required" });
        }

        await pool.query(`SELECT update_notification($1, $2, $3)`, [notification_id, title, title_description]);

        res.status(200).json({ success: true, message: "Notification updated" });
    } catch (error) {
        console.error("❌ Error updating notification:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});

/**
 * @swagger
 * /api/getnotifications:
 *   get:
 *     summary: Get all notifications
 */
router.get('/getnotifications', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT notification_id, title, title_description, created_at, updated_at FROM notifications ORDER BY created_at DESC`
        );

        res.status(200).json({ success: true, notifications: result.rows });
    } catch (error) {
        console.error("❌ Error fetching notifications:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});

/**
 * @swagger
 * /api/getnotifications:
 *   get:
 *     summary: Get all notifications
 *     description: Retrieves all notifications sorted by creation date.
 */
router.get('/getnotifications', async (req, res) => {
    try {
        // If using function: const result = await pool.query(`SELECT * FROM get_notifications()`);
        const result = await pool.query(`
            SELECT notification_id, title, title_description, created_at, updated_at 
            FROM notifications 
            ORDER BY created_at DESC
        `);

        if (result.rows.length > 0) {
            res.status(200).json({ success: true, notifications: result.rows });
        } else {
            res.status(404).json({ success: false, message: "No notifications found." });
        }
    } catch (error) {
        console.error("❌ Error fetching notifications:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});


/**
 * @swagger
 * /api/getnotification/{notification_id}:
 *   get:
 *     summary: Get notification by ID
 *     description: Fetches a specific notification by its ID.
 *     parameters:
 *       - in: path
 *         name: notification_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved notification.
 *       404:
 *         description: Notification not found.
 *       500:
 *         description: Internal Server Error.
 */

router.get('/getnotification/:notification_id', async (req, res) => {
    try {
        const { notification_id } = req.params;
        
        if (!notification_id || isNaN(notification_id)) {
            return res.status(400).json({ success: false, message: "Invalid notification ID" });
        }

        const result = await pool.query(`
            SELECT notification_id, title, title_description, created_at, updated_at 
            FROM notifications 
            WHERE notification_id = $1`, [notification_id]
        );

        if (result.rows.length > 0) {
            res.status(200).json({ success: true, notification: result.rows[0] });
        } else {
            res.status(404).json({ success: false, message: "Notification not found." });
        }
    } catch (error) {
        console.error("❌ Error fetching notification:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});

module.exports = router;
