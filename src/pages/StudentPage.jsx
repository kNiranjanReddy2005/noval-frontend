import { Link } from "react-router-dom";
import { ArrowRight, Code2, Database, PencilRuler } from "lucide-react";
import Navbar from "../components/Navbar";

const courses = [
  {
    title: "Web Development",
    description: "Learn frontend, backend, APIs, and deployment with real project workflows.",
    icon: Code2,
    accent: "from-cyan-100 to-blue-100",
    ring: "border-cyan-200",
    iconBg: "bg-cyan-100 text-cyan-700",
  },
  {
    title: "Data Science",
    description: "Build analytical skills with machine learning, data visualization, and practical datasets.",
    icon: Database,
    accent: "from-emerald-100 to-teal-100",
    ring: "border-emerald-200",
    iconBg: "bg-emerald-100 text-emerald-700",
  },
  {
    title: "UI/UX Design",
    description: "Create intuitive interfaces with design systems, research, prototyping, and usability thinking.",
    icon: PencilRuler,
    accent: "from-fuchsia-100 to-pink-100",
    ring: "border-fuchsia-200",
    iconBg: "bg-fuchsia-100 text-fuchsia-700",
  },
];

function StudentPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <section className="page-enter">
          <div className="mb-12 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-cyan-700">
                Student Admission
              </p>
              <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                Choose a course and begin your admission journey.
              </h1>
              <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">
                Browse animated course cards, compare opportunities, and move into the application form with a smooth page transition.
              </p>
            </div>

            <Link
              to="/dashboard/academichub/admission"
              className="inline-flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm transition duration-300 hover:-translate-y-1 hover:bg-slate-100"
            >
              Open Admission Form
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course, index) => {
              const Icon = course.icon;
              return (
                <article
                  key={course.title}
                  className={`page-stagger rounded-[2rem] border ${course.ring} bg-gradient-to-br ${course.accent} p-6 shadow-xl shadow-slate-200 transition duration-300 hover:-translate-y-2 hover:shadow-2xl`}
                  style={{ animationDelay: `${index * 140}ms` }}
                >
                  <div className={`mb-6 inline-flex rounded-2xl p-4 ${course.iconBg}`}>
                    <Icon size={28} />
                  </div>

                  <h2 className="text-2xl font-bold text-slate-900">{course.title}</h2>
                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    {course.description}
                  </p>

                  <div className="mt-8 flex items-center justify-between gap-4">
                    <span className="rounded-full border border-white/70 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
                      Enrollment Open
                    </span>
                    <Link
                      to="/dashboard/academichub/admission"
                      className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition duration-300 hover:scale-[1.03] hover:bg-indigo-600 active:scale-[0.97]"
                    >
                      Apply Now
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

export default StudentPage;
