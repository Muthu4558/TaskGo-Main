import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { Toaster } from "react-hot-toast";
import { BsThreeDotsVertical } from "react-icons/bs";
import { BiEditAlt, BiUpload } from "react-icons/bi";
import { MdDelete } from "react-icons/md";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

const DailyReport = () => {
  const [content, setContent] = useState("");
  const [reports, setReports] = useState([]);
  const [error, setError] = useState("");
  const [editingReport, setEditingReport] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(null);
  const [filterDate, setFilterDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { user } = useSelector((state) => state.auth);

  const fetchReports = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_BASE_URL}/api/daily-reports/${user._id}`
      );
      const sortedReports = response.data.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setReports(sortedReports);
    } catch (error) {
      console.error("Error fetching reports:", error.response?.data || error.message);
      setError("Error fetching reports.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (content.trim()) {
      if (editingReport) {
        try {
          const updatedReport = { content, remark: editingReport.remark };
          await axios.put(
            `${import.meta.env.VITE_APP_BASE_URL}/api/daily-reports/${editingReport._id}`,
            updatedReport
          );
          setReports((prevReports) =>
            prevReports.map((report) =>
              report._id === editingReport._id ? { ...report, content } : report
            )
          );
          toast.success("Report successfully updated!", {
            style: {
              backgroundColor: "#4caf50",
              color: "#fff",
              fontSize: "16px",
              padding: "10px"
            },
          });
          setEditingReport(null);
          setContent("");
        } catch (error) {
          setError("Error updating report.");
          toast.error("Failed to update report.");
        }
      } else {
        try {
          const newReport = {
            content,
            status: "Todo",
            dateTime: new Date().toISOString(),
            userId: user._id,
            remark: "",
          };
          const { data: createdReport } = await axios.post(
            `${import.meta.env.VITE_APP_BASE_URL}/api/daily-reports`,
            newReport
          );

          const updatedReports = [createdReport, ...reports];

          const reordered = updatedReports.map((r, i) => ({
            id: r._id,
            order: i,
          }));

          setReports(updatedReports);

          await axios.post(`${import.meta.env.VITE_APP_BASE_URL}/api/daily-reports/reorder`, {
            reordered,
          });

          setContent("");
          toast.success("Report submitted successfully!", {
            style: {
              backgroundColor: "#4caf50",
              color: "#fff",
              fontSize: "16px",
              padding: "10px"
            },
          });
        } catch (error) {
          setError("Error submitting report.");
          toast.error("Failed to submit report.");
        }
      }
    }
  };

  const handleEdit = (report) => {
    setEditingReport(report);
    setContent(report.content);
    setDropdownVisible(null);
  };

  const handleCancelEdit = () => {
    setEditingReport(null);
    setContent("");
    toast.dismiss();
  };

  const handleStatusChange = async (id, status) => {
    try {
      await axios.put(`${import.meta.env.VITE_APP_BASE_URL}/api/daily-reports/${id}`, { status });
      setReports((prevReports) =>
        prevReports.map((report) => (report._id === id ? { ...report, status } : report))
      );
      toast.success("Status updated successfully!", {
        style: {
          backgroundColor: "#4caf50",
          color: "#fff",
          fontSize: "16px",
          padding: "10px"
        },
      });
    } catch (error) {
      setError("Error updating status.");
      toast.error("Failed to update status.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_APP_BASE_URL}/api/daily-reports/${id}`);
      const updatedReports = reports.filter((report) => report._id !== id);
      const reordered = updatedReports.map((r, i) => ({ id: r._id, order: i }));
      setReports(updatedReports);
      await axios.post(`${import.meta.env.VITE_APP_BASE_URL}/api/daily-reports/reorder`, {
        reordered,
      });
      toast.success("Report deleted successfully!", {
        style: {
          backgroundColor: "#4caf50",
          color: "#fff",
          fontSize: "16px",
          padding: "10px"
        },
      });
    } catch (error) {
      setError("Error deleting report.");
      toast.error("Failed to delete report.");
    }
  };

  const toggleDropdown = (id) => {
    setDropdownVisible((prev) => (prev === id ? null : id));
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const reorderedReports = Array.from(reports);
    const [movedItem] = reorderedReports.splice(result.source.index, 1);
    reorderedReports.splice(result.destination.index, 0, movedItem);

    const updatedOrder = reorderedReports.map((report, index) => ({
      id: report._id,
      order: index,
    }));

    setReports(reorderedReports);

    try {
      await axios.post(`${import.meta.env.VITE_APP_BASE_URL}/api/daily-reports/reorder`, {
        reordered: updatedOrder,
      });
      toast.success("Task order updated!", {
        style: {
          backgroundColor: "#4caf50",
          color: "#fff",
          fontSize: "16px",
          padding: "10px"
        },
      });
    } catch (error) {
      toast.error("Failed to reorder tasks");
    }
  };

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);

  return (
    <div className="p-4">
      <Toaster position="bottom-right" reverseOrder={false} />

      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-2xl font-bold mb-4">Daily Task</h1>

        <div className="flex flex-wrap gap-4 items-center mb-4">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 focus:ring-2 focus:ring-[#229ea6]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search report..."
            className="border border-gray-300 rounded px-3 py-1 focus:ring-2 focus:ring-[#229ea6]"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 focus:ring-2 focus:ring-[#229ea6]"
          >
            <option value="">All Statuses</option>
            <option value="Todo">Todo</option>
            <option value="In progress">In progress</option>
            <option value="Completed">Completed</option>
            <option value="Maintaining">Maintaining</option>
          </select>
          <button
            onClick={() => {
              setFilterDate("");
              setSearchQuery("");
              setStatusFilter("");
            }}
            className="px-4 py-1 bg-[#229ea6] text-white rounded"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="bg-white p-5 rounded shadow">
        {error && <p className="text-red-500">{error}</p>}

        <form onSubmit={handleSubmit} className="mb-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your daily report here..."
            className="border rounded w-full h-40 p-2 mb-4 bg-gray-100"
          />
          <div className="flex space-x-2">
            <button type="submit" className="bg-[#229ea6] text-white px-4 py-2 rounded">
              {editingReport ? "Update" : "Submit"}
            </button>
            {editingReport && (
              <button
                type="button"
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div>
          <h2 className="text-lg font-semibold mb-2">All Reports:</h2>
          {reports.length > 0 ? (
            <div className="overflow-x-auto shadow-md rounded-lg">
              <table className="min-w-full table-auto border-collapse text-sm bg-white">
                <thead>
                  <tr className="bg-[#f3f4f6] text-black">
                    <th className="border px-4 py-3">S.no</th>
                    <th className="border px-4 py-3">Report</th>
                    <th className="border px-4 py-3">Attachment</th>
                    <th className="border px-4 py-3">Date & Time</th>
                    <th className="border px-4 py-3">Status</th>
                    <th className="border px-4 py-3">Action</th>
                    <th className="border px-4 py-3">Remark (From Admin)</th>
                  </tr>
                </thead>
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="reportTable">
                    {(provided) => (
                      <tbody ref={provided.innerRef} {...provided.droppableProps}>
                        {reports
                          .filter((report) => {
                            const reportDate = new Date(report.createdAt || report.dateTime).toDateString();
                            const selectedDate = new Date(filterDate).toDateString();
                            const matchesDate = !filterDate || reportDate === selectedDate;
                            const matchesSearch = report.content
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase());
                            const matchesStatus =
                              !statusFilter || report.status?.toLowerCase() === statusFilter.toLowerCase();
                            return matchesDate && matchesSearch && matchesStatus;
                          })
                          .map((report, index) => (
                            <Draggable key={report._id} draggableId={report._id} index={index}>
                              {(provided) => (
                                <tr
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`hover:bg-gray-100 ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
                                >
                                  <td className="border px-4 py-3">{index + 1}</td>
                                  <td className="border px-4 py-3 break-words">{report.content}</td>
                                  <td className="border px-4 py-3">No Attachment</td>
                                  <td className="border px-4 py-3">
                                    {new Date(report.createdAt || report.dateTime).toLocaleString()}
                                  </td>
                                  <td className="border px-4 py-3">
                                    <select
                                      className="border rounded px-2 py-1"
                                      value={report.status || "Todo"}
                                      onChange={(e) => handleStatusChange(report._id, e.target.value)}
                                    >
                                      <option value="Completed">Completed</option>
                                      <option value="In progress">In progress</option>
                                      <option value="Todo">Todo</option>
                                      <option value="Maintaining">Maintaining</option>
                                    </select>
                                  </td>
                                  <td className="border px-4 py-3 relative">
                                    <button
                                      onClick={() => toggleDropdown(report._id)}
                                      className="text-gray-700 hover:text-gray-900"
                                    >
                                      <BsThreeDotsVertical size={20} />
                                    </button>
                                    {dropdownVisible === report._id && (
                                      <div className="absolute right-0 mt-2 bg-white border shadow-lg rounded-md z-10">
                                        <label
                                          htmlFor="file-upload"
                                          className="flex gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 cursor-pointer"
                                        >
                                          <BiUpload size={20} /> Upload
                                          <input
                                            id="file-upload"
                                            type="file"
                                            className="hidden"
                                            accept="image/*,application/pdf"
                                          />
                                        </label>
                                        <button
                                          onClick={() => handleEdit(report)}
                                          className="flex gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
                                        >
                                          <BiEditAlt size={20} /> Edit
                                        </button>
                                        <button
                                          onClick={() => handleDelete(report._id)}
                                          className="flex gap-2 items-center px-4 py-2 text-sm text-red-700 hover:bg-gray-200"
                                        >
                                          <MdDelete size={20} /> Delete
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                  <td className="border px-4 py-3 break-words">
                                    {report.remark || "No remark yet"}
                                  </td>
                                </tr>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </tbody>
                    )}
                  </Droppable>
                </DragDropContext>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-xl mt-4 font-bold">No task is updated.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyReport;