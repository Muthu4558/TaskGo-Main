import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdDelete, MdEdit } from 'react-icons/md';

axios.defaults.withCredentials = true;
const API_URL = 'http://localhost:5000/api/idea-board';

const IdeaBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    stage: 'To Do',
    tag: '',
    priority: 'Medium',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    try {
      const res = await axios.get(API_URL);
      setTasks(res.data);
    } catch (err) {
      console.error('Error fetching ideas:', err.message);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      dueDate: '',
      stage: 'To Do',
      tag: '',
      priority: 'Medium',
    });
    setEditId(null);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.dueDate) {
      alert('All fields are required!');
      return;
    }

    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, form);
      } else {
        await axios.post(API_URL, form);
      }
      fetchIdeas();
      resetForm();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving idea:', err.message);
    }
  };

  const handleEdit = (task) => {
    setForm(task);
    setEditId(task._id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchIdeas();
    } catch (err) {
      console.error('Error deleting idea:', err.message);
    }
  };

  const priorityBadge = (priority) => {
    const colors = {
      High: 'bg-red-100 text-red-800',
      Medium: 'bg-yellow-100 text-yellow-800',
      Low: 'bg-green-100 text-green-800',
    };
    return `px-3 py-1 rounded-full text-sm font-semibold ${colors[priority] || 'bg-gray-100 text-gray-800'}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Idea Board</h1>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-[#229ea6] text-white px-5 py-2 rounded-lg shadow hover:bg-[#51b0b7] transition"
        >
          + Add Task to Yourself
        </button>
      </div>

      {/* Task Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <div key={task._id} className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition border">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-semibold text-gray-800">{task.title}</h3>
              <span className="text-sm ">
                <span className='block font-bold'>Due Date:</span> 
                <span className='block text-gray-500'>{new Date(task.dueDate).toLocaleDateString()}</span>
              </span>
            </div>
            <p className="mb-3">
              <span className='block font-bold'>Description:</span>
              <span className='block text-gray-600'>{task.description}</span>
            </p>
            <div className="flex flex-wrap gap-2 text-sm mb-3">
              <select
                value={task.stage}
                onChange={async (e) => {
                  const updatedStage = e.target.value;
                  try {
                    await axios.put(`${API_URL}/${task._id}`, { ...task, stage: updatedStage });
                    fetchIdeas();
                  } catch (err) {
                    console.error('Error updating stage:', err.message);
                  }
                }}
                className="rounded border bg-gray-100 px-2 py-1"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">#{task.tag}</span>
              <span className={priorityBadge(task.priority)}>{task.priority}</span>
            </div>
            <div className="flex justify-end gap-4">
              <button onClick={() => handleEdit(task)}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200 text-sm font-semibold"
              >
                <MdEdit /> Edit
              </button>
              <button
                onClick={() => handleDelete(task._id)}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-red-100 text-red-600 hover:bg-red-200 text-sm font-semibold"
              >
                <MdDelete /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-xl shadow-lg">
            <h2 className="text-2xl font-semibold mb-5">{editId ? 'Edit Task' : 'Add New Task'}</h2>
            <div className="space-y-4">
              <input
                type="text"
                name="title"
                placeholder="Title"
                value={form.title}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring"
              />
              <textarea
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring"
              />
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              />
              <select
                name="stage"
                value={form.stage}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              >
                <option>To Do</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
              <input
                type="text"
                name="tag"
                placeholder="Tag (e.g., Design)"
                value={form.tag}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              />
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="bg-[#229ea6] text-white px-5 py-2 rounded-lg hover:bg-[#51b0b7]"
                >
                  {editId ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IdeaBoard;