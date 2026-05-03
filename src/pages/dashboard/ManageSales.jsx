import axios from "axios";
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  BarChart3,
  Briefcase,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  TrendingUp,
  UserCheck,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

const initialSalesForm = { fullName: "", email: "", phone: "" };
const initialAssignForm = { bookingId: "", salesmanId: "", note: "" };
const initialStatusForm = { status: "pending", note: "" };

const statusOptions = [
  "pending",
  "contacted",
  "in_progress",
  "completed",
  "cancelled",
];

const statusConfig = {
  pending: {
    label: "Pending",
    color: "bg-amber-50 text-amber-700 border border-amber-200",
    dot: "bg-amber-400",
  },
  contacted: {
    label: "Contacted",
    color: "bg-sky-50 text-sky-700 border border-sky-200",
    dot: "bg-sky-400",
  },
  in_progress: {
    label: "In Progress",
    color: "bg-violet-50 text-violet-700 border border-violet-200",
    dot: "bg-violet-400",
  },
  completed: {
    label: "Completed",
    color: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    dot: "bg-emerald-500",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-50 text-red-700 border border-red-200",
    dot: "bg-red-400",
  },
};

/* ── Sub-components ── */
const StatCard = ({ title, value, icon: Icon, accent }) => (
  <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-all duration-200">
    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${accent}`}
    >
      <Icon size={20} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">
        {title}
      </p>
      <p className="text-2xl font-extrabold text-slate-800 mt-0.5 leading-tight">
        {value}
      </p>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || {
    label: status || "unknown",
    color: "bg-slate-100 text-slate-600 border border-slate-200",
    dot: "bg-slate-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

const LoadingSection = ({ text }) => (
  <div className="flex min-h-40 items-center justify-center">
    <div className="flex items-center gap-2.5 text-slate-400">
      <Loader2 className="animate-spin" size={18} />
      <span className="text-sm font-medium">{text}</span>
    </div>
  </div>
);

const EmptyState = ({ text, icon: Icon = Briefcase }) => (
  <div className="flex flex-col min-h-40 items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 text-slate-400">
    <Icon size={28} className="text-slate-300" />
    <p className="text-sm font-medium">{text}</p>
  </div>
);

const FormInput = ({ label, required, children }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-semibold text-slate-600">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    {children}
  </div>
);

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400 cursor-pointer";

const backdropStyle = {
  background: "rgba(15,23,42,0.5)",
  backdropFilter: "blur(4px)",
};
const modalStyle = { animation: "modalIn .2s cubic-bezier(.34,1.56,.64,1)" };

/* ═══════════ MAIN PAGE ═══════════ */
const ManageSales = () => {
  const token = localStorage.getItem("token");
  const authHeaders = useMemo(
    () => ({ headers: { Authorization: `Bearer ${token}` } }),
    [token],
  );

  const [salesList, setSalesList] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [salesmanAssignments, setSalesmanAssignments] = useState([]);

  const [loadingSales, setLoadingSales] = useState(false);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [loadingPerformance, setLoadingPerformance] = useState(false);
  const [loadingSalesmanAssignments, setLoadingSalesmanAssignments] =
    useState(false);

  const [creatingSales, setCreatingSales] = useState(false);
  const [updatingSalesId, setUpdatingSalesId] = useState(null);
  const [deletingSalesId, setDeletingSalesId] = useState(null);
  const [assigningSales, setAssigningSales] = useState(false);
  const [updatingAssignmentId, setUpdatingAssignmentId] = useState(null);

  const [salesForm, setSalesForm] = useState(initialSalesForm);
  const [editingSalesId, setEditingSalesId] = useState(null);
  const [assignForm, setAssignForm] = useState(initialAssignForm);
  const [selectedSalesmanId, setSelectedSalesmanId] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [statusForm, setStatusForm] = useState(initialStatusForm);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    salesId: null,
    salesName: "",
  });
  const [searchText, setSearchText] = useState("");

  const filteredSales = useMemo(() => {
    const term = searchText.toLowerCase().trim();
    if (!term) return salesList;
    return salesList.filter(
      (s) =>
        s?.fullName?.toLowerCase().includes(term) ||
        s?.email?.toLowerCase().includes(term) ||
        s?.phone?.toLowerCase().includes(term),
    );
  }, [salesList, searchText]);

  const fetchSales = async () => {
    try {
      setLoadingSales(true);
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_API_URL}/admin/sales`,
        authHeaders,
      );
      setSalesList(data?.sales || []);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to fetch sales");
    } finally {
      setLoadingSales(false);
    }
  };
  const fetchAllAssignments = async () => {
    try {
      setLoadingAssignments(true);
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_API_URL}/assignments/all`,
        authHeaders,
      );
      setAssignments(data?.assignments || []);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to fetch assignments");
    } finally {
      setLoadingAssignments(false);
    }
  };
  const fetchPerformance = async () => {
    try {
      setLoadingPerformance(true);
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_API_URL}/assignments/performance`,
        authHeaders,
      );
      setPerformance(data?.performance || []);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to fetch performance");
    } finally {
      setLoadingPerformance(false);
    }
  };
  const fetchSalesmanAssignments = async (salesId) => {
    if (!salesId) {
      setSalesmanAssignments([]);
      return;
    }
    try {
      setLoadingSalesmanAssignments(true);
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_API_URL}/assignments/sales/${salesId}`,
        authHeaders,
      );
      setSalesmanAssignments(data?.assignments || []);
    } catch (e) {
      toast.error(
        e?.response?.data?.message || "Failed to fetch salesman assignments",
      );
    } finally {
      setLoadingSalesmanAssignments(false);
    }
  };

  useEffect(() => {
    fetchSales();
    fetchAllAssignments();
    fetchPerformance();
  }, []);
  useEffect(() => {
    if (selectedSalesmanId) fetchSalesmanAssignments(selectedSalesmanId);
  }, [selectedSalesmanId]);

  const refreshAll = () => {
    fetchSales();
    fetchAllAssignments();
    fetchPerformance();
    if (selectedSalesmanId) fetchSalesmanAssignments(selectedSalesmanId);
  };

  const resetSalesForm = () => {
    setSalesForm(initialSalesForm);
    setEditingSalesId(null);
  };

  const handleCreateOrUpdateSales = async (e) => {
    e.preventDefault();
    if (
      !salesForm.fullName ||
      !salesForm.phone ||
      (!editingSalesId && !salesForm.email)
    )
      return toast.error("Please fill all required fields");
    try {
      if (editingSalesId) {
        setUpdatingSalesId(editingSalesId);
        await axios.put(
          `${import.meta.env.VITE_BACKEND_API_URL}/admin/sales/${editingSalesId}`,
          { fullName: salesForm.fullName, phone: salesForm.phone },
          authHeaders,
        );
        toast.success("Sales updated successfully");
      } else {
        setCreatingSales(true);
        await axios.post(
          `${import.meta.env.VITE_BACKEND_API_URL}/admin/create-sales`,
          salesForm,
          authHeaders,
        );
        toast.success("Sales created successfully");
      }
      resetSalesForm();
      fetchSales();
      fetchPerformance();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Operation failed");
    } finally {
      setCreatingSales(false);
      setUpdatingSalesId(null);
    }
  };

  const handleEditSales = (sales) => {
    setEditingSalesId(sales?._id);
    setSalesForm({
      fullName: sales?.fullName || "",
      email: sales?.email || "",
      phone: sales?.phone || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const confirmDeleteSales = async () => {
    try {
      setDeletingSalesId(deleteModal.salesId);
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_API_URL}/admin/sales/${deleteModal.salesId}`,
        authHeaders,
      );
      toast.success("Sales deleted successfully");
      if (selectedSalesmanId === deleteModal.salesId) {
        setSelectedSalesmanId("");
        setSalesmanAssignments([]);
      }
      fetchSales();
      fetchAllAssignments();
      fetchPerformance();
      setDeleteModal({ open: false, salesId: null, salesName: "" });
    } catch (e) {
      toast.error(e?.response?.data?.message || "Delete failed");
    } finally {
      setDeletingSalesId(null);
    }
  };

  const handleAssignSalesman = async (e) => {
    e.preventDefault();
    if (!assignForm.bookingId || !assignForm.salesmanId)
      return toast.error("Booking ID and Salesman are required");
    try {
      setAssigningSales(true);
      await axios.post(
        `${import.meta.env.VITE_BACKEND_API_URL}/assignments/assign`,
        assignForm,
        authHeaders,
      );
      toast.success("Salesman assigned successfully");
      setAssignForm(initialAssignForm);
      fetchAllAssignments();
      fetchPerformance();
      if (selectedSalesmanId) fetchSalesmanAssignments(selectedSalesmanId);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Assignment failed");
    } finally {
      setAssigningSales(false);
    }
  };

  const handleUpdateAssignmentStatus = async (e) => {
    e.preventDefault();
    if (!selectedAssignment?._id) return toast.error("No assignment selected");
    try {
      setUpdatingAssignmentId(selectedAssignment._id);
      await axios.put(
        `${import.meta.env.VITE_BACKEND_API_URL}/assignments/update/${selectedAssignment._id}`,
        statusForm,
        authHeaders,
      );
      toast.success("Assignment updated successfully");
      setSelectedAssignment(null);
      setStatusForm(initialStatusForm);
      fetchAllAssignments();
      fetchPerformance();
      if (selectedSalesmanId) fetchSalesmanAssignments(selectedSalesmanId);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to update assignment");
    } finally {
      setUpdatingAssignmentId(null);
    }
  };

  const totalCompleted = assignments.filter(
    (i) => i?.status === "completed",
  ).length;
  const totalPending = assignments.filter(
    (i) => i?.status === "pending",
  ).length;

  return (
    <div className="min-h-screen bg-slate-50/80 p-4 md:p-6 space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            Sales Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage sales accounts, assignments & performance
          </p>
        </div>
        <button
          onClick={refreshAll}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 transition-all shadow-sm self-start sm:self-auto"
        >
          <RefreshCcw size={15} /> Refresh
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Sales"
          value={salesList.length}
          icon={Users}
          accent="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          title="Assignments"
          value={assignments.length}
          icon={Briefcase}
          accent="bg-violet-50 text-violet-600"
        />
        <StatCard
          title="Completed Deals"
          value={totalCompleted}
          icon={BadgeCheck}
          accent="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Pending Follow-up"
          value={totalPending}
          icon={UserCheck}
          accent="bg-amber-50 text-amber-600"
        />
      </div>

      {/* CREATE / ASSIGN */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <UserCog size={16} className="text-indigo-600" />
            </div>
            <h2 className="font-bold text-slate-800">
              {editingSalesId ? "Edit Sales Account" : "New Sales Account"}
            </h2>
          </div>
          <form onSubmit={handleCreateOrUpdateSales} className="space-y-4">
            <FormInput label="Full Name" required>
              <input
                type="text"
                value={salesForm.fullName}
                onChange={(e) =>
                  setSalesForm((p) => ({ ...p, fullName: e.target.value }))
                }
                placeholder="Enter full name"
                className={inputCls}
              />
            </FormInput>
            <FormInput label="Email" required={!editingSalesId}>
              <input
                type="email"
                value={salesForm.email}
                onChange={(e) =>
                  setSalesForm((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="Enter email"
                disabled={!!editingSalesId}
                className={`${inputCls} ${editingSalesId ? "opacity-50 cursor-not-allowed!" : ""}`}
              />
              {editingSalesId && (
                <p className="text-xs text-slate-400 mt-1">
                  Email cannot be changed
                </p>
              )}
            </FormInput>
            <FormInput label="Phone" required>
              <input
                type="text"
                value={salesForm.phone}
                onChange={(e) =>
                  setSalesForm((p) => ({ ...p, phone: e.target.value }))
                }
                placeholder="Enter phone number"
                className={inputCls}
              />
            </FormInput>
            <FormInput label="Password" required>
              <input
                type="password"
                value={salesForm.password}
                onChange={(e) =>
                  setSalesForm((p) => ({ ...p, password: e.target.value }))
                }
                placeholder="Enter password"
                className={inputCls}
              />
            </FormInput>
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={creatingSales || !!updatingSalesId}
                className="flex-1 cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-[#131518] hover:bg-slate-800 duration-300 text-white text-sm font-semibold py-2.5 transition-all disabled:opacity-50"
              >
                {creatingSales || updatingSalesId ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : editingSalesId ? (
                  <Pencil size={16} />
                ) : (
                  <Plus size={16} />
                )}
                {editingSalesId ? "Update" : "Create Account"}
              </button>
              {editingSalesId && (
                <button
                  type="button"
                  onClick={resetSalesForm}
                  className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-semibold px-4 py-2.5 transition-all"
                >
                  <X size={15} /> Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5 xl:col-span-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <UserCheck size={16} className="text-amber-600" />
            </div>
            <h2 className="font-bold text-slate-800">Assign Salesman</h2>
          </div>
          <form
            onSubmit={handleAssignSalesman}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <FormInput label="Booking ID" required>
              <input
                type="text"
                value={assignForm.bookingId}
                onChange={(e) =>
                  setAssignForm((p) => ({ ...p, bookingId: e.target.value }))
                }
                placeholder="Enter booking ID"
                className={inputCls}
              />
            </FormInput>
            <FormInput label="Select Salesman" required>
              <select
                value={assignForm.salesmanId}
                onChange={(e) =>
                  setAssignForm((p) => ({ ...p, salesmanId: e.target.value }))
                }
                className={inputCls}
              >
                <option value="">Choose salesman</option>
                {salesList.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.fullName} — {s.email}
                  </option>
                ))}
              </select>
            </FormInput>
            <div className="md:col-span-2">
              <FormInput label="Note">
                <textarea
                  value={assignForm.note}
                  onChange={(e) =>
                    setAssignForm((p) => ({ ...p, note: e.target.value }))
                  }
                  rows={3}
                  placeholder="Write an assignment note (optional)"
                  className={inputCls}
                />
              </FormInput>
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={assigningSales}
                className="cursor-pointer inline-flex duration-300 items-center gap-2 rounded-xl bg-[#ebb93a] hover:bg-[#daa624] text-[#131518] text-sm font-semibold px-5 py-2.5 transition-all disabled:opacity-50 shadow-md hover:shadow-lg"
              >
                {assigningSales ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <UserCheck size={16} />
                )}
                Assign Salesman
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* SALES TEAM */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <Users size={16} className="text-slate-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Sales Team</h2>
              <p className="text-xs text-slate-400">
                {salesList.length} member{salesList.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="relative w-full sm:w-72">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search by name, email or phone…"
              className={`${inputCls} pl-9`}
            />
          </div>
        </div>
        {loadingSales ? (
          <LoadingSection text="Loading sales team…" />
        ) : filteredSales.length === 0 ? (
          <EmptyState text="No sales account found" icon={Users} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {filteredSales.map((sales) => (
              <div
                key={sales._id}
                className="group flex items-start justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:shadow-sm hover:border-slate-200 p-4 transition-all duration-150"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold shrink-0">
                      {sales.fullName?.charAt(0)?.toUpperCase() || "S"}
                    </div>
                    <h3 className="font-bold text-slate-800 truncate">
                      {sales.fullName}
                    </h3>
                  </div>
                  <p className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Mail size={12} className="shrink-0" />
                    {sales.email}
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Phone size={12} className="shrink-0" />
                    {sales.phone}
                  </p>
                  <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize">
                    {sales.role}
                  </span>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => handleEditSales(sales)}
                    className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1.5 text-xs font-semibold transition-all"
                  >
                    <Pencil size={13} /> Edit
                  </button>
                  <button
                    onClick={() =>
                      setDeleteModal({
                        open: true,
                        salesId: sales._id,
                        salesName: sales.fullName,
                      })
                    }
                    disabled={deletingSalesId === sales._id}
                    className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-50"
                  >
                    {deletingSalesId === sales._id ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Trash2 size={13} />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ASSIGNMENTS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
              <Briefcase size={16} className="text-violet-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">All Assignments</h2>
              <p className="text-xs text-slate-400">
                {assignments.length} total
              </p>
            </div>
          </div>
          {loadingAssignments ? (
            <LoadingSection text="Loading assignments…" />
          ) : assignments.length === 0 ? (
            <EmptyState text="No assignments found" />
          ) : (
            <div className="space-y-3 max-h-130 overflow-y-auto pr-1">
              {assignments.map((item) => (
                <div
                  key={item._id}
                  className="rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-sm hover:border-slate-200 p-4 transition-all duration-150"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">
                        {item?.clientId?.fullName || "N/A"}
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <UserCheck size={11} />{" "}
                        {item?.salesmanId?.fullName || "N/A"}
                      </p>
                      <p className="text-xs text-slate-400 font-mono truncate">
                        #{item?.bookingId?._id?.slice(-8) || "N/A"}
                      </p>
                      {item?.note && (
                        <p className="text-xs text-slate-500 italic truncate">
                          "{item.note}"
                        </p>
                      )}
                      <div className="pt-1">
                        <StatusBadge status={item?.status} />
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedAssignment(item);
                        setStatusForm({
                          status: item?.status || "pending",
                          note: item?.note || "",
                        });
                      }}
                      className="cursor-pointer shrink-0 inline-flex items-center gap-1 rounded-lg bg-slate-900 hover:bg-slate-700 text-white text-xs font-semibold px-3 py-1.5 transition-all"
                    >
                      <Pencil size={11} /> Update
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <UserCheck size={16} className="text-emerald-600" />
              </div>
              <h2 className="font-bold text-slate-800">By Salesman</h2>
            </div>
            <select
              value={selectedSalesmanId}
              onChange={(e) => setSelectedSalesmanId(e.target.value)}
              className={`${inputCls} w-full sm:w-56`}
            >
              <option value="">Select salesman…</option>
              {salesList.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.fullName}
                </option>
              ))}
            </select>
          </div>
          {!selectedSalesmanId ? (
            <EmptyState
              text="Select a salesman to view assignments"
              icon={UserCheck}
            />
          ) : loadingSalesmanAssignments ? (
            <LoadingSection text="Loading assignments…" />
          ) : salesmanAssignments.length === 0 ? (
            <EmptyState text="No assignments for this salesman" />
          ) : (
            <div className="space-y-3 max-h-130 overflow-y-auto pr-1">
              {salesmanAssignments.map((item) => (
                <div
                  key={item._id}
                  className="rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 p-4 transition-all duration-150 space-y-1.5"
                >
                  <p className="font-semibold text-slate-800 text-sm">
                    {item?.clientId?.fullName || "N/A"}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Mail size={11} /> {item?.clientId?.email || "N/A"}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Phone size={11} /> {item?.clientId?.phone || "N/A"}
                  </p>
                  <p className="text-xs text-slate-400 font-mono">
                    #{item?.bookingId?._id?.slice(-8) || "N/A"}
                  </p>
                  {item?.note && (
                    <p className="text-xs text-slate-500 italic">
                      "{item.note}"
                    </p>
                  )}
                  <StatusBadge status={item?.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* PERFORMANCE */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
            <TrendingUp size={16} className="text-teal-600" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800">Sales Performance</h2>
            <p className="text-xs text-slate-400">Deal completion overview</p>
          </div>
        </div>
        {loadingPerformance ? (
          <LoadingSection text="Loading performance…" />
        ) : performance.length === 0 ? (
          <EmptyState text="No performance data found" icon={BarChart3} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  {["#", "Salesman", "Email", "Total Clients", "Completed"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {performance.map((item, i) => {
                  const rate = item?.totalClients
                    ? Math.round(
                        (item.completedDeals / item.totalClients) * 100,
                      )
                    : 0;
                  return (
                    <tr
                      key={item?._id || i}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="px-4 py-3 text-xs text-slate-400 font-mono">
                        {i + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                            {item?.sales?.fullName?.charAt(0)?.toUpperCase() ||
                              "?"}
                          </div>
                          <span className="font-semibold text-slate-700">
                            {item?.sales?.fullName || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {item?.sales?.email || "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full">
                          <Users size={10} /> {item?.totalClients || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
                            <BadgeCheck size={10} /> {item?.completedDeals || 0}
                          </span>
                          {item?.totalClients > 0 && (
                            <span className="text-xs text-slate-400">
                              {rate}%
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* keyframes */}
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(.93) translateY(10px); }
          to   { opacity: 1; transform: scale(1)   translateY(0);    }
        }
      `}</style>

      {/* ── MODALS — rendered into document.body via Portal (zero layout impact) ── */}

      {selectedAssignment &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={backdropStyle}
            onClick={(e) =>
              e.target === e.currentTarget && setSelectedAssignment(null)
            }
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              style={modalStyle}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
                    <Activity size={15} className="text-violet-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">
                      Update Assignment
                    </h3>
                    <p className="text-xs text-slate-400">
                      {selectedAssignment?.clientId?.fullName || "Client"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAssignment(null)}
                  className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition-all"
                >
                  <X size={16} />
                </button>
              </div>
              <form
                onSubmit={handleUpdateAssignmentStatus}
                className="p-6 space-y-4"
              >
                <FormInput label="Status">
                  <select
                    value={statusForm.status}
                    onChange={(e) =>
                      setStatusForm((p) => ({ ...p, status: e.target.value }))
                    }
                    className={inputCls}
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {statusConfig[s]?.label || s}
                      </option>
                    ))}
                  </select>
                </FormInput>
                <FormInput label="Note">
                  <textarea
                    rows={4}
                    value={statusForm.note}
                    onChange={(e) =>
                      setStatusForm((p) => ({ ...p, note: e.target.value }))
                    }
                    placeholder="Add a note…"
                    className={inputCls}
                  />
                </FormInput>
                <button
                  type="submit"
                  disabled={updatingAssignmentId === selectedAssignment._id}
                  className="cursor-pointer w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold py-2.5 transition-all disabled:opacity-50"
                >
                  {updatingAssignmentId === selectedAssignment._id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <BadgeCheck size={16} />
                  )}
                  Save Changes
                </button>
              </form>
            </div>
          </div>,
          document.body,
        )}

      {deleteModal.open &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={backdropStyle}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
              style={modalStyle}
            >
              <div className="p-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto">
                  <AlertTriangle size={24} className="text-red-500" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">
                    Delete Account?
                  </h3>
                  <p className="text-sm text-slate-500 mt-1.5">
                    You're about to delete{" "}
                    <span className="font-semibold text-slate-700">
                      "{deleteModal.salesName}"
                    </span>
                    . This action cannot be undone.
                  </p>
                </div>
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() =>
                      setDeleteModal({
                        open: false,
                        salesId: null,
                        salesName: "",
                      })
                    }
                    className="cursor-pointer flex-1 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold py-2.5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteSales}
                    disabled={deletingSalesId === deleteModal.salesId}
                    className="cursor-pointer flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2.5 transition-all disabled:opacity-60"
                  >
                    {deletingSalesId === deleteModal.salesId ? (
                      <Loader2 className="animate-spin mx-auto" size={16} />
                    ) : (
                      "Delete"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default ManageSales;
