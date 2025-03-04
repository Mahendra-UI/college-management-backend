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

        // ✅ Validation: Ensure required fields exist
        if (!block_name || !hostel_id) {
            return res.status(400).json({ success: false, message: "block_name and hostel_id are required" });
        }

        // ✅ Call the PostgreSQL function
        const result = await pool.query(
            'SELECT * FROM public.insert_blocks($1, $2);',
            [block_name, parseInt(hostel_id, 10)]
        );

        if (result.rows.length === 0) {
            return res.status(500).json({ success: false, message: "Failed to add block" });
        }

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
 *     responses:
 *       200:
 *         description: Successfully retrieved blocks.
 *       500:
 *         description: Internal Server Error.
 */
router.get('/blocks', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM public.get_blocks();');

        res.status(200).json({ success: true, blocks: result.rows });
    } catch (error) {
        console.error("❌ API Error:", error);
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


/**
 * @swagger
 * /api/blocks/hostel/{hostel_id}:
 *   get:
 *     summary: Get blocks by hostel ID
 *     tags: [Hostel Management]
 *     parameters:
 *       - name: hostel_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the hostel to retrieve blocks for.
 *     responses:
 *       200:
 *         description: Successfully retrieved blocks.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 blocks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       block_id:
 *                         type: integer
 *                         example: 1
 *                       block_name:
 *                         type: string
 *                         example: "Block A"
 *                       hostel_id:
 *                         type: integer
 *                         example: 2
 *                       hostel_name:
 *                         type: string
 *                         example: "New Hostel"
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-03-03T04:06:08.620Z"
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-03-03T04:06:08.620Z"
 *       400:
 *         description: Bad request, invalid or missing hostel_id.
 *       404:
 *         description: No blocks found for the given hostel ID.
 *       500:
 *         description: Internal Server Error.
 */

router.get('/blocks/hostel/:hostel_id', async (req, res) => {
    try {
        const hostel_id = parseInt(req.params.hostel_id, 10);

        if (isNaN(hostel_id)) {
            return res.status(400).json({ success: false, message: "Invalid hostel_id" });
        }

        const result = await pool.query('SELECT * FROM public.get_blocks_by_hostel_id($1);', [hostel_id]);

        res.status(200).json({
            success: true,
            message: result.rows.length ? "Blocks retrieved successfully" : "No blocks found for this hostel",
            blocks: result.rows
        });
    } catch (error) {
        console.error("❌ API Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});






// Floors

/**
 * @swagger
 * /api/floors:
 *   post:
 *     summary: Insert a new floor
 *     tags: [Hostel Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               floor_name:
 *                 type: string
 *                 example: "Ground Floor"
 *               block_id:
 *                 type: integer
 *                 example: 1
 *               hostel_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Floor added successfully.
 *       400:
 *         description: Missing required parameters.
 *       500:
 *         description: Internal Server Error.
 */

router.post('/floors', async (req, res) => {
    try {
        const { floor_name, block_id, hostel_id } = req.body;

        if (!floor_name || !block_id || !hostel_id) {
            return res.status(400).json({ success: false, message: "floor_name, block_id, and hostel_id are required" });
        }

        const result = await pool.query(
            'SELECT * FROM public.insert_floors($1, $2, $3);',
            [floor_name, parseInt(block_id, 10), parseInt(hostel_id, 10)]
        );

        res.status(201).json({
            success: true,
            message: "Floor added successfully",
            floor: result.rows[0]
        });
    } catch (error) {
        console.error("❌ API Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
});


/**
 * @swagger
 * /api/floors:
 *   get:
 *     summary: Get all floors with block and hostel details
 *     tags: [Hostel Management]
 *     responses:
 *       200:
 *         description: Successfully retrieved floors.
 *       500:
 *         description: Internal Server Error.
 */
router.get('/floors', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM public.get_floors();');
        res.status(200).json({ success: true, floors: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});



/**
 * @swagger
 * /api/floors/{floor_id}:
 *   get:
 *     summary: Get floor details by floor ID
 *     tags: [Hostel Management]
 *     parameters:
 *       - name: floor_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the floor to retrieve.
 *     responses:
 *       200:
 *         description: Successfully retrieved floor details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 floor:
 *                   type: object
 *                   properties:
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
 *         description: Floor not found.
 *       500:
 *         description: Internal Server Error.
 */

router.get('/floors/:floor_id', async (req, res) => {
    try {
        const { floor_id } = req.params;

        if (!floor_id || isNaN(floor_id)) {
            return res.status(400).json({ success: false, message: "Invalid floor_id" });
        }

        const result = await pool.query('SELECT * FROM public.get_floor_by_floor_id($1);', [parseInt(floor_id, 10)]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Floor not found" });
        }

        res.status(200).json({ success: true, floor: result.rows[0] });
    } catch (error) {
        console.error("❌ API Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});



/**
 * @swagger
 * /api/floors:
 *   put:
 *     summary: Update a floor
 *     tags: [Hostel Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               floor_id:
 *                 type: integer
 *                 example: 1
 *               floor_name:
 *                 type: string
 *                 example: "Updated Floor Name"
 *               block_id:
 *                 type: integer
 *                 example: 2
 *               hostel_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Successfully updated floor.
 *       400:
 *         description: Bad request.
 *       500:
 *         description: Internal Server Error.
 */

router.put('/floors', async (req, res) => {
    try {
        const { floor_id, floor_name, block_id, hostel_id } = req.body;

        if (!floor_id || !floor_name || !block_id || !hostel_id) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const result = await pool.query(
            'SELECT * FROM public.update_floor_by_id($1, $2, $3, $4);',
            [floor_id, floor_name, block_id, hostel_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Floor not found" });
        }

        res.status(200).json({ success: true, message: "Floor updated successfully", floor: result.rows[0] });
    } catch (error) {
        console.error("❌ API Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});




/**
 * @swagger
 * /api/floors/{floor_id}:
 *   delete:
 *     summary: Delete a floor
 *     tags: [Hostel Management]
 *     parameters:
 *       - name: floor_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully deleted floor.
 *       404:
 *         description: Floor not found.
 *       500:
 *         description: Internal Server Error.
 */

router.delete('/floors/:floor_id', async (req, res) => {
    try {
        const { floor_id } = req.params;

        if (!floor_id) {
            return res.status(400).json({ success: false, message: "floor_id is required" });
        }

        await pool.query('SELECT public.delete_floor_by_id($1);', [parseInt(floor_id, 10)]);

        res.status(200).json({ success: true, message: "Floor deleted successfully" });
    } catch (error) {
        console.error("❌ API Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});

/**
 * @swagger
 * /api/floors/block/{block_id}/hostel/{hostel_id}:
 *   get:
 *     summary: Get floors by block ID and hostel ID
 *     tags: [Hostel Management]
 *     parameters:
 *       - name: block_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the block to filter floors.
 *       - name: hostel_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the hostel to filter floors.
 *     responses:
 *       200:
 *         description: Successfully retrieved floors.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 floors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       floor_id:
 *                         type: integer
 *                         example: 1
 *                       floor_name:
 *                         type: string
 *                         example: "Ground Floor"
 *                       block_id:
 *                         type: integer
 *                         example: 2
 *                       block_name:
 *                         type: string
 *                         example: "A Block"
 *                       hostel_id:
 *                         type: integer
 *                         example: 1
 *                       hostel_name:
 *                         type: string
 *                         example: "Main Hostel"
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-03-03T04:06:08.620Z"
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-03-03T04:06:08.620Z"
 *       400:
 *         description: Bad request, invalid parameters.
 *       404:
 *         description: No floors found for the given block and hostel ID.
 *       500:
 *         description: Internal Server Error.
 */

router.get('/floors/block/:block_id/hostel/:hostel_id', async (req, res) => {
    try {
        const block_id = parseInt(req.params.block_id, 10);
        const hostel_id = parseInt(req.params.hostel_id, 10);

        if (isNaN(block_id) || isNaN(hostel_id)) {
            return res.status(400).json({ success: false, message: "Invalid block_id or hostel_id" });
        }

        const result = await pool.query('SELECT * FROM public.get_floors_by_block_id_and_hostel_id($1, $2);', [block_id, hostel_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "No floors found for this block and hostel" });
        }

        res.status(200).json({ success: true, floors: result.rows });
    } catch (error) {
        console.error("❌ API Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});




module.exports = router;