import axios from "axios";
import {
  BookOpen,
  Building2,
  Calendar,
  CreditCard,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Search,
  TrendingUp,
  User,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

/* ─── helpers ─── */
const fmt = (n) => Number(n || 0).toLocaleString("en-BD");
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const statusCfg = {
  pending: {
    label: "Pending",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-400",
    pill: "bg-amber-400/10 text-amber-600 ring-1 ring-amber-300/60",
  },
  approved: {
    label: "Approved",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    pill: "bg-emerald-400/10 text-emerald-700 ring-1 ring-emerald-300/60",
  },
  rejected: {
    label: "Rejected",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-400",
    pill: "bg-red-400/10 text-red-600 ring-1 ring-red-300/60",
  },
};

const StatusPill = ({ status }) => {
  const c = statusCfg[status] || {
    label: status || "Unknown",
    pill: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
    dot: "bg-slate-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide ${c.pill}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
};

/* ─── tiny stat chip ─── */
const Chip = ({ icon: Icon, label, value, accent }) => (
  <div
    className={`flex items-center gap-2 px-3 py-2 rounded-xl ${accent} bg-opacity-60`}
  >
    <Icon size={13} className="shrink-0 opacity-70" />
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-wider opacity-60 leading-none">
        {label}
      </p>
      <p className="text-sm font-bold mt-0.5 leading-none truncate">{value}</p>
    </div>
  </div>
);

/* ════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════ */
export default function SalesMyBookings() {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [detail, setDetail] = useState(null); // booking for detail modal
  const [page, setPage] = useState(1);
  const perPage = 6;

  /* fetch */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_API_URL}/sales/my-bookings`,
          { headers },
        );
        setBookings(data?.bookings || []);
      } catch (e) {
        toast.error(e?.response?.data?.message || "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* filter */
  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const q = search.toLowerCase();
      const name = b.generalInformation?.fullNameEn?.toLowerCase() || "";
      const email = b.generalInformation?.email?.toLowerCase() || "";
      const phone = b.generalInformation?.mobile1?.toLowerCase() || "";
      const clientId = b.paymentSchedule?.clientId?.toLowerCase() || "";
      const matchSearch =
        !q ||
        name.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        clientId.includes(q);
      const matchStatus = statusFilter === "all" || b.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [bookings, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page]);

  // reset page on filter/search change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  /* counts */
  const counts = useMemo(() => {
    const c = { all: bookings.length, pending: 0, approved: 0, rejected: 0 };
    bookings.forEach((b) => {
      if (c[b.status] !== undefined) c[b.status]++;
    });
    return c;
  }, [bookings]);

  const totalRevenue = useMemo(
    () =>
      bookings.reduce((s, b) => s + (b.paymentSchedule?.totalPrice || 0), 0),
    [bookings],
  );

  const tabs = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        .bookings-root { font-family: 'Sora', sans-serif; }
        .mono { font-family: 'JetBrains Mono', monospace; }
        @keyframes slideUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity:0; } to { opacity:1; }
        }
        @keyframes modalIn {
          from { opacity:0; transform:scale(.95) translateY(12px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
        .card-enter { animation: slideUp .35s cubic-bezier(.22,1,.36,1) both; }
        .modal-enter { animation: modalIn .25s cubic-bezier(.34,1.56,.64,1) both; }
      `}</style>

      <div className="bookings-root min-h-screen bg-[#f4f6fb] p-4 md:p-6 space-y-6">
        {/* ── TOP SUMMARY ── */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            My Bookings
          </h1>
          <p className="text-sm text-slate-400 font-medium">
            {bookings.length} booking{bookings.length !== 1 ? "s" : ""} assigned
            to you
          </p>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: "Total Bookings",
              value: bookings.length,
              icon: BookOpen,
              bg: "bg-indigo-600",
              textColor: "text-white",
            },
            {
              label: "Pending",
              value: counts.pending,
              icon: Calendar,
              bg: "bg-amber-400",
              textColor: "text-white",
            },
            {
              label: "Approved",
              value: counts.approved,
              icon: Users,
              bg: "bg-emerald-500",
              textColor: "text-white",
            },
            {
              label: "Total Value",
              value: `৳${fmt(totalRevenue)}`,
              icon: CreditCard,
              bg: "bg-slate-800",
              textColor: "text-white",
            },
          ].map((s, i) => (
            <div
              key={i}
              className={`${s.bg} ${s.textColor} rounded-2xl p-4 flex items-center gap-3 shadow-sm`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <s.icon size={17} />
              </div>
              <div>
                <p className="text-xs font-semibold opacity-75 leading-none">
                  {s.label}
                </p>
                <p className="text-xl font-extrabold mt-1 leading-none">
                  {s.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── FILTERS ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-52">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, email, client ID…"
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Status tabs */}
          <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setStatusFilter(t.key)}
                className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === t.key
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t.label}
                <span
                  className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    statusFilter === t.key
                      ? "bg-indigo-100 text-indigo-600"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {counts[t.key] ?? 0}
                </span>
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-400 font-semibold ml-auto">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* ── CONTENT ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-64 gap-3">
            <Loader2 size={30} className="animate-spin text-indigo-500" />
            <p className="text-sm text-slate-400 font-medium">
              Loading your bookings…
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-64 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 gap-3">
            <BookOpen size={36} className="opacity-30" />
            <p className="text-sm font-semibold">No bookings found</p>
            <p className="text-xs">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginated.map((b, idx) => {
              const gi = b.generalInformation;
              const ps = b.paymentSchedule;
              const sc = statusCfg[b.status] || {};
              return (
                <div
                  key={b._id}
                  className="card-enter bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-200 flex flex-col overflow-hidden"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* Card top accent bar */}
                  <div className={`h-1 w-full ${sc.dot || "bg-slate-300"}`} />

                  <div className="p-5 flex flex-col gap-4 flex-1">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        {gi?.applicantPhoto?.url ? (
                          <img
                            src={gi.applicantPhoto.url}
                            alt={gi.fullNameEn}
                            className="w-11 h-11 rounded-xl object-cover border border-slate-100 shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-base font-extrabold shrink-0">
                            {gi?.fullNameEn?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 text-sm truncate leading-tight">
                            {gi?.fullNameEn || "N/A"}
                          </p>
                          <p className="text-xs text-slate-400 font-medium mt-0.5 truncate">
                            {gi?.fullNameBn || ""}
                          </p>
                        </div>
                      </div>
                      <StatusPill status={b.status} />
                    </div>

                    {/* Client ID */}
                    <div className="flex items-center gap-2">
                      <span className="mono text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                        {ps?.clientId || "—"}
                      </span>
                    </div>

                    {/* Contact info */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Phone size={11} className="text-slate-400 shrink-0" />
                        <span className="font-medium">
                          {gi?.mobile1 || "—"}
                        </span>
                        {gi?.mobile2 && gi.mobile2 !== gi.mobile1 && (
                          <span className="text-slate-300">·</span>
                        )}
                        {gi?.mobile2 && gi.mobile2 !== gi.mobile1 && (
                          <span className="font-medium">{gi.mobile2}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Mail size={11} className="text-slate-400 shrink-0" />
                        <span className="font-medium truncate">
                          {gi?.email || "—"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <MapPin size={11} className="text-slate-400 shrink-0" />
                        <span className="font-medium truncate">
                          {gi?.presentAddress || "—"}
                        </span>
                      </div>
                    </div>

                    {/* Payment summary chips */}
                    <div className="grid grid-cols-3 gap-2">
                      <Chip
                        icon={TrendingUp}
                        label="Shares"
                        value={ps?.numberOfShare ?? "—"}
                        accent="bg-indigo-50 text-indigo-700"
                      />
                      <Chip
                        icon={CreditCard}
                        label="Per Share"
                        value={`৳${fmt(ps?.sharePrice)}`}
                        accent="bg-slate-50 text-slate-700"
                      />
                      <Chip
                        icon={CreditCard}
                        label="Total"
                        value={`৳${fmt(ps?.totalPrice)}`}
                        accent="bg-emerald-50 text-emerald-700"
                      />
                    </div>

                    {/* Profession + Date */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Building2 size={11} />
                        <span className="font-medium">
                          {gi?.profession || "—"}
                          {gi?.designation ? ` · ${gi.designation}` : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Calendar size={10} />
                        <span>{fmtDate(b.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer CTA */}
                  <div className="px-5 pb-5">
                    <button
                      onClick={() => setDetail(b)}
                      className="cursor-pointer w-full py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200"
                    >
                      <FileText size={13} />
                      View Full Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── PAGINATION ── */}
        {!loading && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4">
            {/* Info */}
            <p className="text-xs text-slate-400 font-semibold order-2 sm:order-1">
              Showing{" "}
              <span className="text-slate-600 font-bold">
                {(page - 1) * perPage + 1}–
                {Math.min(page * perPage, filtered.length)}
              </span>{" "}
              of{" "}
              <span className="text-slate-600 font-bold">
                {filtered.length}
              </span>{" "}
              bookings
            </p>

            {/* Page buttons */}
            <div className="flex items-center gap-1.5 order-1 sm:order-2">
              {/* Prev */}
              <button
                disabled={page === 1}
                onClick={() => {
                  setPage((p) => p - 1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                ← Prev
              </button>

              {/* Page numbers — smart windowing */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    if (totalPages <= 5) return true;
                    if (p === 1 || p === totalPages) return true;
                    return Math.abs(p - page) <= 1;
                  })
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) {
                      acc.push("...");
                    }
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === "..." ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="px-1 text-slate-300 text-xs font-bold select-none"
                      >
                        ···
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => {
                          setPage(item);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className={`cursor-pointer w-9 h-9 rounded-xl text-xs font-extrabold transition-all ${
                          page === item
                            ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                            : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                        }`}
                      >
                        {item}
                      </button>
                    ),
                  )}
              </div>

              {/* Next */}
              <button
                disabled={page === totalPages}
                onClick={() => {
                  setPage((p) => p + 1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════
          DETAIL MODAL (portal)
      ═══════════════════════════════ */}
      {detail &&
        createPortal(
          <div
            className="bookings-root fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6"
            style={{
              background: "rgba(15,23,42,0.55)",
              backdropFilter: "blur(6px)",
            }}
            onClick={(e) => e.target === e.currentTarget && setDetail(null)}
          >
            <div className="modal-enter bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-3">
                  {detail.generalInformation?.applicantPhoto?.url ? (
                    <img
                      src={detail.generalInformation.applicantPhoto.url}
                      alt=""
                      className="w-10 h-10 rounded-xl object-cover border border-slate-100"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-extrabold">
                      {detail.generalInformation?.fullNameEn
                        ?.charAt(0)
                        ?.toUpperCase() || "?"}
                    </div>
                  )}
                  <div>
                    <h2 className="font-extrabold text-slate-800 text-base leading-tight">
                      {detail.generalInformation?.fullNameEn}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5 mono">
                      {detail.paymentSchedule?.clientId}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusPill status={detail.status} />
                  <button
                    onClick={() => setDetail(null)}
                    className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Scrollable body */}
              <div className="overflow-y-auto flex-1 p-6 space-y-6">
                {/* Payment summary */}
                <div className="bg-slate-900 rounded-2xl p-5 text-white">
                  <p className="text-xs font-bold uppercase tracking-widest opacity-50 mb-3">
                    Payment Summary
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs opacity-50 font-semibold">Shares</p>
                      <p className="text-2xl font-extrabold mt-0.5">
                        {detail.paymentSchedule?.numberOfShare}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs opacity-50 font-semibold">
                        Per Share
                      </p>
                      <p className="text-2xl font-extrabold mt-0.5">
                        ৳{fmt(detail.paymentSchedule?.sharePrice)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs opacity-50 font-semibold">Total</p>
                      <p className="text-2xl font-extrabold mt-0.5 text-emerald-400">
                        ৳{fmt(detail.paymentSchedule?.totalPrice)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Applicant info */}
                <Section title="Applicant Information" icon={User}>
                  <Grid2>
                    <Field
                      label="Full Name (EN)"
                      value={detail.generalInformation?.fullNameEn}
                    />
                    <Field
                      label="Full Name (BN)"
                      value={detail.generalInformation?.fullNameBn}
                    />
                    <Field
                      label="Father's Name"
                      value={detail.generalInformation?.fatherName}
                    />
                    <Field
                      label="Mother's Name"
                      value={detail.generalInformation?.motherName}
                    />
                    <Field
                      label="Spouse Name"
                      value={detail.generalInformation?.spouseName}
                    />
                    <Field
                      label="Nationality"
                      value={detail.generalInformation?.nationality}
                    />
                    <Field
                      label="Date of Birth"
                      value={fmtDate(detail.generalInformation?.dob)}
                    />
                    <Field
                      label="Marriage Date"
                      value={fmtDate(detail.generalInformation?.marriageDate)}
                    />
                    <Field
                      label="NID"
                      value={detail.generalInformation?.nid}
                      mono
                    />
                    <Field
                      label="TIN"
                      value={detail.generalInformation?.tin}
                      mono
                    />
                  </Grid2>
                </Section>

                {/* Contact */}
                <Section title="Contact & Address" icon={Phone}>
                  <Grid2>
                    <Field
                      label="Mobile 1"
                      value={detail.generalInformation?.mobile1}
                    />
                    <Field
                      label="Mobile 2"
                      value={detail.generalInformation?.mobile2}
                    />
                    <Field
                      label="Email"
                      value={detail.generalInformation?.email}
                    />
                    <Field
                      label="Present Address"
                      value={detail.generalInformation?.presentAddress}
                    />
                    <Field
                      label="Permanent Address"
                      value={detail.generalInformation?.permanentAddress}
                    />
                  </Grid2>
                </Section>

                {/* Profession */}
                <Section title="Professional Info" icon={Building2}>
                  <Grid2>
                    <Field
                      label="Profession"
                      value={detail.generalInformation?.profession}
                    />
                    <Field
                      label="Designation"
                      value={detail.generalInformation?.designation}
                    />
                    <Field
                      label="Organization"
                      value={detail.generalInformation?.organization}
                    />
                  </Grid2>
                </Section>

                {/* Nominee */}
                <Section title="Nominee Information" icon={Users}>
                  <div className="flex items-center gap-3 mb-4">
                    {detail.nomineeInformation?.nomineePhoto?.url && (
                      <img
                        src={detail.nomineeInformation.nomineePhoto.url}
                        alt="Nominee"
                        className="w-12 h-12 rounded-xl object-cover border border-slate-100"
                      />
                    )}
                    <div>
                      <p className="font-bold text-slate-700 text-sm">
                        {detail.nomineeInformation?.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {detail.nomineeInformation?.relation}
                      </p>
                    </div>
                  </div>
                  <Grid2>
                    <Field
                      label="Address"
                      value={detail.nomineeInformation?.address}
                    />
                    <Field
                      label="NID"
                      value={detail.nomineeInformation?.nid}
                      mono
                    />
                    <Field
                      label="Date of Birth"
                      value={fmtDate(detail.nomineeInformation?.dob)}
                    />
                    <Field
                      label="Mobile 1"
                      value={detail.nomineeInformation?.mobile1}
                    />
                    <Field
                      label="Mobile 2"
                      value={detail.nomineeInformation?.mobile2}
                    />
                  </Grid2>
                </Section>

                {/* Dates */}
                <Section title="Booking Timeline" icon={Calendar}>
                  <Grid2>
                    <Field
                      label="Booked On"
                      value={fmtDate(detail.createdAt)}
                    />
                    <Field
                      label="Last Updated"
                      value={fmtDate(detail.updatedAt)}
                    />
                  </Grid2>
                </Section>

                {/* Documents */}
                {detail.generalInformation?.agreementPdf?.url && (
                  <Section title="Documents" icon={FileText}>
                    <a
                      href={detail.generalInformation.agreementPdf.url}
                      target="_blank"
                      rel="noreferrer"
                      className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-bold rounded-xl transition-all"
                    >
                      <FileText size={14} /> View Agreement PDF
                    </a>
                  </Section>
                )}
              </div>

              {/* Modal footer */}
              <div className="px-6 py-4 border-t border-slate-100 flex justify-end shrink-0">
                <button
                  onClick={() => setDetail(null)}
                  className="cursor-pointer px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

/* ── tiny shared layout components ── */
const Section = ({ title, icon: Icon, children }) => (
  <div>
    <div className="flex items-center gap-2 mb-3">
      <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center">
        <Icon size={13} className="text-indigo-500" />
      </div>
      <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">
        {title}
      </h3>
    </div>
    {children}
  </div>
);

const Grid2 = ({ children }) => (
  <div className="grid grid-cols-2 gap-x-6 gap-y-3">{children}</div>
);

const Field = ({ label, value, mono }) => (
  <div>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">
      {label}
    </p>
    <p
      className={`text-sm font-semibold text-slate-700 mt-1 leading-snug ${mono ? "font-mono text-xs" : ""}`}
    >
      {value || "—"}
    </p>
  </div>
);
