import { useMemo, useState } from "react";
import { ArrowUpRight, BriefcaseBusiness, CircleGauge, Sparkles } from "lucide-react";
import CategoryNavbar from "../components/CategoryNavbar";
import menuData from "../data/menuData";


const categoryDescriptions = {
  "Academic Hub":
    "Handle daily academic workflows, from new admissions to attendance tracking and exam coordination.",
  "Finance & Account":
    "Review fee operations, accounting records, and reporting tools from one finance workspace.",
  "Operation & Admin":
    "Keep campus operations moving with support, inventory, communication, and registration modules.",
  "Control System":
    "Manage permissions, platform settings, credentials, and institution-wide control panels.",
};

const liveModulePaths = new Set([
  "/dashboard/academichub/admission",
  "/dashboard/academichub/attedence",
  "/dashboard/academichub/exam",
]);

const Dashboard = () => {
  const [activeMenu, setActiveMenu] = useState("Academic Hub");
  const activeCategory = menuData[activeMenu] ?? menuData["Academic Hub"];

  const summary = useMemo(() => {
    const totalModules = activeCategory.items.length;
    const readyModules = activeCategory.items.filter((item) =>
      liveModulePaths.has(item.path)
    ).length;

    return {
      totalModules,
      readyModules,
      comingSoon: totalModules - readyModules,
    };
  }, [activeCategory]);

  return (
    <section className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.10),_transparent_28%),linear-gradient(180deg,#f3f7fb_0%,#eef4f8_52%,#f8fafc_100%)] p-4 md:p-6 lg:p-8">
      <div className="rounded-[32px] border border-slate-200/80 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.08)]">
        <div className="relative overflow-hidden rounded-[32px] p-6 md:p-8 lg:p-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.10),_transparent_22%),radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.10),_transparent_26%)]" />

          <div className="relative">
            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[28px] bg-[linear-gradient(135deg,#0f172a_0%,#163256_50%,#0f766e_100%)] p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.24)] md:p-8">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100">
                    <Sparkles size={14} />
                    Official Dashboard
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100">
                    <CircleGauge size={14} />
                    Live Workspace
                  </span>
                </div>

                <h1 className="mt-5 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                  Professional control center for daily academic operations.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
                  Manage admissions, attendance, examination workflows, and
                  institutional modules from one official dashboard with a cleaner,
                  more focused admin experience.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm transition duration-300 hover:-translate-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
                      Modules
                    </p>
                    <p className="mt-2 text-3xl font-bold text-white">
                      {summary.totalModules}
                    </p>
                    <p className="mt-2 text-sm text-slate-300">
                      Total tools in this category
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm transition duration-300 hover:-translate-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100">
                      Ready Now
                    </p>
                    <p className="mt-2 text-3xl font-bold text-white">
                      {summary.readyModules}
                    </p>
                    <p className="mt-2 text-sm text-slate-300">
                      Live modules available today
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm transition duration-300 hover:-translate-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-100">
                      Coming Soon
                    </p>
                    <p className="mt-2 text-3xl font-bold text-white">
                      {summary.comingSoon}
                    </p>
                    <p className="mt-2 text-sm text-slate-300">
                      Planned modules in progress
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">
                        Active Focus
                      </p>
                      <h2 className="mt-3 text-2xl font-bold text-slate-900">
                        {activeMenu}
                      </h2>
                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        {categoryDescriptions[activeMenu]}
                      </p>
                    </div>
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                      <BriefcaseBusiness size={22} />
                    </span>
                  </div>
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#f8fafc_0%,#eef6ff_100%)] p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
                    Workspace Status
                  </p>
                  <div className="mt-4 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-3xl font-black text-slate-900">
                        {Math.round((summary.readyModules / summary.totalModules) * 100) || 0}%
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Category readiness based on currently live modules.
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1.5 text-sm font-semibold text-sky-700">
                      Explore
                      <ArrowUpRight size={16} />
                    </span>
                  </div>
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white shadow-xl transition duration-300 hover:-translate-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                    Current Theme
                  </p>
                  <h3 className="mt-3 text-xl font-bold text-white">
                    Professional admin workspace
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    Built for structured navigation, faster decisions, and a more
                    official institutional dashboard experience.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-[28px] border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
              <CategoryNavbar
                activeMenu={activeMenu}
                onMenuChange={setActiveMenu}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
