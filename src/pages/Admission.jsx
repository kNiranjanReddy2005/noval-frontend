import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  FilePlus2,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  UserRoundPlus,
  UsersRound,
} from "lucide-react";
import { apiRequest } from "../config/api";

const initialForm = {
  fullName: "",
  registrationNo: "",
  year: "",
  dob: "",
  phone: "",
  email: "",
  course: "",
  admissionDate: "",
  gender: "",
  address: "",
};

function StudentAdmissionForm() {
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      await apiRequest("/api/admission", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      setMessage("Student admission saved successfully.");
      setFormData(initialForm);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "fullName", label: "Full Name", type: "text", placeholder: "Enter full name" },
    { name: "registrationNo", label: "Registration No", type: "text", placeholder: "Enter registration number" },
    { name: "year", label: "Year", type: "text", placeholder: "1st Year" },
    { name: "dob", label: "Date of Birth", type: "date" },
    { name: "phone", label: "Phone", type: "tel", placeholder: "Enter phone" },
    { name: "email", label: "Email", type: "email", placeholder: "Enter email" },
    { name: "course", label: "Course", type: "text", placeholder: "Enter course" },
    { name: "admissionDate", label: "Admission Date", type: "date" },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.14),_transparent_30%),linear-gradient(180deg,#f4f7fb_0%,#eef3f9_45%,#f8fafc_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="overflow-hidden rounded-[30px] border border-slate-200/80 bg-white shadow-[0_25px_80px_rgba(15,23,42,0.10)]">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
            <section className="relative overflow-hidden bg-[linear-gradient(160deg,#0f172a_0%,#133b5c_52%,#0f766e_100%)] px-6 py-8 text-white sm:px-8 lg:px-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_24%),radial-gradient(circle_at_bottom_left,_rgba(45,212,191,0.18),_transparent_28%)]" />
              <div className="relative">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-teal-100">
                  <FilePlus2 size={14} />
                  Official Admission Desk
                </span>

                <h1 className="mt-5 max-w-xl text-3xl font-black tracking-tight sm:text-4xl">
                  Student admission portal with a clean, professional workflow.
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
                  Complete student onboarding with a polished institutional interface,
                  quick navigation for admission actions, and a clear form designed for
                  fast, accurate data entry.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm transition duration-300 hover:-translate-y-1">
                    <p className="text-xs uppercase tracking-[0.22em] text-teal-100">
                      Process
                    </p>
                    <p className="mt-2 text-2xl font-bold text-white">01</p>
                    <p className="mt-2 text-sm text-slate-200">Single-page submission flow</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm transition duration-300 hover:-translate-y-1">
                    <p className="text-xs uppercase tracking-[0.22em] text-teal-100">
                      Records
                    </p>
                    <p className="mt-2 text-2xl font-bold text-white">100%</p>
                    <p className="mt-2 text-sm text-slate-200">Structured admission details</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm transition duration-300 hover:-translate-y-1">
                    <p className="text-xs uppercase tracking-[0.22em] text-teal-100">
                      Access
                    </p>
                    <p className="mt-2 text-2xl font-bold text-white">24/7</p>
                    <p className="mt-2 text-sm text-slate-200">Ready for admin desk use</p>
                  </div>
                </div>

                <div className="mt-8 rounded-[26px] border border-white/10 bg-white/10 p-5 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-400/20 text-teal-100">
                      <GraduationCap size={22} />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-100">
                        Admission Actions
                      </p>
                      <h2 className="mt-1 text-xl font-bold text-white">
                        Choose a path and continue
                      </h2>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3">
                    <Link
                      to="/dashboard/academichub/admission"
                      className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-4 transition duration-300 hover:-translate-y-1 hover:bg-white/15"
                    >
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300/20 text-cyan-100">
                          <UsersRound size={20} />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-white">Student Admission</p>
                          <p className="text-xs text-slate-300">Start new student onboarding</p>
                        </div>
                      </div>
                      <ArrowRight
                        size={18}
                        className="text-cyan-100 transition duration-300 group-hover:translate-x-1"
                      />
                    </Link>

                    <Link
                      to="/teacher-admission"
                      className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-4 transition duration-300 hover:-translate-y-1 hover:bg-white/15"
                    >
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-fuchsia-300/20 text-fuchsia-100">
                          <UserRoundPlus size={20} />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-white">Teacher Admission</p>
                          <p className="text-xs text-slate-300">Add a new educator profile</p>
                        </div>
                      </div>
                      <ArrowRight
                        size={18}
                        className="text-fuchsia-100 transition duration-300 group-hover:translate-x-1"
                      />
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white px-6 py-8 sm:px-8 lg:px-10">
              <div className="border-b border-slate-200 pb-5">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-teal-700">
                  Student Admission Form
                </p>
                <h2 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
                  Submit candidate details
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                  Enter the applicant information carefully to create an accurate
                  admission record for the institution.
                </p>
              </div>

              {error && (
                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              {message && (
                <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                <div className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5">
                  <div className="mb-5 flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
                      <UsersRound size={18} />
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>
                      <p className="text-sm text-slate-500">Basic student identity and contact details</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {fields.slice(0, 6).map((field) => {
                      const icon =
                        field.name === "dob" ? (
                          <CalendarDays size={16} />
                        ) : field.name === "phone" ? (
                          <Phone size={16} />
                        ) : field.name === "email" ? (
                          <Mail size={16} />
                        ) : (
                          <UsersRound size={16} />
                        );

                      return (
                        <div key={field.name}>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            {field.label}
                          </label>
                          <div className="flex items-center rounded-2xl border border-slate-300 bg-white px-3 transition focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-100">
                            <span className="text-slate-400">{icon}</span>
                            <input
                              name={field.name}
                              type={field.type}
                              value={formData[field.name]}
                              onChange={handleChange}
                              placeholder={field.placeholder}
                              className="w-full rounded-2xl bg-transparent px-3 py-3 text-sm text-slate-700 outline-none"
                              required
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-5 flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
                      <GraduationCap size={18} />
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Academic Information</h3>
                      <p className="text-sm text-slate-500">Course and enrollment details</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {fields.slice(6).map((field) => (
                      <div key={field.name}>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          {field.label}
                        </label>
                        <div className="flex items-center rounded-2xl border border-slate-300 bg-slate-50 px-3 transition focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
                          <span className="text-slate-400">
                            {field.name === "admissionDate" ? (
                              <CalendarDays size={16} />
                            ) : (
                              <GraduationCap size={16} />
                            )}
                          </span>
                          <input
                            name={field.name}
                            type={field.type}
                            value={formData[field.name]}
                            onChange={handleChange}
                            placeholder={field.placeholder}
                            className="w-full rounded-2xl bg-transparent px-3 py-3 text-sm text-slate-700 outline-none"
                            required
                          />
                        </div>
                      </div>
                    ))}

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Gender
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        required
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5">
                  <div className="mb-5 flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                      <MapPin size={18} />
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Address Information</h3>
                      <p className="text-sm text-slate-500">Permanent contact location for records</p>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows="4"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                      placeholder="Enter full address"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <Link
                    to="/students"
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition duration-300 hover:bg-slate-100"
                  >
                    Back to Students
                  </Link>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex min-w-[210px] items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#0f766e_0%,#1d4ed8_100%)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-200 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Admission
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentAdmissionForm;
