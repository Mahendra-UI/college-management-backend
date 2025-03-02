const express = require('express');
const router = express.Router();
const pool = require('../models/db');


/**
 * @swagger
 * tags:
 *   name: Hostel Management
 *   description: APIs for managing hostels
 */

/**
 * @swagger
 * /api/hostels:
 *   post:
 *     summary: Insert a new hostel
 *     tags: [Hostel Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hostel_name:
 *                 type: string
 *                 example: "New Hostel"
 *     responses:
 *       201:
 *         description: Hostel added successfully.
 *       400:
 *         description: Bad request, missing hostel_name.
 *       500:
 *         description: Internal Server Error.
 */

router.post('/hostels', async (req, res) => {
    try {
        const { hostel_name } = req.body;
        
        if (!hostel_name) {
            return res.status(400).json({ success: false, message: "hostel_name is required" });
        }

        const result = await pool.query('SELECT * FROM public.insert_hostels($1);', [hostel_name]);

        res.status(201).json({ success: true, message: "Hostel added successfully", hostel: result.rows[0] });
    } catch (error) {
        console.error("❌ API Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});



/**
 * @swagger
 * /api/hostels:
 *   get:
 *     summary: Get all hostels
 *     tags: [Hostel Management]
 *     responses:
 *       200:
 *         description: Successfully retrieved hostels.
 *       500:
 *         description: Internal Server Error.
 */
router.get('/hostels', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM public.get_hostels() ORDER BY hostel_id ASC;');
        res.status(200).json({ success: true, hostels: result.rows });
    } catch (error) {
        console.error("❌ API Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});


/**
 * @swagger
 * /api/hostels:
 *   put:
 *     summary: Update hostel by ID
 *     tags: [Hostel Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hostel_id:
 *                 type: integer
 *                 example: 5
 *               hostel_name:
 *                 type: string
 *                 example: "Updated Hostel Name"
 *     responses:
 *       200:
 *         description: Successfully updated hostel.
 *       404:
 *         description: Hostel not found.
 *       500:
 *         description: Internal Server Error.
 */

router.put('/hostels', async (req, res) => {
    try {
        const { hostel_id, hostel_name } = req.body;

        if (!hostel_id || !hostel_name) {
            return res.status(400).json({ success: false, message: "hostel_id and hostel_name are required" });
        }

        const result = await pool.query(
            'SELECT * FROM public.update_hostel_by_id($1, $2);',
            [parseInt(hostel_id, 10), hostel_name]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Hostel not found" });
        }

        res.status(200).json({ success: true, message: "Hostel updated successfully", hostel: result.rows[0] });
    } catch (error) {
        console.error("❌ API Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});



/**
 * @swagger
 * /api/hostels/{hostel_id}:
 *   get:
 *     summary: Get hostel by ID
 *     tags: [Hostel Management]
 *     parameters:
 *       - name: hostel_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved hostel.
 *       404:
 *         description: Hostel not found.
 *       500:
 *         description: Internal Server Error.
 */

router.get('/hostels/:hostel_id', async (req, res) => {
    try {
        const { hostel_id } = req.params;

        // Ensure hostel_id is an integer
        const result = await pool.query('SELECT * FROM public.get_hostel_by_hostel_id($1);', [parseInt(hostel_id, 10)]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Hostel not found" });
        }

        res.status(200).json({ success: true, hostel: result.rows[0] });
    } catch (error) {
        console.error("❌ API Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});



/**
 * @swagger
 * /api/hostels/{hostel_id}:
 *   delete:
 *     summary: Delete hostel by ID and reset sequence if empty
 *     tags: [Hostel Management]
 *     parameters:
 *       - name: hostel_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully deleted hostel.
 *       400:
 *         description: Bad request, hostel_id is required.
 *       500:
 *         description: Internal Server Error.
 */

router.delete('/hostels/:hostel_id', async (req, res) => {
    try {
        const { hostel_id } = req.params;

        if (!hostel_id) {
            return res.status(400).json({ success: false, message: "hostel_id is required" });
        }

        await pool.query('SELECT public.delete_hostel_by_id($1);', [parseInt(hostel_id, 10)]);

        res.status(200).json({ success: true, message: "Hostel deleted successfully" });
    } catch (error) {
        console.error("❌ API Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});



/**
 * @swagger
 * /api/blocks:
 *   post:
 *     summary: Insert a new block
 *     tags: [Hostel Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               block_name:
 *                 type: string
 *               hostel_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Block added successfully.
 *       400:
 *         description: Missing required parameters.
 *       500:
 *         description: Internal Server Error.
 */

router.post('/blocks', async (req, res) => {
    try {
        const { block_name, hostel_id } = req.body;

        // Validation: Ensure required fields exist
        if (!block_name || !hostel_id) {
            return res.status(400).json({ success: false, message: "block_name and hostel_id are required" });
        }

        // Call the PostgreSQL function
        const result = await pool.query(
            'SELECT * FROM public.insert_blocks($1, $2);',
            [block_name, parseInt(hostel_id, 10)]
        );

        res.status(201).json({ success: true, message: "Block added successfully", block: result.rows[0] });
    } catch (error) {
        console.error("❌ API Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});


/**
 * @swagger
 * /api/blocks:
 *   get:
 *     summary: Get all blocks with hostel details
 *     tags: [Hostel Management]
 */
router.get('/blocks', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM public.get_blocks();');
        res.status(200).json({ success: true, blocks: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});


/**
 * @swagger
 * /api/blocks/{block_id}:
 *   get:
 *     summary: Get block by ID
 *     tags: [Hostel Management]
 */
router.get('/blocks/:block_id', async (req, res) => {
    try {
        const { block_id } = req.params;
        const result = await pool.query('SELECT * FROM public.get_block_by_id($1);', [parseInt(block_id, 10)]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Block not found" });
        }

        res.status(200).json({ success: true, block: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});


/**
 * @swagger
 * /api/blocks/{block_id}:
 *   delete:
 *     summary: Delete block by ID
 *     tags: [Hostel Management]
 */
router.delete('/blocks/:block_id', async (req, res) => {
    try {
        const { block_id } = req.params;
        await pool.query('SELECT public.delete_block_by_id($1);', [parseInt(block_id, 10)]);
        res.status(200).json({ success: true, message: "Block deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});

/**
 * @swagger
 * /api/blocks:
 *   put:
 *     summary: Update block by ID
 *     tags: [Hostel Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               block_id:
 *                 type: integer
 *               block_name:
 *                 type: string
 *               hostel_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Successfully updated block.
 */
router.put('/blocks', async (req, res) => {
    try {
        const { block_id, block_name, hostel_id } = req.body;

        // Ensure required fields exist
        if (!block_id || !block_name || !hostel_id) {
            return res.status(400).json({ success: false, message: "block_id, block_name, and hostel_id are required" });
        }

        // Call the database function
        const result = await pool.query(
            'SELECT * FROM public.update_block_by_id($1, $2, $3);',
            [parseInt(block_id, 10), block_name, parseInt(hostel_id, 10)]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Block not found" });
        }

        res.status(200).json({ success: true, message: "Block updated successfully", block: result.rows[0] });
    } catch (error) {
        console.error("❌ API Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});


module.exports = router;