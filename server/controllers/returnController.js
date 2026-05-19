const pool = require('../config/db');

exports.createReturnRequest = async (req, res) => {
  try {
    const { dc_number, user_id, items } = req.body;

    // 1. Fetch active return requests for the same DC Number
    const existingReqs = await pool.query(
      `SELECT items FROM return_requests WHERE LOWER(dc_number) = LOWER($1) AND status IN ('pending', 'approved')`,
      [dc_number]
    );

    const alreadyReturnedIds = new Set();
    for (const row of existingReqs.rows) {
      const existingItems = typeof row.items === 'string' ? JSON.parse(row.items) : row.items;
      if (Array.isArray(existingItems)) {
        for (const item of existingItems) {
          if (item.returned && item.id) {
            alreadyReturnedIds.add(item.id);
          }
        }
      }
    }

    // 2. Validate incoming items
    if (Array.isArray(items)) {
      for (const item of items) {
        if (item.returned && item.id && alreadyReturnedIds.has(item.id)) {
          return res.status(400).send("One or more items in this challan have already been restocked or are pending restocking approval.");
        }
      }
    }

    const result = await pool.query(
      'INSERT INTO return_requests (dc_number, user_id, items) VALUES ($1, $2, $3) RETURNING *',
      [dc_number, user_id, JSON.stringify(items)]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating return request");
  }
};

exports.getReturnRequests = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, u.name AS user_name 
      FROM return_requests r
      JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching return requests");
  }
};

exports.approveReturnRequest = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    await client.query('BEGIN');

    const returnReqRes = await client.query('SELECT * FROM return_requests WHERE id = $1', [id]);
    if (returnReqRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).send("Return request not found");
    }

    const returnReq = returnReqRes.rows[0];
    if (returnReq.status !== 'pending') {
      await client.query('ROLLBACK');
      return res.status(400).send("Return request already processed");
    }

    const items = typeof returnReq.items === 'string' ? JSON.parse(returnReq.items) : returnReq.items;

    for (const item of items) {
      if (item.returned) {
        // Restock available quantity
        await client.query(
          'UPDATE tools SET available_quantity = available_quantity + $1 WHERE id = $2',
          [item.quantity, item.tool_id]
        );
      }
    }

    await client.query('UPDATE return_requests SET status = $1 WHERE id = $2', ['approved', id]);
    
    await client.query('COMMIT');
    res.json({ message: "Return request approved and inventory updated" });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).send("Error approving return request");
  } finally {
    client.release();
  }
};

exports.rejectReturnRequest = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE return_requests SET status = $1 WHERE id = $2', ['rejected', id]);
    res.json({ message: "Return request rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error rejecting return request");
  }
};
