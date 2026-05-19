const pool = require('../config/db');

exports.getTools = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tools');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching tools");
  }
};

exports.createTool = async (req, res) => {
  try {
    const { tool_id, tool_name, category, total_quantity, description, unit_price } = req.body;
    // 🔥 CHECK DUPLICATE

const existing = await pool.query(
  `SELECT * FROM tools
   WHERE LOWER(tool_name) = LOWER($1)
   AND LOWER(category) = LOWER($2)`,
  [tool_name, category]
);

if (existing.rows.length > 0) {
  return res.status(400).send("Tool already exists");
}

    const result = await pool.query(
      `INSERT INTO tools (tool_id, tool_name, category, total_quantity, available_quantity, description, unit_price)
       VALUES ($1, $2, $3, $4, $4, $5, $6)
       RETURNING *`,
      [tool_id || null, tool_name, category, Number(total_quantity), description, parseFloat(unit_price) || 0]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating tool");
  }
};

exports.updateTool = async (req, res) => {
  try {
    const { id } = req.params;
    const { tool_id, tool_name, category, total_quantity, description, unit_price } = req.body;

    const currentToolRes = await pool.query('SELECT total_quantity, available_quantity FROM tools WHERE id = $1', [id]);
    if (currentToolRes.rows.length === 0) {
      return res.status(404).send("Tool not found");
    }

    const currentTool = currentToolRes.rows[0];
    const diff = Number(total_quantity) - currentTool.total_quantity;
    const new_available = currentTool.available_quantity + diff;

    const result = await pool.query(
      `UPDATE tools 
       SET tool_id = $1,
           tool_name = $2,
           category = $3,
           total_quantity = $4,
           available_quantity = $5,
           description = $6,
           unit_price = $7
       WHERE id = $8
       RETURNING *`,
      [tool_id || null, tool_name, category, Number(total_quantity), new_available, description, parseFloat(unit_price) || 0, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating tool");
  }
};

exports.deleteTool = async (req, res) => {
  try {
    await pool.query('DELETE FROM tools WHERE id=$1', [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting tool");
  }
};

exports.batchUpdateStock = async (req, res) => {
  console.log("BATCH STOCK UPDATE REQUEST RECEIVED:", req.body);
  const client = await pool.connect();
  try {
    const { updates } = req.body; // updates: Array of { id, quantity }
    if (!updates || !Array.isArray(updates)) {
      return res.status(400).send("Invalid updates array");
    }

    await client.query('BEGIN');

    for (const update of updates) {
      const { id, quantity } = update;
      const parsedId = parseInt(id, 10);
      const parsedQty = parseInt(quantity, 10);

      if (isNaN(parsedId) || isNaN(parsedQty)) {
        throw new Error(`Invalid item ID (${id}) or quantity (${quantity})`);
      }

      await client.query(
        'UPDATE tools SET total_quantity = total_quantity + $1, available_quantity = available_quantity + $1 WHERE id = $2',
        [parsedQty, parsedId]
      );
    }

    await client.query('COMMIT');
    console.log("BATCH STOCK UPDATE SUCCESSFUL");
    res.json({ message: "Batch stock update successful" });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("BATCH STOCK UPDATE ERROR:", err);
    res.status(500).send("Error performing batch stock update: " + err.message);
  } finally {
    client.release();
  }
};