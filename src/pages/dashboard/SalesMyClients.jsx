import axios from "axios";
import {
  BadgeCheck,
  Filter,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Search,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

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
  assigned: {
    label: "Assigned",
    color: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    dot: "bg-indigo-400",
  },
};

/* ── Sub-components ── */
const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || {
    label: status || "—",
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

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400 cursor-pointer";

const backdropStyle = {
  background: "rgba(15,23,42,0.5)",
  backdropFilter: "blur(4px)",
};
const modalStyle = { animation: "modalIn .2s cubic-bezier(.34,1.56,.64,1)" };

/* ═════════════ MAIN PAGE ═════════════ */
const SalesMyClients = () => {
  const token = localStorage.getItem("token");
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const [clients, setClients] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedClient, setSelectedClient] = useState(null);
  const [statusForm, setStatusForm] = useState({ status: "pending", note: "" });
  const [updating, setUpdating] = useState(false);

  /* fetch */
  const fetchClients = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_API_URL}/sales/clients`,
        authHeaders,
      );
      setClients(data?.clients || []);
      setFiltered(data?.clients || []);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  /* search + filter */
  useEffect(() => {
    let data = clients;
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (c) =>
          (c?.clientId?.fullName || "").toLowerCase().includes(q) ||
          (c?.clientId?.email || "").toLowerCase().includes(q) ||
          (c?.clientId?.phone || "").toLowerCase().includes(q),
      );
    }
    if (statusFilter !== "all")
      data = data.filter((c) => c.status === statusFilter);
    setFiltered(data);
  }, [search, statusFilter, clients]);

  /* update status */
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedClient?._id) return;
    setUpdating(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_API_URL}/sales/update-client/${selectedClient._id}`,
        statusForm,
        authHeaders,
      );
      toast.success("Status updated successfully");
      setClients((prev) =>
        prev.map((c) =>
          c._id === selectedClient._id
            ? { ...c, status: statusForm.status, note: statusForm.note }
            : c,
        ),
      );
      setSelectedClient(null);
      setStatusForm({ status: "pending", note: "" });
    } catch (e) {
      toast.error(e?.response?.data?.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  /* counts for filter badges */
  const counts = statusOptions.reduce((acc, s) => {
    acc[s] = clients.filter((c) => c.status === s).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-50/80 p-4 md:p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
          My Clients
        </h1>
        <p className="text-sm text-slate-400">
          {clients.length} client{clients.length !== 1 ? "s" : ""} assigned to
          you
        </p>
      </div>

      {/* FILTER PILLS */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "all", label: "All", count: clients.length },
          ...statusOptions.map((s) => ({
            key: s,
            label: statusConfig[s]?.label || s,
            count: counts[s] || 0,
          })),
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              statusFilter === key
                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
            }`}
          >
            {label}
            <span
              className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${statusFilter === key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* SEARCH + RESULT COUNT */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-56">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or phone…"
            className={`${inputCls} pl-9`}
          />
        </div>
        <div className="relative">
          <Filter
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`${inputCls} pl-8 pr-8`}
          >
            <option value="all">All Status</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {statusConfig[s]?.label || s}
              </option>
            ))}
          </select>
        </div>
        <span className="text-xs text-slate-400 font-medium ml-auto">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* CLIENTS GRID */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-60 gap-3">
          <Loader2 size={28} className="animate-spin text-indigo-500" />
          <p className="text-sm text-slate-400 font-medium">Loading clients…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-60 gap-3 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400">
          <Users size={32} className="text-slate-300" />
          <p className="text-sm font-medium">No clients found</p>
          <p className="text-xs">Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 p-5 space-y-4 transition-all duration-150 flex flex-col"
            >
              {/* Client info */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-extrabold shrink-0">
                  {item?.clientId?.fullName?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-800 truncate">
                    {item?.clientId?.fullName || "N/A"}
                  </p>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Mail size={11} className="shrink-0" />{" "}
                    {item?.clientId?.email || "—"}
                  </p>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Phone size={11} className="shrink-0" />{" "}
                    {item?.clientId?.phone || "—"}
                  </p>
                </div>
                <StatusBadge status={item?.status} />
              </div>

              {/* Booking info */}
              {item?.bookingId && (
                <div className="bg-slate-50 rounded-xl p-3 space-y-1.5">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Booking
                  </p>
                  <p className="text-xs text-slate-600 font-mono">
                    #{item?.bookingId?._id?.slice(-10) || "N/A"}
                  </p>
                  {item?.bookingId?.paymentSchedule?.totalPrice && (
                    <p className="text-xs text-slate-600 font-semibold">
                      ৳
                      {Number(
                        item.bookingId.paymentSchedule.totalPrice,
                      ).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {/* Note */}
              {item?.note && (
                <p className="text-xs text-slate-500 italic bg-amber-50/60 border border-amber-100 rounded-lg px-3 py-2">
                  "{item.note}"
                </p>
              )}

              {/* Action */}
              <div className="mt-auto pt-1">
                <button
                  onClick={() => {
                    setSelectedClient(item);
                    setStatusForm({
                      status: item?.status || "pending",
                      note: item?.note || "",
                    });
                  }}
                  className="cursor-pointer w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-700 text-white text-xs font-semibold py-2.5 transition-all"
                >
                  <Pencil size={13} /> Update Status
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* keyframes */}
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(.93) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      {/* UPDATE STATUS MODAL — via Portal */}
      {selectedClient &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={backdropStyle}
            onClick={(e) =>
              e.target === e.currentTarget && setSelectedClient(null)
            }
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              style={modalStyle}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-extrabold text-sm shrink-0">
                    {selectedClient?.clientId?.fullName
                      ?.charAt(0)
                      ?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">
                      {selectedClient?.clientId?.fullName || "Client"}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {selectedClient?.clientId?.phone ||
                        selectedClient?.clientId?.email ||
                        "—"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Current status */}
              <div className="px-6 pt-4 flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">
                  Current:
                </span>
                <StatusBadge status={selectedClient?.status} />
              </div>

              {/* Form */}
              <form onSubmit={handleUpdateStatus} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-600">
                    New Status
                  </label>
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
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-600">
                    Note
                  </label>
                  <textarea
                    rows={4}
                    value={statusForm.note}
                    onChange={(e) =>
                      setStatusForm((p) => ({ ...p, note: e.target.value }))
                    }
                    placeholder="Add a follow-up note…"
                    className={inputCls}
                  />
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedClient(null)}
                    className="cursor-pointer flex-1 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold py-2.5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="cursor-pointer flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 transition-all disabled:opacity-50"
                  >
                    {updating ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <BadgeCheck size={15} />
                    )}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default SalesMyClients;
