const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");


const {
  DB_HOST = "localhost",
  DB_USER = "postgres",
  DB_PASSWORD = "example",
  DB_NAME = "tasksdb",
  PORT = 8080,
} = process.env;

const pool = new Pool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
});

const app = express();
app.use(express.json());
app.use(cors());

const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        is_done BOOLEAN NOT NULL DEFAULT false
      );
    `);
    console.log("Tasks table ready (if it didn't exist, it was created).");
  } catch (err) {
    console.error("Error creating tasks table:", err);
  }
};
initDb();


app.get("/api/tasks", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tasks ORDER BY id;");
    return res.json(result.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong!" });
  }
});


app.post("/api/tasks", async (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }
  try {
    const result = await pool.query(
      "INSERT INTO tasks (title) VALUES ($1) RETURNING *",
      [title]
    );
    return res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Could not create task" });
  }
});


app.patch("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { title, is_done } = req.body;
  try {
    const result = await pool.query(
      "UPDATE tasks SET title = COALESCE($1, title), is_done = COALESCE($2, is_done) WHERE id=$3 RETURNING *",
      [title, is_done, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Could not update task" });
  }
});

app.delete("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM tasks WHERE id=$1", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    return res.json({ message: "Task deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Could not delete task" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
