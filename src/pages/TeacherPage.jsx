import { useState } from "react";
import { CheckCircle2, FileText, Send, UserRound, Mail, BriefcaseBusiness } from "lucide-react";
import Navbar from "../components/Navbar";

const initialTeacherForm = {
  fullName: "",
  email: "",
  subjectExpertise: "",
  experience: "",
  resume: null,
};

function TeacherPage() {
  const [formData, setFormData] = useState(initialTeacherForm);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value, files } = event.target;
    setSubmitted(false);
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setSubmitted(false);

    await new Promise((resolve) => setTimeout(resolve, 900));

    setLoading(false);
    setSubmitted(true);
    setFormData(initialTeacherForm);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <section className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="page-enter space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-fuchsia-700">
              Teacher Admission
            </p>
            <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              Apply as an educator through a modern professional form.
            </h1>
            <p className="text-base leading-8 text-slate-600 sm:text-lg">
              Share your subject expertise, teaching experience, and resume through a clean responsive application experience.
            </p>

            <div className="rounded-[2rem] border border-fuchsia-200 bg-fuchsia-50 p-6 shadow-lg shadow-fuchsia-100">
              <div className="mb-4 inline-flex rounded-2xl bg-fuchsia-100 p-3 text-fuchsia-700">
                <FileText size={24} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">What to prepare</h2>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                <li>Your professional teaching profile</li>
                <li>Subject specialization and years of experience</li>
                <li>Updated resume for verification</li>
              </ul>
            </div>
          </div>

          <div className="page-enter-delayed">
            <div className="rounded-[2rem] border border-white bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-8">
              <div className="mb-8 flex flex-col gap-3 border-b border-slate-200 pb-5">
                <h2 className="text-3xl font-bold text-slate-900">
                  Teacher Admission Form
                </h2>
                <p className="text-sm text-slate-500">
                  Complete the details below and submit your application.
                </p>
              </div>

              {submitted && (
                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-700">
                  <CheckCircle2 className="mt-0.5" size={18} />
                  <span>Your application has been submitted successfully.</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="grid gap-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Full Name</span>
                    <div className="relative">
                      <UserRound className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="teacher-field pl-11"
                        placeholder="Enter full name"
                        required
                      />
                    </div>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Email</span>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="teacher-field pl-11"
                        placeholder="Enter email address"
                        required
                      />
                    </div>
                  </label>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Subject Expertise</span>
                    <div className="relative">
                      <BriefcaseBusiness className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="text"
                        name="subjectExpertise"
                        value={formData.subjectExpertise}
                        onChange={handleChange}
                        className="teacher-field pl-11"
                        placeholder="e.g. Mathematics"
                        required
                      />
                    </div>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Experience (years)</span>
                    <input
                      type="number"
                      min="0"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      className="teacher-field"
                      placeholder="e.g. 5"
                      required
                    />
                  </label>
                </div>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Upload Resume</span>
                  <input
                    type="file"
                    name="resume"
                    onChange={handleChange}
                    className="teacher-field file:mr-4 file:rounded-xl file:border-0 file:bg-fuchsia-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-fuchsia-700 hover:file:bg-fuchsia-200"
                    accept=".pdf,.doc,.docx"
                    required
                  />
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-3 inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-pink-500 px-6 py-4 text-base font-bold text-white shadow-xl shadow-fuchsia-200 transition duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:from-fuchsia-500 hover:to-pink-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/80 border-t-transparent" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Submit Application
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default TeacherPage;
