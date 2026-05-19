const fs = require("fs");
const path = require("path");

const pool = require("./config/db");

// 🔥 READ TXT FILE
const filePath = path.join(
  __dirname,
  "product_list.txt"
);

const fileContent = fs.readFileSync(
  filePath,
  "utf-8"
);

// 🔥 PARSE TXT FILE (HANDLING QUOTES)
const lines = fileContent.split("\n");
const tools = [];
let currentTool = "";
let inQuotes = false;

for (let line of lines) {
  line = line.trim();
  if (line.length === 0) continue;

  if (!inQuotes) {
    if (line.startsWith('"') && !line.endsWith('"')) {
      inQuotes = true;
      currentTool = line.substring(1);
    } else if (line.startsWith('"') && line.endsWith('"')) {
      tools.push(line.substring(1, line.length - 1));
    } else {
      tools.push(line);
    }
  } else {
    currentTool += " " + line;
    if (line.endsWith('"')) {
      inQuotes = false;
      tools.push(currentTool.substring(0, currentTool.length - 1));
      currentTool = "";
    }
  }
}

// 🔥 INSERT TOOLS
const importTools = async () => {

  try {

    for (const tool of tools) {

      // CHECK DUPLICATE
      const existing = await pool.query(
        `
        SELECT * FROM tools
        WHERE LOWER(tool_name) = LOWER($1)
        `,
        [tool]
      );

      if (existing.rows.length > 0) {

        console.log(
          `Skipping duplicate: ${tool}`
        );

        continue;
      }

      // INSERT
      await pool.query(
        `
        INSERT INTO tools
        (
          tool_name,
          category,
          description,
          total_quantity,
          available_quantity
        )
        VALUES ($1, $2, $3, $4, $5)
        `,
        [
          tool,
          "General",
          tool,
          10,
          10
        ]
      );

      console.log(
        `Inserted: ${tool}`
      );
    }

    console.log(
      "✅ Tool import completed"
    );

    process.exit();

  } catch (err) {

    console.error(err);

    process.exit(1);
  }
};

importTools();