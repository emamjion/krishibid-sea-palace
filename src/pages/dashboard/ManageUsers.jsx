import axios from "axios";
import { Eye, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 6;

const ManageUsers = () => {
  const token = localStorage.getItem("token");

  const [users, setUsers] = useState([]);
  const [viewUser, setViewUser] = useState(null);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Fetch Users
  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_API_URL}/admin/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setUsers(res.data.users);
    } catch {
      toast.error("Failed to fetch users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Delete User
  const handleDelete = async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_API_URL}/admin/users/${deleteUserId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setUsers(users.filter((u) => u._id !== deleteUserId));
      toast.success("User deleted successfully");
      setDeleteUserId(null);
    } catch {
      toast.error("Delete failed");
    }
  };

  // Role Update
  const handleRoleChange = async (id, role) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_API_URL}/admin/users/${id}/role`,
        { role },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setUsers(users.map((u) => (u._id === id ? { ...u, role } : u)));

      toast.success("Role updated successfully");
    } catch {
      toast.error("Role update failed");
    }
  };

  const filteredUsers = users.filter((user) => {
    const query = search.toLowerCase();

    const matchesSearch =
      user.fullName?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.phone?.toLowerCase().includes(query) ||
      user._id?.toLowerCase().includes(query);

    const matchesRole = roleFilter === "all" ? true : user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  const paginatedUsers = filteredUsers.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h1 className="text-xl font-semibold">Manage Clients</h1>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search */}
          <input
            type="text"
            placeholder="Search name, email, phone or ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 px-3 py-2 rounded-md text-sm w-full sm:w-64"
          />

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 px-3 py-2 rounded-md text-sm"
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="sales">Sales</option>
          </select>
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl bg-white overflow-x-auto">
        <table className="min-w-225 w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-left text-gray-600">
              <th className="p-4 font-medium">User</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Total Bookings</th>
              <th>Verified</th>
              <th>Created</th>
              <th className="text-right pr-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedUsers.map((user) => (
              <tr
                key={user._id}
                className="border-b border-gray-200 hover:bg-gray-50 transition"
              >
                {/* User */}
                <td className="p-4 flex items-center gap-3">
                  <img
                    src={
                      user.avatar?.url ||
                      "https://ui-avatars.com/api/?name=" + user.fullName
                    }
                    className="w-10 h-10 rounded-full object-cover"
                  />

                  <div>
                    <p className="font-medium text-gray-900">{user.fullName}</p>

                    <p className="text-xs text-gray-500">
                      ID: {user._id.slice(-6)}
                    </p>
                  </div>
                </td>

                {/* Email */}
                <td>{user.email}</td>

                {/* Phone */}
                <td>{user.phone || "-"}</td>

                {/* Role */}
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    className="border border-gray-200 rounded-md px-2 py-1"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="sales">Sales</option>
                  </select>
                </td>

                {/* Total bookings */}
                <td className="text-center">
                  {Array.isArray(user.bookings) ? user.bookings.length : 0}
                </td>

                {/* Verified */}
                <td>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      user.isVerified
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {user.isVerified ? "Verified" : "Not Verified"}
                  </span>
                </td>

                {/* Created */}
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>

                {/* Actions */}
                <td className="flex justify-end gap-3 p-4">
                  <button
                    onClick={() => setViewUser(user)}
                    className="text-gray-600 cursor-pointer duration-300 hover:text-black"
                  >
                    <Eye size={18} />
                  </button>

                  <button
                    onClick={() => setDeleteUserId(user._id)}
                    className="text-red-500 cursor-pointer duration-300 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </p>

          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="border border-gray-200 cursor-pointer px-3 py-1 rounded-md text-sm disabled:opacity-50"
            >
              Prev
            </button>

            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="border border-gray-200 px-3 py-1 cursor-pointer rounded-md text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* View User Modal */}

      {viewUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white w-105 rounded-xl shadow-lg border border-gray-200 p-6 animate-scaleIn">
            <div className="flex flex-col items-center">
              <img
                src={
                  viewUser.avatar?.url ||
                  "https://ui-avatars.com/api/?name=" + viewUser.fullName
                }
                className="w-20 h-20 rounded-full object-cover"
              />

              <h2 className="mt-3 text-lg font-semibold">
                {viewUser.fullName}
              </h2>

              <p className="text-sm text-gray-500">{viewUser.email}</p>
            </div>

            <div className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500">Phone</span>
                <span>{viewUser.phone || "-"}</span>
              </div>

              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500">Role</span>
                <span className="capitalize">{viewUser.role}</span>
              </div>

              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500">Verified</span>
                <span>{viewUser.isVerified ? "Yes" : "No"}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span>{new Date(viewUser.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <button
              onClick={() => setViewUser(null)}
              className="mt-6 w-full border cursor-pointer border-gray-200 duration-300 py-2 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete Modal */}

      {deleteUserId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white w-95 p-6 rounded-xl border border-gray-200 shadow-lg animate-scaleIn">
            <h2 className="text-lg font-semibold mb-2">Delete User</h2>

            <p className="text-sm text-gray-600">
              Are you sure you want to delete this user?
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteUserId(null)}
                className="border cursor-pointer duration-300 border-gray-200 px-4 py-2 rounded-md"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="bg-red-500 cursor-pointer duration-300 text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
