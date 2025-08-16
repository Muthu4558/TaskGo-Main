import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Title from '../components/Title';
import axios from 'axios';
import { IoMdAdd } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import UserList from '../components/task/UserList';
import { toast, Toaster } from 'sonner';
import { BsEyeFill } from 'react-icons/bs';
import { MdAdd, MdDelete, MdEdit, MdOpenInBrowser, MdDragIndicator } from 'react-icons/md';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const ProjectTableRow = ({ project, index, provided, snapshot, onEdit, onDeleteConfirm, onOpen, setAssignForm, setIsAssignModalOpen }) => {
  return (
    <tr
      ref={provided?.innerRef}
      {...(provided ? provided.draggableProps : {})}
      className={`bg-white ${snapshot && snapshot.isDragging ? 'shadow-lg scale-105' : ''} hover:bg-gray-50`}
      style={{ ...(provided ? provided.draggableProps.style : {}) }}
    >
      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <span {...(provided ? provided.dragHandleProps : {})} className="cursor-grab text-gray-400 hover:text-gray-600" role="button" tabIndex={0} aria-label={`Drag ${project.title}`}>
            <MdDragIndicator size={20} />
          </span>
          <span className="text-sm font-medium text-gray-700">{index + 1}</span>
        </div>
      </td>

      <td className="px-4 py-3 text-sm text-gray-700 max-w-[360px]">
        <div className="flex flex-col">
          <span className="font-medium truncate">{project.title}</span>
          {project.assets && <small className="text-xs text-gray-400 truncate">{project.assets}</small>}
        </div>
      </td>

      <td className="px-4 py-3 text-sm text-gray-600">{project.dueDate ? new Date(project.dueDate).toLocaleDateString() : '—'}</td>

      <td className="px-4 py-3 text-sm">
        <span className={`inline-block px-2 py-1 rounded-full text-white text-xs ${project.priority === 'high' ? 'bg-red-600' : project.priority === 'medium' ? 'bg-yellow-500 text-black' : 'bg-green-600'}`}>
          {project.priority ? project.priority.charAt(0).toUpperCase() + project.priority.slice(1) : 'Medium'}
        </span>
      </td>

      <td className="px-4 py-3 text-sm whitespace-nowrap">
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(project)} className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md hover:bg-blue-100" title="Edit"><MdEdit /></button>
          <button onClick={() => onDeleteConfirm(project)} className="bg-red-50 text-red-600 px-2 py-1 rounded-md hover:bg-red-100" title="Delete"><MdDelete /></button>
          <button onClick={() => onOpen(project)} className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md hover:bg-emerald-100" title="Open"><MdOpenInBrowser /></button>
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
            className="bg-purple-50 text-purple-600 px-2 py-1 rounded-md hover:bg-purple-100"
            title="Assign"
          >
            <MdAdd />
          </button>
        </div>
      </td>
    </tr>
  );
};

const Project = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [formData, setFormData] = useState({ _id: '', title: '', dueDate: '', priority: 'medium', assets: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [assignForm, setAssignForm] = useState({ taskTitle: '', dueDate: '', priority: 'medium', stage: 'todo', team: [], projectId: '', projectTitle: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // delete confirmation state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ id: '', title: '' });

  const navigate = useNavigate();

  const fetchProjects = useCallback(async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/api/projects`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        withCredentials: true,
      });
      const data = Array.isArray(res.data) ? res.data : [];
      data.sort((a, b) => (b.order || 0) - (a.order || 0));
      setProjects(data);
    } catch (err) {
      console.error('Fetch projects error:', err);
      toast.error('Failed to load projects');
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const handleOnDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.index === destination.index) return;

    const newList = reorder(projects, source.index, destination.index);
    setProjects(newList);

    try {
      const payload = newList.map((proj, idx) => ({ _id: proj._id, order: newList.length - idx }));
      await axios.put(`${import.meta.env.VITE_APP_BASE_URL}/api/projects/reorder`, { projects: payload }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      toast.success('Order saved', {
        style: {
          backgroundColor: "#4caf50",
          color: "#fff",
          fontSize: "16px",
          padding: "10px"
        },
      });
    } catch (err) {
      console.error('Reorder failed:', err);
      toast.error('Failed to save order — reverting');
      fetchProjects();
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
            padding: "10px"
          },
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
            padding: "10px"
          },
        });
      }
      setIsModalOpen(false);
      setIsEditing(false);
      setFormData({ _id: '', title: '', dueDate: '', priority: 'medium', assets: '' });
      fetchProjects();
    } catch (err) {
      console.error('Error submitting project:', err);
      toast.error('Failed to submit project');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (project) => {
    setFormData(project);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  // open delete confirmation modal
  const handleDeleteConfirm = (project) => {
    setDeleteTarget({ id: project._id, title: project.title || '' });
    setIsDeleteModalOpen(true);
  };

  // actual delete after confirmation
  const handleConfirmDelete = async () => {
    if (!deleteTarget.id) return;
    setLoading(true);
    try {
      await axios.delete(`${import.meta.env.VITE_APP_BASE_URL}/api/projects/${deleteTarget.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        withCredentials: true,
      });
      toast.success('Project deleted successfully', {
        style: {
          backgroundColor: "#F44336",
          color: "#fff",
          fontSize: "16px",
          padding: "10px"
        },
      });
      setIsDeleteModalOpen(false);
      setDeleteTarget({ id: '', title: '' });
      fetchProjects();
    } catch (err) {
      console.error('Failed to delete project:', err);
      toast.error('Failed to delete project');
    } finally {
      setLoading(false);
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
          padding: "10px"
        },
      });
      setIsAssignModalOpen(false);
      setAssignForm({ taskTitle: '', dueDate: '', priority: 'medium', stage: 'todo', team: [], projectId: '' });
    } catch (err) {
      console.error('Failed to assign task:', err);
      toast.error('Failed to assign user to project');
    } finally {
      setLoading(false);
    }
  };

  // when filters/search are active we show filtered list but disable drag to avoid complexity
  const filteredProjects = useMemo(() => {
    let list = projects;
    if (priorityFilter !== 'all') {
      list = list.filter((p) => p.priority === priorityFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((p) => (p.title || '').toLowerCase().includes(q) || (p.assets || '').toLowerCase().includes(q));
    }
    return list;
  }, [projects, searchQuery, priorityFilter]);

  const dragEnabled = searchQuery.trim() === '' && priorityFilter === 'all';

  // Render clone for smooth dragging preview
  const renderClone = (provided, snapshot, rubric) => {
    const proj = projects[rubric.source.index];
    return (
      <table className="w-full table-auto border-collapse bg-transparent">
        <tbody>
          <tr
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="bg-white shadow-lg"
            style={{ ...provided.draggableProps.style }}
          >
            <td className="px-4 py-3"> </td>
            <td className="px-4 py-3 font-medium">{proj.title}</td>
            <td className="px-4 py-3">{proj.dueDate ? new Date(proj.dueDate).toLocaleDateString() : '—'}</td>
            <td className="px-4 py-3">
              <span className={`inline-block px-2 py-1 rounded-full text-white text-xs ${proj.priority === 'high' ? 'bg-red-500' : proj.priority === 'medium' ? 'bg-yellow-500 text-black' : 'bg-green-500'}`}>{proj.priority}</span>
            </td>
            <td className="px-4 py-3"> </td>
          </tr>
        </tbody>
      </table>
    );
  };

  return (
    <div>
      <Toaster position="bottom-right" />

      <div className="md:flex justify-between items-center gap-4">
        <Title title="Projects" className="mb-4" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 flex-wrap">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search title or assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 border rounded-md w-full sm:w-64 text-sm"
            />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm w-full sm:w-auto"
            >
              <option value="all">All priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                setIsModalOpen(true);
                setIsEditing(false);
                setFormData({ _id: '', title: '', dueDate: '', priority: 'medium', assets: '' });
              }}
              className="bg-[#229ea6] text-white p-3 rounded-md text-sm font-semibold flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <IoMdAdd className="text-lg" /> Create New Project
            </button>

            <button
              onClick={() => navigate('/userproject')}
              className="bg-[#229ea6] text-white p-3 rounded-md text-sm font-semibold flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <BsEyeFill /> Assigned Tasks
            </button>
          </div>
        </div>

      </div>

      <div className="mt-4 text-sm text-gray-500">{projects.length} project(s){(!dragEnabled) && <span className="ml-2 text-xs text-orange-600">(drag disabled while filtering/searching)</span>}</div>

      {/* Modals (unchanged) */}
      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-md w-full max-w-md mx-4">
            <h2 className="text-2xl font-semibold mb-4">{isEditing ? 'Edit Project' : 'Create New Project'}</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Project Title"
                className="w-full p-2 mb-3 border border-gray-300 rounded-md"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block font-bold mb-1">Due Date</label>
                  <input
                    type="date"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={formData.dueDate ? formData.dueDate.split('T')[0] : formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Priority</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => { setIsModalOpen(false); setIsEditing(false); }}>
                  Cancel
                </button>
                <button type="submit" disabled={loading} className={`bg-[#229ea6] text-white px-4 py-2 rounded ${loading ? 'opacity-50' : ''}`}>
                  {loading ? 'Submitting...' : isEditing ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAssignModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-md w-full max-w-lg mx-4">
            <h2 className="text-2xl font-semibold mb-4">Assign Task In Project</h2>
            <p className="mb-3"><strong>Project:</strong> {assignForm.projectTitle}</p>
            <form onSubmit={handleAssignSubmit}>
              <label className="block font-bold mb-1">Task Title</label>
              <input type="text" className="w-full p-2 mb-3 border border-gray-300 rounded-md" placeholder="Task Title" value={assignForm.taskTitle} onChange={(e) => setAssignForm({ ...assignForm, taskTitle: e.target.value })} required />

              <UserList setTeam={(team) => setAssignForm({ ...assignForm, team })} team={assignForm.team} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Due Date</label>
                  <input type="date" className="w-full p-2 border border-gray-300 rounded-md" value={assignForm.dueDate} onChange={(e) => setAssignForm({ ...assignForm, dueDate: e.target.value })} required />
                </div>
                <div>
                  <label className="block font-bold mb-1">Priority</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md" value={assignForm.priority} onChange={(e) => setAssignForm({ ...assignForm, priority: e.target.value })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <label className="block font-bold mt-3 mb-1">Stage</label>
              <select className="w-full p-2 border border-gray-300 rounded-md" value={assignForm.stage} onChange={(e) => setAssignForm({ ...assignForm, stage: e.target.value })} required>
                <option value="">Select Stage</option>
                <option value="todo">To Do</option>
                <option value="in progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>

              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => setIsAssignModalOpen(false)}>Cancel</button>
                <button type="submit" disabled={loading} className={`bg-[#229ea6] text-white px-4 py-2 rounded ${loading ? 'opacity-50' : ''}`}>{loading ? 'Loading...' : 'Assign'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-md w-full max-w-sm mx-4">
            <h3 className="text-xl font-semibold mb-3">Are you sure?</h3>
            <p className="text-sm text-gray-600 mb-4">This will permanently delete the project <strong>{deleteTarget.title}</strong>. This action cannot be undone.</p>

            <div className="flex justify-end gap-2">
              <button onClick={() => { setIsDeleteModalOpen(false); setDeleteTarget({ id: '', title: '' }); }} className="bg-gray-200 text-gray-800 px-4 py-2 rounded">Cancel</button>
              <button onClick={handleConfirmDelete} disabled={loading} className={`bg-red-600 text-white px-4 py-2 rounded ${loading ? 'opacity-50' : ''}`}>{loading ? 'Deleting...' : 'Confirm'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 border rounded-lg shadow-sm overflow-auto">
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="projects-table" direction="vertical" renderClone={renderClone} isDropDisabled={!dragEnabled}>
            {(provided, snapshot) => (
              <table className="w-full table-auto border-collapse">
                <thead className="bg-white/90 backdrop-blur sticky top-0 z-10">
                  <tr>
                    <th className="text-left px-4 py-3 border-b">#</th>
                    <th className="text-left px-4 py-3 border-b">Title</th>
                    <th className="text-left px-4 py-3 border-b">Due Date</th>
                    <th className="text-left px-4 py-3 border-b">Priority</th>
                    <th className="text-left px-4 py-3 border-b">Actions</th>
                  </tr>
                </thead>

                <tbody ref={provided.innerRef} {...provided.droppableProps}>
                  {filteredProjects.length > 0 ? (dragEnabled ? (
                    projects.map((project, index) => (
                      <Draggable key={String(project._id)} draggableId={String(project._id)} index={index}>
                        {(prov, snap) => (
                          <ProjectTableRow
                            project={project}
                            index={index}
                            provided={prov}
                            snapshot={snap}
                            onEdit={handleEdit}
                            onDeleteConfirm={handleDeleteConfirm}
                            onOpen={handleOpen}
                            setAssignForm={setAssignForm}
                            setIsAssignModalOpen={setIsAssignModalOpen}
                          />
                        )}
                      </Draggable>
                    ))
                  ) : (
                    // drag disabled -> show filtered projects as static rows (preserve numbering based on original index)
                    filteredProjects.map((project, idx) => {
                      const originalIndex = projects.findIndex((p) => String(p._id) === String(project._1d));
                      // fallback if not found
                      const displayIndex = originalIndex !== -1 ? originalIndex + 1 : idx + 1;
                      return (
                        <tr key={String(project._id)} className="bg-white hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-700">{displayIndex}</span>
                            </div>
                          </td>

                          <td className="px-4 py-3 text-sm text-gray-700 max-w-[360px]"><div className="truncate">{project.title}</div></td>
                          <td className="px-4 py-3 text-sm text-gray-600">{project.dueDate ? new Date(project.dueDate).toLocaleDateString() : '—'}</td>
                          <td className="px-4 py-3 text-sm"><span className={`inline-block px-2 py-1 rounded-full text-white text-xs ${project.priority === 'high' ? 'bg-red-600' : project.priority === 'medium' ? 'bg-yellow-500 text-black' : 'bg-green-600'}`}>{project.priority}</span></td>
                          <td className="px-4 py-3 text-sm whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleEdit(project)} className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md hover:bg-blue-100" title="Edit"><MdEdit /></button>
                              <button onClick={() => handleDeleteConfirm(project)} className="bg-red-50 text-red-600 px-2 py-1 rounded-md hover:bg-red-100" title="Delete"><MdDelete /></button>
                              <button onClick={() => handleOpen(project)} className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md hover:bg-emerald-100" title="Open"><MdOpenInBrowser /></button>
                              <button onClick={() => { setAssignForm({ taskTitle: '', dueDate: '', priority: 'medium', stage: 'todo', team: [], projectId: project._id, projectTitle: project.title }); setIsAssignModalOpen(true); }} className="bg-purple-50 text-purple-600 px-2 py-1 rounded-md hover:bg-purple-100" title="Assign"><MdAdd /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )) : (
                    <tr>
                      <td colSpan={5} className="text-center p-8 text-gray-500">No projects yet</td>
                    </tr>
                  )}

                  {provided.placeholder}
                </tbody>
              </table>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
};

export default Project;