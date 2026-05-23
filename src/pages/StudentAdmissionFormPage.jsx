import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  FileSpreadsheet,
  GraduationCap,
  ImagePlus,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { API_BASE_URL, apiRequest } from "../config/api";

const courseOptions = [
  "B.Sc Nursing",
  "M.Sc Nursing",
  "P.B.BSc Nursing",
  "ANM",
  "GNM",
];

const COMMON_REQUIRED_DOCUMENTS = [
  "10th Certificate",
  "10th Marksheet",
  "+2 Certificate",
  "+2 Marksheet",
  "CLC",
  "Caste Certificate (SC, ST, OBC, SEBC)",
  "Aadhar Card",
  "Pass Photo",
  "Signature",
  "Resident Certificate",
];

const COURSE_DOCUMENTS = {
  "B.Sc Nursing": COMMON_REQUIRED_DOCUMENTS,
  GNM: COMMON_REQUIRED_DOCUMENTS,
  ANM: COMMON_REQUIRED_DOCUMENTS,
  "M.Sc Nursing": COMMON_REQUIRED_DOCUMENTS,
  "P.B.BSc Nursing": [
    ...COMMON_REQUIRED_DOCUMENTS,
    "GNM Marksheet",
    "GNM Provisional Certificate",
    "Registration Certificate (ONMRC)",
  ],
};

const PASS_PHOTO_LABEL = "Pass Photo";
const CASTE_CERTIFICATE_LABEL = "Caste Certificate (SC, ST, OBC, SEBC)";

const initialForm = {
  studentName: "",
  email: "",
  phone: "",
  address: "",
  dob: "",
  gender: "",
  course: "",
  casteCategory: "",
};

function StudentAdmissionFormPage() {
  const [searchParams] = useSearchParams();
  const selectedCourse = searchParams.get("course") || "";
  const [formData, setFormData] = useState({
    ...initialForm,
    course: selectedCourse,
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [casteCertificateFile, setCasteCertificateFile] = useState(null);
  const [documentFiles, setDocumentFiles] = useState({});
  const [loading, setLoading] = useState(false);
  const [successRecord, setSuccessRecord] = useState(null);
  const [error, setError] = useState("");
  const requiresCasteCertificate =
    formData.casteCategory === "OBC" ||
    formData.casteCategory === "SC" ||
    formData.casteCategory === "ST";

  const photoPreview = useMemo(() => {
    if (!photoFile) {
      return "";
    }

    return URL.createObjectURL(photoFile);
  }, [photoFile]);

  const requiredDocuments = useMemo(
    () => COURSE_DOCUMENTS[formData.course] || COMMON_REQUIRED_DOCUMENTS,
    [formData.course]
  );

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (name === "casteCategory" && value === "General") {
      setCasteCertificateFile(null);
      setDocumentFiles((current) => {
        const next = { ...current };
        delete next[CASTE_CERTIFICATE_LABEL];
        return next;
      });
    }
  };

  const handleDocumentFileChange = (label, event) => {
    const file = event.target.files?.[0] || null;

    setDocumentFiles((current) => {
      const next = { ...current };
      if (file) {
        next[label] = file;
      } else {
        delete next[label];
      }
      return next;
    });

    if (label === PASS_PHOTO_LABEL) {
      setPhotoFile(file);
    }

    if (label === CASTE_CERTIFICATE_LABEL) {
      setCasteCertificateFile(file);
    }
  };

  const resetForm = () => {
    setFormData({
      ...initialForm,
      course: selectedCourse,
    });
    setPhotoFile(null);
    setCasteCertificateFile(null);
    setDocumentFiles({});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccessRecord(null);

    try {
      if (requiresCasteCertificate && !casteCertificateFile) {
        throw new Error("Please upload the caste certificate for the selected category.");
      }

      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => payload.append(key, value));
      if (photoFile) {
        payload.append("photo", photoFile);
      }
      if (casteCertificateFile) {
        payload.append("casteCertificate", casteCertificateFile);
      }
      const supportingDocumentEntries = Object.entries(documentFiles).filter(
        ([label, file]) => file && label !== PASS_PHOTO_LABEL && label !== CASTE_CERTIFICATE_LABEL
      );
      supportingDocumentEntries.forEach(([, file]) => payload.append("supportingDocuments", file));
      payload.append(
        "supportingDocumentLabels",
        JSON.stringify(supportingDocumentEntries.map(([label]) => label))
      );

      const response = await apiRequest("/api/admission", {
        method: "POST",
        body: payload,
      });

      setSuccessRecord(response.student);
      resetForm();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  const exportUrl = `${API_BASE_URL}/api/admission/export/xlsx`;

  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_28%),linear-gradient(180deg,#eff6ff_0%,#f8fafc_45%,#e5e7eb_100%)] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.10)]">
          <div className="grid xl:grid-cols-[370px_minmax(0,1fr)]">
            <aside className="relative overflow-hidden bg-[linear-gradient(180deg,#0f172a_0%,#0f3d73_52%,#1d4ed8_100%)] px-6 py-7 text-white sm:px-8">
              <div className="hero-grid" />
              <div className="relative">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-blue-100">
                  <ShieldCheck size={14} />
                  Official Admission Portal
                </span>

                <h1 className="mt-5 text-3xl font-black tracking-tight">
                  Professional course admission form
                </h1>
                <p className="mt-4 text-sm leading-7 text-slate-200">
                  Submit the admission profile once and keep the academic office,
                  Google Forms, Google Sheets, and Excel export records aligned from
                  the same workflow.
                </p>

                <div className="mt-7 space-y-4">
                  <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">
                      Workflow
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white">
                      Website Admission Form to Google Form to Google Sheets to Excel
                      export.
                    </p>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">
                      Selected Course
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {formData.course || "Choose a course below"}
                    </p>
                  </div>
                </div>

                <div className="mt-8 grid gap-3">
                  <a
                    href={exportUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                  >
                    <FileSpreadsheet size={16} />
                    Download Excel Records
                  </a>
                  <Link
                    to="/dashboard/academichub/admission/records"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                  >
                    View Admin Dashboard
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </aside>

            <div className="bg-white px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
              <div className="rounded-[28px] border border-blue-100 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">
                  College Admission Management
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                  Student admission application
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                  Complete the official form below. Every submission is designed to
                  flow into the institute’s admission records dashboard and Google
                  sheet export workflow.
                </p>
              </div>

              <div className="mt-5 rounded-[28px] border border-amber-200 bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_100%)] p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                    <CheckCircle2 size={22} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
                      Required Documents To Be Uploaded
                    </p>
                    <h3 className="mt-2 text-xl font-black text-slate-900">
                      {formData.course || "Selected course"} document checklist
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Each required document now has its own upload option below. Upload the caste certificate when required by category, and complete every relevant document slot for the selected course.
                    </p>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {requiredDocuments.map((documentName, index) => (
                        <div
                          key={`${formData.course || "course"}-${documentName}`}
                          className="rounded-2xl border border-amber-100 bg-white px-4 py-3 text-sm text-slate-700"
                        >
                          <span className="font-semibold text-amber-700">{index + 1}.</span> {documentName}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {successRecord && (
                <div className="mt-5 rounded-[28px] border border-emerald-200 bg-emerald-50 px-5 py-5 text-emerald-900 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                        <CheckCircle2 size={16} />
                        Submission Successful
                      </p>
                      <h3 className="mt-2 text-xl font-bold">
                        Admission saved for {successRecord.studentName}
                      </h3>
                      <p className="mt-2 text-sm leading-6">
                        Application ID: {successRecord.applicationId} and current
                        status: {successRecord.status}.
                      </p>
                    </div>

                    <Link
                      to="/dashboard/academichub/admission/records"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                      Open Dashboard
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div className="grid gap-5 lg:grid-cols-2">
                  <label className="rounded-[26px] border border-slate-200 bg-slate-50 p-4 shadow-sm transition hover:border-blue-200 hover:bg-white">
                    <span className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <UserRound size={16} className="text-blue-700" />
                      Student Name
                    </span>
                    <input
                      name="studentName"
                      value={formData.studentName}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                      placeholder="Enter student full name"
                      required
                    />
                  </label>

                  <label className="rounded-[26px] border border-slate-200 bg-slate-50 p-4 shadow-sm transition hover:border-blue-200 hover:bg-white">
                    <span className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Mail size={16} className="text-blue-700" />
                      Email
                    </span>
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                      placeholder="Enter email address"
                      required
                    />
                  </label>

                  <label className="rounded-[26px] border border-slate-200 bg-slate-50 p-4 shadow-sm transition hover:border-blue-200 hover:bg-white">
                    <span className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Phone size={16} className="text-blue-700" />
                      Phone Number
                    </span>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                      placeholder="Enter phone number"
                      required
                    />
                  </label>

                  <label className="rounded-[26px] border border-slate-200 bg-slate-50 p-4 shadow-sm transition hover:border-blue-200 hover:bg-white">
                    <span className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <GraduationCap size={16} className="text-blue-700" />
                      Course Selection
                    </span>
                    <select
                      name="course"
                      value={formData.course}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                      required
                    >
                      <option value="">Select course</option>
                      {courseOptions.map((course) => (
                        <option key={course} value={course}>
                          {course}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="rounded-[26px] border border-slate-200 bg-slate-50 p-4 shadow-sm transition hover:border-blue-200 hover:bg-white">
                    <span className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <UserRound size={16} className="text-blue-700" />
                      Gender
                    </span>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                      required
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </label>

                  <label className="rounded-[26px] border border-slate-200 bg-slate-50 p-4 shadow-sm transition hover:border-blue-200 hover:bg-white">
                    <span className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <UserRound size={16} className="text-blue-700" />
                      Date of Birth
                    </span>
                    <input
                      name="dob"
                      type="date"
                      value={formData.dob}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                      required
                    />
                  </label>

                  <label className="rounded-[26px] border border-slate-200 bg-slate-50 p-4 shadow-sm transition hover:border-blue-200 hover:bg-white">
                    <span className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <UserRound size={16} className="text-blue-700" />
                      Caste Category
                    </span>
                    <select
                      name="casteCategory"
                      value={formData.casteCategory}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                      required
                    >
                      <option value="">Select caste category</option>
                      <option value="General">General</option>
                      <option value="OBC">OBC</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                    </select>
                  </label>
                </div>

                <div className="grid gap-5 lg:grid-cols-[1fr_minmax(0,1fr)]">
                  <label className="rounded-[26px] border border-slate-200 bg-slate-50 p-4 shadow-sm transition hover:border-blue-200 hover:bg-white">
                    <span className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <MapPin size={16} className="text-blue-700" />
                      Address
                    </span>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows="6"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                      placeholder="Enter complete address"
                      required
                    />
                  </label>
                </div>

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {requiredDocuments.map((documentName) => {
                    const isPhoto = documentName === PASS_PHOTO_LABEL;
                    const isCasteCertificate = documentName === CASTE_CERTIFICATE_LABEL;
                    const file = documentFiles[documentName] || null;
                    const isCasteRequired = isCasteCertificate ? requiresCasteCertificate : true;

                    return (
                      <label
                        key={`${formData.course || "course"}-upload-${documentName}`}
                        className="rounded-[26px] border border-dashed border-blue-200 bg-[linear-gradient(180deg,#eff6ff_0%,#ffffff_100%)] p-4 shadow-sm transition hover:border-blue-300"
                      >
                        <span className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <ImagePlus size={16} className="text-blue-700" />
                          {documentName}
                        </span>

                        <div className="flex h-full flex-col justify-between gap-4">
                          <input
                            type="file"
                            accept={isPhoto ? "image/*" : ".pdf,.jpg,.jpeg,.png"}
                            onChange={(event) => handleDocumentFileChange(documentName, event)}
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:font-semibold file:text-white hover:file:bg-blue-700"
                            required={isPhoto || isCasteRequired}
                          />

                          {isPhoto ? (
                            photoPreview ? (
                              <img
                                src={photoPreview}
                                alt="Admission preview"
                                className="h-44 w-full rounded-2xl object-cover shadow-sm"
                              />
                            ) : (
                              <div className="flex h-44 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-center text-sm text-slate-500">
                                Candidate photo preview will appear here.
                              </div>
                            )
                          ) : (
                            <div className="flex h-44 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-center text-sm text-slate-500">
                              {file
                                ? file.name
                                : isCasteCertificate && !requiresCasteCertificate
                                  ? "Optional for General category."
                                  : `Upload ${documentName}.`}
                            </div>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>

                <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <Link
                    to="/student-admission"
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Back to Courses
                  </Link>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#1d4ed8_0%,#0f172a_100%)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Submitting..." : "Submit Admission"}
                    <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default StudentAdmissionFormPage;
