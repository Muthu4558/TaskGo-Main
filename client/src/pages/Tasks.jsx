// Tasks.jsx
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Loading from "../components/Loader";
import Title from "../components/Title";
import Button from "../components/Button";
import { IoMdAdd } from "react-icons/io";
import AddTask from "../components/task/AddTask";
import { useGetAllTaskQuery } from "../redux/slices/api/taskApiSlice";
import Table from "../components/task/Table";

const TASK_TYPE = {
  todo: "bg-blue-600",
  "in progress": "bg-yellow-600",
  completed: "bg-green-600",
};

const Tasks = () => {
  const params = useParams();
  const status = params?.status || "";

  const [open, setOpen] = useState(false);
  const [filterDate, setFilterDate] = useState("");
  const [filterDueDate, setFilterDueDate] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading } = useGetAllTaskQuery({
    strQuery: status === "overdue" ? "overdue" : status,
    isTrashed: "",
    search: "",
  });

  const processedTasks =
    data?.tasks.map((task) => {
      const isOverdue = task.date && new Date(task.date) < new Date();
      return {
        ...task,
        isOverdue,
        dynamicClass:
          isOverdue && task.stage !== "completed"
            ? "bg-red-600"
            : TASK_TYPE[task.stage],
      };
    }) || [];

  // Apply search
  const searchedTasks = processedTasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Apply filters
  const filteredTasks = searchedTasks.filter((task) => {
    const matchCreatedDate = filterDate
      ? new Date(task.createdAt).toDateString() ===
      new Date(filterDate).toDateString()
      : true;
    const matchDueDate = filterDueDate
      ? task.date &&
      new Date(task.date).toDateString() ===
      new Date(filterDueDate).toDateString()
      : true;
    const matchPriority = filterPriority
      ? task.priority?.toLowerCase() === filterPriority.toLowerCase()
      : true;
    return matchCreatedDate && matchDueDate && matchPriority;
  });

  if (isLoading) {
    return (
      <div className="py-10">
        <Loading />
      </div>
    );
  }

  // ✅ Overdue Page - Table Only
  if (status === "overdue") {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <Title title="Overdue Tasks" />
        </div>
        <Table
          tasks={processedTasks.filter((t) => t.isOverdue)}
          showFiltersAndActions={false}
        />
        <AddTask open={open} setOpen={setOpen} />
      </div>
    );
  }

  // 🔁 Normal Task Page - Table with Filters & Actions
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
        <Title title={status ? `${status} Tasks` : "Tasks"} />
        <div className="flex flex-wrap items-end gap-4">
          {!status && (
            <>
              {/* Search */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">Search</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search task title..."
                  className="w-56 border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#229ea6] focus:border-[#229ea6] transition bg-white text-gray-800 text-base shadow-sm"
                />
              </div>

              {/* Created Date */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">Created Date</label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-44 border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#229ea6] focus:border-[#229ea6] transition bg-white text-gray-800 text-base shadow-sm"
                />
              </div>

              {/* Due Date */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">Due Date</label>
                <input
                  type="date"
                  value={filterDueDate}
                  onChange={(e) => setFilterDueDate(e.target.value)}
                  className="w-44 border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#229ea6] focus:border-[#229ea6] transition bg-white text-gray-800 text-base shadow-sm"
                />
              </div>

              {/* Priority */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">Priority</label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="w-36 border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#229ea6] focus:border-[#229ea6] transition bg-white text-gray-800 text-base shadow-sm"
                >
                  <option value="">All</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setFilterDate("");
                  setFilterDueDate("");
                  setFilterPriority("");
                  setSearchQuery("");
                }}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-200 text-gray-700 rounded-xl shadow-sm transition font-medium"
              >
                Clear
              </button>
            </>
          )}

          {/* Create Task */}
          {!status && (
            <Button
              onClick={() => setOpen(true)}
              label="Create Task"
              icon={<IoMdAdd className="text-lg" />}
              className="flex flex-row-reverse gap-1 items-center bg-[#229ea6] text-white rounded-md py-2"
            />
          )}
        </div>
      </div>

      {/* ✅ Always Table View */}
      <Table tasks={filteredTasks} showFiltersAndActions={false} />

      <AddTask open={open} setOpen={setOpen} />
    </div>
  );
};

export default Tasks;