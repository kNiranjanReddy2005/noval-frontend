import { useMemo, useState } from "react";
import { BarChart3, ClipboardCheck, FileCheck2, Filter, Search } from "lucide-react";

const exams = [
  {
    id: "EXM-101",
    subject: "Mathematics",
    department: "B.Sc Nursing",
    examDate: "2026-05-10",
    hallNumber: "Hall A-101",
    status: "Upcoming",
    attendancePercentage: 0,
    resultPublished: false,
    passPercentage: 0,
  },
  {
    id: "EXM-102",
    subject: "Physics",
    department: "GNM",
    examDate: "2026-05-12",
    hallNumber: "Hall B-204",
    status: "Upcoming",
    attendancePercentage: 0,
    resultPublished: false,
    passPercentage: 0,
  },
  {
    id: "EXM-103",
    subject: "Chemistry",
    department: "B.Pharm Allied",
    examDate: "2026-05-15",
    hallNumber: "Hall C-112",
    status: "Completed",
    attendancePercentage: 95,
    resultPublished: true,
    passPercentage: 89,
  },
  {
    id: "EXM-104",
    subject: "Biology",
    department: "Post Basic B.Sc",
    examDate: "2026-05-18",
    hallNumber: "Hall D-118",
    status: "Upcoming",
    attendancePercentage: 0,
    resultPublished: false,
    passPercentage: 0,
  },
  {
    id: "EXM-105",
    subject: "Community Health",
    department: "B.Sc Nursing",
    examDate: "2026-05-20",
    hallNumber: "Hall A-303",
    status: "Completed",
    attendancePercentage: 93,
    resultPublished: true,
    passPercentage: 91,
  },
];

const statusOptions = ["All Status", ...Array.from(new Set(exams.map((exam) => exam.status)))];
const departmentOptions = ["All Departments", ...Array.from(new Set(exams.map((exam) => exam.department)))];

function formatDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStatusClasses(status) {
  if (status === "Completed") {
    return "bg-green-100 text-green-700";
  }

  return "bg-yellow-100 text-yellow-700";
}

function SmallCard({ title, value, note }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition duration-200 hover:-translate-y-1 hover:shadow-md">
      <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      <p className="mt-2 text-3xl font-bold text-blue-700">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{note}</p>
    </div>
  );
}

export default function ExamDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");

  const filteredExams = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return exams.filter((exam) => {
      const matchesSearch =
        query.length === 0 ||
        exam.subject.toLowerCase().includes(query) ||
        exam.department.toLowerCase().includes(query) ||
        exam.hallNumber.toLowerCase().includes(query) ||
        exam.id.toLowerCase().includes(query);

      const matchesStatus =
        selectedStatus === "All Status" || exam.status === selectedStatus;

      const matchesDepartment =
        selectedDepartment === "All Departments" ||
        exam.department === selectedDepartment;

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [searchTerm, selectedStatus, selectedDepartment]);

  const analytics = useMemo(() => {
    const completedExams = exams.filter((exam) => exam.status === "Completed");
    const averagePassPercentage = completedExams.length
      ? Math.round(
          completedExams.reduce((sum, exam) => sum + exam.passPercentage, 0) /
            completedExams.length
        )
      : 0;

    const averageAttendancePercentage = completedExams.length
      ? Math.round(
          completedExams.reduce((sum, exam) => sum + exam.attendancePercentage, 0) /
            completedExams.length
        )
      : 0;

    const publishedResults = exams.filter((exam) => exam.resultPublished).length;

    return {
      totalExams: exams.length,
      upcomingExams: exams.filter((exam) => exam.status === "Upcoming").length,
      completedExams: exams.filter((exam) => exam.status === "Completed").length,
      passPercentage: `${averagePassPercentage}%`,
      attendancePercentage: `${averageAttendancePercentage}%`,
      resultPublicationStatus: `${publishedResults}/${exams.length}`,
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                 Exam Dashboard
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                exam management dashboard.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="relative min-w-0 sm:min-w-[280px]">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search subject, hall, code..."
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </label>

              <div className="rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
                <p className="text-sm font-semibold text-slate-900">Admin</p>
                <p className="text-xs text-slate-500">Exam Office</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <SmallCard
            title="Total Exams"
            value={analytics.totalExams}
            note="Total exam records"
          />
          <SmallCard
            title="Upcoming"
            value={analytics.upcomingExams}
            note="Scheduled upcoming exams"
          />
          <SmallCard
            title="Completed"
            value={analytics.completedExams}
            note="Completed exam records"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <BarChart3 size={20} />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">Pass Percentage</p>
                <p className="text-xs text-slate-500">Overall completed exams</p>
              </div>
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-900">{analytics.passPercentage}</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <ClipboardCheck size={20} />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">Attendance Percentage</p>
                <p className="text-xs text-slate-500">Exam attendance performance</p>
              </div>
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-900">{analytics.attendancePercentage}</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <FileCheck2 size={20} />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">Result Publication Status</p>
                <p className="text-xs text-slate-500">Published result records</p>
              </div>
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-900">{analytics.resultPublicationStatus}</p>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Advanced Exam Management Table</h2>
              <p className="mt-2 text-sm text-slate-600">
                Subject, department, exam date, hall number, status, search, filter, and hover effects.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap">
              <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <Filter size={16} />
                <select
                  value={selectedDepartment}
                  onChange={(event) => setSelectedDepartment(event.target.value)}
                  className="w-full bg-transparent outline-none"
                >
                  {departmentOptions.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={selectedStatus}
                onChange={(event) => setSelectedStatus(event.target.value)}
                className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 hidden overflow-x-auto lg:block">
            <table className="min-w-full border-separate border-spacing-y-3">
              <thead>
                <tr>
                  {["Subject", "Department", "Exam Date", "Hall Number", "Status"].map((heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.22em] text-slate-500"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredExams.map((exam) => (
                  <tr key={exam.id} className="group transition duration-200 hover:-translate-y-0.5">
                    <td className="rounded-l-2xl bg-slate-50 px-4 py-4 ring-1 ring-slate-200 transition duration-200 group-hover:bg-white group-hover:shadow-md">
                      <p className="font-semibold text-slate-900">{exam.subject}</p>
                      <p className="mt-1 text-xs text-slate-500">{exam.id}</p>
                    </td>
                    <td className="bg-slate-50 px-4 py-4 text-sm text-slate-700 ring-y-1 ring-slate-200 transition duration-200 group-hover:bg-white">
                      {exam.department}
                    </td>
                    <td className="bg-slate-50 px-4 py-4 text-sm text-slate-700 ring-y-1 ring-slate-200 transition duration-200 group-hover:bg-white">
                      {formatDate(exam.examDate)}
                    </td>
                    <td className="bg-slate-50 px-4 py-4 text-sm text-slate-700 ring-y-1 ring-slate-200 transition duration-200 group-hover:bg-white">
                      {exam.hallNumber}
                    </td>
                    <td className="rounded-r-2xl bg-slate-50 px-4 py-4 ring-1 ring-slate-200 transition duration-200 group-hover:bg-white">
                      <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getStatusClasses(exam.status)}`}>
                        {exam.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid gap-4 lg:hidden">
            {filteredExams.map((exam) => (
              <div
                key={exam.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition duration-200 hover:-translate-y-1 hover:bg-white hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900">{exam.subject}</h3>
                    <p className="mt-1 text-xs text-slate-500">{exam.id}</p>
                  </div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getStatusClasses(exam.status)}`}>
                    {exam.status}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Department</p>
                    <p className="mt-1 text-sm text-slate-700">{exam.department}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Exam Date</p>
                    <p className="mt-1 text-sm text-slate-700">{formatDate(exam.examDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Hall Number</p>
                    <p className="mt-1 text-sm text-slate-700">{exam.hallNumber}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredExams.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
              <p className="text-lg font-semibold text-slate-900">No exams found</p>
              <p className="mt-2 text-sm text-slate-600">
                Try changing the search or filter options.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
