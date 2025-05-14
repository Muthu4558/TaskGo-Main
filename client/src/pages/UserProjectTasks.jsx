import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { FaArrowLeft } from 'react-icons/fa';

const UserProjectTasks = () => {
    const { userId } = useParams();
    const [details, setDetails] = useState([]);
    const [searchTitle, setSearchTitle] = useState('');
    const [filteredStage, setFilteredStage] = useState('all');
    const [dueDateFilter, setDueDateFilter] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserProjectDetails = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/api/project-details/user/${userId}`);
                setDetails(response.data);
            } catch (error) {
                console.error('Error fetching project details:', error);
            }
        };

        fetchUserProjectDetails();
    }, [userId]);

    const filteredTasks = details
        .filter(task => (filteredStage === 'all' ? true : task.stage === filteredStage))
        .filter(task => task.projectId?.title?.toLowerCase().includes(searchTitle.toLowerCase()))
        .filter(task => {
            if (!dueDateFilter) return true;
            const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
            return taskDate === dueDateFilter;
        });

    const handleDownloadExcel = () => {
        const data = filteredTasks.map(task => ({
            Project: task.projectId?.title || 'N/A',
            'Task Title': task.taskTitle,
            Stage: task.stage,
            'Due Date': new Date(task.dueDate).toLocaleDateString(),
        }));
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Tasks');
        XLSX.writeFile(workbook, 'user_tasks.xlsx');
    };

    return (
        <div className="p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-xl text-gray-600 p-2 rounded-full hover:bg-gray-200"
                    >
                        <FaArrowLeft />
                    </button>
                    <h2 className="text-2xl font-bold text-gray-800">User Assigned Tasks</h2>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Filter by Project:</label>
                        <input
                            type="text"
                            value={searchTitle}
                            onChange={(e) => setSearchTitle(e.target.value)}
                            placeholder="Search project title"
                            className="border border-gray-300 rounded-lg w-full px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Filter by Stage:</label>
                        <select
                            value={filteredStage}
                            onChange={(e) => setFilteredStage(e.target.value)}
                            className="border border-gray-300 rounded-lg w-full px-3 py-2"
                        >
                            <option value="all">All</option>
                            <option value="todo">To Do</option>
                            <option value="inprogress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Due On:</label>
                        <input
                            type="date"
                            value={dueDateFilter}
                            onChange={(e) => setDueDateFilter(e.target.value)}
                            className="border border-gray-300 rounded-lg w-full px-3 py-2"
                        />
                    </div>

                    <div className="flex flex-col gap-2 justify-end">
                        <button
                            onClick={() => {
                                setDueDateFilter('');
                                setFilteredStage('all');
                                setSearchTitle('');
                            }}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                        >
                            Clear Filters
                        </button>
                        <button
                            onClick={handleDownloadExcel}
                            className="px-4 py-2 bg-[#229ea6] text-white rounded-md hover:bg-[#1a7f84]"
                        >
                            Download Excel
                        </button>
                    </div>
                </div>
            </div>

            {/* Task Table */}
            {filteredTasks.length > 0 ? (
                <div className="overflow-x-auto bg-white p-4 rounded-lg shadow">
                    <table className="min-w-[600px] w-full table-auto">
                        <thead className="bg-gray-200 text-gray-700 text-left">
                            <tr>
                                <th className="py-2 px-4">Project Title</th>
                                <th className="py-2 px-4">Task Title</th>
                                <th className="py-2 px-4">Stage</th>
                                <th className="py-2 px-4">Due Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTasks.map((task) => (
                                <tr key={task._id} className="border-t hover:bg-gray-50">
                                    <td className="py-2 px-4">{task.projectId?.title || 'N/A'}</td>
                                    <td className="py-2 px-4">{task.taskTitle}</td>
                                    <td className="py-2 px-4">
                                        <span className={`text-white px-2 py-1 rounded text-sm ${
                                            task.stage === 'todo' ? 'bg-blue-500' :
                                            task.stage === 'inprogress' ? 'bg-yellow-500' :
                                            task.stage === 'completed' ? 'bg-green-600' : 'bg-gray-400'
                                        }`}>
                                            {task.stage.charAt(0).toUpperCase() + task.stage.slice(1)}
                                        </span>
                                    </td>
                                    <td className="py-2 px-4">{new Date(task.dueDate).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-center text-gray-500 text-lg">No tasks found for this user.</p>
            )}
        </div>
    );
};

export default UserProjectTasks;
