const pool = require("../config/db");

// ✅ CREATE REQUEST
exports.createRequest = async (req, res) => {
  try {
    const requestColumns = [
      'user_id',
      'tool_id',
      'quantity',
      'approved_quantity',
      'status',
      'is_printed',
      'dc_number',
      'client_name',
      'client_address',
      'attention_person',
      'phone',
      'po_number',
      'po_date',
      'state',
      'returnable',
      'price',
      'unit_price'
    ];



    const existingColumnsRes = await pool.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'requests' AND column_name = ANY($1)`,
      [requestColumns]
    );

    const existingColumns = new Set(
      existingColumnsRes.rows.map((row) => row.column_name)
    );

    const insertColumns = requestColumns.filter((column) =>
      existingColumns.has(column)
    );

    const values = insertColumns.map((column) => {
      const value = req.body[column];
      if (column === 'po_date' && value === '') {
        return null;
      }
      return value === undefined ? null : value;
    });

    const placeholders = insertColumns
      .map((_, index) => `$${index + 1}`)
      .join(',');

    const insertQuery = `INSERT INTO requests (${insertColumns.join(',')}) VALUES (${placeholders}) RETURNING *`;

    const {
      user_id,
      tool_id,
      quantity,
      status
    } = req.body;

    console.log('Creating request for user:', user_id, 'tool:', tool_id, 'quantity:', quantity);

    const result = await pool.query(insertQuery, values);

    res.json(result.rows[0]);
  } catch (err) {
    console.error('CREATE REQUEST ERROR:', err.message || err);
    res.status(500).send(err.message || 'Error creating request');
  }
};

// ✅ GET REQUESTS
exports.getRequests = async (req, res) => {
  try {
    const { from, to } = req.query;

    let query = `
      SELECT 
        r.*,
        u.name AS user_name,
        t.tool_name
      FROM requests r
      JOIN users u ON r.user_id = u.id
      JOIN tools t ON r.tool_id = t.id
    `;

    const values = [];

    // ✅ DATE FILTER
    if (from && to) {
      query += ` WHERE DATE(r.request_date) BETWEEN $1 AND $2`;
      values.push(from, to);
    }

    query += ` ORDER BY r.id DESC`;

    const result = await pool.query(query, values);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching requests");
  }
};

// ✅ APPROVE REQUEST
exports.approveRequest = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const requestId = req.params.id;

    // 1️⃣ GET REQUEST
    const requestRes = await client.query(
      `SELECT * FROM requests WHERE id = $1`,
      [requestId]
    );

    if (requestRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).send("Request not found");
    }

    const request = requestRes.rows[0];

    // ✅ CHECK STATUS
    if (request.status !== "pending") {
      await client.query("ROLLBACK");
      return res.status(400).send("Request already processed");
    }

    // 2️⃣ GET TOOL
    const toolRes = await client.query(
      `SELECT * FROM tools WHERE id = $1 FOR UPDATE`,
      [request.tool_id]
    );

    if (toolRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).send("Tool not found");
    }

    const tool = toolRes.rows[0];

    // 3️⃣ CHECK STOCK
    if (tool.available_quantity < request.quantity) {
      await client.query("ROLLBACK");
      return res.status(400).send("Not enough stock");
    }

    // 4️⃣ UPDATE TOOL STOCK
    await client.query(
      `UPDATE tools
       SET available_quantity = available_quantity - $1
       WHERE id = $2`,
      [request.quantity, request.tool_id]
    );

    // 5️⃣ UPDATE REQUEST STATUS
    await client.query(
      `UPDATE requests
       SET status = 'approved',
           approval_date = NOW()
       WHERE id = $1`,
      [requestId]
    );

    // 6️⃣ INSERT INTO ALLOCATIONS
    await client.query(
      `INSERT INTO allocations (user_id, tool_id, quantity)
       VALUES ($1, $2, $3)`,
      [request.user_id, request.tool_id, request.quantity]
    );

    await client.query("COMMIT");

    res.json({
      message: "Request approved successfully",
    });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("APPROVE ERROR:", err);

    res.status(500).send(err.message);
  } finally {
    client.release();
  }
};

// ✅ MARK AS PRINTED
exports.markAsPrinted = async (req, res) => {
  try {
    const id = req.params.id;

    const check = await pool.query(
      `SELECT * FROM requests WHERE id = $1`,
      [id]
    );

    if (check.rows.length === 0) {
      return res.status(404).send("Request not found");
    }

    await pool.query(
      `UPDATE requests
       SET is_printed = true
       WHERE id = $1`,
      [id]
    );

    res.json({
      message: "Request marked as printed"
    });
  } catch (err) {
    console.error('MARK AS PRINTED ERROR:', err.message || err);
    res.status(500).send(err.message || "Error marking request printed");
  }
};

// ✅ REJECT REQUEST
exports.rejectRequest = async (req, res) => {
  try {
    const id = req.params.id;

    // CHECK REQUEST
    const check = await pool.query(
      `SELECT * FROM requests WHERE id = $1`,
      [id]
    );

    if (check.rows.length === 0) {
      return res.status(404).send("Request not found");
    }

    const request = check.rows[0];

    // CHECK STATUS
    if (request.status !== "pending") {
      return res.status(400).send("Already processed");
    }

    // UPDATE STATUS
    const result = await pool.query(
      `UPDATE requests
       SET status = 'rejected',
           approval_date = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    res.json({
      message: "Request rejected successfully",
      data: result.rows[0],
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error rejecting request");
  }
};

// ✅ DELETE REQUEST
exports.deleteRequest = async (req, res) => {
  try {
    const id = req.params.id;
    const check = await pool.query('SELECT status FROM requests WHERE id = $1', [id]);
    
    if (check.rows.length === 0) {
      return res.status(404).send("Request not found");
    }
    
    if (check.rows[0].status.toLowerCase() !== 'pending') {
      return res.status(400).send(`Only pending requests can be deleted. Current status: ${check.rows[0].status}`);
    }

    
    await pool.query('DELETE FROM requests WHERE id = $1', [id]);
    res.json({ message: "Request deleted successfully" });
  } catch (err) {
    console.error("DELETE REQUEST ERROR:", err);
    res.status(500).send("Error deleting request");
  }
};

// ✅ HIDE REQUEST
exports.hideRequest = async (req, res) => {
  try {
    const id = req.params.id;
    const check = await pool.query('SELECT * FROM requests WHERE id = $1', [id]);
    
    if (check.rows.length === 0) {
      return res.status(404).send("Request not found");
    }
    
    await pool.query('UPDATE requests SET is_hidden = true WHERE id = $1', [id]);
    res.json({ message: "Request hidden successfully" });
  } catch (err) {
    console.error("HIDE REQUEST ERROR:", err);
    res.status(500).send("Error hiding request");
  }
};

// ✅ MERGE REQUESTS
exports.mergeRequests = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const userId = req.params.userId;

    // Fetch all pending requests for this user
    const pendingRes = await client.query(
      `SELECT * FROM requests WHERE user_id = $1 AND status = 'pending' ORDER BY id ASC`,
      [userId]
    );

    if (pendingRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).send("No pending requests found for this user");
    }

    const requests = pendingRes.rows;
    // Base DC number (use the earliest one)
    const baseDcNumber = requests[0].dc_number;

    // Group by tool_id
    const toolMap = {};
    for (const r of requests) {
      if (!toolMap[r.tool_id]) {
        toolMap[r.tool_id] = { ...r, quantity: Number(r.quantity), duplicateIds: [] };
      } else {
        toolMap[r.tool_id].quantity += Number(r.quantity);
        toolMap[r.tool_id].duplicateIds.push(r.id);
      }
    }

    for (const toolId in toolMap) {
      const mergedReq = toolMap[toolId];
      // Update the base request with the summed quantity and the base DC number
      await client.query(
        `UPDATE requests SET quantity = $1, dc_number = $2 WHERE id = $3`,
        [mergedReq.quantity, baseDcNumber, mergedReq.id]
      );
      // Delete duplicates
      if (mergedReq.duplicateIds.length > 0) {
        await client.query(
          `DELETE FROM requests WHERE id = ANY($1::int[])`,
          [mergedReq.duplicateIds]
        );
      }
    }

    await client.query("COMMIT");
    res.json({ message: "Requests merged successfully" });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("MERGE ERROR:", err);
    res.status(500).send("Error merging requests");
  } finally {
    client.release();
  }
};