import React from "react";
import {
  MdDashboard,
  MdOutlinePendingActions,
  MdTaskAlt,
  MdOutlineAlarm,
  MdOutlineAssessment
} from "react-icons/md";
import { FaProjectDiagram, FaTasks, FaTrashAlt, FaUsers } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { setOpenSidebar } from "../redux/slices/authSlice";
import clsx from "clsx";
import Logo2 from "../assets/images/logo2.png";
import { HiViewBoards } from "react-icons/hi";

const adminLinks = [
  { label: "Dashboard", link: "dashboard", icon: <MdDashboard /> },
  { label: "Project", link: "project", icon: <FaProjectDiagram /> },
  { label: "Idea Board", link: "idea-board", icon: <HiViewBoards /> },
  { label: "Tasks", link: "tasks", icon: <FaTasks /> },
  { label: "Completed", link: "completed/completed", icon: <MdTaskAlt /> },
  { label: "In Progress", link: "in-progress/in progress", icon: <MdOutlinePendingActions /> },
  { label: "To Do", link: "todo/todo", icon: <MdOutlinePendingActions /> },
  { label: "Overdue", link: "overdue/overdue", icon: <MdOutlineAlarm /> },
  { label: "Daily Task", link: "dailyreport", icon: <MdOutlineAssessment /> },
  { label: "Team", link: "team", icon: <FaUsers /> },
  { label: "Trash", link: "trashed", icon: <FaTrashAlt /> },
];

const superAdminLinks = [
  { label: "Dashboard", link: "SuperAdminDashboard", icon: <MdDashboard /> },
];

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  const path = location.pathname.split("/")[1];

  let sidebarLinks = [];
  if (user?.isSuperAdmin) {
    sidebarLinks = superAdminLinks;
  } else if (user?.isAdmin) {
    sidebarLinks = adminLinks;
  } else {
    sidebarLinks = adminLinks.slice(0, 9);
  }

  const closeSidebar = () => dispatch(setOpenSidebar(false));

  const NavLink = ({ el }) => (
    <Link
      to={el.link}
      onClick={closeSidebar}
      className={clsx(
        "w-full lg:w-3/4 flex gap-2 px-3 py-2 rounded-full items-center text-gray-700 text-base hover:bg-[#229ea6]",
        path === el.link.split("/")[0] ? "bg-[#229ea6] text-neutral-100" : ""
      )}
    >
      {el.icon}
      <span className='hover:text-[#ffffff]'>{el.label}</span>
    </Link>
  );

  return (
    <div className='w-full h-full flex flex-col gap- p-5'>
      <img className="w-67 mt-1" src={Logo2} alt="Nizcare-Logo" />
      <div className='flex-1 flex flex-col gap-y-4 py-4'>
        {sidebarLinks.map((link) => (
          <NavLink el={link} key={link.label} />
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
