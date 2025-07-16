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
import { DndContext, useDraggable } from '@dnd-kit/core';

// LocalStorage Key for positions
const POSITION_STORAGE_KEY = "project-card-positions";

// ---- CHILD: DRAGGABLE CARD ----
function DraggableCard({
  project,
  position = { x: 0, y: 0 },
  onEdit,
  onDelete,
  onOpen,
  setAssignForm,
  setIsAssignModalOpen,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({ id: project._id });

  const x = position.x + (transform?.x || 0);
  const y = position.y + (transform?.y || 0);

  const style = {
    transform: `translate3d(${x}px,${y}px,0)`,
    cursor: isDragging ? "grabbing" : "grab",
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    touchAction: "none",
    zIndex: isDragging ? 30 : 1,
    transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(.22,.68,0,1.71)',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white shadow-lg rounded-2xl p-6 border hover:shadow-xl transition-all duration-300 select-none"
      {...attributes}
    >
      {/* DRAG HANDLE: Only this area enables DnD */}
      <div
        {...listeners}
        className="mb-3 cursor-grab hover:cursor-grabbing select-none font-semibold text-lg text-gray-800"
        style={{ userSelect: 'none' }}
        title="Drag to move card"
      >
        <span role="img" aria-label="drag" style={{marginRight: 6}}>↕️</span>{project.title}
      </div>

      {/* Rest of the card content */}
      <div className="space-y-1 text-sm text-gray-600">
        <p>
          <span className="font-medium">Due:</span> {new Date(project.dueDate).toLocaleDateString()}
        </p>
        <p>
          <span className="font-medium">Priority:</span>
          <span className={`inline-block px-2 py-0.5 rounded-full text-white ${
            project.priority === 'high' ? 'bg-red-500' :
            project.priority === 'medium' ? 'bg-yellow-500' :
            'bg-green-500'}`}>
            {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
          </span>
        </p>
      </div>

      <div className="mt-4 flex justify-end gap-3 flex-wrap">
        <button
          onClick={() => onEdit(project)}
          className="flex items-center gap-1 px-2 py-1 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200 text-sm font-semibold"
          type="button"
        >
          <MdEdit />
        </button>
        <button
          onClick={() => onDelete(project._id)}
          className="flex items-center gap-1 px-2 py-1 rounded-md bg-red-100 text-red-600 hover:bg-red-200 text-sm font-semibold"
          type="button"
        >
          <MdDelete />
        </button>
        <button
          onClick={() => onOpen(project)}
          className="flex items-center gap-1 px-2 py-1 rounded-md bg-green-100 text-green-600 hover:bg-green-200 text-sm font-semibold"
          type="button"
        >
          <MdOpenInBrowser />
        </button>
        <button
          onClick={() => {
            setAssignForm({
              taskTitle: '',
              dueDate: '',
              priority: 'medium',
              stage: 'todo',
              team: [],
              projectId: project._id,
              projectTitle: project.title,
            });
            setIsAssignModalOpen(true);
          }}
          className="flex items-center gap-1 px-2 py-1 rounded-md bg-purple-100 text-purple-600 hover:bg-purple-200 text-sm font-semibold"
          type="button"
        >
          <MdAdd /> Assign User
        </button>
      </div>
    </div>
  );
}

// ---- MAIN PAGE ----
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
    projectTitle: '',
  });

  // DND position map, persisted to localStorage
  const [positionMap, setPositionMap] = useState({});

  // For accessibility/drag state (not required, but can be used for visual feedback/etc)
  const [activeId, setActiveId] = useState(null);

  const navigate = useNavigate();

  // ---- Utility: Load/save card positions to localStorage ----
  function savePositionsToStorage(pos) {
    try {
      window.localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(pos));
    } catch {}
  }
  function loadPositionsFromStorage() {
    try {
      const raw = window.localStorage.getItem(POSITION_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {}
    return {};
  }

  // On mount, load persistent positions
  useEffect(() => {
    setPositionMap(loadPositionsFromStorage());
  }, []);

  // Each time project list changes, reset positions for missing/deleted projects
  useEffect(() => {
    if (projects.length > 0) {
      setPositionMap(prev => {
        const filtered = {};
        projects.forEach(proj => {
          filtered[proj._id] = prev[proj._id] || { x: 0, y: 0 };
        });
        savePositionsToStorage(filtered);
        return filtered;
      });
    }
  }, [projects]);

  // ---- CRUD, assign, and open functions (no change) ----

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/api/projects`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        withCredentials: true,
      });
      setProjects(res.data);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      toast.error('Failed to load projects');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (isEditing) {
        await axios.put(`${import.meta.env.VITE_APP_BASE_URL}/api/projects/${formData._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
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
        await axios.post(`${import.meta.env.VITE_APP_BASE_URL}/api/projects`, formData, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
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
      setLoading(false);
    }
  };

  const handleEdit = (project) => {
    setFormData(project);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_APP_BASE_URL}/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        withCredentials: true,
      });
      toast.success('Project deleted successfully', {
        style: {
          backgroundColor: "#4caf50",
          color: "#fff",
          fontSize: "16px",
          padding: "10px",
        }
      });
      fetchProjects();
      setPositionMap(pos => {
        const newPos = { ...pos };
        delete newPos[id];
        savePositionsToStorage(newPos);
        return newPos;
      });
    } catch (err) {
      console.error('Failed to delete project:', err);
      toast.error('Failed to delete project', {
        style: {
          backgroundColor: "#4caf50",
          color: "#fff",
          fontSize: "16px",
          padding: "10px",
        }
      });
    }
  };

  const handleOpen = (project) => {
    navigate(`/projects/${project._id}`);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...assignForm, projectId: assignForm.projectId };
      await axios.post(`${import.meta.env.VITE_APP_BASE_URL}/api/project-details`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        withCredentials: true,
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // ---- DnD onDragEnd ----
  function handleDragEnd({ active, delta }) {
    setActiveId(null);
    setPositionMap(prev => {
      const newPos = {
        ...prev,
        [active.id]: {
          x: (prev[active.id]?.x || 0) + delta.x,
          y: (prev[active.id]?.y || 0) + delta.y
        }
      };
      savePositionsToStorage(newPos);
      return newPos;
    });
  }

  // ---- Render ----
  return (
    <div>
      <Toaster position="bottom-right" reverseOrder={false} />
      {/* Header */}
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
            <p className="mb-4 text-center">
              <span className="font-bold mt-2">Project:</span> {assignForm.projectTitle}
            </p>
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

      {/* Display Projects with DRAGGABLE CARDS */}
      <DndContext
        onDragStart={({ active }) => setActiveId(active.id)}
        onDragEnd={handleDragEnd}
      >
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
          {projects.length === 0 ? (
            <div className="text-2xl font-bold col-span-3 text-center text-gray-500">
              No projects available. Please create a new project.
            </div>
          ) : (
            projects.map((project) => (
              <div
                key={project._id}
                style={{ position: 'relative', minHeight: 250 }}
              >
                <DraggableCard
                  project={project}
                  position={positionMap[project._id] || { x: 0, y: 0 }}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onOpen={handleOpen}
                  setAssignForm={setAssignForm}
                  setIsAssignModalOpen={setIsAssignModalOpen}
                />
              </div>
            ))
          )}
        </div>
      </DndContext>
    </div>
  );
};

export default Project;