// Table.jsx
import React, { useEffect, useMemo, useState, Suspense } from "react";
import { toast } from "sonner";
import { BGS, TASK_TYPE, formatDate } from "../../utils";
import clsx from "clsx";
import UserInfo from "../UserInfo";
import ConfirmatioDialog from "../Dialogs";
import { useTrashTaskMutation } from "../../redux/slices/api/taskApiSlice";
import TaskDialog from "./TaskDialog";
import { MdCheckBoxOutlineBlank, MdAccessTime, MdCheckCircle, MdDownload } from "react-icons/md";
import { useSelector } from "react-redux";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { FaBell } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";

// Dynamically import XLSX
const XLSX = React.lazy(() => import("xlsx"));

const ICONS1 = {
  todo: <MdCheckBoxOutlineBlank />,
  "in progress": <MdAccessTime />,
  completed: <MdCheckCircle />,
};

const Table = ({ tasks = [], showFiltersAndActions = true }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selected, setSelected] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [taskStage, setTaskStage] = useState("");
  const [reminderLoading, setReminderLoading] = useState(null);

  const [trashtask] = useTrashTaskMutation();
  const { user } = useSelector((state) => state.auth);

  // --- Local ordering state: sort by order asc, then _id desc
  const sortedFromProps = useMemo(() => {
    const clone = [...tasks];
    clone.sort((a, b) => {
      const ao = typeof a.order === "number" ? a.order : 0;
      const bo = typeof b.order === "number" ? b.order : 0;
      if (ao !== bo) return ao - bo;
      // fallback stable-ish
      return String(b._id).localeCompare(String(a._id));
    });
    return clone;
  }, [tasks]);

  const [taskList, setTaskList] = useState(sortedFromProps);

  // keep in sync when parent gives fresh tasks (e.g., after refresh)
  useEffect(() => {
    setTaskList(sortedFromProps);
  }, [sortedFromProps]);

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
  };
  const clearFilters1 = () => setTaskStage("");

  const filteredTasks = useMemo(() => {
    return taskList.filter((task) => {
      const taskDate = new Date(task?.createdAt);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      if (start && taskDate < start) return false;
      if (end && taskDate > end) return false;
      if (taskStage && task.stage !== taskStage) return false;
      return true;
    });
  }, [taskList, startDate, endDate, taskStage]);

  const downloadExcel = async () => {
    try {
      const excelData = filteredTasks.map((task, index) => ({
        "S.No": index + 1,
        "Task Title": task?.title || "No title",
        "Assigned Date": formatDate(new Date(task?.createdAt)),
        "Due Date": formatDate(new Date(task?.date)),
        Team: task?.team?.map((member) => member.name).join(", "),
        Status: task?.stage,
      }));

      const { utils, writeFile } = await import("xlsx");
      const worksheet = utils.json_to_sheet(excelData);
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, "Tasks");
      writeFile(workbook, "task_list.xlsx");
    } catch (error) {
      console.error("Failed to generate Excel file:", error);
    }
  };

  const deleteHandler = async () => {
    try {
      const result = await trashtask({ id: selected, isTrash: "trash" }).unwrap();
      toast.success(result?.message || "Task moved to trash successfully!");
      setOpenDialog(false);
    } catch (error) {
      console.error(error);
      toast.error("Error occurred while deleting the task.");
    }
  };

  const handleSendReminder = async (taskId) => {
    try {
      setReminderLoading(taskId);
      const resp = await fetch(`${import.meta.env.VITE_APP_BASE_URL}/api/task/${taskId}/reminder`, {
        method: "POST",
        credentials: "include",
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.message || "Failed to send reminder");

      toast.success("Reminder sent successfully");
    } catch (err) {
      console.error("Reminder error:", err);
      toast.error("Failed to send reminder");
    } finally {
      setReminderLoading(null);
    }
  };


  const TableHeader = () => (
    <thead className="bg-[#229ea6] text-white">
      <tr>
        <th className="px-2 py-3 text-left w-8"></th>
        <th className="px-2 py-3 text-left w-8">#</th>
        <th className="px-4 py-3 text-left">Task Title</th>
        <th className="px-4 py-3 text-left">Assigned Date</th>
        <th className="px-4 py-3 text-left">Due Date</th>
        <th className="px-4 py-3 text-left">Team</th>
        <th className="px-4 py-3 text-left">Status</th>
        <th className="px-4 py-3 text-right">Actions</th>
        {/* <th className="px-4 py-3 text-right">Reminder</th> */}
      </tr>
    </thead>
  );

  const TableRow = ({ task, index }) => (
    <Draggable draggableId={String(task._id)} index={index}>
      {(provided) => (
        <tr
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="border-b border-gray-200 text-gray-600 hover:bg-gray-300/10"
        >

          {/* Drag handle cell */}
          <td className="py-2 px-2 cursor-grab select-none" {...provided.dragHandleProps} title="Drag to reorder">
            ⋮⋮
          </td>

          {/* Serial number */}
          <td className="py-2 px-2 text-sm text-gray-800">{index + 1}</td>

          <td className="py-2">
            <div className="flex items-center gap-2">
              <div className={clsx("w-4 h-4 rounded-full", TASK_TYPE[task.stage] || "bg-gray-400")} />
              <p className="line-clamp-2 text-base text-black">{task?.title || "No title"}</p>
            </div>
          </td>
          <td className="py-2 text-sm text-gray-600">{formatDate(new Date(task?.createdAt))}</td>
          <td className="py-2 text-sm text-gray-600">{formatDate(new Date(task?.date))}</td>
          <td className="py-2">
            <div className="flex">
              {task?.team?.map((member, idx) => (
                <div
                  key={member._id || idx}
                  className={clsx(
                    "w-7 h-7 rounded-full text-white flex items-center justify-center text-sm",
                    BGS[idx % BGS.length]
                  )}
                >
                  <UserInfo user={member} />
                </div>
              ))}
            </div>
          </td>
          <td className="py-2">
            <div className="flex gap-2 items-center">
              <div
                className={clsx(
                  "w-7 h-7 flex items-center justify-center rounded-full",
                  task.stage === "todo"
                    ? "bg-blue-600"
                    : task.stage === "in progress"
                      ? "bg-yellow-600"
                      : task.stage === "completed"
                        ? "bg-green-600"
                        : "bg-gray-400"
                )}
              >
                <div className="text-white">{ICONS1[task.stage] || ICONS1["todo"]}</div>
              </div>
              <div>
                <span className="text-sm text-gray-600 capitalize">{task.stage}</span>
              </div>
            </div>
          </td>
          <td className="py-2 flex gap-2 justify-end">
            {user && <TaskDialog task={task} />}
            <button
              onClick={() => handleSendReminder(task._id)}
              disabled={reminderLoading === task._id}
              className={`flex items-center justify-end px-2 py-1 rounded-md 
      ${reminderLoading === task._id
                  ? "bg-purple-100 text-purple-400"
                  : "bg-purple-50 text-purple-600 hover:bg-purple-100"}`}
              title={reminderLoading === task._id ? "Sending..." : "Send Reminder"}
            >
              {reminderLoading === task._id ? (
                <ImSpinner2 className="animate-spin" />
              ) : (
                <FaBell />
              )}
            </button>
          </td>

        </tr>
      )}
    </Draggable>
  );

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const sourceItem = filteredTasks[result.source.index];
    const destItem = filteredTasks[result.destination.index];

    const sourceIndexInFull = taskList.findIndex(t => String(t._id) === String(sourceItem._id));
    const destIndexInFull = taskList.findIndex(t => String(t._id) === String(destItem._id));

    const newList = Array.from(taskList);
    const [removed] = newList.splice(sourceIndexInFull, 1);

    const insertIndex = destIndexInFull + (result.destination.index > result.source.index ? 1 : 0);
    newList.splice(insertIndex, 0, removed);

    const withOrder = newList.map((t, idx) => ({ ...t, order: idx }));

    setTaskList(withOrder);

    try {
      const payload = withOrder.map((t) => ({ id: t._id, order: t.order }));

      // 👇 Use your env variable
      const resp = await fetch(
        `${import.meta.env.VITE_APP_BASE_URL}/api/task/reorder`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ tasks: payload }),
        }
      );

      if (!resp.ok) throw new Error("Failed to save order");

      toast.success("Order updated", {
        style: {
          backgroundColor: "#4caf50",
          color: "#fff",
          fontSize: "16px",
          padding: "10px",
        },
      });
    } catch (err) {
      console.error("Failed to reorder tasks:", err);
      toast.error("Could not save new order");
    }
  };


  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="bg-white px-2 md:px-4 pt-4 pb-9 shadow-md rounded">
        {showFiltersAndActions && (
          <div className="flex justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-center mb-4">
              <div>
                <label htmlFor="startDate" className="block text-sm text-gray-600">Start Date:</label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1"
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm text-gray-600">End Date:</label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1"
                />
              </div>
              <button
                onClick={clearFilters}
                className="bg-[#229ea6] text-white font-semibold px-4 py-1 mt-5 rounded"
              >
                Clear
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-1">
              <div>
                <label htmlFor="taskStage" className="block text-sm text-gray-600">Status Filter:</label>
                <select
                  id="taskStage"
                  value={taskStage}
                  onChange={(e) => setTaskStage(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1"
                >
                  <option value="">All</option>
                  <option value="todo">To-Do</option>
                  <option value="in progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <button
                  onClick={clearFilters1}
                  className="bg-[#229ea6] text-white font-semibold px-4 py-1 mt-5 rounded"
                >
                  Clear
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mt-5">
                <button
                  onClick={downloadExcel}
                  className="bg-[#229ea6] text-white font-semibold px-4 py-1 rounded flex items-center gap-2"
                >
                  <MdDownload />
                  Download
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Task Table with DnD */}
        <div className="overflow-x-auto">
          {filteredTasks.length > 0 ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="taskTable">
                {(provided) => (
                  <table
                    className="w-full border-collapse"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <TableHeader />
                    <tbody>
                      {filteredTasks.map((task, index) => (
                        <TableRow key={task._id} task={task} index={index} />
                      ))}
                      {provided.placeholder}
                    </tbody>
                  </table>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <div className="text-center py-4 text-gray-500">No tasks found</div>
          )}
        </div>
      </div>

      <ConfirmatioDialog open={openDialog} setOpen={setOpenDialog} onClick={deleteHandler} />
    </Suspense>
  );
};

export default Table;