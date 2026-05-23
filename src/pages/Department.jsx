import { useEffect, useMemo, useState } from "react";
import {
  BellRing,
  BookOpen,
  Building2,
  CheckCircle2,
  CircleAlert,
  CreditCard,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  HandCoins,
  Hotel,
  IndianRupee,
  Landmark,
  Layers3,
  Library,
  LoaderCircle,
  RefreshCcw,
  ReceiptText,
  School,
  ScrollText,
  ShieldCheck,
  Soup,
  TrendingUp,
  UserCog,
  Users,
  WalletCards,
} from "lucide-react";
import { apiRequest } from "../config/api";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const filterYears = ["FY 2026-27", "FY 2025-26", "FY 2024-25"];
const filterViews = ["All Departments", "Academic Units", "Hostel & Common"];
const departmentPrograms = [
  {
    title: "Sabarmati College of Nursing",
    shortCode: "SCN",
    items: ["B.Sc Nursing (B.Sc N)", "M.Sc Nursing (M.Sc N)", "P.B.BSc Nursing"],
  },
  {
    title: "Sabarmati School of Nursing",
    shortCode: "SSN",
    items: ["ANM", "GNM"],
  },
];

const securityHighlights = [
  "Secure JWT authentication with institution-wide role mapping",
  "Dynamic sidebar and module visibility by department permission",
  "Audit logs for approvals, fee actions, hostel receipts, and access events",
  "Real-time notifications for approvals, dues, attendance, and reports",
];

const defaultBudgetForm = {
  department: "Library",
  institutionGroup: "Common Departments",
  semester: "Annual",
  yearlyBudget: "",
  carryForwardAmount: "",
  remarks: "",
};

const defaultExpenseForm = {
  department: "Library",
  category: "Software & Licensing",
  tag: "",
  semester: "Annual",
  amount: "",
  requestedBy: "Department User",
  remarks: "",
};

const defaultHostelForm = {
  studentName: "",
  registrationNo: "",
  roomNo: "",
  amount: "",
  paymentMode: "UPI",
  status: "Collected",
};

function getDefaultScopeForRole(roleKey) {
  if (roleKey === "hostel") {
    return "Hostel";
  }

  if (roleKey === "library") {
    return "Library";
  }

  if (roleKey === "hod") {
    return "B.Sc Nursing";
  }

  return "All Departments";
}

function formatCurrency(value) {
  if (typeof value !== "number") {
    return value;
  }

  return currencyFormatter.format(value);
}

function getStatusTone(status) {
  if (status === "Approved" || status === "Collected" || status === "Active") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "Pending") {
    return "bg-amber-100 text-amber-700";
  }

  if (status === "Auto Alert" || status === "Rejected" || status === "Restricted") {
    return "bg-rose-100 text-rose-700";
  }

  return "bg-slate-100 text-slate-700";
}

function getAlertTone(level) {
  if (level === "danger") {
    return "border-rose-200 bg-rose-50 text-rose-800";
  }

  if (level === "warning") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-800";
}

function buildRoleModules(dashboard, selectedYear) {
  const overview = dashboard?.overview || {};

  return {
    "super-admin": {
      label: "Super Admin",
      icon: ShieldCheck,
      accent: "from-slate-950 via-blue-950 to-cyan-900",
      badge: "Institution Root Access",
      description:
        "Full control over departments, approvals, analytics, finance, hostel operations, and master access policies.",
      permissions: [
        "Full system access",
        "Manage all departments",
        "User and permission management",
        "Approve all modules",
        "Financial management",
        "Reports and analytics",
        "Multi-department control",
      ],
      modules: [
        {
          id: "overview",
          label: "Executive Dashboard",
          description: "Institution-wide visibility across departments, approvals, and fiscal health.",
          stats: [
            { label: "Institution Budget", value: formatCurrency(overview.institutionBudget || 0) },
            { label: "Pending Approvals", value: overview.pendingApprovals || 0 },
            { label: "Active Alerts", value: overview.lowBalanceAlerts || 0 },
            { label: "Financial Year", value: selectedYear },
          ],
        },
        {
          id: "users",
          label: "Access Management",
          description: "Create department-wise users, assign roles, and govern access scopes.",
          items: [
            "Create Admin, HOD, Accounts, Staff, Hostel, Library, and Student users",
            "Assign program, department, semester, and campus permissions",
            "Enable JWT login, approval scope, and audit logging policy",
          ],
        },
        {
          id: "approvals",
          label: "Approval Authority",
          description: "Review high-priority budget and workflow items across the institution.",
          items:
            (dashboard?.approvalQueue || []).slice(0, 4).map((item) => ({
              title: item.request,
              meta: `${item.stage} • ${formatCurrency(item.amount)}`,
              note: item.remarks,
            })) || [],
        },
      ],
    },
    principal: {
      label: "Principal",
      icon: Landmark,
      accent: "from-blue-950 via-sky-900 to-cyan-800",
      badge: "Academic Authority",
      description:
        "Central academic oversight with department analytics, student reports, staff summaries, and approval visibility.",
      permissions: [
        "Institution overview dashboard",
        "Department analytics",
        "Financial summary",
        "Staff and student reports",
        "Approval authority",
        "Academic reports",
      ],
      modules: [
        {
          id: "overview",
          label: "Institution Overview",
          description: "Track academic units, performance, and budget alignment from one official dashboard.",
          stats: [
            { label: "Academic Units", value: departmentPrograms.length },
            { label: "Department Budgets", value: dashboard?.departmentBudgets?.length || 0 },
            { label: "Semester Plans", value: dashboard?.semesterAllocations?.length || 0 },
            { label: "Reports Ready", value: dashboard?.reportCards?.length || 0 },
          ],
        },
        {
          id: "reports",
          label: "Academic Reports",
          description: "Program-wise decisions supported by semester analytics and department visibility.",
          items: [
            "Department analytics by B.Sc N, M.Sc N, P.B.BSc, ANM, and GNM",
            "Staff performance, attendance, and progress review windows",
            "Student outcomes, fee status, and hostel activity summary",
          ],
        },
      ],
    },
    hod: {
      label: "HOD Access",
      icon: GraduationCap,
      accent: "from-emerald-950 via-teal-900 to-cyan-800",
      badge: "Department Command",
      description:
        "Department-wise control for B.Sc Nursing, M.Sc Nursing, P.B.BSc, ANM, and GNM with academic and budget responsibilities.",
      permissions: [
        "Student management",
        "Attendance management",
        "Department reports",
        "Budget requests",
        "Staff management",
        "Semester analytics",
      ],
      modules: [
        {
          id: "departments",
          label: "HOD Departments",
          description: "Switch between HOD-controlled nursing programs and monitor semester progress.",
          items: [
            "B.Sc Nursing HOD",
            "M.Sc Nursing HOD",
            "P.B.BSc HOD",
            "ANM HOD",
            "GNM HOD",
          ],
        },
        {
          id: "budget",
          label: "Budget Requests",
          description: "Raise annual and semester budget proposals for department operations.",
          action: "budget-form",
        },
      ],
    },
    accounts: {
      label: "Accounts",
      icon: IndianRupee,
      accent: "from-amber-950 via-orange-900 to-rose-800",
      badge: "Finance & Receipts",
      description:
        "Fee collection, dues tracking, accounting entries, payroll-linked controls, and approval workflow management.",
      permissions: [
        "Fee collection",
        "Student dues",
        "Accounting entries",
        "Payroll management",
        "Financial reports",
        "Budget approval",
        "Receipt generation",
        "Hostel fee management",
      ],
      modules: [
        {
          id: "fees",
          label: "Fee & Dues Console",
          description: "Monitor collections, dues, and receipt readiness.",
          stats: [
            { label: "Hostel Revenue", value: formatCurrency(overview.hostelRevenue || 0) },
            { label: "Outstanding", value: formatCurrency(overview.hostelOutstanding || 0) },
            { label: "Total Expenses", value: formatCurrency(overview.totalExpenses || 0) },
            { label: "Approvals", value: overview.pendingApprovals || 0 },
          ],
        },
        {
          id: "expenses",
          label: "Expense Workflow",
          description: "Submit, review, and route spending requests.",
          action: "expense-form",
        },
        {
          id: "approvals",
          label: "Budget Approval",
          description: "Approve or reject requests with audit-trail updates.",
          action: "approval-list",
        },
      ],
    },
    staff: {
      label: "Staff / Faculty",
      icon: Users,
      accent: "from-violet-950 via-fuchsia-900 to-rose-800",
      badge: "Faculty Operations",
      description:
        "Faculty-facing tools for attendance, marks, leave, timetable visibility, and student progress management.",
      permissions: [
        "Student attendance",
        "Marks entry",
        "Leave requests",
        "Timetable access",
        "Student progress reports",
        "Subject management",
      ],
      modules: [
        {
          id: "attendance",
          label: "Teaching Operations",
          description: "Keep classroom data accurate through attendance, timetable, and subject workflows.",
          items: [
            "Record attendance by batch and semester",
            "Manage marks, practicals, and internal assessment entries",
            "Track leave requests and student progress reports",
          ],
        },
      ],
    },
    hostel: {
      label: "Hostel",
      icon: Hotel,
      accent: "from-cyan-950 via-sky-900 to-blue-900",
      badge: "Residential Control",
      description:
        "Residential administration with admissions, dues, room management, meal operations, and hostel reporting.",
      permissions: [
        "Hostel admissions",
        "Hostel fee collection",
        "Hostel due tracking",
        "Room allocation",
        "Meal management",
        "Hostel reports",
      ],
      modules: [
        {
          id: "hostel-finance",
          label: "Hostel Collection Desk",
          description: "Record payments and keep hostel cash flow updated.",
          action: "hostel-form",
        },
        {
          id: "operations",
          label: "Room & Meal Control",
          description: "Coordinate room allocation, mess management, and due tracking in one place.",
          items: [
            "Room allocation by block, floor, and occupancy status",
            "Meal plan readiness and mess-service coordination",
            "Outstanding hostel due monitoring with notifications",
          ],
        },
      ],
    },
    library: {
      label: "Library",
      icon: Library,
      accent: "from-slate-900 via-slate-800 to-blue-900",
      badge: "Knowledge Services",
      description:
        "Library operations for books, issue-return workflows, fines, records, and reporting across departments.",
      permissions: [
        "Book management",
        "Issue/return books",
        "Fine collection",
        "Student library records",
        "Library reports",
      ],
      modules: [
        {
          id: "library-ops",
          label: "Library Management",
          description: "Maintain books, circulation records, and student usage insights.",
          items: [
            "Catalogue management and accession tracking",
            "Issue/return monitoring with overdue and fine alerts",
            "Program-wise reading activity and library reports",
          ],
        },
      ],
    },
    student: {
      label: "Students",
      icon: School,
      accent: "from-sky-950 via-indigo-900 to-violet-900",
      badge: "Student Self Service",
      description:
        "A secure student portal for academic, financial, hostel, and timetable access from a single login.",
      permissions: [
        "View attendance",
        "View results",
        "Fee payment",
        "Download receipts",
        "Bonafide certificate",
        "Hostel details",
        "Timetable access",
      ],
      modules: [
        {
          id: "portal",
          label: "Student Portal",
          description: "Self-service access to academic and finance documents with role-based security.",
          items: [
            "Attendance, results, and timetable visibility",
            "Fee payment, receipt downloads, and due reminders",
            "Bonafide certificate requests and hostel information",
          ],
        },
      ],
    },
  };
}

const Department = () => {
  const [selectedYear, setSelectedYear] = useState(filterYears[0]);
  const [selectedView, setSelectedView] = useState(filterViews[0]);
  const [selectedAxis, setSelectedAxis] = useState("Departments");
  const [activeRole, setActiveRole] = useState("super-admin");
  const [activeModule, setActiveModule] = useState("overview");
  const [selectedScope, setSelectedScope] = useState(getDefaultScopeForRole("super-admin"));
  const [loading, setLoading] = useState(true);
  const [savingBudget, setSavingBudget] = useState(false);
  const [savingExpense, setSavingExpense] = useState(false);
  const [savingHostel, setSavingHostel] = useState(false);
  const [approvingId, setApprovingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [budgetForm, setBudgetForm] = useState(defaultBudgetForm);
  const [expenseForm, setExpenseForm] = useState(defaultExpenseForm);
  const [hostelForm, setHostelForm] = useState(defaultHostelForm);
  const [lastReceipt, setLastReceipt] = useState(null);

  useEffect(() => {
    let ignore = false;

    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          year: selectedYear,
          view: selectedView,
          role: activeRole,
          scope: selectedScope,
        });
        const payload = await apiRequest(`/api/department-finance/dashboard?${params.toString()}`);
        if (!ignore) {
          setDashboard(payload);
        }
      } catch (loadError) {
        if (!ignore) {
          setError(loadError.message);
          setDashboard(null);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      ignore = true;
    };
  }, [activeRole, selectedScope, selectedView, selectedYear]);

  const refreshDashboard = async () => {
    const params = new URLSearchParams({
      year: selectedYear,
      view: selectedView,
      role: activeRole,
      scope: selectedScope,
    });
    const payload = await apiRequest(`/api/department-finance/dashboard?${params.toString()}`);
    setDashboard(payload);
  };

  const utilizationSummary = useMemo(() => {
    if (!dashboard?.departmentBudgets?.length) {
      return {
        totalBudget: 0,
        totalUsed: 0,
        totalRemaining: 0,
        percentage: 0,
      };
    }

    const totalBudget = dashboard.departmentBudgets.reduce((sum, item) => sum + item.approvedBudget, 0);
    const totalUsed = dashboard.departmentBudgets.reduce((sum, item) => sum + item.utilizedBudget, 0);
    const totalRemaining = dashboard.departmentBudgets.reduce((sum, item) => sum + item.remainingBudget, 0);

    return {
      totalBudget,
      totalUsed,
      totalRemaining,
      percentage: totalBudget > 0 ? Math.round((totalUsed / totalBudget) * 100) : 0,
    };
  }, [dashboard]);

  const hostelSignal = useMemo(() => {
    if (!dashboard?.overview) {
      return { collectionRate: 0, outstandingShare: 0 };
    }

    const totalHostelFlow =
      (dashboard.overview.hostelRevenue || 0) + (dashboard.overview.hostelOutstanding || 0);

    if (!totalHostelFlow) {
      return { collectionRate: 0, outstandingShare: 0 };
    }

    return {
      collectionRate: Math.round(((dashboard.overview.hostelRevenue || 0) / totalHostelFlow) * 100),
      outstandingShare: Math.round(((dashboard.overview.hostelOutstanding || 0) / totalHostelFlow) * 100),
    };
  }, [dashboard]);

  const roleModules = useMemo(
    () => buildRoleModules(dashboard, selectedYear),
    [dashboard, selectedYear]
  );

  const roleEntries = useMemo(() => Object.entries(roleModules), [roleModules]);
  const currentRole = roleModules[activeRole] || roleModules["super-admin"];
  const currentModules = currentRole?.modules || [];
  const availableScopes = dashboard?.accessControl?.availableScopes || [selectedScope];

  useEffect(() => {
    if (!currentModules.some((module) => module.id === activeModule)) {
      setActiveModule(currentModules[0]?.id || "overview");
    }
  }, [activeModule, currentModules]);

  useEffect(() => {
    if (availableScopes.length > 0 && !availableScopes.includes(selectedScope)) {
      setSelectedScope(availableScopes[0]);
    }
  }, [availableScopes, selectedScope]);

  useEffect(() => {
    if (
      selectedScope &&
      selectedScope !== "All Departments" &&
      selectedScope !== "Common Departments"
    ) {
      const scopeBudget = (dashboard?.departmentBudgets || []).find(
        (item) => item.department === selectedScope
      );
      setBudgetForm((prev) => ({ ...prev, department: selectedScope }));
      if (scopeBudget?.institutionGroup) {
        setBudgetForm((prev) => ({
          ...prev,
          department: selectedScope,
          institutionGroup: scopeBudget.institutionGroup,
        }));
      }
      setExpenseForm((prev) => ({ ...prev, department: selectedScope }));
    }
  }, [dashboard, selectedScope]);

  const currentModule = currentModules.find((module) => module.id === activeModule) || currentModules[0];
  const activePermissions =
    dashboard?.accessControl?.permissions?.length
      ? dashboard.accessControl.permissions
      : currentRole.permissions;

  const budgetStats = useMemo(() => {
    const overview = dashboard?.overview;

    return [
      { title: "Institution Budget", value: overview?.institutionBudget || 0, note: `${selectedYear} approved`, icon: WalletCards },
      { title: "Total Expenses", value: overview?.totalExpenses || 0, note: "Live synced spending", icon: IndianRupee },
      { title: "Remaining Budget", value: overview?.remainingBudget || 0, note: `${utilizationSummary.percentage}% utilized`, icon: TrendingUp },
      { title: "Hostel Revenue", value: overview?.hostelRevenue || 0, note: "Fees and mess collections", icon: Hotel },
    ];
  }, [dashboard, selectedYear, utilizationSummary.percentage]);

  const roleAccessSummary = useMemo(
    () =>
      roleEntries.map(([key, role]) => ({
        key,
        label: role.label,
        status: key === activeRole ? "Active" : "Ready",
        modules: role.modules.length,
      })),
    [activeRole, roleEntries]
  );

  const handleRoleSwitch = (roleKey) => {
    setActiveRole(roleKey);
    setActiveModule(roleModules[roleKey]?.modules?.[0]?.id || "overview");
    setSelectedScope(getDefaultScopeForRole(roleKey));
  };

  const handleBudgetSubmit = async () => {
    try {
      setSavingBudget(true);
      setError("");
      setSuccess("");

      await apiRequest("/api/department-finance/budgets", {
        method: "POST",
        body: JSON.stringify({
          ...budgetForm,
          financialYear: selectedYear,
          academicYear: "2026-27",
          yearlyBudget: Number(budgetForm.yearlyBudget || 0),
          approvedBudget: Number(budgetForm.yearlyBudget || 0),
          semesterBudget: Number(budgetForm.yearlyBudget || 0),
          carryForwardAmount: Number(budgetForm.carryForwardAmount || 0),
          pendingBudget: 0,
          utilizedBudget: 0,
        }),
      });

      setBudgetForm(defaultBudgetForm);
      setSuccess("Department budget saved successfully.");
      await refreshDashboard();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSavingBudget(false);
    }
  };

  const handleExpenseSubmit = async () => {
    try {
      setSavingExpense(true);
      setError("");
      setSuccess("");

      await apiRequest("/api/department-finance/expenses", {
        method: "POST",
        body: JSON.stringify({
          ...expenseForm,
          amount: Number(expenseForm.amount || 0),
        }),
      });

      setExpenseForm(defaultExpenseForm);
      setSuccess("Expense request submitted into the approval workflow.");
      await refreshDashboard();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSavingExpense(false);
    }
  };

  const handleApproval = async (expenseId, status) => {
    try {
      setApprovingId(`${expenseId}:${status}`);
      setError("");
      setSuccess("");

      await apiRequest(`/api/department-finance/approvals/${expenseId}`, {
        method: "PATCH",
        body: JSON.stringify({
          status,
          actor: "Finance Approver",
          remarks:
            status === "Approved"
              ? "Approved through Department Access dashboard"
              : "Rejected after budget and compliance review",
        }),
      });

      setSuccess(`Expense request ${status.toLowerCase()} successfully.`);
      await refreshDashboard();
    } catch (approvalError) {
      setError(approvalError.message);
    } finally {
      setApprovingId("");
    }
  };

  const handleHostelSubmit = async () => {
    try {
      setSavingHostel(true);
      setError("");
      setSuccess("");

      const payload = await apiRequest("/api/department-finance/hostel-payments", {
        method: "POST",
        body: JSON.stringify({
          ...hostelForm,
          amount: Number(hostelForm.amount || 0),
        }),
      });

      setLastReceipt(payload.receipt);
      setHostelForm(defaultHostelForm);
      setSuccess("Hostel payment recorded and receipt generated.");
      await refreshDashboard();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSavingHostel(false);
    }
  };

  const renderBudgetForm = () => (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Department Budget Request</h3>
          <p className="text-sm text-slate-500">
            Create secure, department-wise annual or semester budget requests.
          </p>
        </div>
        <WalletCards className="text-slate-700" size={22} />
      </div>

      <div className="mt-5 grid gap-3">
        {[
          ["department", "Department"],
          ["institutionGroup", "Institution Group"],
          ["semester", "Semester"],
        ].map(([key, label]) => (
          <input
            key={key}
            value={budgetForm[key]}
            onChange={(event) => setBudgetForm((prev) => ({ ...prev, [key]: event.target.value }))}
            className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
            placeholder={label}
          />
        ))}
        <input
          type="number"
          value={budgetForm.yearlyBudget}
          onChange={(event) => setBudgetForm((prev) => ({ ...prev, yearlyBudget: event.target.value }))}
          className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
          placeholder="Yearly budget"
        />
        <input
          type="number"
          value={budgetForm.carryForwardAmount}
          onChange={(event) => setBudgetForm((prev) => ({ ...prev, carryForwardAmount: event.target.value }))}
          className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
          placeholder="Carry-forward amount"
        />
        <textarea
          rows="3"
          value={budgetForm.remarks}
          onChange={(event) => setBudgetForm((prev) => ({ ...prev, remarks: event.target.value }))}
          className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
          placeholder="Remarks"
        />
        <button
          type="button"
          onClick={handleBudgetSubmit}
          disabled={savingBudget}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {savingBudget ? "Saving..." : "Save Budget"}
        </button>
      </div>
    </div>
  );

  const renderExpenseForm = () => (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Expense Workflow Access</h3>
          <p className="text-sm text-slate-500">
            Submit controlled expense requests with audit-ready remarks and approval routing.
          </p>
        </div>
        <HandCoins className="text-slate-700" size={22} />
      </div>

      <div className="mt-5 grid gap-3">
        {[
          ["department", "Department"],
          ["category", "Category"],
          ["tag", "Expense tag"],
          ["semester", "Semester"],
          ["requestedBy", "Requested by"],
        ].map(([key, label]) => (
          <input
            key={key}
            value={expenseForm[key]}
            onChange={(event) => setExpenseForm((prev) => ({ ...prev, [key]: event.target.value }))}
            className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
            placeholder={label}
          />
        ))}
        <input
          type="number"
          value={expenseForm.amount}
          onChange={(event) => setExpenseForm((prev) => ({ ...prev, amount: event.target.value }))}
          className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
          placeholder="Amount"
        />
        <textarea
          rows="3"
          value={expenseForm.remarks}
          onChange={(event) => setExpenseForm((prev) => ({ ...prev, remarks: event.target.value }))}
          className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
          placeholder="Approval remarks or justification"
        />
        <button
          type="button"
          onClick={handleExpenseSubmit}
          disabled={savingExpense}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {savingExpense ? "Submitting..." : "Submit Expense"}
        </button>
      </div>
    </div>
  );

  const renderApprovalList = () => (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Approval Workflow</h3>
          <p className="text-sm text-slate-500">
            Review pending requests with department-level financial authority.
          </p>
        </div>
        <ShieldCheck className="text-slate-700" size={22} />
      </div>

      <div className="mt-5 space-y-4">
        {(dashboard?.approvalQueue || []).length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
            No pending approvals right now.
          </div>
        ) : (
          (dashboard?.approvalQueue || []).map((item) => (
            <div key={item.expenseId} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h4 className="text-base font-bold text-slate-900">{item.request}</h4>
                  <p className="mt-1 text-sm text-slate-500">{item.requestedBy}</p>
                </div>
                <span className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">
                  {item.stage}
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Amount</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{formatCurrency(item.amount)}</p>
                </div>
                <div className="rounded-2xl bg-white px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Remarks</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{item.remarks}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-500">{item.history}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => handleApproval(item.expenseId, "Approved")}
                  disabled={approvingId === `${item.expenseId}:Approved`}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                >
                  {approvingId === `${item.expenseId}:Approved` ? "Approving..." : "Approve"}
                </button>
                <button
                  type="button"
                  onClick={() => handleApproval(item.expenseId, "Rejected")}
                  disabled={approvingId === `${item.expenseId}:Rejected`}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
                >
                  {approvingId === `${item.expenseId}:Rejected` ? "Rejecting..." : "Reject"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderHostelForm = () => (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Hostel Collection & Receipt Desk</h3>
          <p className="text-sm text-slate-500">
            Securely record hostel receipts and generate collection proof for residential operations.
          </p>
        </div>
        <Hotel className="text-slate-700" size={22} />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {(dashboard?.hostelMetrics || []).map((item) => (
          <div key={item.title} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">{item.title}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {item.plain ? item.value : formatCurrency(item.value)}
            </p>
            <p className="mt-2 text-sm text-slate-500">{item.note}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-3">
        {[
          ["studentName", "Student name"],
          ["registrationNo", "Registration number"],
          ["roomNo", "Room number"],
        ].map(([key, label]) => (
          <input
            key={key}
            value={hostelForm[key]}
            onChange={(event) => setHostelForm((prev) => ({ ...prev, [key]: event.target.value }))}
            className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-700"
            placeholder={label}
          />
        ))}
        <input
          type="number"
          value={hostelForm.amount}
          onChange={(event) => setHostelForm((prev) => ({ ...prev, amount: event.target.value }))}
          className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-700"
          placeholder="Amount"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={hostelForm.paymentMode}
            onChange={(event) => setHostelForm((prev) => ({ ...prev, paymentMode: event.target.value }))}
            className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-700"
            placeholder="Payment mode"
          />
          <input
            value={hostelForm.status}
            onChange={(event) => setHostelForm((prev) => ({ ...prev, status: event.target.value }))}
            className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-700"
            placeholder="Status"
          />
        </div>
        <button
          type="button"
          onClick={handleHostelSubmit}
          disabled={savingHostel}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {savingHostel ? "Recording..." : "Record Hostel Payment"}
        </button>
      </div>

      {lastReceipt ? (
        <div className="mt-5 rounded-[24px] border border-dashed border-blue-200 bg-blue-50 p-4 text-sm leading-7 text-blue-900">
          Receipt generated: <span className="font-semibold">{lastReceipt.receiptNumber}</span> for{" "}
          <span className="font-semibold">{lastReceipt.studentName || "student"}</span>.
        </div>
      ) : null}
    </div>
  );

  const renderModuleAction = () => {
    switch (currentModule?.action) {
      case "budget-form":
        return renderBudgetForm();
      case "expense-form":
        return renderExpenseForm();
      case "approval-list":
        return renderApprovalList();
      case "hostel-form":
        return renderHostelForm();
      default:
        return null;
    }
  };

  return (
    <section className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.14),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.08),_transparent_24%),linear-gradient(180deg,#eff6ff_0%,#f8fafc_44%,#edf2f7_100%)] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1660px] space-y-6">
        <div className="overflow-hidden rounded-[32px] border border-slate-200/70 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.08)]">
          <div className="relative p-6 md:p-8 lg:p-10">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.14),_transparent_24%),radial-gradient(circle_at_bottom_left,_rgba(15,23,42,0.06),_transparent_28%)]" />
            <div className="pointer-events-none absolute -left-10 top-12 h-44 w-44 rounded-full bg-blue-200/35 blur-3xl" />
            <div className="pointer-events-none absolute right-0 top-0 h-52 w-52 rounded-full bg-cyan-200/20 blur-3xl" />

            <div className="relative grid gap-6 xl:grid-cols-[1.16fr_0.84fr]">
              <div className={`relative isolate overflow-hidden rounded-[30px] bg-gradient-to-br ${currentRole.accent} p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.22)] md:p-8`}>
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.12)_0%,transparent_28%,transparent_62%,rgba(255,255,255,0.08)_100%)]" />
                <div className="relative z-10 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-blue-50">
                    <ShieldCheck size={14} />
                    Department Access Management
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100">
                    <BellRing size={14} />
                    Secure Role-Based Dashboard
                  </span>
                </div>

                <h1 className="relative z-10 mt-5 max-w-4xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                  Modern, official access control for Sabarmati nursing departments and institutional services.
                </h1>
                <p className="relative z-10 mt-4 max-w-3xl text-sm leading-7 text-blue-50 sm:text-base">
                  Build one secure workspace for Super Admin, Principal, HOD, Accounts, Staff,
                  Hostel, Library, and Students with responsive dashboards, JWT-based access,
                  permission management, and button-wise module control.
                </p>

                <div className="relative z-10 mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {budgetStats.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.title}
                        className="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:bg-white/[0.14]"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-100">
                            {item.title}
                          </p>
                          <Icon size={16} className="text-blue-50" />
                        </div>
                        <p className="mt-3 text-2xl font-bold text-white">
                          {formatCurrency(item.value)}
                        </p>
                        <p className="mt-2 text-sm font-medium text-cyan-100">{item.note}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="relative z-10 mt-8 grid gap-4 xl:grid-cols-[1fr_0.95fr]">
                  <div className="rounded-[26px] border border-white/10 bg-black/15 p-5 backdrop-blur-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100">
                          Active Role Profile
                        </p>
                        <h2 className="mt-3 text-2xl font-bold text-white">{currentRole.label}</h2>
                      </div>
                      <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-cyan-100">
                        {currentRole.badge}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-blue-50">{currentRole.description}</p>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {activePermissions.slice(0, 4).map((permission) => (
                        <div key={permission} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-100">
                          {permission}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[26px] border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100">
                      Security & Governance
                    </p>
                    <div className="mt-4 space-y-3">
                      {securityHighlights.map((item) => (
                        <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-100">
                          <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-cyan-200" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_100%)] p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">
                        Institution Structure
                      </p>
                      <h2 className="mt-3 text-2xl font-bold text-slate-900">{selectedYear}</h2>
                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        Official academic structure with department-wise access aligned to college and school programs.
                      </p>
                    </div>
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                      <Building2 size={22} />
                    </span>
                  </div>

                  <div className="mt-5 space-y-3">
                    {departmentPrograms.map((unit) => (
                      <div key={unit.title} className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-bold text-slate-900">{unit.title}</p>
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                            {unit.shortCode}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-7 text-slate-500">{unit.items.join(" • ")}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#ecfeff_0%,#ffffff_100%)] p-6 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
                    Finance & Access Snapshot
                  </p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-3xl font-black text-slate-900">{utilizationSummary.percentage}%</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Budget utilization across department and hostel operational layers.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-blue-100 bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Hostel Collection Rate</p>
                      <p className="mt-2 text-xl font-bold text-slate-900">{hostelSignal.collectionRate}%</p>
                      <p className="mt-2 text-sm text-slate-500">Outstanding share: {hostelSignal.outstandingShare}%</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#111827_52%,#0f3a64_100%)] p-6 text-white shadow-xl">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-200">
                      Quick Controls
                    </p>
                    <button
                      type="button"
                      onClick={refreshDashboard}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/15"
                    >
                      <RefreshCcw size={12} />
                      Refresh
                    </button>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {[
                      "Role-Based Login",
                      "Permission Matrix",
                      "Audit Logs",
                      "Notifications",
                    ].map((action) => (
                      <div
                        key={action}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition duration-300 hover:-translate-y-1 hover:bg-white/15"
                      >
                        <UserCog size={16} />
                        {action}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-4 rounded-[28px] border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur lg:grid-cols-[1.05fr_0.95fr]">
              <div className="grid gap-4 md:grid-cols-4">
                <label className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Financial Year
                  </span>
                  <select
                    value={selectedYear}
                    onChange={(event) => setSelectedYear(event.target.value)}
                    className="w-full bg-transparent text-sm text-slate-900 outline-none"
                  >
                    {filterYears.map((year) => (
                      <option key={year}>{year}</option>
                    ))}
                  </select>
                </label>

                <label className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    View Filter
                  </span>
                  <select
                    value={selectedView}
                    onChange={(event) => setSelectedView(event.target.value)}
                    className="w-full bg-transparent text-sm text-slate-900 outline-none"
                  >
                    {filterViews.map((view) => (
                      <option key={view}>{view}</option>
                    ))}
                  </select>
                </label>

                <label className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Access Scope
                  </span>
                  <select
                    value={selectedScope}
                    onChange={(event) => setSelectedScope(event.target.value)}
                    className="w-full bg-transparent text-sm text-slate-900 outline-none"
                  >
                    {availableScopes.map((scope) => (
                      <option key={scope}>{scope}</option>
                    ))}
                  </select>
                </label>

                <label className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Analytics Axis
                  </span>
                  <select
                    value={selectedAxis}
                    onChange={(event) => setSelectedAxis(event.target.value)}
                    className="w-full bg-transparent text-sm text-slate-900 outline-none"
                  >
                    {["Departments", "Semesters", "Months"].map((axis) => (
                      <option key={axis}>{axis}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="rounded-[24px] border border-blue-100 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Used Budget</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      {formatCurrency(utilizationSummary.totalUsed)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Approved Budget</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      {formatCurrency(utilizationSummary.totalBudget)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Active Scope</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      {dashboard?.accessControl?.activeScope || selectedScope}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  The selected {selectedAxis.toLowerCase()} view stays connected to live budgeting,
                  hostel collections, access permissions, and approval controls.
                </p>
              </div>
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-5 text-rose-700 shadow-sm">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-[28px] border border-emerald-200 bg-emerald-50 p-5 text-emerald-700 shadow-sm">
            {success}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-[28px] border border-slate-200 bg-white p-10 shadow-sm">
            <div className="flex items-center justify-center gap-3 text-slate-600">
              <LoaderCircle className="animate-spin" size={20} />
              Loading department access management workspace...
            </div>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="space-y-6">
              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">
                      Access Roles
                    </p>
                    <h3 className="mt-2 text-xl font-bold text-slate-900">Button-Wise Role Panels</h3>
                  </div>
                  <ShieldCheck className="text-slate-700" size={20} />
                </div>

                <div className="mt-5 grid gap-3">
                  {roleEntries.map(([key, role]) => {
                    const Icon = role.icon;
                    const isActive = key === activeRole;

                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleRoleSwitch(key)}
                        className={`rounded-[22px] border px-4 py-4 text-left transition ${
                          isActive
                            ? "border-slate-900 bg-slate-900 text-white shadow-lg"
                            : "border-slate-200 bg-slate-50 text-slate-900 hover:border-blue-300 hover:bg-blue-50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                            <Icon size={18} />
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                              isActive ? "bg-white/10 text-cyan-100" : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {role.badge}
                          </span>
                        </div>
                        <p className="mt-4 text-sm font-bold">{role.label}</p>
                        <p className={`mt-2 text-sm leading-6 ${isActive ? "text-slate-200" : "text-slate-500"}`}>
                          {role.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Access Summary</h3>
                    <p className="text-sm text-slate-500">Responsive status by role</p>
                  </div>
                  <Users className="text-slate-700" size={20} />
                </div>
                <div className="mt-5 space-y-3">
                  {roleAccessSummary.map((item) => (
                    <div key={item.key} className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-bold text-slate-900">{item.label}</p>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusTone(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-500">{item.modules} button panels configured</p>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            <div className="space-y-6">
              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">
                      Active Dashboard
                    </p>
                    <h3 className="mt-2 text-2xl font-bold text-slate-900">{currentRole.label}</h3>
                    <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">{currentRole.description}</p>
                  </div>
                  <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Current Scope</p>
                    <p className="mt-2 text-sm font-bold text-slate-900">
                      {dashboard?.accessControl?.activeScope || selectedScope}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      {dashboard?.accessControl?.permissions?.length || currentRole.permissions.length} permissions active
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  {currentModules.map((module) => (
                    <button
                      key={module.id}
                      type="button"
                      onClick={() => setActiveModule(module.id)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        activeModule === module.id
                          ? "bg-blue-700 text-white shadow-sm"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {module.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                <div className="space-y-6">
                  <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{currentModule?.label}</h3>
                        <p className="text-sm text-slate-500">{currentModule?.description}</p>
                      </div>
                      <ScrollText className="text-slate-700" size={22} />
                    </div>

                    {currentModule?.stats ? (
                      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {currentModule.stats.map((item) => (
                          <div key={item.label} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
                            <p className="mt-3 text-2xl font-bold text-slate-900">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {currentModule?.items ? (
                      <div className="mt-5 grid gap-4">
                        {currentModule.items.map((item) =>
                          typeof item === "string" ? (
                            <div key={item} className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-700">
                              {item}
                            </div>
                          ) : (
                            <div key={`${item.title}-${item.meta}`} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-bold text-slate-900">{item.title}</p>
                                <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                                  {item.meta}
                                </span>
                              </div>
                              <p className="mt-2 text-sm leading-6 text-slate-500">{item.note}</p>
                            </div>
                          )
                        )}
                      </div>
                    ) : null}
                  </div>

                  {renderModuleAction()}

                  <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Department Budget Control</h3>
                        <p className="text-sm text-slate-500">
                          Live yearly allocations with department-wise utilization visibility.
                        </p>
                      </div>
                      <Layers3 className="text-slate-700" size={22} />
                    </div>

                    <div className="mt-5 overflow-x-auto">
                      <table className="min-w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500">
                            <th className="px-3 py-3 font-semibold">Department</th>
                            <th className="px-3 py-3 font-semibold">Semester</th>
                            <th className="px-3 py-3 font-semibold">Budget</th>
                            <th className="px-3 py-3 font-semibold">Used</th>
                            <th className="px-3 py-3 font-semibold">Remaining</th>
                            <th className="px-3 py-3 font-semibold">Utilization</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(dashboard?.departmentBudgets || []).map((item) => (
                            <tr key={item.budgetId} className="border-b border-slate-100">
                              <td className="px-3 py-3 font-semibold text-slate-900">{item.department}</td>
                              <td className="px-3 py-3 text-slate-700">{item.semester}</td>
                              <td className="px-3 py-3 text-slate-700">{formatCurrency(item.approvedBudget)}</td>
                              <td className="px-3 py-3 text-slate-700">{formatCurrency(item.utilizedBudget)}</td>
                              <td className="px-3 py-3 text-slate-700">{formatCurrency(item.remainingBudget)}</td>
                              <td className="px-3 py-3">
                                <div className="flex min-w-[150px] items-center gap-3">
                                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                      className={`h-full rounded-full ${
                                        item.utilizationPercentage >= 80
                                          ? "bg-rose-500"
                                          : item.utilizationPercentage >= 70
                                            ? "bg-amber-500"
                                            : "bg-blue-600"
                                      }`}
                                      style={{ width: `${item.utilizationPercentage}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-semibold text-slate-700">
                                    {item.utilizationPercentage}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Permission Matrix</h3>
                        <p className="text-sm text-slate-500">
                          Official user-role mapping for modules and workflows.
                        </p>
                      </div>
                      <UserCog className="text-slate-700" size={22} />
                    </div>

                    <div className="mt-5 space-y-3">
                      {activePermissions.map((permission) => (
                        <div key={permission} className="flex items-center gap-3 rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3">
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                            <CheckCircle2 size={18} />
                          </span>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{permission}</p>
                            <p className="text-sm text-slate-500">Enabled for {currentRole.label} dashboard access.</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Operational Feeds</h3>
                        <p className="text-sm text-slate-500">
                          Reports, alerts, and readiness cards generated from the connected API.
                        </p>
                      </div>
                      <FileSpreadsheet className="text-slate-700" size={22} />
                    </div>

                    <div className="mt-5 grid gap-4">
                      {(dashboard?.reportCards || []).map((report) => (
                        <div key={report} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-bold text-slate-900">{report}</p>
                              <p className="mt-2 text-sm text-slate-500">Ready for PDF and spreadsheet export.</p>
                            </div>
                            <FileText size={18} className="text-slate-600" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Notifications & Audit Trail</h3>
                        <p className="text-sm text-slate-500">
                          Monitor real-time events across attendance, finance, hostel, and access workflows.
                        </p>
                      </div>
                      <BellRing className="text-slate-700" size={22} />
                    </div>

                    <div className="mt-5 space-y-4">
                      {(dashboard?.alerts || []).map((alert) => {
                        const Icon =
                          alert.level === "danger"
                            ? CircleAlert
                            : alert.level === "warning"
                              ? HandCoins
                              : CheckCircle2;

                        return (
                          <div key={`${alert.title}-${alert.note}`} className={`rounded-[24px] border p-4 ${getAlertTone(alert.level)}`}>
                            <div className="flex items-start gap-3">
                              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/60">
                                <Icon size={18} />
                              </span>
                              <div>
                                <p className="text-base font-bold">{alert.title}</p>
                                <p className="mt-2 text-sm leading-6">{alert.note}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#1e3a8a_100%)] p-5 text-white shadow-xl">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold text-white">Secure Module Architecture</h3>
                        <p className="mt-2 text-sm leading-6 text-blue-100">
                          Each role opens only its permitted buttons, tables, workflows, and institutional reports.
                        </p>
                      </div>
                      <CreditCard size={22} className="text-blue-100" />
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {[
                        "Dynamic sidebar based on role and department",
                        "JWT authentication and access policy enforcement",
                        "Button-wise dashboards for finance, hostel, library, and academics",
                        "Audit logs and real-time notification readiness",
                      ].map((item) => (
                        <div key={item} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-blue-50">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Semester Analytics</h3>
                      <p className="text-sm text-slate-500">
                        Role-aware department visibility across semester allocations.
                      </p>
                    </div>
                    <BookOpen className="text-slate-700" size={22} />
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {(dashboard?.semesterAllocations || []).map((item) => (
                      <div key={item.semester} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="text-base font-bold text-slate-900">{item.semester}</h4>
                            <p className="mt-1 text-sm text-slate-500">Academic planning block</p>
                          </div>
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                            {item.utilization}%
                          </span>
                        </div>
                        <div className="mt-4 space-y-3 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Budget</span>
                            <span className="font-semibold text-slate-900">{formatCurrency(item.budget)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Expense</span>
                            <span className="font-semibold text-slate-900">{formatCurrency(item.expense)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Remaining</span>
                            <span className="font-semibold text-slate-900">{formatCurrency(item.remaining)}</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-white">
                            <div className="h-full rounded-full bg-blue-600" style={{ width: `${item.utilization}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Expenses, Receipts & Role Cards</h3>
                      <p className="text-sm text-slate-500">
                        Quick financial and department operational summaries for official users.
                      </p>
                    </div>
                    <ReceiptText className="text-slate-700" size={22} />
                  </div>

                  <div className="mt-5 overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500">
                          <th className="px-3 py-3 font-semibold">Department</th>
                          <th className="px-3 py-3 font-semibold">Category</th>
                          <th className="px-3 py-3 font-semibold">Tag</th>
                          <th className="px-3 py-3 font-semibold">Amount</th>
                          <th className="px-3 py-3 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(dashboard?.expenses || []).slice(0, 6).map((row) => (
                          <tr key={row.expenseId} className="border-b border-slate-100">
                            <td className="px-3 py-3 font-semibold text-slate-900">{row.department}</td>
                            <td className="px-3 py-3 text-slate-700">{row.category}</td>
                            <td className="px-3 py-3 text-slate-700">{row.tag}</td>
                            <td className="px-3 py-3 text-slate-700">{formatCurrency(row.amount)}</td>
                            <td className="px-3 py-3">
                              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusTone(row.status)}`}>
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-5 space-y-3">
                    {(dashboard?.roleCards || []).map((item) => (
                      <div key={item.role} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                        <p className="text-base font-bold text-slate-900">{item.role}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-500">{item.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#153a7a_52%,#0f766e_100%)] p-5 text-white shadow-xl">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold text-white">Department-Wise Dashboard Objectives</h3>
                    <p className="mt-2 text-sm leading-6 text-blue-100">
                      One button opens one responsibility area, making the experience cleaner, safer, and easier for every role.
                    </p>
                  </div>
                  <Soup size={22} className="text-blue-100" />
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {[
                    "Super Admin for full system control and user governance",
                    "Principal for academic overview and institutional approvals",
                    "HOD for department analytics, attendance, and budget requests",
                    "Accounts, Hostel, Library, Staff, and Student modules with scoped access",
                  ].map((item) => (
                    <div key={item} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-sm leading-6 text-blue-50">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Department;
