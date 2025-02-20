const express = require('express');
const pool = require('../models/db'); // Database connection
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Fee Information
 *   description: APIs related to fee management
 */

/**
 * @swagger
 * /api/fee-types:
 *   get:
 *     summary: Get all fee types
 *     tags: [Fee Information]
 *     description: Retrieve all fee types from the database.
 *     responses:
 *       200:
 *         description: Successfully retrieved fee types.
 */
router.get('/fee-types', async (req, res) => {
    try {
        console.log("Fetching fee types...");
        const result = await pool.query("SELECT * FROM fee_types");
        console.log("Result:", result.rows); // Debugging
        res.status(200).json({ success: true, feeTypes: result.rows });
    } catch (error) {
        console.error("Error fetching fee types:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/fee-ledger:
 *   post:
 *     tags: [Fee Information]
 *     summary: Add a new fee ledger record
 *     description: Insert a new fee record using the insert_fee_ledger function.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fee_type_id:
 *                 type: integer
 *                 example: 1
 *               course_id:
 *                 type: integer
 *                 example: 2
 *               semester_id:
 *                 type: integer
 *                 example: 3
 *               year:
 *                 type: string
 *                 example: "2024"
 *               fee_amount:
 *                 type: number
 *                 example: 15000
 *     responses:
 *       201:
 *         description: Fee ledger record successfully added.
 *       400:
 *         description: Missing required fields.
 *       500:
 *         description: Internal Server Error.
 */
router.post('/fee-ledger', async (req, res) => {
    try {
        const { fee_type_id, course_id, semester_id, year, fee_amount } = req.body;

        if (!fee_type_id || !course_id || !semester_id || !year || !fee_amount) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const result = await pool.query(
            `SELECT insert_fee_ledger($1, $2, $3, $4, $5) AS fee_ledger_id`,
            [fee_type_id, course_id, semester_id, year, fee_amount]
        );

        return res.status(201).json({ 
            success: true, 
            message: "Fee ledger record added successfully", 
            fee_ledger_id: result.rows[0].fee_ledger_id 
        });

    } catch (error) {
        console.error("Error inserting fee ledger record:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});


/**
 * @swagger
 * /api/fee-ledger:
 *   get:
 *     tags: [Fee Information]
 *     summary: Get all fee ledger records
 *     description: Retrieve all records from the fee_ledger table.
 *     responses:
 *       200:
 *         description: Successfully retrieved fee ledger records.
 */

router.get('/fee-ledger', async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM get_fee_ledgers();`);
        return res.status(200).json({ success: true, feeRecords: result.rows });
    } catch (error) {
        console.error("Error fetching fee ledger records:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});




/**
 * @swagger
 * /api/fee-ledger/{id}:
 *   get:
 *     tags: [Fee Information]
 *     summary: Get a specific fee ledger record by ID
 */

router.get('/fee-ledger/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT * FROM fee_ledger WHERE fee_ledger_id = $1;`, 
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Fee ledger record not found" });
        }

        return res.status(200).json({ success: true, feeRecord: result.rows[0] });

    } catch (error) {
        console.error("Error fetching fee ledger record:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});



/**
 * @swagger
 * /api/fee-ledger/{id}:
 *   put:
 *     tags: [Fee Information]
 *     summary: Update a fee ledger record
 *     description: Update an existing fee ledger record using the update_fee_ledger function.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the fee ledger record to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fee_type_id:
 *                 type: integer
 *                 example: 1
 *               course_id:
 *                 type: integer
 *                 example: 2
 *               semester_id:
 *                 type: integer
 *                 example: 3
 *               year:
 *                 type: string
 *                 example: "2024"
 *               fee_amount:
 *                 type: number
 *                 example: 15000
 *     responses:
 *       200:
 *         description: Fee ledger record updated successfully.
 *       400:
 *         description: Bad request - missing required fields.
 *       404:
 *         description: Fee ledger record not found.
 *       500:
 *         description: Internal Server Error.
 */
router.put('/fee-ledger/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let { fee_type_id, course_id, semester_id, year, fee_amount } = req.body;

        if (!fee_type_id || !course_id || !semester_id || !year || !fee_amount) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // ✅ Ensure `year` is an INTEGER
        year = parseInt(year);

        const result = await pool.query(
            `SELECT update_fee_ledger($1, $2, $3, $4, $5, $6) AS updated;`, 
            [id, fee_type_id, course_id, semester_id, year, fee_amount]
        );

        if (result.rows[0].updated) {
            return res.status(200).json({ success: true, message: "Fee ledger record updated successfully" });
        } else {
            return res.status(404).json({ success: false, message: "Fee ledger record not found" });
        }

    } catch (error) {
        console.error("Error updating fee ledger record:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});



/**
 * @swagger
 * /api/fee-ledger/{id}:
 *   delete:
 *     tags: [Fee Information]
 *     summary: Delete a fee ledger record
 */
router.delete('/fee-ledger/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query(`SELECT delete_fee_ledger($1);`, [id]);
        return res.status(200).json({ success: true, message: "Fee ledger record deleted successfully" });
    } catch (error) {
        console.error("Error deleting fee ledger record:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});


module.exports = router;
