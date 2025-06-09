import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdDelete, MdEdit } from 'react-icons/md';
import { toast } from "sonner";

axios.defaults.withCredentials = true;
const API_URL = `${import.meta.env.VITE_APP_BASE_URL}/api/idea-board`;

const IdeaBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
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
  const [stageFilter, setStageFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewTask, setViewTask] = useState(null);

  useEffect(() => {
    fetchIdeas();
  }, []);

  useEffect(() => {
    let updated = [...tasks];

    if (stageFilter !== 'All') {
      updated = updated.filter(task => task.stage === stageFilter);
    }

    if (searchQuery.trim()) {
      updated = updated.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTasks(updated);
  }, [tasks, stageFilter, searchQuery]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setViewTask(null);
        setIsModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
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
        toast.success('Task updated successfully');
      } else {
        await axios.post(API_URL, form);
        toast.success('Task added successfully');
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
      toast.success('Task deleted successfully');
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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <h1 className="text-4xl font-bold text-gray-800">Idea Board</h1>

        <div className="flex flex-wrap gap-4 items-end">
          {/* Filter by Stage */}
          <div className="flex flex-col">
            <label className="mb-1">Filter by Stage:</label>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="border rounded px-3 py-2 min-w-[160px]"
            >
              <option value="All">All</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Search by Title */}
          <div className="flex flex-col">
            <label className="mb-1">Search by Title:</label>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border rounded px-3 py-2 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-[#229ea6]"
            />
          </div>

          {/* Clear Button */}
          <div className="flex flex-col">
            <label className="invisible mb-1">Clear</label>
            <button
              onClick={() => {
                setStageFilter('All');
                setSearchQuery('');
              }}
              className="bg-[#229ea6] text-white px-4 py-2 rounded-lg hover:bg-[#51b0b7] transition"
            >
              Clear
            </button>
          </div>

          {/* Add Task Button */}
          <div className="flex flex-col">
            <label className="invisible mb-1">Add</label>
            <button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="bg-[#229ea6] text-white px-5 py-2 rounded-lg shadow hover:bg-[#51b0b7] transition"
            >
              + Add Task
            </button>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map((task) => (
          <div key={task._id} className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition border overflow-hidden break-words">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xl font-semibold text-gray-800 truncate max-w-[60%]">{task.title}</h3>
              <span className="text-sm text-right">
                <span className="block font-bold">Due:</span>
                <span className="block text-gray-500">{new Date(task.dueDate).toLocaleDateString()}</span>
              </span>
            </div>
            <p className="mb-3 line-clamp-3">
              <span className="block font-bold">Description:</span>
              <span className="block text-gray-600">{task.description}</span>
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
                className="rounded border bg-gray-100 px-2 py-1 min-w-0"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium break-words max-w-full">#{task.tag}</span>
              <span className={priorityBadge(task.priority)}>{task.priority}</span>
            </div>
            <div className="flex justify-end gap-2 flex-wrap">
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
              <button
                onClick={() => setViewTask(task)}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-semibold"
              >
                Open
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* View Task Modal */}
      {viewTask && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setViewTask(null)} // Click outside to close
        >
          <div
            className="relative bg-white rounded-lg p-5 w-[90%] max-w-sm shadow-lg max-h-[50vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            {/* Close Button */}
            <button
              onClick={() => setViewTask(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-3xl font-bold"
            >
              &times;
            </button>

            <h2 className="text-xl font-bold mb-4 text-gray-800">View Task</h2>

            <div className="mb-3">
              <h3 className="text-sm font-semibold text-gray-600">Title</h3>
              <p className="text-gray-800 break-words">{viewTask.title}</p>
            </div>

            <div className="mb-3">
              <h3 className="text-sm font-semibold text-gray-600">Description</h3>
              <p className="text-gray-800 whitespace-pre-wrap break-words">{viewTask.description}</p>
            </div>

            <div className="mb-3">
              <h3 className="text-sm font-semibold text-gray-600">Due Date</h3>
              <p className="text-gray-800">{new Date(viewTask.dueDate).toLocaleDateString()}</p>
            </div>

            <div className="mb-3">
              <h3 className="text-sm font-semibold text-gray-600">Stage</h3>
              <p className="text-gray-800">{viewTask.stage}</p>
            </div>

            <div className="mb-1">
              <h3 className="text-sm font-semibold text-gray-600">Priority</h3>
              <p className="text-gray-800">{viewTask.priority}</p>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Task Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setIsModalOpen(false)} // Click outside to close
        >
          <div
            className="relative bg-white rounded-lg p-6 w-[90%] max-w-md shadow-lg max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()} // Prevent close on inner click
          >
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold"
            >
              &times;
            </button>

            <h2 className="text-xl font-bold mb-4 text-gray-800">{editId ? 'Edit Task' : 'Add Task'}</h2>

            {/* Form Inputs */}
            <div className="flex flex-col gap-3">
              <input
                type="text"
                name="title"
                placeholder="Title"
                value={form.title}
                onChange={handleChange}
                className="border rounded px-3 py-2 focus:outline-none"
              />

              <textarea
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={handleChange}
                className="border rounded px-3 py-2 h-24 resize-none focus:outline-none"
              />

              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                className="border rounded px-3 py-2 focus:outline-none"
              />

              <select
                name="stage"
                value={form.stage}
                onChange={handleChange}
                className="border rounded px-3 py-2 focus:outline-none"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>

              <input
                type="text"
                name="tag"
                placeholder="Tag"
                value={form.tag}
                onChange={handleChange}
                className="border rounded px-3 py-2 focus:outline-none"
              />

              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="border rounded px-3 py-2 focus:outline-none"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                className="bg-[#229ea6] text-white px-5 py-2 rounded-lg hover:bg-[#51b0b7] transition"
              >
                {editId ? 'Update Task' : 'Add Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IdeaBoard;
