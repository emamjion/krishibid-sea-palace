import axios from "axios";
import {
  BookOpen,
  Calendar,
  Check,
  CheckCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  CreditCard,
  Eye,
  Filter,
  Layers,
  Loader2,
  Search,
  User,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

/* ─────────────────────────────────────────
   VIEW BOOKING MODAL  (inline, self-contained)
───────────────────────────────────────── */
const ViewBookingModal = ({ booking, onClose }) => {
  const [copiedField, setCopiedField] = useState(null);

  const copy = (value, field) => {
    navigator.clipboard.writeText(value ?? "");
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  if (!booking) return null;

  const gi = booking.generalInformation || {};
  const ps = booking.paymentSchedule || {};

  const statusColor =
    {
      approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
      pending: "bg-amber-100 text-amber-700 border-amber-200",
      rejected: "bg-red-100 text-red-700 border-red-200",
    }[booking.status] || "bg-slate-100 text-slate-600";

  const Row = ({ label, value, copiable, field }) => (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider w-36 shrink-0">
        {label}
      </span>
      <div className="flex items-center gap-2 flex-1 justify-end">
        <span className="text-sm text-slate-700 font-medium text-right break-all">
          {value || <span className="text-slate-300 italic">—</span>}
        </span>
        {copiable && value && (
          <button
            onClick={() => copy(value, field)}
            className="ml-1 p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
          >
            {copiedField === field ? (
              <Check size={13} className="text-emerald-500" />
            ) : (
              <Copy size={13} />
            )}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        style={{ animation: "modalIn .22s cubic-bezier(.34,1.56,.64,1)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
              <User size={18} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-base leading-tight">
                {gi.fullNameEn || "Booking Details"}
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {ps.clientId || booking._id}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full border capitalize ${statusColor}`}
            >
              {booking.status}
            </span>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">
          {/* General Info */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <User size={14} className="text-indigo-400" />
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                General Information
              </h3>
            </div>
            <div className="bg-slate-50 rounded-xl px-4 divide-y divide-slate-100">
              <Row
                label="Full Name (EN)"
                value={gi.fullNameEn}
                copiable
                field="fullNameEn"
              />
              <Row
                label="Full Name (BN)"
                value={gi.fullNameBn}
                copiable
                field="fullNameBn"
              />
              <Row
                label="Mobile 1"
                value={gi.mobile1}
                copiable
                field="mobile1"
              />
              <Row
                label="Mobile 2"
                value={gi.mobile2}
                copiable
                field="mobile2"
              />
              <Row label="Email" value={gi.email} copiable field="email" />
              <Row
                label="NID / Passport"
                value={gi.nidPassport}
                copiable
                field="nid"
              />
              <Row label="Date of Birth" value={gi.dateOfBirth} field="dob" />
              <Row
                label="Address"
                value={gi.address}
                copiable
                field="address"
              />
            </div>
          </section>

          {/* Payment Schedule */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <CreditCard size={14} className="text-indigo-400" />
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Payment Schedule
              </h3>
            </div>
            <div className="bg-slate-50 rounded-xl px-4 divide-y divide-slate-100">
              <Row
                label="Client ID"
                value={ps.clientId}
                copiable
                field="clientId"
              />
              <Row
                label="No. of Shares"
                value={ps.numberOfShare}
                field="shares"
              />
              <Row
                label="Total Price"
                value={ps.totalPrice ? `৳${ps.totalPrice}` : null}
                field="price"
              />
              <Row
                label="Per Share Price"
                value={ps.perSharePrice ? `৳${ps.perSharePrice}` : null}
                field="perShare"
              />
              <Row
                label="Down Payment"
                value={ps.downPayment ? `৳${ps.downPayment}` : null}
                field="down"
              />
              <Row
                label="Monthly Installment"
                value={
                  ps.monthlyInstallment ? `৳${ps.monthlyInstallment}` : null
                }
                field="monthly"
              />
            </div>
          </section>

          {/* Meta */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={14} className="text-indigo-400" />
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Record Info
              </h3>
            </div>
            <div className="bg-slate-50 rounded-xl px-4 divide-y divide-slate-100">
              <Row
                label="Booking ID"
                value={booking._id}
                copiable
                field="bookingId"
              />
              <Row
                label="Created At"
                value={new Date(booking.createdAt).toLocaleString()}
                field="created"
              />
              <Row
                label="Updated At"
                value={
                  booking.updatedAt
                    ? new Date(booking.updatedAt).toLocaleString()
                    : null
                }
                field="updated"
              />
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(.93) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

/* ─────────────────────────────────────────
   STAT CARD
───────────────────────────────────────── */
const StatCard = ({ label, value, icon: Icon, color, bg }) => (
  <div
    className={`rounded-2xl p-5 flex items-center gap-4 ${bg} border border-white/60 shadow-sm`}
  >
    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} bg-white/70 shadow-sm`}
    >
      <Icon size={22} />
    </div>
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-2xl font-extrabold text-slate-800 leading-tight mt-0.5">
        {value}
      </p>
    </div>
  </div>
);

/* ─────────────────────────────────────────
   COPY BUTTON (inline)
───────────────────────────────────────── */
const CopyBtn = ({ value }) => {
  const [copied, setCopied] = useState(false);
  const handle = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  return (
    <button
      onClick={handle}
      title="Copy"
      className="ml-1 inline-flex items-center justify-center w-6 h-6 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
    >
      {copied ? (
        <CheckCheck size={12} className="text-emerald-500" />
      ) : (
        <Copy size={12} />
      )}
    </button>
  );
};

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
const ManageBookings = () => {
  const token = localStorage.getItem("token");

  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [selectedBooking, setSelectedBooking] = useState(null);

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const fetchBookings = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_API_URL}/admin/bookings`,
        authHeaders,
      );
      setBookings(res.data.bookings);
      setFilteredBookings(res.data.bookings);
    } catch {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    let data = bookings;
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (b) =>
          (b.paymentSchedule?.clientId || "").toLowerCase().includes(q) ||
          (b.generalInformation?.fullNameEn || "").toLowerCase().includes(q) ||
          (b._id || "").toLowerCase().includes(q) ||
          (b.generalInformation?.mobile1 || "").toLowerCase().includes(q) ||
          (b.generalInformation?.mobile2 || "").toLowerCase().includes(q),
      );
    }
    if (statusFilter !== "all") {
      data = data.filter((b) => b.status === statusFilter);
    }
    setFilteredBookings(data);
    setPage(1);
  }, [search, statusFilter, bookings]);

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_API_URL}/admin/booking/${id}/status`,
        { status },
        authHeaders,
      );
      toast.success(`Booking ${status}`);
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status } : b)),
      );
    } catch {
      toast.error("Update failed");
    }
  };

  const totalPages = Math.ceil(filteredBookings.length / perPage);
  const paginated = filteredBookings.slice(
    (page - 1) * perPage,
    page * perPage,
  );

  const counts = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    approved: bookings.filter((b) => b.status === "approved").length,
    rejected: bookings.filter((b) => b.status === "rejected").length,
  };

  const statusBadge = {
    approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    pending: "bg-amber-50 text-amber-700 border border-amber-200",
    rejected: "bg-red-50 text-red-700 border border-red-200",
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 size={32} className="animate-spin text-indigo-500" />
        <p className="text-sm text-slate-400 font-medium">Loading bookings…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
          Manage Bookings
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          View, approve, and manage all client bookings
        </p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Bookings"
          value={counts.total}
          icon={BookOpen}
          color="text-indigo-600"
          bg="bg-indigo-50"
        />
        <StatCard
          label="Pending"
          value={counts.pending}
          icon={Clock}
          color="text-amber-600"
          bg="bg-amber-50"
        />
        <StatCard
          label="Approved"
          value={counts.approved}
          icon={CheckCircle2}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <StatCard
          label="Rejected"
          value={counts.rejected}
          icon={XCircle}
          color="text-red-500"
          bg="bg-red-50"
        />
      </div>

      {/* SEARCH + FILTER BAR */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-56">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search by Client ID, Name, Phone or Booking ID…"
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all placeholder:text-slate-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="relative">
          <Filter
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <select
            className="pl-8 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 appearance-none cursor-pointer transition-all"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <span className="text-xs text-slate-400 ml-auto font-medium">
          {filteredBookings.length} result
          {filteredBookings.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {[
                  "Booking ID",
                  "Client ID",
                  "Applicant",
                  "Phone",
                  "Shares",
                  "Total Price",
                  "Status",
                  "Created",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-16 text-slate-400">
                    <BookOpen
                      size={32}
                      className="mx-auto mb-3 text-slate-300"
                    />
                    <p className="font-medium">No bookings found</p>
                    <p className="text-xs mt-1">
                      Try adjusting your search or filter
                    </p>
                  </td>
                </tr>
              ) : (
                paginated.map((booking, idx) => (
                  <tr
                    key={booking._id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Booking ID */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span
                          className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg max-w-24 truncate"
                          title={booking._id}
                        >
                          {booking._id?.slice(-8)}
                        </span>
                        <CopyBtn value={booking._id} />
                      </div>
                    </td>

                    {/* Client ID */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-xs font-semibold text-indigo-700">
                          {booking.paymentSchedule?.clientId || "—"}
                        </span>
                        {booking.paymentSchedule?.clientId && (
                          <CopyBtn value={booking.paymentSchedule.clientId} />
                        )}
                      </div>
                    </td>

                    {/* Name */}
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-700">
                        {booking.generalInformation?.fullNameEn || "—"}
                      </span>
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-3 text-slate-600">
                      {booking.generalInformation?.mobile1 || "—"}
                    </td>

                    {/* Shares */}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 font-bold text-xs px-2.5 py-1 rounded-full">
                        <Layers size={11} />
                        {booking.paymentSchedule?.numberOfShare ?? "—"}
                      </span>
                    </td>

                    {/* Total Price */}
                    <td className="px-4 py-3 font-bold text-slate-800">
                      {booking.paymentSchedule?.totalPrice
                        ? `৳${Number(booking.paymentSchedule.totalPrice).toLocaleString()}`
                        : "—"}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusBadge[booking.status] || "bg-slate-100 text-slate-500"}`}
                      >
                        {booking.status}
                      </span>
                    </td>

                    {/* Created */}
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(booking.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {/* View */}
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          title="View Details"
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-all cursor-pointer"
                        >
                          <Eye size={15} />
                        </button>

                        {/* Approve */}
                        <button
                          onClick={() => updateStatus(booking._id, "approved")}
                          title="Approve"
                          disabled={booking.status === "approved"}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <CheckCircle2 size={15} />
                        </button>

                        {/* Reject */}
                        <button
                          onClick={() => updateStatus(booking._id, "rejected")}
                          title="Reject"
                          disabled={booking.status === "rejected"}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <XCircle size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/50">
            <span className="text-xs text-slate-400 font-medium">
              Page {page} of {totalPages} &nbsp;·&nbsp;{" "}
              {filteredBookings.length} bookings
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white border border-transparent hover:border-slate-200 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <ChevronLeft size={15} />
              </button>

              {[...Array(totalPages)].map((_, i) => {
                const p = i + 1;
                const visible =
                  p === 1 || p === totalPages || Math.abs(p - page) <= 1;
                const ellipsis =
                  (p === 2 && page > 4) ||
                  (p === totalPages - 1 && page < totalPages - 3);
                if (!visible && !ellipsis) return null;
                if (ellipsis && !visible)
                  return (
                    <span
                      key={p}
                      className="w-8 h-8 flex items-center justify-center text-slate-400 text-sm"
                    >
                      …
                    </span>
                  );
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                      page === p
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "hover:bg-white border border-transparent hover:border-slate-200 text-slate-600"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white border border-transparent hover:border-slate-200 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* VIEW MODAL */}
      {selectedBooking && (
        <ViewBookingModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
};

export default ManageBookings;
