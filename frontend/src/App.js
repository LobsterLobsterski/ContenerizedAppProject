import React, { useState, useEffect } from "react";

const API_URL = "/api/tasks"; 


function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setTasks(data));
  }, []);

  const addTask = async () => {
    if (!title.trim()) return;
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    const newTask = await res.json();
    setTasks([...tasks, newTask]);
    setTitle("");
  };

  const toggleDone = async (task) => {
    const res = await fetch(`${API_URL}/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_done: !task.is_done }),
    });
    const updated = await res.json();
    setTasks(tasks.map((t) => (t.id === task.id ? updated : t)));
  };

  const deleteTask = async (id) => {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    setTasks(tasks.filter((t) => t.id !== id));
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h1>Tasks Manager</h1>
      <div>
        <input
          placeholder="New Task"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button onClick={addTask}>Add</button>
      </div>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {tasks.map((task) => (
          <li key={task.id} style={{ margin: "8px 0" }}>
            <input
              type="checkbox"
              checked={task.is_done}
              onChange={() => toggleDone(task)}
            />
            <span
              style={{
                textDecoration: task.is_done ? "line-through" : "none",
                marginLeft: "8px",
              }}
            >
              {task.title}
            </span>
            <button
              style={{ marginLeft: "8px" }}
              onClick={() => deleteTask(task.id)}
            >
              x
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
