import React, { useState, useEffect } from 'react';
import Title from '../components/Title';
import axios from 'axios';
import { IoMdAdd } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import UserList from '../components/task/UserList';
import { toast } from "sonner";
import { Toaster } from "react-hot-toast";
import { BsEyeFill } from 'react-icons/bs';
import { MdAdd, MdDelete, MdEdit, MdOpenInBrowser } from 'react-icons/md';

const Project = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    _id: '',
    title: '',
    dueDate: '',
    priority: 'medium',
    assets: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [assignForm, setAssignForm] = useState({
    taskTitle: '',
    dueDate: '',
    priority: 'medium',
    stage: 'todo',
    team: [],
    projectId: '',
  });

  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/api/projects`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setProjects(res.data);
      // toast.success('Projects loaded successfully');
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      toast.error('Failed to load projects');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);  // Start loading
    try {
      const token = localStorage.getItem('token');
      if (isEditing) {
        await axios.put(`/api/projects/${formData._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Project updated successfully', {
          style: {
            backgroundColor: "#4caf50",
            color: "#fff",
            fontSize: "16px",
            padding: "10px",
          }
        });
      } else {
        await axios.post('/api/projects', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Project created successfully', {
          style: {
            backgroundColor: "#4caf50",
            color: "#fff",
            fontSize: "16px",
            padding: "10px",
          }
        });
      }
      setIsModalOpen(false);
      setIsEditing(false);
      setFormData({ _id: '', title: '', dueDate: '', priority: 'medium', assets: '' });
      fetchProjects();
    } catch (err) {
      console.error('Error submitting project:', err);
      toast.error('Failed to submit project', {
        style: {
          backgroundColor: "#4caf50",
          color: "#fff",
          fontSize: "16px",
          padding: "10px",
        }
      });
    } finally {
      setLoading(false);  // Stop loading
    }
  };


  const handleEdit = (project) => {
    setFormData(project);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      toast.success('Project deleted successfully', {
        style: {
          backgroundColor: "#4caf50",
          color: "#fff",
          fontSize: "16px",
          padding: "10px",
        }
      }
      );
      fetchProjects();
    } catch (err) {
      console.error('Failed to delete project:', err);
      toast.error('Failed to delete project', {
        style: {
          backgroundColor: "#4caf50",
          color: "#fff",
          fontSize: "16px",
          padding: "10px",
        }
      }
      );
    }
  };

  const handleOpen = (project) => {
    navigate(`/projects/${project._id}`);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading

    try {
      const payload = {
        ...assignForm,
        projectId: assignForm.projectId
      };

      await axios.post('/api/project-details', payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      toast.success('User assigned to project successfully', {
        style: {
          backgroundColor: "#4caf50",
          color: "#fff",
          fontSize: "16px",
          padding: "10px",
        }
      });

      setIsAssignModalOpen(false);
      setAssignForm({ taskTitle: '', dueDate: '', priority: 'medium', stage: 'todo', team: [], projectId: '' });
    } catch (err) {
      console.error('Failed to assign task:', err);
      toast.error('Failed to assign user to project', {
        style: {
          backgroundColor: "#4caf50",
          color: "#fff",
          fontSize: "16px",
          padding: "10px",
        }
      });
    } finally {
      setLoading(false); // End loading
    }
  };


  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div>
      <Toaster position="bottom-right" reverseOrder={false} />
      <div className="md:flex justify-between items-center">
        <Title title="Project" className="mb-4" />
        <div className="flex gap-5">
          <button
            onClick={() => {
              setIsModalOpen(true);
              setIsEditing(false);
              setFormData({ _id: '', title: '', dueDate: '', priority: 'medium', assets: '' });
            }}
            className="bg-[#229ea6] text-white p-3 rounded-md text-lg font-semibold flex items-center gap-2"
          >
            <IoMdAdd className="text-lg" />Create New Project
          </button>
          <button
            onClick={() => navigate('/userproject')}
            className="bg-[#229ea6] text-white p-3 rounded-md text-lg font-semibold flex items-center gap-2"
          >
            <BsEyeFill /> Assigned Tasks
          </button>
        </div>
      </div>

      {/* Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-10">
          <div className="bg-white p-8 rounded-md w-96">
            <h2 className="text-2xl font-semibold mb-4">
              {isEditing ? 'Edit Project' : 'Create New Project'}
            </h2>
            <form onSubmit={handleSubmit}>
              <label className='font-bold'>Project Title</label>
              <input
                type="text"
                placeholder="Project Title"
                className="w-full p-2 mb-4 border border-gray-300 rounded-md mt-2"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <label className='font-bold'>Due Date</label>
              <input
                type="date"
                className="w-full p-2 mb-4 border border-gray-300 rounded-md mt-2"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
              />
              <label className='font-bold'>Priority Level</label>
              <select
                className="w-full p-2 mb-4 border border-gray-300 rounded-md mt-2"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="bg-gray-400 text-white px-4 py-2 rounded mr-2"
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`bg-[#229ea6] text-white p-2 rounded-md w-full font-semibold ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Submitting...' : isEditing ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign User Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-20">
          <div className="bg-white p-8 rounded-md w-[400px]">
            <h2 className="text-2xl font-semibold mb-4">Assign Task In Project</h2>
            <form onSubmit={handleAssignSubmit}>
              <label className='font-bold'>Task Title</label>
              <input
                type="text"
                placeholder="Task Title"
                className="w-full p-2 mb-4 border border-gray-300 rounded-md mt-2"
                value={assignForm.taskTitle}
                onChange={(e) => setAssignForm({ ...assignForm, taskTitle: e.target.value })}
                required
              />
              <UserList setTeam={(team) => setAssignForm({ ...assignForm, team })} team={assignForm.team} />
              <label className='font-bold'>Due Date</label>
              <input
                type="date"
                className="w-full p-2 mb-4 border border-gray-300 rounded-md mt-2"
                value={assignForm.dueDate}
                onChange={(e) => setAssignForm({ ...assignForm, dueDate: e.target.value })}
                required
              />
              <label className='font-bold'>Priority</label>
              <select
                className="w-full p-2 mb-4 border border-gray-300 rounded-md mt-2"
                value={assignForm.priority}
                onChange={(e) => setAssignForm({ ...assignForm, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <label className='font-bold'>Stage</label>
              <select
                className="w-full p-2 mb-4 border border-gray-300 rounded-md mt-2"
                value={assignForm.stage}
                onChange={(e) => setAssignForm({ ...assignForm, stage: e.target.value })}
                required
              >
                <option value="">Select Stage</option>
                <option value="todo">To Do</option>
                <option value="in progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>

              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  className="bg-gray-400 text-white px-4 py-2 rounded mr-2"
                  onClick={() => setIsAssignModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 rounded text-white ${loading ? 'bg-gray-400' : 'bg-[#229ea6] hover:bg-[#1b868d]'}`}
                >
                  {loading ? 'Loading...' : 'Assign'}
                </button>

              </div>
            </form>
          </div>
        </div>
      )}

      {/* Display Projects */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <div className="text-2xl font-bold col-span-3 text-center text-gray-500">
            No projects available. Please create a new project.
          </div>
        ) : (
          projects.map((project) => (
            <div
              key={project._id}
              className="bg-white shadow-lg rounded-2xl p-6 border hover:shadow-xl transition-all duration-300"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {project.title}
              </h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Due:</span> {new Date(project.dueDate).toLocaleDateString()}</p>
                <p><span className="font-medium">Priority:</span> <span className={`inline-block px-2 py-0.5 rounded-full text-white ${project.priority === 'high' ? 'bg-red-500' : project.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}>
                  {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                </span></p>
              </div>
              <div className="mt-4 flex justify-end gap-3 flex-wrap">
                <button
                  onClick={() => handleEdit(project)}
                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200 text-sm font-semibold"
                >
                  <MdEdit /> Edit
                </button>
                <button
                  onClick={() => handleDelete(project._id)}
                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-red-100 text-red-600 hover:bg-red-200 text-sm font-semibold"
                >
                  <MdDelete /> Delete
                </button>
                <button
                  onClick={() => handleOpen(project)}
                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-green-100 text-green-600 hover:bg-green-200 text-sm font-semibold"
                >
                  <MdOpenInBrowser /> Open
                </button>
                <button
                  onClick={() => {
                    setAssignForm({ ...assignForm, projectId: project._id });
                    setIsAssignModalOpen(true);
                  }}
                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-purple-100 text-purple-600 hover:bg-purple-200 text-sm font-semibold"
                >
                  <MdAdd /> Add User
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Project;
