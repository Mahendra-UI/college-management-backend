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
        const { fee_type_id, course_id, semester_id, year, fee_amount, fee_ledger_description } = req.body;

        if (!fee_type_id || !course_id || !semester_id || !year || !fee_amount || !fee_ledger_description) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const result = await pool.query(
            `SELECT insert_fee_ledger($1, $2, $3, $4, $5, $6) AS fee_ledger_id`,
            [fee_type_id, course_id, semester_id, year, fee_amount, fee_ledger_description]
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
 *     summary: Get fee ledger details by ID
 *     description: Fetch the details of a specific fee ledger record by ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Fee ledger ID
 *     responses:
 *       200:
 *         description: Successfully fetched fee ledger record
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 feeRecord:
 *                   type: object
 *                   properties:
 *                     fee_ledger_id:
 *                       type: integer
 *                     fee_type_id:
 *                       type: integer
 *                     course_id:
 *                       type: integer
 *                     semester_id:
 *                       type: integer
 *                     year:
 *                       type: string
 *                     fee_amount:
 *                       type: number
 *                     fee_ledger_description:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid request, missing or invalid fee_ledger_id
 *       404:
 *         description: Fee ledger record not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/fee-ledger/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`📌 Fetching fee ledger record for ID: ${id}`);

        // Validate input
        const feeLedgerId = parseInt(id, 10);
        if (isNaN(feeLedgerId) || feeLedgerId <= 0) {
            return res.status(400).json({ success: false, message: "Invalid Fee Ledger ID" });
        }

        // Query database for fee ledger record
        const result = await pool.query(`SELECT * FROM fee_ledger WHERE fee_ledger_id = $1`, [feeLedgerId]);

        if (result.rows.length === 0) {
            console.warn("⚠ Fee ledger record not found.");
            return res.status(404).json({ success: false, message: "Fee ledger record not found" });
        }

        console.log("✅ Fee ledger record found:", result.rows[0]);
        return res.status(200).json({ success: true, feeRecord: result.rows[0] });

    } catch (error) {
        console.error("❌ Error fetching fee ledger record:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
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
        let { fee_type_id, course_id, semester_id, year, fee_ledger_description, fee_amount } = req.body;

        if (!fee_type_id || !course_id || !semester_id || !year || !fee_ledger_description || !fee_amount) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        year = parseInt(year);

        const result = await pool.query(
            `SELECT update_fee_ledger($1, $2, $3, $4, $5, $6, $7) AS updated;`, 
            [id, fee_type_id, course_id, semester_id, year, fee_ledger_description, fee_amount]
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



/**
 * @swagger
 * /api/fee-ledger/student/{username}:
 *   get:
 *     tags: [Fee Information]
 *     summary: Fetch fee ledgers for a student based on their username
 *     description: Retrieves fee ledger records based on the student's enrolled course.
 *     parameters:
 *       - name: username
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: "Student's username to fetch associated fee ledgers"
 *     responses:
 *       '200':
 *         description: Successfully retrieved fee ledger records
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 feeLedgers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       fee_ledger_id:
 *                         type: integer
 *                         example: 7
 *                       fee_type_name:
 *                         type: string
 *                         example: "Library Fee"
 *                       course_name:
 *                         type: string
 *                         example: "ETC"
 *                       semester_name:
 *                         type: string
 *                         example: "Semester - I"
 *                       year:
 *                         type: integer
 *                         example: 2024
 *                       fee_amount:
 *                         type: number
 *                         example: 2000
 *                       fee_ledger_description:
 *                         type: string
 *                         example: "Library fee description"
 *                       created_at:
 *                         type: string
 *                         example: "2025-02-20T14:18:26.508Z"
 *                       updated_at:
 *                         type: string
 *                         example: "2025-02-21T08:39:29.845Z"
 *       '404':
 *         description: No fee ledger records found for this student
 *       '500':
 *         description: Internal Server Error
 */



router.get('/fee-ledger/student/:username', async (req, res) => {
    try {
        const { username } = req.params;
        console.log("📩 Fetching fee ledgers for username:", username);

        const result = await pool.query(
            'SELECT * FROM public.get_fee_ledgers_by_username($1)', 
            [username]  // ✅ Pass username as parameter
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "No fee ledger records found for this student" });
        }

        return res.status(200).json({ success: true, feeLedgers: result.rows });

    } catch (error) {
        console.error("❌ Error fetching fee ledger records:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});






/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Process a fee payment
 *     tags: [Payments]
 *     description: Stores payment details and updates fee status.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fee_ledger_id:
 *                 type: integer
 *               username:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Payment successful.
 *       400:
 *         description: Missing required fields.
 *       500:
 *         description: Internal Server Error.
 */
router.post('/payments', async (req, res) => {
    try {
        const { fee_ledger_id, username, amount } = req.body;

        if (!fee_ledger_id || !username || !amount) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // ✅ Generate Unique Transaction ID
        const transaction_id = `TXN${Date.now()}`;

        // ✅ Insert Payment Record
        const result = await pool.query(
            `INSERT INTO payments (fee_ledger_id, username, transaction_id, payment_status, amount_paid)
             VALUES ($1, $2, $3, 'Completed', $4) RETURNING *`,
            [fee_ledger_id, username, transaction_id, amount]
        );

        return res.status(201).json({
            success: true,
            message: "Payment successful",
            transaction_id: transaction_id,
            paymentDetails: result.rows[0]
        });

    } catch (error) {
        console.error("❌ Payment Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});


/**
 * @swagger
 * /api/receipt/{transactionId}:
 *   get:
 *     tags: [Payments]
 *     summary: Fetch receipt details by transaction ID
 *     description: Retrieves receipt details for a completed fee payment.
 *     parameters:
 *       - name: transactionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: "Transaction ID of the payment"
 *     responses:
 *       '200':
 *         description: Successfully retrieved receipt details
 *       '404':
 *         description: Receipt not found
 *       '500':
 *         description: Internal Server Error
 */


router.get('/receipt/:transactionId', async (req, res) => {
    try {
        const { transactionId } = req.params;

        if (!transactionId) {
            return res.status(400).json({ success: false, message: "Transaction ID is required" });
        }

        const query = `
            SELECT 
                p.payment_id, 
                p.fee_ledger_id, 
                p.username, 
                p.transaction_id, 
                p.payment_status, 
                p.amount_paid, 
                p.payment_date, 
                fl.fee_type_id, 
                ft.fee_type_name, 
                fl.course_id, 
                c.course_name, 
                fl.semester_id, 
                s.semester_name, 
                fl.year
            FROM payments p
            JOIN fee_ledger fl ON p.fee_ledger_id = fl.fee_ledger_id
            JOIN fee_types ft ON fl.fee_type_id = ft.fee_type_id
            JOIN courses c ON fl.course_id = c.course_id
            JOIN semesters s ON fl.semester_id = s.semester_id
            WHERE p.transaction_id = $1
        `;

        const result = await pool.query(query, [transactionId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Receipt not found" });
        }

        return res.status(200).json({ success: true, receipt: result.rows[0] });

    } catch (error) {
        console.error("❌ Error fetching receipt:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});



/**
 * @swagger
 * /api/students/fee-status:
 *   get:
 *     tags: [Fee Information]
 *     summary: Fetch fee status for all students
 *     description: Retrieves all students' fee ledgers along with their payment status.
 *     responses:
 *       '200':
 *         description: Successfully retrieved students' fee status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 feeStatus:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       student_username:
 *                         type: string
 *                       student_name:
 *                         type: string
 *                       course_name:
 *                         type: string
 *                       semester_name:
 *                         type: string
 *                       fee_ledger_id:
 *                         type: integer
 *                       fee_type_name:
 *                         type: string
 *                       year:
 *                         type: integer
 *                       fee_amount:
 *                         type: number
 *                       fee_status:
 *                         type: string
 *                       transaction_id:
 *                         type: string
 *                       payment_date:
 *                         type: string
 *       '500':
 *         description: Internal Server Error
 */

router.get('/students/fee-status', async (req, res) => {
    try {
        console.log("📩 Fetching all students' fee status...");
        
        const result = await pool.query('SELECT * FROM get_all_students_fee_status()');

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "No fee records found." });
        }

        return res.status(200).json({ success: true, feeStatus: result.rows });

    } catch (error) {
        console.error("❌ Error fetching students' fee status:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});


module.exports = router;
