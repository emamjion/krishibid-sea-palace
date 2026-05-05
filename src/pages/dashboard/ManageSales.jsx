// ManageSales - Redesigned with proper functionality

import axios from "axios";
import {
  BadgeCheck,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Eye,
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  User,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  employeeId: "",
  password: "",
};

const COLORS = ["#6366f1", "#e2e8f0"];

export default function ManageSales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalMode, setModalMode] = useState(null); // 'create' | 'view' | 'edit' | 'delete'
  const [selectedSale, setSelectedSale] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsModal, setBookingsModal] = useState(false);

  const perPage = 6;
  const token = localStorage.getItem("token");

  const fetchSales = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_API_URL}/admin/sales`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSales(data.sales || []);
    } catch {
      toast.error("Failed to load sales team");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchBookings = async (salesId) => {
    try {
      setBookingsLoading(true);
      setBookings([]);
      setBookingsModal(true);
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_API_URL}/admin/sales/${salesId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setBookings(data.bookings || []);
    } catch {
      toast.error("Failed to load bookings");
    } finally {
      setBookingsLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!form.fullName.trim()) errors.fullName = "Full name is required";
    if (!form.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = "Invalid email";
    if (!form.phone.trim()) errors.phone = "Phone is required";
    if (!form.employeeId.trim()) errors.employeeId = "Employee ID is required";
    if (modalMode === "create" && !form.password.trim())
      errors.password = "Password is required";
    else if (modalMode === "create" && form.password.trim().length < 6)
      errors.password = "Password must be at least 6 characters";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_API_URL}/admin/create-sales`,
        form,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Salesman created successfully");
      closeModal();
      fetchSales();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Create failed");
    }
  };

  const handleEdit = async () => {
    if (!validateForm()) return;
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_API_URL}/admin/sales/${selectedSale._id}`,
        form,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Updated successfully");
      closeModal();
      fetchSales();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_API_URL}/admin/sales/${selectedSale._id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Deleted successfully");
      closeModal();
      fetchSales();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    } finally {
      setDeleteLoading(false);
    }
  };

  const openCreate = () => {
    setForm(initialForm);
    setFormErrors({});
    setModalMode("create");
  };

  const openView = (s) => {
    setSelectedSale(s);
    setModalMode("view");
  };

  const openEdit = (s) => {
    setSelectedSale(s);
    setForm({
      fullName: s.fullName || "",
      email: s.email || "",
      phone: s.phone || "",
      employeeId: s.salesInfo?.employeeId || "",
      password: "",
    });
    setFormErrors({});
    setModalMode("edit");
  };

  const openDelete = (s) => {
    setSelectedSale(s);
    setModalMode("delete");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedSale(null);
    setForm(initialForm);
    setFormErrors({});
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return sales;
    const q = search.toLowerCase();
    return sales.filter(
      (s) =>
        s.fullName?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.salesInfo?.employeeId?.toLowerCase().includes(q) ||
        s.phone?.toLowerCase().includes(q),
    );
  }, [sales, search]);

  const totalPages = Math.ceil(filtered.length / perPage);

  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page]);

  const assignedCount = sales.filter((s) => s.assigned).length;

  const chartData = [
    { name: "Total", value: sales.length },
    { name: "Assigned", value: assignedCount },
  ];

  const statCards = [
    {
      label: "Total Salesmen",
      value: sales.length,
      icon: Users,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Assigned",
      value: assignedCount,
      icon: TrendingUp,
      color: "bg-amber-50 text-amber-600",
    },
  ];

  const fieldConfig = [
    {
      key: "fullName",
      label: "Full Name",
      icon: User,
      type: "text",
      placeholder: "e.g. Ahmed Rahman",
    },
    {
      key: "email",
      label: "Email Address",
      icon: Mail,
      type: "email",
      placeholder: "e.g. ahmed@company.com",
    },
    {
      key: "phone",
      label: "Phone Number",
      icon: Phone,
      type: "tel",
      placeholder: "e.g. +880 1700 000000",
    },
    {
      key: "employeeId",
      label: "Employee ID",
      icon: BadgeCheck,
      type: "text",
      placeholder: "e.g. EMP-001",
    },
    ...(modalMode === "create"
      ? [
          {
            key: "password",
            label: "Password",
            icon: null,
            type: "password",
            placeholder: "Min 6 characters",
          },
        ]
      : []),
  ];

  return (
    <div
      style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
      className="p-6 space-y-6 bg-slate-50 min-h-screen"
    >
      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4">
        {statCards.map((card, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4"
          >
            <div className={`rounded-xl p-3 ${card.color}`}>
              <card.icon size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                {card.label}
              </p>
              <h2 className="text-2xl font-bold text-slate-800">
                {card.value}
              </h2>
            </div>
          </div>
        ))}
      </div>

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Sales Team</h2>
          <p className="text-sm text-slate-400">{sales.length} members total</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:flex-none">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, email..."
              className="pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <button
            onClick={openCreate}
            className="cursor-pointer flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 transition-colors text-white px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap shadow-sm"
          >
            <Plus size={16} /> Add Salesman
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
            <div className="w-6 h-6 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mr-3" />
            Loading sales team...
          </div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Users size={40} className="mb-3 opacity-30" />
            <p className="text-sm font-medium">No salesmen found</p>
            <p className="text-xs mt-1">
              Try a different search or add a new salesman
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Name
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">
                  Email
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">
                  Phone
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Employee ID
                </th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">
                  Bookings
                </th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginated.map((s) => (
                <tr
                  key={s._id}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold text-xs shrink-0">
                        {s.fullName?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <span className="font-medium text-slate-800 truncate max-w-[120px]">
                        {s.fullName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-500 hidden md:table-cell truncate max-w-[160px]">
                    {s.email}
                  </td>
                  <td className="px-4 py-4 text-slate-500 hidden lg:table-cell">
                    {s.phone}
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-xs font-mono font-medium px-2.5 py-1 rounded-lg">
                      {s.salesInfo?.employeeId || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-4 hidden sm:table-cell">
                    <div className="flex justify-center">
                      <button
                        onClick={() => {
                          setSelectedSale(s);
                          fetchBookings(s.salesInfo?.employeeId);
                        }}
                        className="cursor-pointer inline-flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <BookOpen size={12} />
                        {s.bookings?.length ?? 0} Bookings
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => openView(s)}
                        title="View"
                        className="cursor-pointer p-2 rounded-lg text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => openEdit(s)}
                        title="Edit"
                        className="cursor-pointer p-2 rounded-lg text-slate-500 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => openDelete(s)}
                        title="Delete"
                        className="cursor-pointer p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Showing {(page - 1) * perPage + 1}–
            {Math.min(page * perPage, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="cursor-pointer p-2 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`cursor-pointer w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                  page === i + 1
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-white hover:border hover:border-slate-200"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="cursor-pointer p-2 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">
          Active vs Inactive
        </h3>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barSize={48}>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#94a3b8" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                  fontSize: 13,
                }}
                cursor={{ fill: "#f8fafc" }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {chartData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={index === 0 ? "#6366f1" : "#e2e8f0"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── CREATE / EDIT MODAL ── */}
      {(modalMode === "create" || modalMode === "edit") && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <h2 className="font-bold text-slate-800 text-lg">
                  {modalMode === "create"
                    ? "Add New Salesman"
                    : "Edit Salesman"}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {modalMode === "create"
                    ? "Fill in the details below"
                    : `Editing ${selectedSale?.fullName}`}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="cursor-pointer p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <div className="px-6 py-5">
              <div className="grid grid-cols-2 gap-4">
                {fieldConfig.map(
                  ({ key, label, icon: Icon, type, placeholder }) => (
                    <div
                      key={key}
                      className={key === "password" ? "col-span-2" : ""}
                    >
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                        {label}
                      </label>
                      <div className="relative">
                        {Icon && (
                          <Icon
                            size={15}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                          />
                        )}
                        <input
                          type={type}
                          placeholder={placeholder}
                          value={form[key]}
                          onChange={(e) => {
                            setForm({ ...form, [key]: e.target.value });
                            if (formErrors[key])
                              setFormErrors({ ...formErrors, [key]: "" });
                          }}
                          className={`w-full border rounded-xl py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 transition-all ${
                            Icon ? "pl-10 pr-4" : "px-4"
                          } ${
                            formErrors[key]
                              ? "border-red-300 focus:ring-red-200"
                              : "border-slate-200 focus:ring-indigo-200 focus:border-indigo-400"
                          }`}
                        />
                      </div>
                      {formErrors[key] && (
                        <p className="text-xs text-red-500 mt-1">
                          {formErrors[key]}
                        </p>
                      )}
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-slate-100">
              <button
                onClick={closeModal}
                className="cursor-pointer flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={modalMode === "create" ? handleCreate : handleEdit}
                className="cursor-pointer flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors shadow-sm"
              >
                {modalMode === "create" ? "Create Salesman" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW MODAL ── */}
      {modalMode === "view" && selectedSale && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h2 className="font-bold text-slate-800 text-lg">
                Salesman Profile
              </h2>
              <button
                onClick={closeModal}
                className="cursor-pointer p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Avatar + Name */}
            <div className="flex flex-col items-center pt-6 pb-4 px-6">
              <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl font-bold mb-3">
                {selectedSale.fullName?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                {selectedSale.fullName}
              </h3>
            </div>

            {/* Details Grid */}
            <div className="px-6 pb-4 grid grid-cols-2 gap-3">
              {[
                {
                  icon: BadgeCheck,
                  label: "Employee ID",
                  value: selectedSale.salesInfo?.employeeId,
                },
                { icon: Mail, label: "Email", value: selectedSale.email },
                { icon: Phone, label: "Phone", value: selectedSale.phone },
                {
                  icon: TrendingUp,
                  label: "Assigned",
                  value: selectedSale.assigned ? "Yes" : "No",
                },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl"
                >
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={15} className="text-indigo-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400">{label}</p>
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {value || "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-slate-100">
              <button
                onClick={closeModal}
                className="cursor-pointer flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  closeModal();
                  setTimeout(() => openEdit(selectedSale), 50);
                }}
                className="cursor-pointer flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ── */}
      {modalMode === "delete" && selectedSale && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={22} className="text-red-500" />
              </div>
              <h2 className="text-lg font-bold text-slate-800 mb-1">
                Delete Salesman
              </h2>
              <p className="text-sm text-slate-500">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-slate-700">
                  {selectedSale.fullName}
                </span>
                ? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={closeModal}
                className="cursor-pointer flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="cursor-pointer flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-sm font-medium transition-colors"
              >
                {deleteLoading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── BOOKINGS MODAL ── */}
      {bookingsModal && selectedSale && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
              <div>
                <h2 className="font-bold text-slate-800 text-lg">Bookings</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedSale.fullName} &middot;{" "}
                  {selectedSale.salesInfo?.employeeId}
                </p>
              </div>
              <button
                onClick={() => {
                  setBookingsModal(false);
                  setBookings([]);
                  setSelectedSale(null);
                }}
                className="cursor-pointer p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto px-6 py-5 space-y-4 flex-1">
              {bookingsLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <div className="w-7 h-7 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mb-3" />
                  <p className="text-sm">Loading bookings...</p>
                </div>
              ) : bookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <BookOpen size={36} className="mb-3 opacity-30" />
                  <p className="text-sm font-medium">No bookings found</p>
                  <p className="text-xs mt-1">
                    This salesman has no bookings yet
                  </p>
                </div>
              ) : (
                bookings.map((b, idx) => (
                  <div
                    key={b._id}
                    className="border border-slate-100 rounded-2xl overflow-hidden"
                  >
                    {/* Booking card header */}
                    <div className="bg-slate-50 px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </span>
                        <span className="text-sm font-semibold text-slate-700">
                          {b.generalInformation?.fullNameEn || "N/A"}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          · {b.paymentSchedule?.clientId}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                          b.status === "pending"
                            ? "bg-amber-50 text-amber-600"
                            : b.status === "approved"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-red-50 text-red-500"
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>

                    {/* Booking details grid */}
                    <div className="px-4 py-4 grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                          <Phone size={12} className="text-indigo-500" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Mobile</p>
                          <p className="text-sm font-medium text-slate-700">
                            {b.generalInformation?.mobile1 || "—"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                          <CreditCard size={12} className="text-indigo-500" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Total Price</p>
                          <p className="text-sm font-medium text-slate-700">
                            ৳
                            {b.paymentSchedule?.totalPrice?.toLocaleString() ||
                              "—"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                          <TrendingUp size={12} className="text-indigo-500" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">
                            Shares · Price/Share
                          </p>
                          <p className="text-sm font-medium text-slate-700">
                            {b.paymentSchedule?.numberOfShare} &times; ৳
                            {b.paymentSchedule?.sharePrice?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                          <Calendar size={12} className="text-indigo-500" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Booked On</p>
                          <p className="text-sm font-medium text-slate-700">
                            {new Date(b.createdAt).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 col-span-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                          <Mail size={12} className="text-indigo-500" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Email</p>
                          <p className="text-sm font-medium text-slate-700">
                            {b.generalInformation?.email || "—"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {!bookingsLoading && bookings.length > 0 && (
              <div className="px-6 py-4 border-t border-slate-100 shrink-0 flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Total{" "}
                  <span className="font-semibold text-slate-600">
                    {bookings.length}
                  </span>{" "}
                  booking{bookings.length !== 1 ? "s" : ""}
                </p>
                <button
                  onClick={() => {
                    setBookingsModal(false);
                    setBookings([]);
                    setSelectedSale(null);
                  }}
                  className="cursor-pointer px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
