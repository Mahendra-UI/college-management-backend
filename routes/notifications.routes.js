const express = require('express');
const pool = require('../models/db');
const router = express.Router();

/**
 * @swagger
 * /api/addnotification:
 *   post:
 *     summary: Add a new notification
 *     description: Inserts a new notification with title and description.
 *     tags:
 *       - Notifications
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "New Event"
 *               title_description:
 *                 type: string
 *                 example: "This is a new notification for the event."
 *     responses:
 *       201:
 *         description: Notification created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal Server Error
 */
router.post('/addnotification', async (req, res) => {
    try {
        const { title, title_description } = req.body;
        if (!title || !title_description) {
            return res.status(400).json({ success: false, message: "Title and description are required" });
        }
        await pool.query(`INSERT INTO notifications (title, title_description) VALUES ($1, $2)`, [title, title_description]);
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
 *     description: Updates an existing notification.
 *     tags:
 *       - Notifications
 *     parameters:
 *       - in: path
 *         name: notification_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the notification to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               title_description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Notification updated successfully
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Internal Server Error
 */
router.put('/updatenotification/:notification_id', async (req, res) => {
    try {
        const { notification_id } = req.params;
        const { title, title_description } = req.body;
        if (!title || !title_description) {
            return res.status(400).json({ success: false, message: "Title and description are required" });
        }
        const result = await pool.query(`UPDATE notifications SET title = $1, title_description = $2, updated_at = NOW() WHERE notification_id = $3 RETURNING *`, [title, title_description, notification_id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }
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
 *     description: Retrieves all notifications sorted by creation date.
 *     tags:
 *       - Notifications
 *     responses:
 *       200:
 *         description: Successfully retrieved notifications
 *       500:
 *         description: Internal Server Error
 */
router.get('/getnotifications', async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM notifications ORDER BY created_at DESC`);
        res.status(200).json({ success: true, notifications: result.rows });
    } catch (error) {
        console.error("❌ Error fetching notifications:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});

/**
 * @swagger
 * /api/deletenotification/{notification_id}:
 *   delete:
 *     summary: Delete a notification
 *     description: Deletes a notification by ID.
 *     tags:
 *       - Notifications
 *     parameters:
 *       - in: path
 *         name: notification_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the notification to delete
 *     responses:
 *       200:
 *         description: Successfully deleted notification
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Internal Server Error
 */
router.delete('/deletenotification/:notification_id', async (req, res) => {
    try {
        const { notification_id } = req.params;
        const result = await pool.query(`DELETE FROM notifications WHERE notification_id = $1 RETURNING *`, [notification_id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }
        res.status(200).json({ success: true, message: "Notification deleted successfully" });
    } catch (error) {
        console.error("❌ Error deleting notification:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});

/**
 * @swagger
 * /api/getnotification/{notification_id}:
 *   get:
 *     summary: Get notification by ID
 *     description: Fetches a specific notification by its ID.
 *     tags:
 *       - Notifications
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

        const result = await pool.query(
            `SELECT notification_id, title, title_description, created_at, updated_at 
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

/**
 * @swagger
 * /api/deletenotification/{notification_id}:
 *   delete:
 *     summary: Delete a notification
 *     description: Deletes a notification based on `notification_id`.
 *     tags:
 *       - Notifications
 *     parameters:
 *       - in: path
 *         name: notification_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique notification ID to be deleted.
 *     responses:
 *       200:
 *         description: Successfully deleted notification.
 *       400:
 *         description: Invalid request, missing notification_id.
 *       404:
 *         description: Notification not found.
 *       500:
 *         description: Internal server error.
 */
router.delete('/deletenotification/:notification_id', async (req, res) => {
    try {
        const { notification_id } = req.params;

        if (!notification_id) {
            return res.status(400).json({ success: false, message: "Missing notification_id parameter" });
        }

        const result = await pool.query(`SELECT delete_notification($1) AS message`, [notification_id]);

        if (result.rows[0].message === 'Notification not found') {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        res.status(200).json({ success: true, message: "Notification deleted successfully" });

    } catch (error) {
        console.error("❌ Error deleting notification:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});


module.exports = router;
