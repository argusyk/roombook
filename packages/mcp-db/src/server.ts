// packages/mcp-db/src/server.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  StdioServerTransport,
} from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import pg from "pg";

const MAX_ROWS = 200;
const pool = new pg.Pool({ connectionString: process.env.ROOMBOOK_RO_URL });

const server = new McpServer(
  { name: "roombook_db", version: "0.1.0" },
  {
    instructions:
      "Read-only access to the RoomBook replica. Call list_tables first, " +
      "then query with explicit columns and LIMIT. " +
      "The User table is not available.",
  },
);

server.registerTool(
  "list_tables",
  {
    description: "Lists available tables with their columns and types.",
    inputSchema: {},
    annotations: { readOnlyHint: true },
  },
  async () => {
    const res = await pool.query(
      "SELECT table_name, column_name, data_type " +
        "FROM information_schema.columns WHERE table_schema = 'public' " +
        "ORDER BY table_name, ordinal_position",
    );
    return { content: [{ type: "text", text: JSON.stringify(res.rows) }] };
  },
);

server.registerTool(
  "query",
  {
    description:
      "Runs one read-only SELECT. Returns at most 200 rows as JSON " +
      "and a note if the result was truncated.",
    inputSchema: { sql: z.string().max(4000) },
    annotations: { readOnlyHint: true },
  },
  async ({ sql }) => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN TRANSACTION READ ONLY");
      const res = await client.query(sql);
      const rows = res.rows.slice(0, MAX_ROWS);
      const note = res.rows.length > MAX_ROWS
        ? "truncated: " + res.rows.length + " rows, add filters or LIMIT"
        : "complete";
      const text = JSON.stringify({ note, rows });
      return { content: [{ type: "text", text }] };
    } catch (e) {
      const text = "SQL error: " + String(e);
      return { isError: true, content: [{ type: "text", text }] };
    } finally {
      await client.query("ROLLBACK");
      client.release();
    }
  },
);

await server.connect(new StdioServerTransport());
// лише stderr: stdout належить протоколу
console.error("roombook_db ready");
