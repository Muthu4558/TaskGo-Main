import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Loading from "../components/Loader";
import Title from "../components/Title";
import Button from "../components/Button";
import { IoMdAdd } from "react-icons/io";
import Tabs from "../components/Tabs";
import TaskTitle from "../components/TaskTitle";
import BoardView from "../components/BoardView";
import AddTask from "../components/task/AddTask";
import { useGetAllTaskQuery } from "../redux/slices/api/taskApiSlice";

const TABS = [];

const TASK_TYPE = {
  todo: "bg-blue-600",
  "in progress": "bg-yellow-600",
  completed: "bg-green-600",
};

const Tasks = () => {
  const params = useParams();

  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);
  const [filterDate, setFilterDate] = useState("");
  const [filterDueDate, setFilterDueDate] = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  const status = params?.status || "";

  const { data, isLoading } = useGetAllTaskQuery({
    strQuery: status === "overdue" ? "overdue" : status,
    isTrashed: "",
    search: "",
  });

  const processedTasks = data?.tasks.map((task) => {
    const isOverdue = task.date && new Date(task.date) < new Date();
    return {
      ...task,
      isOverdue,
      dynamicClass:
        isOverdue && task.stage !== "completed"
          ? "bg-red-600"
          : TASK_TYPE[task.stage],
    };
  });

  const filteredTasks = processedTasks?.filter((task) => {
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

  return isLoading ? (
    <div className="py-10">
      <Loading />
    </div>
  ) : (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
        <Title title={status ? `${status} Tasks` : "Tasks"} />

        <div className="flex items-center gap-4 flex-wrap">
          {!status && (
            <>
              {/* Created Date Filter */}
              <div className="flex flex-col">
                <label>Created Date:</label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-1 focus:outline-none focus:ring-2 focus:ring-[#229ea6] focus:border-[#229ea6] transition-all duration-300 bg-white text-gray-800 text-lg"
                />
              </div>

              {/* Due Date Filter */}
              <div className="flex flex-col">
                <label>Due Date:</label>
                <input
                  type="date"
                  value={filterDueDate}
                  onChange={(e) => setFilterDueDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-1 focus:outline-none focus:ring-2 focus:ring-[#229ea6] focus:border-[#229ea6] transition-all duration-300 bg-white text-gray-800 text-lg"
                />
              </div>

              {/* Priority Filter */}
              <div className="flex flex-col">
                <label>Priority:</label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-1 focus:outline-none focus:ring-2 focus:ring-[#229ea6] focus:border-[#229ea6] transition-all duration-300 bg-white text-gray-800 text-lg"
                >
                  <option value="">All</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setFilterDate("");
                  setFilterDueDate("");
                  setFilterPriority("");
                }}
                className="px-4 py-2 bg-[#229ea6] text-white rounded-md"
              >
                Clear
              </button>
            </>
          )}

          {!status && (
            <Button
              onClick={() => setOpen(true)}
              label="Create Task"
              icon={<IoMdAdd className="text-lg" />}
              className="flex flex-row-reverse gap-1 items-center bg-[#229ea6] text-white rounded-md py-2 2xl:py-2.5"
            />
          )}
        </div>
      </div>

      <Tabs tabs={TABS} setSelected={setSelected}>
        {!status && (
          <div className="w-full flex justify-between gap-4 md:gap-x-12 py-4">
            <TaskTitle label="To Do" className={TASK_TYPE.todo} />
            <TaskTitle
              label="In Progress"
              className={TASK_TYPE["in progress"]}
            />
            <TaskTitle label="Completed" className={TASK_TYPE.completed} />
          </div>
        )}
        {Array.isArray(filteredTasks) && filteredTasks.length === 0 ? (
          <div className="text-center text-gray-500 py-10 text-2xl font-bold">
            No tasks available in {status || "this category"}.
          </div>
        ) : (
          <BoardView tasks={filteredTasks} />
        )}
      </Tabs>

      <AddTask open={open} setOpen={setOpen} />
    </div>
  );
};

export default Tasks;