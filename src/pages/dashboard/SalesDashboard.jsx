import axios from "axios";
import {
  Activity,
  BadgeCheck,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Clock,
  Loader2,
  RefreshCcw,
  TrendingUp,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

const statusConfig = {
  pending: {
    label: "Pending",
    color: "bg-amber-50 text-amber-700 border border-amber-200",
    dot: "bg-amber-400",
    icon: Clock,
  },
  contacted: {
    label: "Contacted",
    color: "bg-sky-50 text-sky-700 border border-sky-200",
    dot: "bg-sky-400",
    icon: UserCheck,
  },
  in_progress: {
    label: "In Progress",
    color: "bg-violet-50 text-violet-700 border border-violet-200",
    dot: "bg-violet-400",
    icon: Activity,
  },
  completed: {
    label: "Completed",
    color: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-50 text-red-700 border border-red-200",
    dot: "bg-red-400",
    icon: XCircle,
  },
  assigned: {
    label: "Assigned",
    color: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    dot: "bg-indigo-400",
    icon: Briefcase,
  },
};

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

const StatCard = ({ title, value, icon: Icon, accent, sub }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-all duration-200">
    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${accent}`}
    >
      <Icon size={21} />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
        {title}
      </p>
      <p className="text-2xl font-extrabold text-slate-800 leading-tight mt-0.5">
        {value ?? "—"}
      </p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const SalesDashboard = () => {
  const token = localStorage.getItem("token");
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const [stats, setStats] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [recentClients, setRecentClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, perfRes, clientsRes] = await Promise.all([
        axios.get(
          `${import.meta.env.VITE_BACKEND_API_URL}/sales/dashboard`,
          authHeaders,
        ),
        axios.get(
          `${import.meta.env.VITE_BACKEND_API_URL}/sales/performance`,
          authHeaders,
        ),
        axios.get(
          `${import.meta.env.VITE_BACKEND_API_URL}/sales/clients`,
          authHeaders,
        ),
      ]);
      setStats(statsRes.data.stats);
      setPerformance(perfRes.data.performance);
      setRecentClients((clientsRes.data.clients || []).slice(0, 5));
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 size={32} className="animate-spin text-indigo-500" />
        <p className="text-sm text-slate-400 font-medium">
          Loading your dashboard…
        </p>
      </div>
    );
  }

  const convRate = parseFloat(performance?.conversionRate) || 0;

  return (
    <div className="min-h-screen bg-slate-50/80 p-4 md:p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            My Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Your sales overview and performance metrics
          </p>
        </div>
        <button
          onClick={fetchAll}
          className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 transition-all shadow-sm self-start sm:self-auto"
        >
          <RefreshCcw size={15} /> Refresh
        </button>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Clients"
          value={stats?.totalClients}
          icon={Users}
          accent="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          title="Assigned"
          value={stats?.assigned}
          icon={Briefcase}
          accent="bg-sky-50 text-sky-600"
        />
        <StatCard
          title="In Progress"
          value={stats?.inProgress}
          icon={Activity}
          accent="bg-violet-50 text-violet-600"
        />
        <StatCard
          title="Completed"
          value={stats?.completed}
          icon={BadgeCheck}
          accent="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* PERFORMANCE + RECENT CLIENTS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Performance Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
              <TrendingUp size={16} className="text-teal-600" />
            </div>
            <h2 className="font-bold text-slate-800">Performance</h2>
          </div>

          {/* Conversion Rate Ring */}
          <div className="flex flex-col items-center py-4">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#f1f5f9"
                  strokeWidth="12"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - convRate / 100)}`}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-slate-800">
                  {convRate}%
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  conversion
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
              <span className="text-sm text-slate-500 font-medium">
                Total Clients
              </span>
              <span className="text-sm font-bold text-slate-800">
                {performance?.totalClients ?? "—"}
              </span>
            </div>
            <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
              <span className="text-sm text-slate-500 font-medium">
                Completed Deals
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700">
                <CheckCircle2 size={14} /> {performance?.completedDeals ?? "—"}
              </span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-sm text-slate-500 font-medium">
                Pending Deals
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-bold text-amber-700">
                <Clock size={14} /> {performance?.pendingDeals ?? "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Clients */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Users size={16} className="text-indigo-600" />
              </div>
              <h2 className="font-bold text-slate-800">Recent Clients</h2>
            </div>
            <Link
              to="/sales/my-clients"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              View all <ChevronRight size={13} />
            </Link>
          </div>

          {recentClients.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-40 gap-2 text-slate-400">
              <Users size={28} className="text-slate-300" />
              <p className="text-sm font-medium">No clients assigned yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentClients.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 hover:shadow-sm p-3.5 transition-all duration-150"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold shrink-0">
                      {item?.clientId?.fullName?.charAt(0)?.toUpperCase() ||
                        "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">
                        {item?.clientId?.fullName || "N/A"}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {item?.clientId?.phone || item?.clientId?.email || "—"}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={item?.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
