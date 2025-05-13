import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaEdit, FaTrashAlt } from 'react-icons/fa';
import UserList from '../components/task/UserList';
import { toast } from "sonner";

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

    const fetchProjectDetails = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/api/project-details/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setProjectDetails(res.data);
        } catch (err) {
            console.error('Failed to fetch project details:', err);
            toast.error('Failed to fetch project details');
        }
    };

    const fetchProject = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/api/projects/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setProject(res.data);
        } catch (err) {
            console.error('Failed to load project:', err);
            toast.error('Failed to load project');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProject();
        fetchProjectDetails();
    }, [id]);

    const handleBack = () => navigate(-1);

    const handleClearFilters = () => {
        setFilteredStage('all');
        setSearchTerm('');
        setDueDateFilter('');
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await axios.delete(`${import.meta.env.VITE_APP_BASE_URL}/api/project-details/${taskId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setProjectDetails(projectDetails.filter(task => task._id !== taskId));
            toast.success('Task deleted successfully', {
                style: {
                    backgroundColor: "#4caf50",
                    color: "#fff",
                    fontSize: "16px",
                    padding: "10px",
                }
            });
        } catch (err) {
            console.error('Error deleting task:', err);
            toast.error('Failed to delete task');
        }
    };

    const handleEditTask = (task) => {
        setEditTask(task);
        setEditModalOpen(true);
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditTask({ ...editTask, [name]: value });
    };

    const handleEditSubmit = async () => {
        try {
            const res = await axios.put(`${import.meta.env.VITE_APP_BASE_URL}/api/project-details/${editTask._id}`, editTask, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });

            const updatedTasks = projectDetails.map(task =>
                task._id === editTask._id ? res.data : task
            );
            setProjectDetails(updatedTasks);
            setEditModalOpen(false);
            setEditTask(null);
            toast.success('Task updated successfully', {
                style: {
                    backgroundColor: "#4caf50",
                    color: "#fff",
                    fontSize: "16px",
                    padding: "10px",
                }
            });
        } catch (err) {
            console.error('Error updating task:', err);
            toast.error('Failed to update task');
        }
    };

    const filteredTasks = projectDetails
        .filter(task => (filteredStage === 'all' ? true : task.stage === filteredStage))
        .filter(task => task.taskTitle.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter(task => {
            if (!dueDateFilter) return true;
            const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
            return taskDate === dueDateFilter;
        });

    if (loading) return <p className="text-center mt-10 text-gray-500">Loading project details...</p>;
    if (!project) return <p className="text-center mt-10 text-red-500">Project not found.</p>;

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
                <div className="flex items-center gap-3">
                    <button onClick={handleBack} className="text-xl text-gray-600 p-2 rounded-full hover:bg-gray-200">
                        <FaArrowLeft />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">{project.title}</h1>
                        <p className="text-sm text-gray-600 mt-1">
                            <strong>Due Date:</strong> {new Date(project.dueDate).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex flex-col">
                        <label className="text-sm font-medium">Filter by Stage:</label>
                        <select value={filteredStage} onChange={(e) => setFilteredStage(e.target.value)} className="border rounded px-3 py-1">
                            <option value="all">All</option>
                            <option value="todo">To Do</option>
                            <option value="inprogress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm font-medium">Search Task:</label>
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

            <h2 className="text-xl font-semibold mb-4 text-gray-700">Assigned Tasks</h2>
            {filteredTasks.length === 0 ? (
                <p className="text-center text-gray-500 font-bold text-lg">No tasks found with selected filters.</p>
            ) : (
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTasks.map(task => (
                        <li key={task._id} className="bg-white p-5 border rounded-xl shadow-md hover:shadow-lg transition">
                            <h4 className="text-lg font-bold mb-1 text-gray-800">{task.taskTitle}</h4>
                            <p className="text-sm text-gray-600 mb-1"><strong>Due:</strong> {new Date(task.dueDate).toLocaleDateString()}</p>
                            <p className="text-sm mb-1">
                                <strong>Priority:</strong>{' '}
                                <span className={`text-xs px-2 py-0.5 rounded text-white ${task.priority === 'high' ? 'bg-red-500' :
                                        task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}>
                                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                </span>
                            </p>
                            <p className="text-sm mb-1">
                                <strong>Stage:</strong>{' '}
                                <span className={`text-xs px-2 py-0.5 rounded-full text-white ${task.stage === 'todo' ? 'bg-blue-500' :
                                        task.stage === 'inprogress' ? 'bg-yellow-500' :
                                            task.stage === 'completed' ? 'bg-green-600' : 'bg-gray-400'
                                    }`}>
                                    {task.stage.charAt(0).toUpperCase() + task.stage.slice(1)}
                                </span>
                            </p>
                            <p className="text-sm text-gray-700"><strong>Team:</strong> {task.team.map(user => user.name).join(', ')}</p>
                            <div className="flex justify-end gap-2 mt-4">
                                <button onClick={() => handleEditTask(task)} className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-800 text-white rounded-md">
                                    <FaEdit /> Edit
                                </button>
                                <button onClick={() => handleDeleteTask(task._id)} className="flex items-center gap-1 px-2 py-1 bg-red-600 hover:bg-red-800 text-white rounded-md">
                                    <FaTrashAlt /> Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {editModalOpen && editTask && (
                <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-xl w-full max-w-lg">
                        <h3 className="text-xl font-semibold mb-4">Edit Task</h3>
                        <div className="space-y-3">
                            <input type="text" name="taskTitle" value={editTask.taskTitle} onChange={handleEditInputChange} className="w-full border p-2 rounded" placeholder="Task Title" />
                            <UserList setTeam={(team) => setEditTask({ ...editTask, team })} team={editTask.team} />
                            <input type="date" name="dueDate" value={editTask.dueDate.split('T')[0]} onChange={handleEditInputChange} className="w-full border p-2 rounded" />
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