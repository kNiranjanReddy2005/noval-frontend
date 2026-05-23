import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { jsPDF } from "jspdf";
import {
  AlertCircle,
  BadgeIndianRupee,
  Banknote,
  CheckCircle2,
  CreditCard,
  Download,
  FileSpreadsheet,
  GraduationCap,
  IndianRupee,
  Landmark,
  LayoutDashboard,
  Percent,
  QrCode,
  ReceiptText,
  RefreshCcw,
  ScrollText,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Logo from "../assets/Logo.png";
import { apiRequest } from "../config/api";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const initialCapabilities = {
  feeDashboard: true,
  manualPayment: true,
  razorpay: true,
  feeSummary: true,
  feeReports: true,
  feeConfig: true,
  feeRefunds: true,
};

const paymentModes = [
  "Cash",
  "Bank",
  "UPI",
  "Cheque",
  "QR Payment",
  "Razorpay Checkout",
  "API Verification",
];

function formatCurrency(value) {
  return currencyFormatter.format(Number(value || 0));
}

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatDateInput(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function buildUpiPaymentLink({
  upiId,
  payeeName,
  amount,
  transactionNote,
  transactionRef,
}) {
  const params = new URLSearchParams({
    pa: upiId,
    pn: payeeName,
    am: amount,
    cu: "INR",
    tn: transactionNote,
  });

  if (transactionRef) {
    params.set("tr", transactionRef);
  }

  return `upi://pay?${params.toString()}`;
}

function loadRazorpayCheckout() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Unable to load Razorpay checkout.")),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () =>
      reject(new Error("Unable to load Razorpay checkout."));
    document.body.appendChild(script);
  });
}

function isMissingRouteError(message) {
  return typeof message === "string" && message.includes("Backend route unavailable:");
}

function sanitizeCharge(item, fallback = {}) {
  return {
    chargeId: item?.chargeId || fallback.chargeId || `CHG-${Date.now()}`,
    title: item?.title || fallback.title || "Charge",
    category: item?.category || fallback.category || "Miscellaneous",
    scope: item?.scope || fallback.scope || "Additional",
    amount: Number(item?.amount || 0),
    dueDate: item?.dueDate || fallback.dueDate || "",
    status: item?.status || fallback.status || "Pending",
    note: item?.note || fallback.note || "",
  };
}

function sanitizeDiscount(item) {
  return {
    discountId: item?.discountId || `DISC-${Date.now()}`,
    title: item?.title || "Discount",
    scope: item?.scope || "Student",
    mode: item?.mode || "Flat",
    value: Number(item?.value || 0),
    amount: Number(item?.amount || 0),
    reason: item?.reason || "",
    appliedAt: item?.appliedAt || new Date().toISOString(),
  };
}

function sanitizeFineRule(item) {
  return {
    ruleId: item?.ruleId || `FINE-${Date.now()}`,
    title: item?.title || "Late Fee Rule",
    mode: item?.mode || "Flat",
    value: Number(item?.value || 0),
    graceDays: Number(item?.graceDays || 0),
    active: item?.active !== false,
  };
}

function sanitizeStudent(student) {
  if (!student) {
    return null;
  }

  const paymentHistory = Array.isArray(student.paymentHistory)
    ? student.paymentHistory
    : [];
  const refunds = Array.isArray(student.refunds) ? student.refunds : [];
  const baseFee = Number(student.baseFee ?? student.totalFee ?? 50000);
  const feeStructure = Array.isArray(student.feeStructure)
    ? student.feeStructure.map((item) =>
        sanitizeCharge(item, { scope: "Structure", category: "Tuition" })
      )
    : [];
  const extraCharges = Array.isArray(student.extraCharges)
    ? student.extraCharges.map((item) =>
        sanitizeCharge(item, { scope: "Additional", category: "Additional" })
      )
    : [];
  const examFees = Array.isArray(student.examFees)
    ? student.examFees.map((item) =>
        sanitizeCharge(item, { scope: "Exam", category: "Exam Fee" })
      )
    : [];
  const discounts = Array.isArray(student.discounts)
    ? student.discounts.map(sanitizeDiscount)
    : [];
  const fineRules = Array.isArray(student.fineRules)
    ? student.fineRules.map(sanitizeFineRule)
    : [];
  const discountTotal =
    student.totalDiscount != null
      ? Number(student.totalDiscount)
      : discounts.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const extraTotal =
    student.totalExtraCharges != null
      ? Number(student.totalExtraCharges)
      : [...extraCharges, ...examFees].reduce(
          (sum, item) => sum + Number(item.amount || 0),
          0
        );
  const fineTotal = Number(student.totalFine || 0);
  const paidAmount =
    student.paidAmount != null
      ? Number(student.paidAmount)
      : paymentHistory.reduce((sum, item) => sum + Number(item.amount || 0), 0) -
        refunds.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalFee =
    student.totalFee != null
      ? Number(student.totalFee)
      : Math.max(baseFee + extraTotal + fineTotal - discountTotal, 0);
  const pendingAmount =
    student.pendingAmount != null
      ? Number(student.pendingAmount)
      : Math.max(totalFee - paidAmount, 0);

  return {
    ...student,
    feePlan: student.feePlan || "Yearly",
    baseFee,
    totalFee,
    paidAmount,
    pendingAmount,
    totalDiscount: discountTotal,
    totalExtraCharges: extraTotal,
    totalFine: fineTotal,
    outstandingAmount: Number(student.outstandingAmount ?? pendingAmount),
    outstandingStatus:
      student.outstandingStatus ||
      (pendingAmount <= 0 ? "Cleared" : "Pending"),
    paymentHistory,
    refunds,
    feeStructure,
    extraCharges,
    examFees,
    discounts,
    fineRules,
    ledgerEntries: Array.isArray(student.ledgerEntries) ? student.ledgerEntries : [],
  };
}

function createFallbackSummary(students) {
  const normalizedStudents = students.map(sanitizeStudent);
  const totalStudents = normalizedStudents.length;
  const totalFeeCollection = normalizedStudents.reduce(
    (sum, item) => sum + item.paidAmount,
    0
  );
  const totalDueAmount = normalizedStudents.reduce(
    (sum, item) => sum + item.pendingAmount,
    0
  );
  const overdueStudents = normalizedStudents.filter(
    (item) => item.outstandingStatus === "Overdue"
  ).length;

  return {
    totalStudents,
    totalFeeCollection,
    totalDueAmount,
    totalOutstanding: totalDueAmount,
    totalRefunds: normalizedStudents.reduce(
      (sum, item) =>
        sum +
        item.refunds.reduce((refundSum, refund) => refundSum + Number(refund.amount || 0), 0),
      0
    ),
    totalFines: normalizedStudents.reduce((sum, item) => sum + item.totalFine, 0),
    overdueStudents,
    paidStudents: normalizedStudents.filter((item) => item.pendingAmount <= 0).length,
    pendingStudents: normalizedStudents.filter((item) => item.pendingAmount > 0).length,
    monthlyRevenue: [],
    paymentStatusChart: [
      {
        label: "Paid",
        value: normalizedStudents.filter((item) => item.pendingAmount <= 0).length,
      },
      {
        label: "Pending",
        value: normalizedStudents.filter((item) => item.pendingAmount > 0).length,
      },
      { label: "Overdue", value: overdueStudents },
    ],
    outstandingStudents: normalizedStudents
      .filter((item) => item.pendingAmount > 0)
      .sort((a, b) => b.pendingAmount - a.pendingAmount)
      .slice(0, 8)
      .map((item) => ({
        registrationNo: item.registrationNo,
        studentName: item.studentName || item.fullName,
        course: item.course,
        pendingAmount: item.pendingAmount,
        status: item.outstandingStatus,
      })),
  };
}

function createFallbackReports(students) {
  const normalizedStudents = students.map(sanitizeStudent);

  return {
    dailyCollection: normalizedStudents.flatMap((student) =>
      student.paymentHistory.map((payment) => ({
        date: payment.paymentDate,
        receiptNumber: payment.receiptNumber,
        registrationNo: student.registrationNo,
        studentName: student.studentName || student.fullName || "Student",
        method: payment.method,
        amount: payment.amount,
      }))
    ),
    studentLedger: normalizedStudents.map((student) => ({
      registrationNo: student.registrationNo,
      studentName: student.studentName || student.fullName || "Student",
      course: student.course,
      debit: student.totalFee,
      credit: student.paidAmount,
      due: student.pendingAmount,
      refunds: student.refunds.reduce(
        (sum, refund) => sum + Number(refund.amount || 0),
        0
      ),
    })),
    dueReport: normalizedStudents
      .filter((student) => student.pendingAmount > 0)
      .map((student) => ({
        registrationNo: student.registrationNo,
        studentName: student.studentName || student.fullName || "Student",
        course: student.course,
        year: student.year,
        pendingAmount: student.pendingAmount,
        status: student.outstandingStatus,
        nextDueDate: student.nextDueDate,
      })),
    fineReport: normalizedStudents
      .filter((student) => student.totalFine > 0)
      .map((student) => ({
        registrationNo: student.registrationNo,
        studentName: student.studentName || student.fullName || "Student",
        totalFine: student.totalFine,
        status: student.outstandingStatus,
      })),
    refundReport: normalizedStudents.flatMap((student) =>
      student.refunds.map((refund) => ({
        refundNumber: refund.refundNumber,
        registrationNo: student.registrationNo,
        studentName: student.studentName || student.fullName || "Student",
        amount: refund.amount,
        refundDate: refund.refundDate,
        reason: refund.reason,
        status: refund.status,
      }))
    ),
    feeCollectionSummary: normalizedStudents.map((student) => ({
      registrationNo: student.registrationNo,
      studentName: student.studentName || student.fullName || "Student",
      totalFee: student.totalFee,
      paidAmount: student.paidAmount,
      pendingAmount: student.pendingAmount,
    })),
  };
}

function downloadCsv(filename, rows) {
  if (!rows.length) {
    return;
  }

  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const value = row[header] ?? "";
          const escaped = String(value).replaceAll('"', '""');
          return `"${escaped}"`;
        })
        .join(",")
    ),
  ];

  const blob = new Blob([lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}

async function downloadReceiptPdf({ payment, student }) {
  const doc = new jsPDF();
  const studentName = student?.studentName || student?.fullName || "Student";
  const course = student?.course || "Not available";
  const registrationNo = student?.registrationNo || "Not available";

  try {
    const logo = await loadImage(Logo);
    doc.addImage(logo, "PNG", 14, 10, 20, 20);
  } catch {
    // Ignore logo loading failures and continue with text-only header.
  }

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 34, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Official Fee Receipt", 40, 18);
  doc.setFontSize(10);
  doc.text("Institution Finance Office", 40, 25);

  doc.setTextColor(31, 41, 55);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");

  const rows = [
    ["Receipt Number", payment.receiptNumber || "Not available"],
    ["Student Name", studentName],
    ["Registration No", registrationNo],
    ["Course", course],
    ["Amount Paid", formatCurrency(payment.amount)],
    ["Payment Method", payment.method || "Not available"],
    ["Transaction ID", payment.transactionId || "Not available"],
    ["Payment Date", formatDate(payment.paymentDate)],
    ["Status", payment.status || "Confirmed"],
    ["Confirmed By", payment.confirmedBy || "Admin"],
    ["Note", payment.note || "No additional note"],
  ];

  let y = 48;
  rows.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, 14, y);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(String(value), 120);
    doc.text(lines, 64, y);
    y += Math.max(lines.length * 7, 8);
  });

  doc.setDrawColor(203, 213, 225);
  doc.line(14, y + 4, 196, y + 4);
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text("Computer-generated receipt. No manual signature required.", 14, y + 12);

  doc.save(`${payment.receiptNumber || "fee-receipt"}.pdf`);
}

function downloadLetterPdf({ student, type }) {
  const doc = new jsPDF();
  const title =
    type === "bonafide" ? "Bonafide Certificate" : "Fee Demand Letter";
  const studentName = student?.studentName || student?.fullName || "Student";

  doc.setFillColor(15, 118, 110);
  doc.rect(0, 0, 210, 30, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text(title, 14, 18);

  doc.setTextColor(31, 41, 55);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  if (type === "bonafide") {
    const lines = doc.splitTextToSize(
      `This is to certify that ${studentName} bearing registration number ${
        student?.registrationNo || "N/A"
      } is a bonafide student of ${student?.course || "the institution"} for ${
        student?.year || "the current academic session"
      }.`,
      180
    );
    doc.text(lines, 14, 48);
  } else {
    const lines = doc.splitTextToSize(
      `This letter is issued to inform ${studentName} that an outstanding fee amount of ${formatCurrency(
        student?.pendingAmount
      )} is due. Please complete the payment on or before ${
        formatDate(student?.nextDueDate) || "the notified due date"
      }.`,
      180
    );
    doc.text(lines, 14, 48);
  }

  doc.text(`Generated on: ${formatDate(new Date().toISOString())}`, 14, 85);
  doc.save(`${title.toLowerCase().replaceAll(" ", "-")}-${student?.registrationNo || "student"}.pdf`);
}

function statusClass(status) {
  if (status === "Cleared") {
    return "bg-emerald-100 text-emerald-800";
  }

  if (status === "Overdue") {
    return "bg-red-100 text-red-700";
  }

  return "bg-amber-100 text-amber-800";
}

const Fee = () => {
  const [searchParams] = useSearchParams();
  const [students, setStudents] = useState([]);
  const [student, setStudent] = useState(null);
  const [selectedRegistrationNo, setSelectedRegistrationNo] = useState(
    searchParams.get("registrationNo") || ""
  );
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [note, setNote] = useState("");
  const [upiId, setUpiId] = useState(
    import.meta.env.VITE_UPI_ID || "schoolfees@okaxis"
  );
  const [payeeName, setPayeeName] = useState(
    import.meta.env.VITE_UPI_NAME || "Campus Fee Collection"
  );
  const [showQr, setShowQr] = useState(false);
  const [latestReceipt, setLatestReceipt] = useState(null);
  const [summary, setSummary] = useState(null);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [configSaving, setConfigSaving] = useState(false);
  const [refundSaving, setRefundSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [capabilities, setCapabilities] = useState(initialCapabilities);
  const [configForm, setConfigForm] = useState({
    feePlan: "Yearly",
    baseFee: "",
    nextDueDate: "",
    structureTitle: "",
    structureAmount: "",
    extraTitle: "",
    extraAmount: "",
    examTitle: "",
    examAmount: "",
    discountTitle: "",
    discountAmount: "",
    fineTitle: "",
    fineValue: "",
    fineMode: "Flat",
    graceDays: "",
  });
  const [refundForm, setRefundForm] = useState({
    amount: "",
    reason: "",
    reference: "",
  });

  const pendingAmount = Number(student?.pendingAmount || 0);
  const normalizedAmount = Number(paymentAmount);
  const isValidAmount =
    Number.isFinite(normalizedAmount) &&
    normalizedAmount > 0 &&
    normalizedAmount <= pendingAmount;

  const transactionReference = useMemo(() => {
    return (
      transactionId.trim() ||
      `FEE-${student?.registrationNo || "STUDENT"}-${Date.now()}`
    );
  }, [transactionId, student?.registrationNo]);

  const upiPaymentLink = useMemo(() => {
    if (!student || !isValidAmount || !upiId.trim() || !payeeName.trim()) {
      return "";
    }

    const transactionNote = [
      student.studentName || student.fullName || "Student Fee",
      student.registrationNo ? `Reg ${student.registrationNo}` : "",
      note.trim(),
    ]
      .filter(Boolean)
      .join(" | ");

    return buildUpiPaymentLink({
      upiId: upiId.trim(),
      payeeName: payeeName.trim(),
      amount: normalizedAmount.toFixed(2),
      transactionNote,
      transactionRef: transactionReference,
    });
  }, [
    student,
    isValidAmount,
    upiId,
    payeeName,
    note,
    normalizedAmount,
    transactionReference,
  ]);

  const refreshAnalytics = async (currentStudents) => {
    try {
      const summaryResponse = await apiRequest("/api/students/fees/summary");
      setSummary(summaryResponse.overview);
      setCapabilities((prev) => ({ ...prev, feeSummary: true }));
    } catch (summaryError) {
      if (isMissingRouteError(summaryError.message)) {
        setCapabilities((prev) => ({ ...prev, feeSummary: false }));
      }
      setSummary(createFallbackSummary(currentStudents));
    }

    try {
      const reportsResponse = await apiRequest("/api/students/fees/reports");
      setReports(reportsResponse.reports);
      setCapabilities((prev) => ({ ...prev, feeReports: true }));
    } catch (reportError) {
      if (isMissingRouteError(reportError.message)) {
        setCapabilities((prev) => ({ ...prev, feeReports: false }));
      }
      setReports(createFallbackReports(currentStudents));
    }
  };

  const syncConfigForm = (nextStudent) => {
    setConfigForm((prev) => ({
      ...prev,
      feePlan: nextStudent?.feePlan || "Yearly",
      baseFee: nextStudent?.baseFee ? String(nextStudent.baseFee) : "",
      nextDueDate: formatDateInput(nextStudent?.nextDueDate),
    }));
  };

  const refreshSelectedStudent = async (registrationNo, listOverride) => {
    const currentList = listOverride || students;
    let nextStudent = null;

    try {
      const response = await apiRequest(
        `/api/students/fee-dashboard?registrationNo=${encodeURIComponent(
          registrationNo
        )}`
      );
      nextStudent = sanitizeStudent(response.student);
      setCapabilities((prev) => ({ ...prev, feeDashboard: true }));
    } catch (loadError) {
      if (isMissingRouteError(loadError.message)) {
        setCapabilities((prev) => ({ ...prev, feeDashboard: false }));
      }

      nextStudent = currentList.find(
        (item) => item.registrationNo === registrationNo
      );

      if (!nextStudent) {
        throw loadError;
      }
    }

    setStudent(nextStudent);
    setLatestReceipt(nextStudent.paymentHistory?.[0] || null);
    setPaymentAmount(
      nextStudent.pendingAmount > 0 ? String(nextStudent.pendingAmount) : ""
    );
    syncConfigForm(nextStudent);
  };

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const list = await apiRequest("/api/students");
        const normalizedList = list.map(sanitizeStudent);

        if (ignore) {
          return;
        }

        setStudents(normalizedList);
        await refreshAnalytics(normalizedList);

        const registrationNo =
          searchParams.get("registrationNo") ||
          selectedRegistrationNo ||
          normalizedList[0]?.registrationNo ||
          "";

        if (!registrationNo) {
          setStudent(null);
          return;
        }

        setSelectedRegistrationNo(registrationNo);
        await refreshSelectedStudent(registrationNo, normalizedList);
      } catch (loadError) {
        if (!ignore) {
          setError(loadError.message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, []);

  const updateLocalStudent = async (nextStudent, receipt) => {
    const normalized = sanitizeStudent(nextStudent);
    const nextStudents = students.map((item) =>
      item._id === normalized._id ? normalized : item
    );

    setStudent(normalized);
    setLatestReceipt(receipt || normalized.paymentHistory?.[0] || null);
    setStudents(nextStudents);
    setPaymentAmount(
      normalized.pendingAmount > 0 ? String(normalized.pendingAmount) : ""
    );
    setTransactionId("");
    setNote("");
    setShowQr(false);
    syncConfigForm(normalized);
    await refreshAnalytics(nextStudents);
  };

  const handleStudentChange = async (event) => {
    const registrationNo = event.target.value;
    setSelectedRegistrationNo(registrationNo);
    setError("");
    setSuccess("");
    setShowQr(false);
    setTransactionId("");
    setNote("");

    if (!registrationNo) {
      setStudent(null);
      return;
    }

    setLoading(true);

    try {
      await refreshSelectedStudent(registrationNo);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  const validatePaymentInput = () => {
    if (!student) {
      return "Select a student first.";
    }

    if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
      return "Enter a valid payment amount.";
    }

    if (normalizedAmount > pendingAmount) {
      return "Payment amount cannot be greater than the pending due.";
    }

    return "";
  };

  const handleGenerateQr = () => {
    setError("");
    setSuccess("");

    const validationMessage = validatePaymentInput();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    if (!upiId.trim()) {
      setError("Enter a valid UPI ID before generating the QR code.");
      return;
    }

    if (!payeeName.trim()) {
      setError("Enter the payee name before generating the QR code.");
      return;
    }

    setShowQr(true);
  };

  const handleManualConfirm = async () => {
    const validationMessage = validatePaymentInput();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await apiRequest(`/api/students/${student._id}/fees/pay`, {
        method: "POST",
        body: JSON.stringify({
          amount: normalizedAmount,
          method: paymentMethod,
          provider: ["Cash", "Bank", "Cheque"].includes(paymentMethod)
            ? paymentMethod
            : "Manual",
          transactionId,
          note,
          confirmedBy: paymentMethod === "API Verification" ? "Payment API" : "Admin",
        }),
      });

      setCapabilities((prev) => ({ ...prev, manualPayment: true }));
      await updateLocalStudent(response.student, response.receipt);
      setSuccess(response.message);
    } catch (paymentError) {
      if (isMissingRouteError(paymentError.message)) {
        setCapabilities((prev) => ({ ...prev, manualPayment: false }));
        setError(
          "Manual payment confirmation is not available on the connected backend yet. Please restart or redeploy the backend with the latest student fee routes."
        );
      } else {
        setError(paymentError.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRazorpayPayment = async () => {
    const validationMessage = validatePaymentInput();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await loadRazorpayCheckout();

      const orderResponse = await apiRequest(
        `/api/students/${student._id}/fees/razorpay-order`,
        {
          method: "POST",
          body: JSON.stringify({ amount: normalizedAmount }),
        }
      );

      setCapabilities((prev) => ({ ...prev, razorpay: true }));

      const razorpay = new window.Razorpay({
        key: orderResponse.keyId,
        amount: orderResponse.order.amount,
        currency: orderResponse.order.currency,
        name: payeeName.trim() || "Campus Fee Collection",
        description: `Student fee payment for ${student.studentName || student.fullName}`,
        order_id: orderResponse.order.id,
        prefill: {
          name: student.studentName || student.fullName || "",
          email: student.email || "",
          contact: student.phone || "",
        },
        notes: {
          registrationNo: student.registrationNo || "",
          course: student.course || "",
        },
        theme: {
          color: "#0f766e",
        },
        handler: async (paymentResponse) => {
          try {
            const verifyResponse = await apiRequest(
              `/api/students/${student._id}/fees/verify-razorpay`,
              {
                method: "POST",
                body: JSON.stringify({
                  amount: normalizedAmount,
                  note,
                  ...paymentResponse,
                }),
              }
            );

            await updateLocalStudent(verifyResponse.student, verifyResponse.receipt);
            setSuccess(verifyResponse.message);
          } catch (verifyError) {
            if (isMissingRouteError(verifyError.message)) {
              setCapabilities((prev) => ({ ...prev, razorpay: false }));
            }
            setError(verifyError.message);
          } finally {
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
          },
        },
      });

      razorpay.on("payment.failed", (response) => {
        setError(
          response.error?.description || "Razorpay payment was not completed."
        );
        setSubmitting(false);
      });

      razorpay.open();
    } catch (checkoutError) {
      if (isMissingRouteError(checkoutError.message)) {
        setCapabilities((prev) => ({ ...prev, razorpay: false }));
        setError(
          "Razorpay automatic checkout is not available on the connected backend yet. Please restart or redeploy the backend with the latest student fee routes."
        );
      } else {
        setError(checkoutError.message);
      }
      setSubmitting(false);
    }
  };

  const handleSaveFeeConfig = async () => {
    if (!student) {
      setError("Select a student first.");
      return;
    }

    setConfigSaving(true);
    setError("");
    setSuccess("");

    const nextStructure = configForm.structureTitle.trim()
      ? [
          ...student.feeStructure,
          {
            title: configForm.structureTitle.trim(),
            amount: Number(configForm.structureAmount || 0),
            scope: "Structure",
            category: "Tuition",
            dueDate: configForm.nextDueDate,
          },
        ]
      : student.feeStructure;

    const nextCharges = configForm.extraTitle.trim()
      ? [
          ...student.extraCharges,
          {
            title: configForm.extraTitle.trim(),
            amount: Number(configForm.extraAmount || 0),
            scope: "Additional",
            category: "Miscellaneous",
            dueDate: configForm.nextDueDate,
          },
        ]
      : student.extraCharges;

    const nextExamFees = configForm.examTitle.trim()
      ? [
          ...student.examFees,
          {
            title: configForm.examTitle.trim(),
            amount: Number(configForm.examAmount || 0),
            scope: "Exam",
            category: "Exam Fee",
            dueDate: configForm.nextDueDate,
          },
        ]
      : student.examFees;

    const nextDiscounts = configForm.discountTitle.trim()
      ? [
          ...student.discounts,
          {
            title: configForm.discountTitle.trim(),
            amount: Number(configForm.discountAmount || 0),
            scope: "Student",
            mode: "Flat",
            reason: "Configured from finance dashboard",
          },
        ]
      : student.discounts;

    const nextFineRules = configForm.fineTitle.trim()
      ? [
          ...student.fineRules,
          {
            title: configForm.fineTitle.trim(),
            value: Number(configForm.fineValue || 0),
            mode: configForm.fineMode,
            graceDays: Number(configForm.graceDays || 0),
            active: true,
          },
        ]
      : student.fineRules;

    try {
      const response = await apiRequest(`/api/students/${student._id}/fees/config`, {
        method: "PATCH",
        body: JSON.stringify({
          feePlan: configForm.feePlan,
          baseFee: Number(configForm.baseFee || 0),
          nextDueDate: configForm.nextDueDate,
          feeStructure: nextStructure,
          extraCharges: nextCharges,
          examFees: nextExamFees,
          discounts: nextDiscounts,
          fineRules: nextFineRules,
        }),
      });

      setCapabilities((prev) => ({ ...prev, feeConfig: true }));
      await updateLocalStudent(response.student);
      setConfigForm((prev) => ({
        ...prev,
        structureTitle: "",
        structureAmount: "",
        extraTitle: "",
        extraAmount: "",
        examTitle: "",
        examAmount: "",
        discountTitle: "",
        discountAmount: "",
        fineTitle: "",
        fineValue: "",
        graceDays: "",
      }));
      setSuccess(response.message);
    } catch (configError) {
      if (isMissingRouteError(configError.message)) {
        setCapabilities((prev) => ({ ...prev, feeConfig: false }));
        setError("Fee configuration route is unavailable on the connected backend.");
      } else {
        setError(configError.message);
      }
    } finally {
      setConfigSaving(false);
    }
  };

  const handleProcessRefund = async () => {
    if (!student) {
      setError("Select a student first.");
      return;
    }

    const refundAmount = Number(refundForm.amount);
    if (!Number.isFinite(refundAmount) || refundAmount <= 0) {
      setError("Enter a valid refund amount.");
      return;
    }

    setRefundSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await apiRequest(`/api/students/${student._id}/fees/refund`, {
        method: "POST",
        body: JSON.stringify({
          amount: refundAmount,
          reason: refundForm.reason,
          reference: refundForm.reference,
          processedBy: "Admin",
        }),
      });

      setCapabilities((prev) => ({ ...prev, feeRefunds: true }));
      await updateLocalStudent(response.student);
      setRefundForm({ amount: "", reason: "", reference: "" });
      setSuccess(response.message);
    } catch (refundError) {
      if (isMissingRouteError(refundError.message)) {
        setCapabilities((prev) => ({ ...prev, feeRefunds: false }));
        setError("Refund processing route is unavailable on the connected backend.");
      } else {
        setError(refundError.message);
      }
    } finally {
      setRefundSaving(false);
    }
  };

  const notices = [
    !capabilities.feeDashboard
      ? "Fee dashboard route unavailable. The page is using the general student list fallback."
      : "",
    !capabilities.manualPayment
      ? "Manual payment confirmation route is unavailable on the connected backend."
      : "",
    !capabilities.razorpay
      ? "Razorpay order creation route is unavailable on the connected backend."
      : "",
    !capabilities.feeSummary
      ? "Analytics summary route unavailable. Dashboard cards are using local fallback calculations."
      : "",
    !capabilities.feeReports
      ? "Reports route unavailable. Report tables are using local fallback calculations."
      : "",
    !capabilities.feeConfig
      ? "Fee configuration updates are unavailable on the connected backend."
      : "",
    !capabilities.feeRefunds
      ? "Refund management route is unavailable on the connected backend."
      : "",
  ].filter(Boolean);

  const summaryCards = [
    {
      label: "Total Fee Collection",
      value: formatCurrency(summary?.totalFeeCollection),
      icon: IndianRupee,
      tone: "bg-emerald-50 border-emerald-200 text-emerald-900",
    },
    {
      label: "Total Due Amount",
      value: formatCurrency(summary?.totalDueAmount),
      icon: AlertCircle,
      tone: "bg-amber-50 border-amber-200 text-amber-900",
    },
    {
      label: "Refund Processed",
      value: formatCurrency(summary?.totalRefunds),
      icon: RefreshCcw,
      tone: "bg-rose-50 border-rose-200 text-rose-900",
    },
    {
      label: "Late Fee Fines",
      value: formatCurrency(summary?.totalFines),
      icon: Percent,
      tone: "bg-sky-50 border-sky-200 text-sky-900",
    },
  ];

  return (
    <section className="min-h-screen bg-[linear-gradient(180deg,#edf4ff_0%,#f7fbff_48%,#f8fafc_100%)] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_26px_80px_rgba(15,23,42,0.08)]">
          <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_48%,#0f766e_100%)] px-5 py-6 text-white sm:px-8 sm:py-8">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-4xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100">
                  <ShieldCheck size={14} />
                  Finance Office
                </span>
                <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                   fee collection and finance control 
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-200 sm:text-base">
                  Manage fee structures, semester or yearly dues, QR and Razorpay collections,
                  discounts, refunds, exam fees, outstanding tracking, certificates, and reports
                  from one responsive admin workspace.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/dashboard/academichub/admission"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  New Admission
                </Link>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  Refresh Dashboard
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 lg:p-8">
            {error && (
              <div className="mb-4 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {notices.length > 0 && (
              <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
                <p className="text-sm font-semibold text-amber-900">
                  Backend compatibility notices
                </p>
                <div className="mt-2 space-y-2 text-sm text-amber-800">
                  {notices.map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex min-h-[360px] items-center justify-center rounded-[24px] border border-slate-200 bg-slate-50">
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
                  Loading student fee workspace...
                </div>
              </div>
            ) : students.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
                <h2 className="text-xl font-bold text-slate-900">
                  No students available yet
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Create a student admission first, then return here to manage fee payments,
                  receipts, reports, and ledger entries.
                </p>
                <Link
                  to="/dashboard/academichub/admission"
                  className="mt-5 inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Open Admission Form
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {summaryCards.map((card) => {
                    const Icon = card.icon;
                    return (
                      <div
                        key={card.label}
                        className={`rounded-[24px] border p-5 ${card.tone}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em]">
                              {card.label}
                            </p>
                            <p className="mt-3 text-3xl font-black">{card.value}</p>
                          </div>
                          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70">
                            <Icon size={22} />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                  <div className="rounded-[26px] border border-slate-200 bg-white p-5">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                        <LayoutDashboard size={22} />
                      </span>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">Dashboard Snapshot</h2>
                        <p className="text-sm text-slate-500">
                          Collection summary, payment status mix, and top outstanding students.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-3">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          Total Students
                        </p>
                        <p className="mt-2 text-2xl font-black text-slate-900">
                          {summary?.totalStudents || students.length}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          Paid Students
                        </p>
                        <p className="mt-2 text-2xl font-black text-emerald-900">
                          {summary?.paidStudents || 0}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          Overdue Students
                        </p>
                        <p className="mt-2 text-2xl font-black text-red-700">
                          {summary?.overdueStudents || 0}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-700">
                          Monthly Revenue Analytics
                        </h3>
                        <span className="text-xs text-slate-500">Last 6 months</span>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-6">
                        {(summary?.monthlyRevenue?.length
                          ? summary.monthlyRevenue
                          : Array.from({ length: 6 }).map((_, index) => ({
                              label: `M${index + 1}`,
                              total: 0,
                            }))
                        ).map((item) => {
                          const maxValue = Math.max(
                            ...(summary?.monthlyRevenue?.map((entry) => entry.total) || [1])
                          );
                          const height = maxValue > 0 ? (item.total / maxValue) * 120 : 10;

                          return (
                            <div key={item.label} className="flex flex-col items-center gap-3">
                              <div className="flex h-32 w-full items-end rounded-2xl bg-white px-3 py-3">
                                <div
                                  className="w-full rounded-xl bg-[linear-gradient(180deg,#2563eb_0%,#0f766e_100%)] transition-all"
                                  style={{ height: `${Math.max(height, 10)}px` }}
                                />
                              </div>
                              <div className="text-center">
                                <p className="text-xs font-semibold text-slate-700">{item.label}</p>
                                <p className="text-[11px] text-slate-500">
                                  {formatCurrency(item.total)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[26px] border border-slate-200 bg-white p-5">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                        <ScrollText size={22} />
                      </span>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">Outstanding Report</h2>
                        <p className="text-sm text-slate-500">
                          Students with open balances and their current payment status.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 space-y-3">
                      {(summary?.outstandingStudents || []).length ? (
                        summary.outstandingStudents.map((item) => (
                          <div
                            key={item.registrationNo}
                            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <p className="text-sm font-semibold text-slate-900">
                                  {item.studentName}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {item.registrationNo} • {item.course}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-slate-900">
                                  {formatCurrency(item.pendingAmount)}
                                </p>
                                <span
                                  className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass(
                                    item.status
                                  )}`}
                                >
                                  {item.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-600">
                          No outstanding balances at the moment.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                  <div className="space-y-6">
                    <div className="rounded-[26px] border border-slate-200 bg-white p-5">
                      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                        <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5">
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Select Student
                          </label>
                          <select
                            value={selectedRegistrationNo}
                            onChange={handleStudentChange}
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                          >
                            {students.map((item) => (
                              <option key={item._id} value={item.registrationNo}>
                                {item.studentName || item.fullName} - {item.registrationNo}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="rounded-[24px] border border-slate-200 bg-white p-5">
                          <div className="flex items-center gap-3">
                            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                              <UserRound size={22} />
                            </span>
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                                Student Profile
                              </p>
                              <h2 className="mt-1 text-xl font-bold text-slate-900">
                                {student?.studentName || student?.fullName || "Not selected"}
                              </h2>
                            </div>
                          </div>

                          <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl bg-slate-50 p-4">
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                                Registration No
                              </p>
                              <p className="mt-2 text-sm font-semibold text-slate-900">
                                {student?.registrationNo || "Not available"}
                              </p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 p-4">
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                                Course
                              </p>
                              <p className="mt-2 text-sm font-semibold text-slate-900">
                                {student?.course || "Not available"}
                              </p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 p-4">
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                                Plan
                              </p>
                              <p className="mt-2 text-sm font-semibold text-slate-900">
                                {student?.feePlan || "Yearly"}
                              </p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 p-4">
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                                Status
                              </p>
                              <span
                                className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(
                                  student?.outstandingStatus
                                )}`}
                              >
                                {student?.outstandingStatus || "Pending"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 md:grid-cols-4">
                        <div className="rounded-[24px] border border-slate-200 bg-white p-5">
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                            Base + Structure
                          </p>
                          <p className="mt-3 text-2xl font-black text-slate-900">
                            {formatCurrency(student?.baseFee)}
                          </p>
                        </div>
                        <div className="rounded-[24px] border border-sky-200 bg-sky-50 p-5">
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                            Discounts
                          </p>
                          <p className="mt-3 text-2xl font-black text-sky-900">
                            {formatCurrency(student?.totalDiscount)}
                          </p>
                        </div>
                        <div className="rounded-[24px] border border-violet-200 bg-violet-50 p-5">
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-700">
                            Charges + Exam Fees
                          </p>
                          <p className="mt-3 text-2xl font-black text-violet-900">
                            {formatCurrency(student?.totalExtraCharges)}
                          </p>
                        </div>
                        <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-5">
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
                            Pending Due
                          </p>
                          <p className="mt-3 text-2xl font-black text-amber-900">
                            {formatCurrency(student?.pendingAmount)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[26px] border border-slate-200 bg-white p-5">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
                          <CreditCard size={22} />
                        </span>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">Fee Collection</h3>
                          <p className="text-sm text-slate-500">
                            Collect semester or yearly payments using cash, bank, UPI, cheque, QR, or Razorpay.
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Payment Mode
                          </label>
                          <select
                            value={paymentMethod}
                            onChange={(event) => {
                              setPaymentMethod(event.target.value);
                              setShowQr(false);
                            }}
                            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                          >
                            {paymentModes.map((mode) => (
                              <option key={mode} value={mode}>
                                {mode}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Payment Amount
                          </label>
                          <div className="flex items-center rounded-2xl border border-slate-300 bg-slate-50 px-3 transition focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-100">
                            <IndianRupee size={16} className="text-slate-400" />
                            <input
                              type="number"
                              min="1"
                              value={paymentAmount}
                              onChange={(event) => setPaymentAmount(event.target.value)}
                              className="w-full rounded-2xl bg-transparent px-3 py-3 text-sm text-slate-700 outline-none"
                              placeholder="Enter payment amount"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            UPI ID
                          </label>
                          <input
                            type="text"
                            value={upiId}
                            onChange={(event) => setUpiId(event.target.value)}
                            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                            placeholder="schoolfees@okaxis"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Payee Name
                          </label>
                          <input
                            type="text"
                            value={payeeName}
                            onChange={(event) => setPayeeName(event.target.value)}
                            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                            placeholder="Campus Fee Collection"
                          />
                        </div>

                        {paymentMethod !== "Razorpay Checkout" && (
                          <>
                            <div>
                              <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Transaction Reference
                              </label>
                              <input
                                type="text"
                                value={transactionId}
                                onChange={(event) => setTransactionId(event.target.value)}
                                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                                placeholder="Optional transaction id"
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Note
                              </label>
                              <textarea
                                rows="3"
                                value={note}
                                onChange={(event) => setNote(event.target.value)}
                                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                                placeholder="Add note, reference, or confirmation details"
                              />
                            </div>
                          </>
                        )}
                      </div>

                      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                        {paymentMethod === "Razorpay Checkout" ? (
                          <button
                            type="button"
                            onClick={handleRazorpayPayment}
                            disabled={submitting || !student || pendingAmount <= 0}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#0f766e_0%,#2563eb_100%)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-100 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {submitting ? (
                              <>
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <CreditCard size={16} />
                                Pay with Razorpay
                              </>
                            )}
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={handleGenerateQr}
                              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                            >
                              <QrCode size={16} />
                              Generate QR
                            </button>

                            <button
                              type="button"
                              onClick={handleManualConfirm}
                              disabled={submitting || !student || pendingAmount <= 0}
                              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#0f766e_0%,#2563eb_100%)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-100 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {submitting ? (
                                <>
                                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                  Confirming...
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 size={16} />
                                  Confirm Payment
                                </>
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="rounded-[26px] border border-slate-200 bg-white p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                            <ReceiptText size={22} />
                          </span>
                          <div>
                            <h3 className="text-xl font-bold text-slate-900">Receipt & Documents</h3>
                            <p className="text-sm text-slate-500">
                              QR payment access, downloadable receipt, demand letter, and bonafide certificate.
                            </p>
                          </div>
                        </div>

                        {latestReceipt && (
                          <button
                            type="button"
                            onClick={() =>
                              downloadReceiptPdf({ payment: latestReceipt, student })
                            }
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                          >
                            <Download size={16} />
                            Download
                          </button>
                        )}
                      </div>

                      {paymentMethod === "Razorpay Checkout" ? (
                        <div className="mt-5 rounded-[20px] border border-slate-200 bg-slate-50 p-5">
                          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-700">
                            Razorpay Automatic Checkout
                          </p>
                          <h4 className="mt-2 text-lg font-bold text-slate-900">
                            Official online payment flow
                          </h4>
                          <p className="mt-3 text-sm leading-7 text-slate-600">
                            The system creates a Razorpay order, opens secure checkout, verifies the signature,
                            and generates the receipt automatically.
                          </p>
                          <div className="mt-4 space-y-2 text-sm text-slate-600">
                            <p>
                              <span className="font-semibold text-slate-900">Student:</span>{" "}
                              {student?.studentName || student?.fullName}
                            </p>
                            <p>
                              <span className="font-semibold text-slate-900">Amount:</span>{" "}
                              {formatCurrency(paymentAmount)}
                            </p>
                            <p>
                              <span className="font-semibold text-slate-900">Payee:</span>{" "}
                              {payeeName || "Not set"}
                            </p>
                          </div>
                        </div>
                      ) : showQr && upiPaymentLink ? (
                        <div className="mt-5 rounded-[20px] border border-slate-200 bg-slate-50 p-5">
                          <div className="flex justify-center rounded-2xl bg-white p-4">
                            <QRCodeSVG
                              value={upiPaymentLink}
                              size={220}
                              bgColor="#ffffff"
                              fgColor="#0f172a"
                              level="M"
                              includeMargin
                            />
                          </div>
                          <div className="mt-4 space-y-2 text-sm text-slate-600">
                            <p>
                              <span className="font-semibold text-slate-900">Amount:</span>{" "}
                              {formatCurrency(paymentAmount)}
                            </p>
                            <p>
                              <span className="font-semibold text-slate-900">UPI ID:</span>{" "}
                              {upiId}
                            </p>
                            <p>
                              <span className="font-semibold text-slate-900">Payee:</span>{" "}
                              {payeeName}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-5 rounded-[20px] border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
                          <p className="text-sm leading-7 text-slate-600">
                            Generate a QR code or use another payment flow to begin collection. The latest
                            confirmed receipt will appear here for download.
                          </p>
                        </div>
                      )}

                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => downloadLetterPdf({ student, type: "demand" })}
                          disabled={!student}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <ScrollText size={16} />
                          Demand Letter
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadLetterPdf({ student, type: "bonafide" })}
                          disabled={!student}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <GraduationCap size={16} />
                          Bonafide PDF
                        </button>
                      </div>

                      {latestReceipt && (
                        <div className="mt-5 rounded-[20px] border border-emerald-200 bg-emerald-50 p-5">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                                Latest Receipt
                              </p>
                              <h4 className="mt-2 text-lg font-bold text-emerald-950">
                                {latestReceipt.receiptNumber}
                              </h4>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                downloadReceiptPdf({ payment: latestReceipt, student })
                              }
                              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
                            >
                              <Download size={16} />
                              Download Receipt
                            </button>
                          </div>

                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl bg-white px-4 py-3">
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                                Amount
                              </p>
                              <p className="mt-2 text-sm font-semibold text-slate-900">
                                {formatCurrency(latestReceipt.amount)}
                              </p>
                            </div>
                            <div className="rounded-2xl bg-white px-4 py-3">
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                                Confirmed On
                              </p>
                              <p className="mt-2 text-sm font-semibold text-slate-900">
                                {formatDate(latestReceipt.paymentDate)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-[26px] border border-slate-200 bg-white p-5">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
                        <BadgeIndianRupee size={22} />
                      </span>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Fee Structure & Due Setup</h3>
                        <p className="text-sm text-slate-500">
                          Configure fee plans, structure items, extra admission charges, exam fees, discounts, and fine rules.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Fee Plan
                        </label>
                        <select
                          value={configForm.feePlan}
                          onChange={(event) =>
                            setConfigForm((prev) => ({
                              ...prev,
                              feePlan: event.target.value,
                            }))
                          }
                          className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
                        >
                          <option value="Yearly">Yearly</option>
                          <option value="Semester-wise">Semester-wise</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Base Fee
                        </label>
                        <input
                          type="number"
                          value={configForm.baseFee}
                          onChange={(event) =>
                            setConfigForm((prev) => ({
                              ...prev,
                              baseFee: event.target.value,
                            }))
                          }
                          className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
                          placeholder="50000"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Next Due Date
                        </label>
                        <input
                          type="date"
                          value={configForm.nextDueDate}
                          onChange={(event) =>
                            setConfigForm((prev) => ({
                              ...prev,
                              nextDueDate: event.target.value,
                            }))
                          }
                          className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
                        />
                      </div>
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-slate-900">Structure Item</p>
                        <input
                          type="text"
                          value={configForm.structureTitle}
                          onChange={(event) =>
                            setConfigForm((prev) => ({
                              ...prev,
                              structureTitle: event.target.value,
                            }))
                          }
                          className="mt-3 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
                          placeholder="Tuition Fee"
                        />
                        <input
                          type="number"
                          value={configForm.structureAmount}
                          onChange={(event) =>
                            setConfigForm((prev) => ({
                              ...prev,
                              structureAmount: event.target.value,
                            }))
                          }
                          className="mt-3 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
                          placeholder="Amount"
                        />
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-slate-900">Extra Admission Charge</p>
                        <input
                          type="text"
                          value={configForm.extraTitle}
                          onChange={(event) =>
                            setConfigForm((prev) => ({
                              ...prev,
                              extraTitle: event.target.value,
                            }))
                          }
                          className="mt-3 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
                          placeholder="Registration Kit"
                        />
                        <input
                          type="number"
                          value={configForm.extraAmount}
                          onChange={(event) =>
                            setConfigForm((prev) => ({
                              ...prev,
                              extraAmount: event.target.value,
                            }))
                          }
                          className="mt-3 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
                          placeholder="Amount"
                        />
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-slate-900">Exam Fee</p>
                        <input
                          type="text"
                          value={configForm.examTitle}
                          onChange={(event) =>
                            setConfigForm((prev) => ({
                              ...prev,
                              examTitle: event.target.value,
                            }))
                          }
                          className="mt-3 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
                          placeholder="Semester Exam Fee"
                        />
                        <input
                          type="number"
                          value={configForm.examAmount}
                          onChange={(event) =>
                            setConfigForm((prev) => ({
                              ...prev,
                              examAmount: event.target.value,
                            }))
                          }
                          className="mt-3 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
                          placeholder="Amount"
                        />
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-slate-900">Discount</p>
                        <input
                          type="text"
                          value={configForm.discountTitle}
                          onChange={(event) =>
                            setConfigForm((prev) => ({
                              ...prev,
                              discountTitle: event.target.value,
                            }))
                          }
                          className="mt-3 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
                          placeholder="Scholarship"
                        />
                        <input
                          type="number"
                          value={configForm.discountAmount}
                          onChange={(event) =>
                            setConfigForm((prev) => ({
                              ...prev,
                              discountAmount: event.target.value,
                            }))
                          }
                          className="mt-3 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
                          placeholder="Amount"
                        />
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
                        <p className="text-sm font-semibold text-slate-900">Fine Rule</p>
                        <div className="mt-3 grid gap-3 md:grid-cols-4">
                          <input
                            type="text"
                            value={configForm.fineTitle}
                            onChange={(event) =>
                              setConfigForm((prev) => ({
                                ...prev,
                                fineTitle: event.target.value,
                              }))
                            }
                            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none md:col-span-2"
                            placeholder="Late payment fine"
                          />
                          <select
                            value={configForm.fineMode}
                            onChange={(event) =>
                              setConfigForm((prev) => ({
                                ...prev,
                                fineMode: event.target.value,
                              }))
                            }
                            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
                          >
                            <option value="Flat">Flat</option>
                            <option value="Per Day">Per Day</option>
                          </select>
                          <input
                            type="number"
                            value={configForm.fineValue}
                            onChange={(event) =>
                              setConfigForm((prev) => ({
                                ...prev,
                                fineValue: event.target.value,
                              }))
                            }
                            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
                            placeholder="Value"
                          />
                        </div>
                        <input
                          type="number"
                          value={configForm.graceDays}
                          onChange={(event) =>
                            setConfigForm((prev) => ({
                              ...prev,
                              graceDays: event.target.value,
                            }))
                          }
                          className="mt-3 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
                          placeholder="Grace days"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveFeeConfig}
                      disabled={configSaving || !student}
                      className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {configSaving ? "Saving..." : "Save Fee Configuration"}
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="rounded-[26px] border border-slate-200 bg-white p-5">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
                          <Landmark size={22} />
                        </span>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">Refund Management</h3>
                          <p className="text-sm text-slate-500">
                            Record refund payments and preserve a clean audit trail.
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 space-y-3">
                        <input
                          type="number"
                          value={refundForm.amount}
                          onChange={(event) =>
                            setRefundForm((prev) => ({
                              ...prev,
                              amount: event.target.value,
                            }))
                          }
                          className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none"
                          placeholder="Refund amount"
                        />
                        <input
                          type="text"
                          value={refundForm.reference}
                          onChange={(event) =>
                            setRefundForm((prev) => ({
                              ...prev,
                              reference: event.target.value,
                            }))
                          }
                          className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none"
                          placeholder="Refund reference"
                        />
                        <textarea
                          rows="3"
                          value={refundForm.reason}
                          onChange={(event) =>
                            setRefundForm((prev) => ({
                              ...prev,
                              reason: event.target.value,
                            }))
                          }
                          className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none"
                          placeholder="Reason for refund"
                        />
                        <button
                          type="button"
                          onClick={handleProcessRefund}
                          disabled={refundSaving || !student}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {refundSaving ? "Processing..." : "Process Refund"}
                        </button>
                      </div>
                    </div>

                    <div className="rounded-[26px] border border-slate-200 bg-white p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                            <FileSpreadsheet size={22} />
                          </span>
                          <div>
                            <h3 className="text-xl font-bold text-slate-900">Reports & Export</h3>
                            <p className="text-sm text-slate-500">
                              Daily collection, due, fine, refund, and ledger exports.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() =>
                            downloadCsv("daily-collection-report.csv", reports?.dailyCollection || [])
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          <Banknote size={16} />
                          Daily Collection
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            downloadCsv("student-ledger-report.csv", reports?.studentLedger || [])
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          <ScrollText size={16} />
                          Student Ledger
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            downloadCsv("due-report.csv", reports?.dueReport || [])
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          <AlertCircle size={16} />
                          Due Report
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            downloadCsv("refund-report.csv", reports?.refundReport || [])
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          <RefreshCcw size={16} />
                          Refund Report
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                  <div className="rounded-[26px] border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Payment History</h3>
                        <p className="text-sm text-slate-500">
                          Every confirmed payment generates a receipt entry automatically.
                        </p>
                      </div>
                    </div>

                    {student?.paymentHistory?.length ? (
                      <div className="mt-5 overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-500">
                              <th className="px-3 py-3 font-semibold">Receipt</th>
                              <th className="px-3 py-3 font-semibold">Amount</th>
                              <th className="px-3 py-3 font-semibold">Method</th>
                              <th className="px-3 py-3 font-semibold">Transaction</th>
                              <th className="px-3 py-3 font-semibold">Date</th>
                              <th className="px-3 py-3 font-semibold">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {student.paymentHistory.map((payment) => (
                              <tr key={payment.receiptNumber} className="border-b border-slate-100">
                                <td className="px-3 py-3 font-medium text-slate-900">
                                  {payment.receiptNumber}
                                </td>
                                <td className="px-3 py-3 text-slate-700">
                                  {formatCurrency(payment.amount)}
                                </td>
                                <td className="px-3 py-3 text-slate-700">
                                  {payment.method}
                                </td>
                                <td className="px-3 py-3 text-slate-700">
                                  {payment.transactionId}
                                </td>
                                <td className="px-3 py-3 text-slate-700">
                                  {formatDate(payment.paymentDate)}
                                </td>
                                <td className="px-3 py-3">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      downloadReceiptPdf({ payment, student })
                                    }
                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                                  >
                                    <Download size={14} />
                                    PDF
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-600">
                        No payments confirmed yet.
                      </div>
                    )}
                  </div>

                  <div className="rounded-[26px] border border-slate-200 bg-white p-5">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Student Ledger</h3>
                      <p className="text-sm text-slate-500">
                        Debit, credit, due, discount, fine, and refund movements for the selected student.
                      </p>
                    </div>

                    {student?.ledgerEntries?.length ? (
                      <div className="mt-5 overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-500">
                              <th className="px-3 py-3 font-semibold">Entry</th>
                              <th className="px-3 py-3 font-semibold">Category</th>
                              <th className="px-3 py-3 font-semibold">Direction</th>
                              <th className="px-3 py-3 font-semibold">Amount</th>
                              <th className="px-3 py-3 font-semibold">Balance</th>
                            </tr>
                          </thead>
                          <tbody>
                            {student.ledgerEntries.map((entry) => (
                              <tr key={entry.entryId} className="border-b border-slate-100">
                                <td className="px-3 py-3 font-medium text-slate-900">
                                  {entry.title}
                                </td>
                                <td className="px-3 py-3 text-slate-700">
                                  {entry.category}
                                </td>
                                <td className="px-3 py-3 text-slate-700">
                                  {entry.direction}
                                </td>
                                <td className="px-3 py-3 text-slate-700">
                                  {formatCurrency(entry.amount)}
                                </td>
                                <td className="px-3 py-3 text-slate-700">
                                  {formatCurrency(entry.balanceAfter)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-600">
                        Ledger entries will appear after fee structures or payments are posted.
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-3">
                  <div className="rounded-[26px] border border-slate-200 bg-white p-5">
                    <h3 className="text-lg font-bold text-slate-900">Fee Structure</h3>
                    <div className="mt-4 space-y-3">
                      {student?.feeStructure?.length ? (
                        student.feeStructure.map((item) => (
                          <div key={item.chargeId} className="rounded-2xl bg-slate-50 px-4 py-3">
                            <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                            <p className="text-xs text-slate-500">{item.category}</p>
                            <p className="mt-2 text-sm font-bold text-slate-900">
                              {formatCurrency(item.amount)}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-600">
                          No fee structure items configured yet.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[26px] border border-slate-200 bg-white p-5">
                    <h3 className="text-lg font-bold text-slate-900">Charges, Exams & Discounts</h3>
                    <div className="mt-4 space-y-3">
                      {[...(student?.extraCharges || []), ...(student?.examFees || [])].length ? (
                        [...(student?.extraCharges || []), ...(student?.examFees || [])].map((item) => (
                          <div key={item.chargeId} className="rounded-2xl bg-slate-50 px-4 py-3">
                            <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                            <p className="text-xs text-slate-500">{item.scope}</p>
                            <p className="mt-2 text-sm font-bold text-slate-900">
                              {formatCurrency(item.amount)}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-600">
                          No extra or exam charges recorded yet.
                        </div>
                      )}
                      {student?.discounts?.map((item) => (
                        <div key={item.discountId} className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3">
                          <p className="text-sm font-semibold text-sky-900">{item.title}</p>
                          <p className="mt-2 text-sm font-bold text-sky-900">
                            - {formatCurrency(item.amount)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[26px] border border-slate-200 bg-white p-5">
                    <h3 className="text-lg font-bold text-slate-900">Refund & Fine History</h3>
                    <div className="mt-4 space-y-3">
                      {student?.fineRules?.map((item) => (
                        <div key={item.ruleId} className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                          <p className="text-sm font-semibold text-amber-900">{item.title}</p>
                          <p className="text-xs text-amber-700">
                            {item.mode} • Grace {item.graceDays} days
                          </p>
                          <p className="mt-2 text-sm font-bold text-amber-900">
                            {formatCurrency(item.value)}
                          </p>
                        </div>
                      ))}
                      {student?.refunds?.length ? (
                        student.refunds.map((item) => (
                          <div key={item.refundNumber} className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
                            <p className="text-sm font-semibold text-rose-900">{item.refundNumber}</p>
                            <p className="text-xs text-rose-700">{item.reason || "Refund"}</p>
                            <p className="mt-2 text-sm font-bold text-rose-900">
                              {formatCurrency(item.amount)}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-600">
                          No refund entries yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Fee;
