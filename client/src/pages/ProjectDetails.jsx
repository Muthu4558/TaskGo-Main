// src/pages/ProjectDetails.jsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaEdit, FaTrashAlt } from 'react-icons/fa';
import { MdDragIndicator } from 'react-icons/md';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import UserList from '../components/task/UserList';
import { toast, Toaster } from 'sonner';
import { FaBell } from 'react-icons/fa';
import { ImSpinner2 } from 'react-icons/im';

const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
};

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [projectDetails, setProjectDetails] = useState([]);
    const [filteredStage, setFilteredStage] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [dueDateFilter, setDueDateFilter] = useState('');
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editTask, setEditTask] = useState(null);
    const [reminderLoading, setReminderLoading] = useState(null);

    // delete confirmation state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState({ id: '', title: '' });

    const BASE = import.meta.env.VITE_APP_BASE_URL || 'http://localhost:5000';

    const fetchProject = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${BASE}/api/projects/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                withCredentials: true,
            });
            setProject(res.data);
        } catch (err) {
            console.error('Failed to load project:', err);
            toast.error('Failed to load project');
        } finally {
            setLoading(false);
        }
    }, [BASE, id]);

    const fetchProjectDetails = useCallback(async () => {
        try {
            const res = await axios.get(`${BASE}/api/project-details/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                withCredentials: true,
            });
            setProjectDetails(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Failed to fetch project details:', err);
            toast.error('Failed to fetch project details');
        }
    }, [BASE, id]);

    useEffect(() => {
        fetchProject();
        fetchProjectDetails();
    }, [fetchProject, fetchProjectDetails]);

    const handleBack = () => navigate(-1);

    const handleClearFilters = () => {
        setFilteredStage('all');
        setSearchTerm('');
        setDueDateFilter('');
    };

    // open delete confirmation
    const handleDeleteConfirm = (task) => {
        setDeleteTarget({ id: task._id, title: task.taskTitle || '' });
        setIsDeleteModalOpen(true);
    };

    // actual delete after confirmation
    const handleConfirmDelete = async () => {
        if (!deleteTarget.id) return;
        setLoading(true);
        try {
            await axios.delete(`${BASE}/api/project-details/${deleteTarget.id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                withCredentials: true,
            });
            setProjectDetails((prev) => prev.filter((t) => t._id !== deleteTarget.id));
            toast.success('Task deleted successfully', {
                style: {
                    backgroundColor: "#4caf50",
                    color: "#fff",
                    fontSize: "16px",
                    padding: "10px"
                },
            });
            setIsDeleteModalOpen(false);
            setDeleteTarget({ id: '', title: '' });
        } catch (err) {
            console.error('Error deleting task:', err);
            toast.error('Failed to delete task');
        } finally {
            setLoading(false);
        }
    };

    const handleEditTask = (task) => {
        setEditTask({
            ...task,
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : '',
            team: task.team || [],
        });
        setEditModalOpen(true);
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditTask((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditSubmit = async () => {
        try {
            const payload = {
                taskTitle: editTask.taskTitle,
                dueDate: editTask.dueDate,
                priority: editTask.priority,
                stage: editTask.stage,
                team: editTask.team,
            };
            const res = await axios.put(`${BASE}/api/project-details/${editTask._1d ?? editTask._id}`, payload, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
                withCredentials: true,
            });

            const updated = res.data;
            setProjectDetails((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
            setEditModalOpen(false);
            setEditTask(null);
            toast.success('Task updated successfully', {
                style: {
                    backgroundColor: "#4caf50",
                    color: "#fff",
                    fontSize: "16px",
                    padding: "10px"
                },
            });
        } catch (err) {
            console.error('Error updating task:', err);
            toast.error('Failed to update task');
        }
    };

    const handleSendReminder = async (taskId) => {
        try {
            setReminderLoading(taskId); // start loading
            await axios.post(`${BASE}/api/project-details/${taskId}/reminder`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                withCredentials: true,
            });
            toast.success('Reminder sent successfully', {
                style: {
                    backgroundColor: "#4caf50",
                    color: "#fff",
                    fontSize: "16px",
                    padding: "10px"
                },
            });
        } catch (err) {
            console.error('Error sending reminder:', err);
            toast.error('Failed to send reminder');
        } finally {
            setReminderLoading(null); // stop loading
        }
    };

    // IMPORTANT: Include Content-Type and withCredentials; server must allow PATCH
    const handleStageChange = async (taskId, newStage) => {
        try {
            const res = await axios.patch(
                `${BASE}/api/project-details/${taskId}/status`,
                { stage: newStage },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true,
                }
            );
            setProjectDetails((prev) => prev.map((t) => (t._id === taskId ? res.data : t)));
            toast.success('Stage updated', {
                style: {
                    backgroundColor: "#4caf50",
                    color: "#fff",
                    fontSize: "16px",
                    padding: "10px"
                },
            });
        } catch (err) {
            console.error('Error updating stage:', err);
            toast.error('Failed to update stage');
        }
    };

    const filteredTasks = useMemo(() => {
        return projectDetails
            .filter((task) => (filteredStage === 'all' ? true : task.stage === filteredStage))
            .filter((task) => (searchTerm.trim() ? (task.taskTitle || '').toLowerCase().includes(searchTerm.toLowerCase()) : true))
            .filter((task) => {
                if (!dueDateFilter) return true;
                const taskDate = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '';
                return taskDate === dueDateFilter;
            });
    }, [projectDetails, filteredStage, searchTerm, dueDateFilter]);

    const dragEnabled = searchTerm.trim() === '' && filteredStage === 'all' && !dueDateFilter;

    const handleOnDragEnd = async (result) => {
        const { source, destination } = result;
        if (!destination) return;
        if (source.index === destination.index) return;

        const newList = reorder(projectDetails, source.index, destination.index);
        setProjectDetails(newList);

        try {
            const payload = newList.map((task, idx) => ({ _id: task._id, order: newList.length - idx }));
            await axios.put(`${BASE}/api/project-details/reorder`, { tasks: payload }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
                withCredentials: true,
            });
            toast.success('Order saved');
        } catch (err) {
            console.error('Reorder failed:', err);
            toast.error('Failed to save order — reverting');
            fetchProjectDetails();
        }
    };

    if (loading) return <p className="text-center mt-10 text-gray-500">Loading project details...</p>;
    if (!project) return <p className="text-center mt-10 text-red-500">Project not found.</p>;

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            <Toaster position="bottom-right" />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
                <div className="flex items-center gap-3">
                    <button onClick={handleBack} className="text-xl text-gray-600 p-2 rounded-full hover:bg-gray-200">
                        <FaArrowLeft />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">{project.title}</h1>
                        <p className="text-sm text-gray-600 mt-1">
                            <strong>Due Date:</strong> {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : '—'}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex flex-col">
                        <label className="text-sm font-medium">Status:</label>
                        <select value={filteredStage} onChange={(e) => setFilteredStage(e.target.value)} className="border rounded px-3 py-1">
                            <option value="all">All</option>
                            <option value="todo">To Do</option>
                            <option value="inprogress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm font-medium">Task:</label>
                        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="border rounded px-3 py-1" placeholder="Search by title..." />
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm font-medium">Due On:</label>
                        <input type="date" value={dueDateFilter} onChange={(e) => setDueDateFilter(e.target.value)} className="border rounded px-3 py-1" />
                    </div>

                    <div className="pt-5 sm:pt-0">
                        <button onClick={handleClearFilters} className="bg-[#229ea6] text-white rounded px-4 py-2">Clear Filters</button>
                    </div>
                </div>
            </div>

            <div className="mb-3 text-sm text-gray-500">
                {projectDetails.length} task(s)
                {!dragEnabled && <span className="ml-2 text-xs text-orange-600">(drag disabled while filtering/searching)</span>}
            </div>

            <div className="mt-4 border rounded-lg shadow-sm overflow-auto">
                <DragDropContext onDragEnd={handleOnDragEnd}>
                    <Droppable droppableId="project-tasks" isDropDisabled={!dragEnabled}>
                        {(provided) => (
                            <table className="w-full table-auto border-collapse">
                                <thead className="bg-[#229ea6] text-white backdrop-blur sticky top-0 z-10">
                                    <tr>
                                        <th className="text-left px-4 py-3 border-b">#</th>
                                        <th className="text-left px-4 py-3 border-b">Task</th>
                                        <th className="text-left px-4 py-3 border-b">Team</th>
                                        <th className="text-left px-4 py-3 border-b">Due Date</th>
                                        <th className="text-left px-4 py-3 border-b">Priority</th>
                                        <th className="text-left px-4 py-3 border-b">Status</th>
                                        <th className="text-left px-4 py-3 border-b">Actions</th>
                                    </tr>
                                </thead>

                                <tbody ref={provided.innerRef} {...provided.droppableProps}>
                                    {projectDetails.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center p-8 text-gray-500">No tasks yet</td>
                                        </tr>
                                    ) : (
                                        dragEnabled ? (
                                            projectDetails.map((task, index) => (
                                                <Draggable key={String(task._id)} draggableId={String(task._id)} index={index}>
                                                    {(prov, snap) => (
                                                        <tr
                                                            ref={prov.innerRef}
                                                            {...prov.draggableProps}
                                                            className={`bg-white ${snap.isDragging ? 'shadow-lg scale-105' : ''} hover:bg-gray-50`}
                                                            style={{ ...(prov.draggableProps.style || {}) }}
                                                        >
                                                            <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                                                                <div className="flex items-center gap-2">
                                                                    <span {...prov.dragHandleProps} className="cursor-grab text-gray-400 hover:text-gray-600" role="button" tabIndex={0} aria-label={`Drag ${task.taskTitle}`}>
                                                                        <MdDragIndicator size={20} />
                                                                    </span>
                                                                    <span className="text-sm font-medium text-gray-700">{index + 1}</span>
                                                                </div>
                                                            </td>

                                                            <td className="px-4 py-3 text-sm text-blue-700 max-w-[360px]">
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium break-words">{task.taskTitle}</span>
                                                                    {task.description && <small className="text-xs text-gray-400 truncate">{task.description}</small>}
                                                                </div>
                                                            </td>

                                                            <td className="px-4 py-3 text-sm text-gray-700 break-words">{(task.team || []).map(u => (u?.name || u)).join(', ')}</td>

                                                            <td className="px-4 py-3 text-sm text-gray-600">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}</td>

                                                            <td className="px-4 py-3 text-sm">
                                                                <span className={`inline-block px-2 py-1 rounded-full text-white text-xs ${task.priority === 'high' ? 'bg-red-600' : task.priority === 'medium' ? 'bg-yellow-500 text-black' : 'bg-green-600'}`}>
                                                                    {task.priority ? (task.priority.charAt(0).toUpperCase() + task.priority.slice(1)) : 'Medium'}
                                                                </span>
                                                            </td>

                                                            <td className="px-4 py-3 text-sm">
                                                                <select value={task.stage} onChange={(e) => handleStageChange(task._id, e.target.value)} className="border rounded px-2 py-1 text-sm">
                                                                    <option value="todo">To Do</option>
                                                                    <option value="inprogress">In Progress</option>
                                                                    <option value="completed">Completed</option>
                                                                </select>
                                                            </td>

                                                            <td className="px-4 py-3 text-sm whitespace-nowrap">
                                                                <div className="flex items-center gap-2">
                                                                    <button onClick={() => handleEditTask(task)} className="text-black px-2 py-1 rounded-md hover:bg-blue-100" title="Edit"><FaEdit /></button>
                                                                    <button onClick={() => handleDeleteConfirm(task)} className="text-red-600 px-2 py-1 rounded-md hover:bg-red-100" title="Delete"><FaTrashAlt /></button>
                                                                    <button
                                                                        onClick={() => handleSendReminder(task._id)}
                                                                        disabled={reminderLoading === task._id}
                                                                        className={`flex items-center gap-2 px-2 py-1 rounded-md 
      ${reminderLoading === task._id ? 'bg-purple-100 text-purple-400' : 'bg-purple-50 text-purple-600 hover:bg-purple-100'}`}
                                                                    >
                                                                        {reminderLoading === task._id ? (
                                                                            <ImSpinner2 className="animate-spin" />
                                                                        ) : (
                                                                            <FaBell />
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            </td>

                                                        </tr>
                                                    )}
                                                </Draggable>
                                            ))
                                        ) : (
                                            filteredTasks.map((task, idx) => {
                                                const originalIndex = projectDetails.findIndex((p) => String(p._id) === String(task._id));
                                                const displayIndex = originalIndex !== -1 ? originalIndex + 1 : idx + 1;
                                                return (
                                                    <tr key={String(task._id)} className="bg-white hover:bg-gray-50">
                                                        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-medium text-gray-700">{displayIndex}</span>
                                                            </div>
                                                        </td>

                                                        <td className="px-4 py-3 text-sm text-gray-700 max-w-[360px]"><div className="break-words">{task.taskTitle}</div></td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}</td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <span className={`inline-block px-2 py-1 rounded-full text-white text-xs ${task.priority === 'high' ? 'bg-red-600' : task.priority === 'medium' ? 'bg-yellow-500 text-black' : 'bg-green-600'}`}>
                                                                {task.priority}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <span className={`text-xs px-2 py-0.5 rounded-full inline-block ${task.stage === 'todo' ? 'bg-blue-500 text-white' : task.stage === 'inprogress' ? 'bg-yellow-500 text-black' : task.stage === 'completed' ? 'bg-green-600 text-white' : 'bg-gray-400 text-white'}`}>
                                                                {task.stage}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-700">{(task.team || []).map(u => (u?.name || u)).join(', ')}</td>
                                                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                                                            <div className="flex items-center gap-2">
                                                                <button onClick={() => handleEditTask(task)} className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md hover:bg-blue-100" title="Edit"><FaEdit /></button>
                                                                <button onClick={() => handleDeleteConfirm(task)} className="bg-red-50 text-red-600 px-2 py-1 rounded-md hover:bg-red-100" title="Delete"><FaTrashAlt /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )
                                    )}
                                    {provided.placeholder}
                                </tbody>
                            </table>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>

            {/* Delete confirmation modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-md w-full max-w-sm mx-4">
                        <h3 className="text-xl font-semibold mb-3">Are you sure?</h3>
                        <p className="text-sm text-gray-600 mb-4">This will permanently delete the task <strong>{deleteTarget.title}</strong>. This action cannot be undone.</p>

                        <div className="flex justify-end gap-2">
                            <button onClick={() => { setIsDeleteModalOpen(false); setDeleteTarget({ id: '', title: '' }); }} className="bg-gray-200 text-gray-800 px-4 py-2 rounded">Cancel</button>
                            <button onClick={handleConfirmDelete} disabled={loading} className={`bg-red-600 text-white px-4 py-2 rounded ${loading ? 'opacity-50' : ''}`}>{loading ? 'Deleting...' : 'Confirm'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit modal */}
            {editModalOpen && editTask && (
                <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-xl w-full max-w-lg">
                        <h3 className="text-xl font-semibold mb-4">Edit Task</h3>
                        <div className="space-y-3">
                            <input type="text" name="taskTitle" value={editTask.taskTitle} onChange={handleEditInputChange} className="w-full border p-2 rounded" placeholder="Task Title" />
                            <UserList setTeam={(team) => setEditTask({ ...editTask, team })} team={editTask.team || []} />
                            <input type="date" name="dueDate" value={editTask.dueDate ? editTask.dueDate.split('T')[0] : ''} onChange={handleEditInputChange} className="w-full border p-2 rounded" />
                            <select name="priority" value={editTask.priority} onChange={handleEditInputChange} className="w-full border p-2 rounded">
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                            <select name="stage" value={editTask.stage} onChange={handleEditInputChange} className="w-full border p-2 rounded">
                                <option value="todo">To Do</option>
                                <option value="inprogress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            <button onClick={() => setEditModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
                            <button onClick={handleEditSubmit} className="px-4 py-2 bg-[#229ea6] text-white rounded">Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectDetails;