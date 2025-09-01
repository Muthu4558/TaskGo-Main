import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import { toast } from "sonner";
import { Toaster } from "react-hot-toast";

const UserDashboard = () => {
    const [assignedDetails, setAssignedDetails] = useState([]);
    const [editingStatus, setEditingStatus] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAssigned = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/api/project-details/user/assigned/all`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                    withCredentials: true,
                });
                setAssignedDetails(res.data);
            } catch (err) {
                console.error('Failed to load your assigned tasks:', err);
            }
        };
        fetchAssigned();
    }, []);

    const handleBack = () => {
        navigate(-1);
    };

    const handleClearFilters = () => {
        setSearchTerm('');
    };

    const handleStatusChange = async (taskId) => {
        try {
            await axios.patch(
                `${import.meta.env.VITE_APP_BASE_URL}/api/project-details/${taskId}/status`,
                { stage: newStatus },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                    withCredentials: true,
                }
            );

            setAssignedDetails((prev) =>
                prev.map((task) =>
                    task._id === taskId ? { ...task, stage: newStatus } : task
                )
            );

            setEditingStatus(null);
            toast.success('Task status updated successfully!', {
                style: {
                    backgroundColor: "#4caf50",
                    color: "#fff",
                    fontSize: "16px",
                    padding: "10px",
                }
            });
        } catch (error) {
            console.error('Failed to update task status:', error);
        }
    };

    const tasksByProject = assignedDetails.reduce((acc, detail) => {
        const proj = detail.projectId;
        if (!proj) return acc;
        if (!acc[proj._id]) acc[proj._id] = { project: proj, tasks: [] };
        acc[proj._id].tasks.push(detail);
        return acc;
    }, {});

    const filteredProjects = Object.values(tasksByProject).filter(({ project }) =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 sm:p-6">
            <Toaster position="bottom-right" reverseOrder={false} />
            <div className='flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4'>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleBack}
                        className="text-xl text-gray-600 p-2 rounded-full hover:bg-gray-200"
                    >
                        <FaArrowLeft />
                    </button>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Task Assigned in Projects</h1>
                </div>

                <div className='flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto'>
                    <input
                        type="text"
                        placeholder="Search by project title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#229ea6] bg-white text-gray-800 w-full sm:w-64"
                    />
                    <button
                        onClick={handleClearFilters}
                        className="px-4 py-2 bg-[#229ea6] text-white rounded-md w-full sm:w-auto"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            {filteredProjects.length === 0 ? (
                <p className="text-gray-600 text-lg sm:text-2xl font-bold text-center">No matching projects found.</p>
            ) : (
                filteredProjects.map(({ project, tasks }) => (
                    <div key={project._id} className="mb-10 bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-md">
                        <h2 className="text-xl sm:text-2xl font-bold text-[#229ea6] mb-1">{project.title}</h2>
                        <p className="text-sm text-gray-500 mb-5">
                            Due: {new Date(project.dueDate).toLocaleDateString()} • Priority:{' '}
                            <span className={`font-medium ${project.priority === 'high'
                                ? 'text-red-500'
                                : project.priority === 'medium'
                                    ? 'text-yellow-600'
                                    : 'text-green-600'
                                }`}
                            >
                                {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                            </span>
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {tasks.map((task) => (
                                <div key={task._id} className="border border-gray-200 rounded-xl p-4 bg-gradient-to-br from-gray-50 to-white hover:shadow-lg transition">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-base sm:text-lg font-semibold text-gray-800">{task.taskTitle}</h3>
                                        <span
                                            className={`text-xs px-2 py-0.5 rounded-full text-white ${task.priority === 'high'
                                                ? 'bg-red-500'
                                                : task.priority === 'medium'
                                                    ? 'bg-yellow-500'
                                                    : 'bg-green-500'
                                                }`}
                                        >
                                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-600 mb-1">
                                        Due: {new Date(task.dueDate).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm text-gray-600 mb-3">
                                        Stage:{" "}
                                        <span className={`font-medium text-xs px-2 py-0.5 rounded-full text-white
                                            ${task.stage === 'todo' ? 'bg-blue-500'
                                                : task.stage === 'in progress' ? 'bg-yellow-500'
                                                    : task.stage === 'completed' ? 'bg-green-600'
                                                        : 'bg-gray-400'
                                            }`}
                                        >
                                            {task.stage.charAt(0).toUpperCase() + task.stage.slice(1)}
                                        </span>
                                    </p>

                                    {editingStatus === task._id ? (
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                            <select
                                                value={newStatus}
                                                onChange={(e) => setNewStatus(e.target.value)}
                                                className="text-sm border rounded px-2 py-1 w-full sm:w-auto"
                                            >
                                                <option value="">Select Status</option>
                                                <option value="todo">Todo</option>
                                                <option value="in progress">In Progress</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                            <div className='flex gap-2'>
                                                <button
                                                    onClick={() => handleStatusChange(task._id)}
                                                    className="text-sm bg-[#229ea6] text-white px-3 py-1 rounded"
                                                >
                                                    Update
                                                </button>
                                                <button
                                                    onClick={() => setEditingStatus(null)}
                                                    className="text-sm text-gray-500 hover:text-gray-700"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setEditingStatus(task._id);
                                                setNewStatus(task.stage);
                                            }}
                                            className="mt-2 bg-[#229ea6] text-white text-sm px-3 py-1 rounded-md"
                                        >
                                            Change Status
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default UserDashboard;