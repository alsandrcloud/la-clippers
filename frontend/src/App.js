import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import Pagination from './Pagination'; // Import the Pagination component

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editTaskId, setEditTaskId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage] = useState(10); // Number of tasks per page
  const [totalTasks, setTotalTasks] = useState(0);

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  // Fetch tasks from the backend
  useEffect(() => {
    fetchTasks();
  }, [currentPage]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/tasks?page=${currentPage}&limit=${tasksPerPage}`);
      if (response.data && Array.isArray(response.data.tasks)) {
        setTasks(response.data.tasks);
        setTotalTasks(response.data.total); // Assuming the response includes the total count of tasks
      } else {
        setTasks([]);
        console.error('Unexpected data format:', response.data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const addTask = async () => {
    try {
      const newTask = { title, description };
      await axios.post(`${backendUrl}/api/tasks`, newTask);
      fetchTasks();
      setTitle('');
      setDescription('');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const updateTask = async (id) => {
    try {
      const updatedTask = { title, description };
      await axios.put(`${backendUrl}/api/tasks/${id}`, updatedTask);
      fetchTasks();
      setTitle('');
      setDescription('');
      setEditTaskId(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${backendUrl}/api/tasks/${id}`);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editTaskId) {
      updateTask(editTaskId);
    } else {
      addTask();
    }
  };

  const totalPages = Math.ceil(totalTasks / tasksPerPage);

  return (
    <div className="App">
      <h1>Task Manager</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <button type="submit">{editTaskId ? 'Update Task' : 'Add Task'}</button>
      </form>
      <table className="task-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(tasks) && tasks.map((task) => (
            <tr key={task._id}>
              <td>{task.title}</td>
              <td>{task.description}</td>
              <td>
                <button onClick={() => {
                  setEditTaskId(task._id);
                  setTitle(task.title);
                  setDescription(task.description);
                }}>Edit</button>
                <button onClick={() => deleteTask(task._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

export default App;
