import React, { useState } from "react";
import AddUser from "../components/AddUser";
import Button from "../components/Button";
import ModalWrapper from "../components/ModalWrapper";
import { useSelector } from "react-redux";
import ConfirmatioDialog from "../components/Dialogs";
import {
  useCreateAdminMutation,
  useGetAdminQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetTeamListQuery,
} from "../redux/slices/api/userApiSlice";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { IoMdAdd } from "react-icons/io";
import { BiEditAlt } from "react-icons/bi";
import { FaEye } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { MdBusiness } from "react-icons/md";
import { FaUserShield } from "react-icons/fa";

const ViewUsersModal = ({ open, setOpen, admin, users }) => {
  if (!admin) return null;
  const filteredUsers = users?.filter(
    (u) => !u.isAdmin && u.tenantId === admin.tenantId
  );

  return (
    <ModalWrapper open={open} setOpen={setOpen}>
      <div className="p-4 border-none">
        <h2 className="text-lg font-bold mb-4">
          Users created by <span className="text-[#229ea6]">{admin.name}</span>
        </h2>
        <div className="max-h-64 overflow-y-auto p-2 rounded">
          {filteredUsers && filteredUsers.length > 0 ? (
            <ul className="space-y-2">
              {filteredUsers.map((user) => (
                <li key={user._id} className="border p-2 rounded">
                  <p>
                    <strong className="text-[#229ea6]">Name:</strong> {user.name}
                  </p>
                  <p>
                    <strong className="text-[#229ea6]">Email:</strong> {user.email}
                  </p>
                  <p>
                    <strong className="text-[#229ea6]">Role:</strong> {user.role}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No users found for this admin.</p>
          )}
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            label="Close"
            onClick={() => setOpen(false)}
            className="bg-[#229ea6] text-white px-4 py-2 rounded"
          />
        </div>
      </div>
    </ModalWrapper>
  );
};

const SuperAdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [selectedAdminForUsers, setSelectedAdminForUsers] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);

  const [createAdmin] = useCreateAdminMutation();
  const [updateAdmin] = useUpdateUserMutation();
  const [deleteAdmin] = useDeleteUserMutation();

  const { data: admins, refetch, isLoading: isFetching } = useGetAdminQuery();
  const { data: users } = useGetTeamListQuery();

  const totalCompanies = new Set(admins?.map((admin) => admin.companyName)).size;
  const totalAdmins = admins?.length || 0;

  const handleOnSubmitAdmin = async (data) => {
    try {
      if (selectedAdmin) {
        const updatedData = {
          ...data,
          _id: selectedAdmin._id,
          tenantId: selectedAdmin.tenantId,
        };
        await updateAdmin(updatedData).unwrap();
        toast.success("Admin updated successfully!", {
          style: {
            backgroundColor: "#4caf50",
            color: "#fff",
            fontSize: "16px",
            padding: "10px"
          },
        });
      } else {
        const tenantId = uuidv4();
        await createAdmin({
          name: data.name,
          role: data.role,
          email: data.email,
          password: 12345,
          isAdmin: true,
          userLimit: Number(data.userLimit),
          companyName: data.companyName,
          tenantId,
        }).unwrap();
        toast.success("Admin created successfully!", {
          style: {
            backgroundColor: "#4caf50",
            color: "#fff",
            fontSize: "16px",
            padding: "10px"
          },
        });
      }
      setOpen(false);
      setSelectedAdmin(null);
      refetch();
      window.location.reload();
    } catch (error) {
      console.error("Error in admin submit:", error);
      toast.error(error?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (admin) => {
    setSelectedAdmin(admin);
    setOpen(true);
  };

  const handleDelete = async () => {
    if (!adminToDelete) return;

    try {
      const result = await deleteAdmin(adminToDelete._id);

      if (result.error) {
        throw new Error(result.error.data?.message || "Failed to delete admin");
      }

      toast.success("Admin deleted successfully!", {
        style: {
          backgroundColor: "#4caf50",
          color: "#fff",
          fontSize: "16px",
          padding: "10px"
        },
      });

      setAdminToDelete(null);
      setOpenDialog(false);
      refetch();
      window.location.reload();
    } catch (error) {
      console.error("Error deleting admin:", error);
      toast.error(error?.message || "Failed to delete admin");
      setAdminToDelete(null);
      setOpenDialog(false);
    }
  };

  const deleteClick = (admin) => {
    if (!user?.isSuperAdmin) {
      toast.error("Only super admins can delete admins", {
        style: {
          backgroundColor: "#f44336",
          color: "#fff",
          fontSize: "16px",
          padding: "10px",
        },
      });
      return;
    }
    setAdminToDelete(admin);
    setOpenDialog(true);
  };

  const handleViewUsers = (admin) => {
    setSelectedAdminForUsers(admin);
    setShowUsersModal(true);
  };

  return (
    <>
      <div className="p-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold mb-4">Super Admin Dashboard</h1>
        {user?.isSuperAdmin && (
          <Button
            label="Add Admin"
            icon={<IoMdAdd className="text-lg" />}
            className="flex flex-row-reverse gap-1 items-center bg-[#229ea6] text-white rounded-md 2xl:py-2.5"
            onClick={() => {
              setSelectedAdmin(null);
              setOpen(true);
            }}
          />
        )}
      </div>

      <AddUser
        open={open}
        setOpen={(val) => {
          setOpen(val);
          if (!val) setSelectedAdmin(null);
        }}
        onSubmit={handleOnSubmitAdmin}
        isAdminOnly={true}
        userData={selectedAdmin}
      />

      <ConfirmatioDialog
        open={openDialog}
        setOpen={setOpenDialog}
        msg={`Are you sure you want to delete ${adminToDelete?.name || ''}?`}
        onClick={handleDelete}
        type="delete"
      />

      {showUsersModal && (
        <ViewUsersModal
          open={showUsersModal}
          setOpen={setShowUsersModal}
          admin={selectedAdminForUsers}
          users={users}
        />
      )}

      <div className="bg-white p-5">
        <h2 className="text-xl font-semibold mb-4">
          Comapany & Admin Status
        </h2>

        <div className="flex justify-around m-8">
          <div className="bg-white shadow-md rounded-lg p-6 w-60 text-center">

            <h2 className="text-xl font-semibold text-gray-700 mb-2">Total Companies</h2>
            <div className="flex justify-around">
              <MdBusiness className="text-4xl text-blue-600" />
              <p className="text-3xl font-bold text-blue-600">{totalCompanies}</p>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6 w-60 text-center">

            <h2 className="text-xl font-semibold text-gray-700 mb-2">Total Admins</h2>
            <div className="flex justify-around">
              <FaUserShield className="text-4xl text-green-600" />
              <p className="text-3xl font-bold text-green-600">{totalAdmins}</p>
            </div>
          </div>
        </div>

        {isFetching ? (
          <p>Loading admins...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#229ea6] text-white">
                  <th className="border border-gray-300 px-4 py-2">Name</th>
                  <th className="border border-gray-300 px-4 py-2">Company Name</th>
                  <th className="border border-gray-300 px-4 py-2">Email</th>
                  <th className="border border-gray-300 px-4 py-2">User Limit</th>
                  <th className="border border-gray-300 px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins?.length > 0 ? (
                  admins
                    .filter((admin) => admin._id !== "67b03acd1829681ccea1c774")
                    .map((admin) => (
                      <tr key={admin._id} className="text-center">
                        <td className="border border-gray-300 px-4 py-2">
                          {admin.name}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">{admin.companyName}</td>
                        <td className="border border-gray-300 px-4 py-2">
                          {admin.email}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {admin.userLimit}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 space-x-2">
                          <button
                            className="text-blue-500 px-2 py-1 rounded"
                            onClick={() => handleEdit(admin)}
                          >
                            <BiEditAlt size={20} />
                          </button>
                          <button
                            className="text-green-500 px-2 py-1 rounded"
                            onClick={() => handleViewUsers(admin)}
                          >
                            <FaEye size={20} />
                          </button>
                          <button
                            className="text-red-500 px-2 py-1 rounded"
                            onClick={() => deleteClick(admin)}
                          >
                            <MdDelete size={20} />
                          </button>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan="5" className="border border-gray-300 px-4 py-2 text-center">
                      No admins found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default SuperAdminDashboard;