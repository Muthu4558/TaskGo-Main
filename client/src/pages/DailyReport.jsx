import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast, Toaster } from "sonner";
import { BsThreeDotsVertical } from "react-icons/bs";
import { BiEditAlt, BiUpload } from "react-icons/bi";
import { MdDelete, MdDragIndicator } from "react-icons/md";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Title from "../components/Title";

const DailyReportRow = ({ report, index, provided, snapshot, onEdit, onDelete, onStatusChange, toggleDropdown, dropdownVisible, onUpload }) => {
  return (
    <tr
      ref={provided?.innerRef}
      {...(provided ? provided.draggableProps : {})}
      className={`hover:bg-gray-50 ${snapshot && snapshot.isDragging ? "shadow-lg scale-105" : ""} ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
      style={{ ...(provided ? provided.draggableProps.style : {}) }}
    >
      <td className="border px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <span {...(provided ? provided.dragHandleProps : {})} className="cursor-grab text-gray-400 hover:text-gray-600" role="button" tabIndex={0} aria-label={`Drag report ${index + 1}`}>
            <MdDragIndicator size={18} />
          </span>
          <span className="text-sm font-medium">{index + 1}</span>
        </div>
      </td>

      <td className="border px-4 py-3 text-sm break-words max-w-[560px]">
        <div className="flex flex-col">
          <span className="truncate font-medium">{report.content}</span>
          {report.attachment && <small className="text-xs text-gray-400 truncate">{report.attachment}</small>}
        </div>
      </td>

      <td className="border px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{new Date(report.createdAt || report.dateTime).toLocaleString()}</td>

      <td className="border px-4 py-3 text-sm whitespace-nowrap">
        <select
          className="border rounded px-2 py-1 text-sm"
          value={report.status || "Todo"}
          onChange={(e) => onStatusChange(report._id, e.target.value)}
        >
          <option value="Completed">Completed</option>
          <option value="In progress">In progress</option>
          <option value="Todo">Todo</option>
          <option value="Maintaining">Maintaining</option>
        </select>
      </td>

      <td className="border px-4 py-3 text-sm relative">
        <button onClick={() => toggleDropdown(report._id)} className="text-gray-700 hover:text-gray-900">
          <BsThreeDotsVertical size={18} />
        </button>
        {dropdownVisible === report._id && (
          <div className="absolute right-2 mt-2 bg-white border shadow-lg rounded-md z-10 w-40">
            <label htmlFor={`file-upload-${report._id}`} className="flex gap-2 items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
              <BiUpload size={18} /> Upload
              <input id={`file-upload-${report._id}`} type="file" className="hidden" onChange={(e) => onUpload(report._id, e.target.files?.[0])} accept="image/*,application/pdf" />
            </label>
            <button onClick={() => { onEdit(report); }} className="flex gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
              <BiEditAlt size={18} /> Edit
            </button>
            <button onClick={() => onDelete(report._id)} className="flex gap-2 items-center px-4 py-2 text-sm text-red-700 hover:bg-gray-100 w-full text-left">
              <MdDelete size={18} /> Delete
            </button>
          </div>
        )}
      </td>

      <td className="border px-4 py-3 text-sm break-words max-w-[360px]">{report.remark || "No remark yet"}</td>
    </tr>
  );
};

const DailyReport = () => {
  const { user } = useSelector((state) => state.auth || {});
  const [content, setContent] = useState("");
  const [reports, setReports] = useState([]);
  const [error, setError] = useState("");
  const [editingReport, setEditingReport] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(null);
  const [filterDate, setFilterDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchReports = useCallback(async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/api/daily-reports/${user._id}`);
      const data = Array.isArray(res.data) ? res.data : [];
      data.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setReports(data);
    } catch (err) {
      console.error("Error fetching reports:", err.response?.data || err.message);
      setError("Error fetching reports.");
    }
  }, [user]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!content.trim()) return setError("Report content is required.");

    setLoading(true);
    try {
      if (editingReport) {
        await axios.put(`${import.meta.env.VITE_APP_BASE_URL}/api/daily-reports/${editingReport._id}`, { content, remark: editingReport.remark });
        setReports((prev) => prev.map((r) => (r._id === editingReport._id ? { ...r, content } : r)));
        toast.success("Report successfully updated!" , {
        style: {
          backgroundColor: "#4caf50",
          color: "#fff",
          fontSize: "16px",
          padding: "10px"
        },
      });
        setEditingReport(null);
        setContent("");
      } else {
        const newReport = { content, status: "Todo", dateTime: new Date().toISOString(), userId: user._id, remark: "" };
        const { data: created } = await axios.post(`${import.meta.env.VITE_APP_BASE_URL}/api/daily-reports`, newReport);
        // prepend to keep newest on top
        const updated = [created, ...reports];
        setReports(updated);
        // update order on server
        const reordered = updated.map((r, i) => ({ id: r._id, order: i }));
        await axios.post(`${import.meta.env.VITE_APP_BASE_URL}/api/daily-reports/reorder`, { reordered });
        setContent("");
        toast.success("Report submitted successfully!" , {
        style: {
          backgroundColor: "#4caf50",
          color: "#fff",
          fontSize: "16px",
          padding: "10px"
        },
      });
      }
    } catch (err) {
      console.error(err);
      setError("Failed to submit report.");
      toast.error("Failed to submit report.");
    } finally {
      setLoading(false);
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
    toast.dismiss && toast.dismiss();
  };

  const handleStatusChange = async (id, status) => {
    try {
      await axios.put(`${import.meta.env.VITE_APP_BASE_URL}/api/daily-reports/${id}`, { status });
      setReports((prev) => prev.map((r) => (r._id === id ? { ...r, status } : r)));
      toast.success("Status updated successfully!" , {
        style: {
          backgroundColor: "#4caf50",
          color: "#fff",
          fontSize: "16px",
          padding: "10px"
        },
      });
    } catch (err) {
      console.error(err);
      setError("Error updating status.");
      toast.error("Failed to update status.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_APP_BASE_URL}/api/daily-reports/${id}`);
      const updated = reports.filter((r) => r._id !== id);
      setReports(updated);
      const reordered = updated.map((r, i) => ({ id: r._id, order: i }));
      await axios.post(`${import.meta.env.VITE_APP_BASE_URL}/api/daily-reports/reorder`, { reordered });
      toast.success("Report deleted successfully!" , {
        style: {
          backgroundColor: "#4caf50",
          color: "#fff",
          fontSize: "16px",
          padding: "10px"
        },
      });
    } catch (err) {
      console.error(err);
      setError("Error deleting report.");
      toast.error("Failed to delete report.");
    }
  };

  const toggleDropdown = (id) => setDropdownVisible((prev) => (prev === id ? null : id));

  const onUpload = async (reportId, file) => {
    if (!file) return;
    toast.success("Attachment saved (placeholder)");
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const reordered = Array.from(reports);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setReports(reordered);

    try {
      const payload = reordered.map((r, i) => ({ id: r._id, order: i }));
      await axios.post(`${import.meta.env.VITE_APP_BASE_URL}/api/daily-reports/reorder`, { reordered: payload });
      toast.success("Task order updated!" , {
        style: {
          backgroundColor: "#4caf50",
          color: "#fff",
          fontSize: "16px",
          padding: "10px"
        },
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to reorder tasks");
      fetchReports();
    }
  };

  const filtered = useMemo(() => {
    return reports.filter((report) => {
      const reportDate = new Date(report.createdAt || report.dateTime).toDateString();
      const selectedDate = filterDate ? new Date(filterDate).toDateString() : null;
      const matchesDate = !filterDate || reportDate === selectedDate;
      const matchesSearch = report.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = !statusFilter || (report.status || '').toLowerCase() === statusFilter.toLowerCase();
      return matchesDate && matchesSearch && matchesStatus;
    });
  }, [reports, filterDate, searchQuery, statusFilter]);

  const dragEnabled = searchQuery.trim() === "" && statusFilter === "" && !filterDate;

  const renderClone = (provided, snapshot, rubric) => {
    const r = reports[rubric.source.index];
    return (
      <table className="w-full table-auto border-collapse">
        <tbody>
          <tr ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="bg-white shadow-lg">
            <td className="px-4 py-3"> </td>
            <td className="px-4 py-3 font-medium truncate">{r.content}</td>
            <td className="px-4 py-3">{new Date(r.createdAt || r.dateTime).toLocaleString()}</td>
            <td className="px-4 py-3">{r.status}</td>
            <td className="px-4 py-3"> </td>
            <td className="px-4 py-3"> </td>
          </tr>
        </tbody>
      </table>
    );
  };

  return (
    <div className="p-4">
      <Toaster position="bottom-right" />

      <div className="md:flex justify-between items-center flex-wrap gap-4">
        <Title title="Daily Task" />

        <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center">
  {/* Date filter */}
  <input
    type="date"
    value={filterDate}
    onChange={(e) => setFilterDate(e.target.value)}
    className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#229ea6] text-sm w-full sm:w-auto"
  />

  {/* Search */}
  <input
    type="text"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    placeholder="Search report..."
    className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#229ea6] text-sm w-full sm:w-auto"
  />

  {/* Status Filter */}
  <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#229ea6] text-sm w-full sm:w-auto"
  >
    <option value="">All Statuses</option>
    <option value="Todo">Todo</option>
    <option value="In progress">In progress</option>
    <option value="Completed">Completed</option>
    <option value="Maintaining">Maintaining</option>
  </select>

  {/* Clear Button */}
  <button
    onClick={() => {
      setFilterDate("");
      setSearchQuery("");
      setStatusFilter("");
    }}
    className="px-4 py-2 bg-[#229ea6] text-white rounded text-sm font-medium w-full sm:w-auto"
  >
    Clear
  </button>
</div>

      </div>

      <div className="bg-white p-5 rounded shadow mt-4">
        {error && <p className="text-red-500">{error}</p>}

        <form onSubmit={handleSubmit} className="mb-4">
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Enter your daily report here..." className="border rounded w-full h-40 p-2 mb-4 bg-gray-100" />
          <div className="flex space-x-2">
            <button type="submit" className="bg-[#229ea6] text-white px-4 py-2 rounded">{editingReport ? "Update" : "Submit"}</button>
            {editingReport && (<button type="button" className="bg-gray-500 text-white px-4 py-2 rounded" onClick={handleCancelEdit}>Cancel</button>)}
          </div>
        </form>

        <div>
          <h2 className="text-lg font-semibold mb-2">All Reports:</h2>

          {reports.length > 0 ? (
            <div className="overflow-x-auto shadow-md rounded-lg">
              <table className="min-w-full table-auto border-collapse text-sm bg-white">
                <thead>
                  <tr className="bg-[#f3f4f6] text-black sticky top-0">
                    <th className="border px-4 py-3">S.no</th>
                    <th className="border px-4 py-3">Report</th>
                    <th className="border px-4 py-3">Date & Time</th>
                    <th className="border px-4 py-3">Status</th>
                    <th className="border px-4 py-3">Action</th>
                    <th className="border px-4 py-3">Remark (From Admin)</th>
                  </tr>
                </thead>

                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="reportTable" direction="vertical" renderClone={renderClone} isDropDisabled={!dragEnabled}>
                    {(provided) => (
                      <tbody ref={provided.innerRef} {...provided.droppableProps}>
                        {dragEnabled ? (
                          reports.map((report, index) => (
                            <Draggable key={String(report._id)} draggableId={String(report._id)} index={index}>
                              {(prov, snap) => (
                                <DailyReportRow
                                  report={report}
                                  index={index}
                                  provided={prov}
                                  snapshot={snap}
                                  onEdit={handleEdit}
                                  onDelete={handleDelete}
                                  onStatusChange={handleStatusChange}
                                  toggleDropdown={toggleDropdown}
                                  dropdownVisible={dropdownVisible}
                                  onUpload={onUpload}
                                />
                              )}
                            </Draggable>
                          ))
                        ) : (
                          // show filtered static rows when drag disabled
                          filtered.map((report, idx) => {
                            const originalIndex = reports.findIndex((r) => String(r._id) === String(report._id));
                            return (
                              <tr key={String(report._id)} className={`${originalIndex % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-50`}>
                                <td className="border px-4 py-3">{originalIndex + 1}</td>
                                <td className="border px-4 py-3 break-words">{report.content}</td>
                                <td className="border px-4 py-3">{new Date(report.createdAt || report.dateTime).toLocaleString()}</td>
                                <td className="border px-4 py-3"><span className={`inline-block px-2 py-1 rounded-full text-xs ${report.status === 'high' ? 'bg-red-600 text-white' : report.status === 'medium' ? 'bg-yellow-400 text-black' : 'bg-green-600 text-white'}`}>{report.status}</span></td>
                                <td className="border px-4 py-3 relative">
                                  <div className="flex items-center gap-2">
                                    <button onClick={() => handleEdit(report)} className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md hover:bg-blue-100" title="Edit"><BiEditAlt size={18} /></button>
                                    <button onClick={() => handleDelete(report._id)} className="bg-red-50 text-red-600 px-2 py-1 rounded-md hover:bg-red-100" title="Delete"><MdDelete size={18} /></button>
                                  </div>
                                </td>
                                <td className="border px-4 py-3 break-words">{report.remark || "No remark yet"}</td>
                              </tr>
                            );
                          })
                        )}

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
