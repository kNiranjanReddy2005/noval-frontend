import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpDown,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Funnel,
  Search,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";
import { apiRequest, downloadFile } from "../config/api";

const statusOptions = ["All", "Pending", "Approved"];
const sortOptions = [
  { value: "latest", label: "Latest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "name-asc", label: "Name A-Z" },
  { value: "course-asc", label: "Course A-Z" },
];

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

const Students = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("latest");
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [sourceLabel, setSourceLabel] = useState("database");

  const fetchRecords = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await apiRequest("/api/admission/records");
      setRecords(response.records || []);
      setSourceLabel(response.source || "database");
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchRecords();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const filteredRecords = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const nextRecords = records.filter((record) => {
      const matchesStatus =
        statusFilter === "All" ? true : record.status === statusFilter;
      const matchesSearch = normalizedSearch
        ? [record.studentName, record.email, record.phone, record.course, record.applicationId]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(normalizedSearch))
        : true;

      return matchesStatus && matchesSearch;
    });

    nextRecords.sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.submittedAt) - new Date(b.submittedAt);
      }
      if (sortBy === "name-asc") {
        return a.studentName.localeCompare(b.studentName);
      }
      if (sortBy === "course-asc") {
        return a.course.localeCompare(b.course);
      }

      return new Date(b.submittedAt) - new Date(a.submittedAt);
    });

    return nextRecords;
  }, [records, searchTerm, statusFilter, sortBy]);

  const summary = useMemo(() => {
    const totalAdmissions = records.length;
    const pendingApplications = records.filter((record) => record.status === "Pending").length;
    const approvedAdmissions = records.filter((record) => record.status === "Approved").length;

    return {
      totalAdmissions,
      pendingApplications,
      approvedAdmissions,
    };
  }, [records]);

  const updateStatus = async (id, status) => {
    try {
      const response = await apiRequest(`/api/admission/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      setRecords((current) =>
        current.map((record) => (record._id === id ? response.record : record))
      );
    } catch (updateError) {
      setError(updateError.message);
    }
  };

  const handleExcelDownload = async () => {
    setDownloadLoading(true);
    setError("");

    try {
      await downloadFile("/api/admission/export/xlsx", "admissions-export.xls");
    } catch (downloadError) {
      setError(downloadError.message);
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <section className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_28%),linear-gradient(180deg,#eff6ff_0%,#f8fafc_48%,#e5e7eb_100%)] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] md:p-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">
                Admin Dashboard
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Course admission management system
              </h1>
              <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                Review live admission records, search applicants, filter by approval
                stage, and keep downloadable Excel records aligned with Google
                Sheets integration.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={fetchRecords}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Refresh Records
              </button>
              <button
                type="button"
                onClick={handleExcelDownload}
                disabled={downloadLoading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#1d4ed8_0%,#0f172a_100%)] px-5 py-3 text-sm font-semibold text-white transition hover:shadow-lg"
              >
                <Download size={16} />
                {downloadLoading ? "Downloading Excel..." : "Download Excel"}
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-[28px] border border-blue-100 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                    Total Admissions
                  </p>
                  <p className="mt-3 text-4xl font-black text-slate-900">
                    {summary.totalAdmissions}
                  </p>
                </div>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                  <UsersRound size={22} />
                </span>
              </div>
            </div>

            <div className="rounded-[28px] border border-amber-100 bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_100%)] p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                    Pending Applications
                  </p>
                  <p className="mt-3 text-4xl font-black text-slate-900">
                    {summary.pendingApplications}
                  </p>
                </div>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                  <Funnel size={22} />
                </span>
              </div>
            </div>

            <div className="rounded-[28px] border border-emerald-100 bg-[linear-gradient(135deg,#ecfdf5_0%,#ffffff_100%)] p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                    Approved Admissions
                  </p>
                  <p className="mt-3 text-4xl font-black text-slate-900">
                    {summary.approvedAdmissions}
                  </p>
                </div>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <CheckCircle2 size={22} />
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.45fr)_minmax(0,0.45fr)]">
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Search size={18} className="text-slate-400" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by name, course, phone, email, or application ID"
                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <Funnel size={18} className="text-slate-400" />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full bg-transparent outline-none"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <ArrowUpDown size={18} className="text-slate-400" />
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="w-full bg-transparent outline-none"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Admission Records</h2>
              <p className="mt-1 text-sm text-slate-500">
                Showing {filteredRecords.length} record{filteredRecords.length === 1 ? "" : "s"}.
                Data source: {sourceLabel}.
              </p>
            </div>

            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
              <FileSpreadsheet size={16} />
              Google Sheets Ready
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[860px] text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">Submitted</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-16 text-center text-slate-500">
                      Loading admission records...
                    </td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-16 text-center text-slate-500">
                      No admission records match the current search or filters.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr key={record._id} className="transition hover:bg-slate-50">
                      <td className="px-6 py-5">
                        <button
                          type="button"
                          onClick={() => setSelectedProfile(record)}
                          className="group flex items-center gap-4 rounded-2xl px-2 py-2 text-left transition hover:bg-slate-100"
                        >
                          {record.photoUrl ? (
                            <img
                              src={record.photoUrl}
                              alt={record.studentName}
                              className="h-12 w-12 rounded-2xl object-cover shadow-sm ring-2 ring-transparent transition group-hover:ring-blue-200"
                            />
                          ) : (
                            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition group-hover:bg-blue-50 group-hover:text-blue-700">
                              <UsersRound size={20} />
                            </span>
                          )}
                          <div>
                            <p className="font-semibold text-slate-900 group-hover:text-blue-700">{record.studentName}</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">
                              {record.applicationId || "No ID"}
                            </p>
                            <p className="mt-1 text-xs font-medium text-blue-600 opacity-0 transition group-hover:opacity-100">
                              View student profile
                            </p>
                          </div>
                        </button>
                      </td>
                      <td className="px-6 py-5 text-slate-600">
                        <p>{record.email || "-"}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-400">
                          {record.phone || "-"}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-medium text-slate-800">{record.course || "-"}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-400">
                          {record.gender || "-"}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-slate-600">{formatDate(record.submittedAt)}</td>
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            record.status === "Approved"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <button
                          type="button"
                          onClick={() =>
                            updateStatus(
                              record._id,
                              record.status === "Approved" ? "Pending" : "Approved"
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          <UserRoundCheck size={16} />
                          {record.status === "Approved" ? "Mark Pending" : "Approve"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selectedProfile && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/45 p-3 backdrop-blur-sm sm:p-4">
            <div className="flex min-h-full items-start justify-center py-4 sm:items-center">
              <div className="w-full max-w-3xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_32px_120px_rgba(15,23,42,0.2)]">
              <div className="flex flex-col gap-4 border-b border-slate-200 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
                <div className="flex min-w-0 items-center gap-4">
                  {selectedProfile.photoUrl ? (
                    <img
                      src={selectedProfile.photoUrl}
                      alt={selectedProfile.studentName}
                      className="h-14 w-14 rounded-3xl object-cover shadow-sm sm:h-16 sm:w-16"
                    />
                  ) : (
                    <span className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100 text-slate-500 sm:h-16 sm:w-16">
                      <UsersRound size={28} />
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Student Profile</p>
                    <h3 className="mt-2 break-words text-xl font-black text-slate-900 sm:text-2xl">{selectedProfile.studentName || "-"}</h3>
                    <p className="mt-1 break-words text-sm text-slate-500">
                      {selectedProfile.applicationId || "No application ID"} • {selectedProfile.status}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedProfile(null)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:w-auto"
                >
                  Close
                </button>
              </div>

              <div className="grid max-h-[calc(100vh-12rem)] gap-6 overflow-y-auto px-5 py-5 md:grid-cols-2 md:px-6 md:py-6">
                <div className="space-y-4 rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Contact</p>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Email</p>
                    <p className="mt-1 font-semibold text-slate-900">{selectedProfile.email || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Phone</p>
                    <p className="mt-1 font-semibold text-slate-900">{selectedProfile.phone || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Address</p>
                    <p className="mt-1 font-semibold text-slate-900">{selectedProfile.address || "-"}</p>
                  </div>
                </div>

                <div className="space-y-4 rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Academic</p>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Course</p>
                    <p className="mt-1 font-semibold text-slate-900">{selectedProfile.course || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Department</p>
                    <p className="mt-1 font-semibold text-slate-900">{selectedProfile.department || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Submitted</p>
                    <p className="mt-1 font-semibold text-slate-900">{formatDate(selectedProfile.submittedAt)}</p>
                  </div>
                </div>

                <div className="space-y-4 rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Personal</p>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Gender</p>
                    <p className="mt-1 font-semibold text-slate-900">{selectedProfile.gender || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Date of Birth</p>
                    <p className="mt-1 font-semibold text-slate-900">{selectedProfile.dob || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Caste Category</p>
                    <p className="mt-1 font-semibold text-slate-900">{selectedProfile.casteCategory || "-"}</p>
                  </div>
                </div>

                <div className="space-y-4 rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Application</p>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Application ID</p>
                    <p className="mt-1 font-semibold text-slate-900">{selectedProfile.applicationId || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Status</p>
                    <p className="mt-1 font-semibold text-slate-900">{selectedProfile.status || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Sync Status</p>
                    <p className="mt-1 font-semibold text-slate-900">{selectedProfile.syncStatus || "-"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </section>
  );
};

export default Students;
