import { Bell, CreditCard, GraduationCap, ShieldCheck, UserCircle2 } from "lucide-react";
import { getStoredUser } from "../utils/auth";

const statCards = [
  { title: "Attendance Status", value: "92%", note: "Current month attendance", icon: ShieldCheck },
  { title: "Admission Status", value: "Approved", note: "Admission verified by admin", icon: GraduationCap },
  { title: "Fee Status", value: "Up to date", note: "Latest receipt available", icon: CreditCard },
  { title: "Notifications", value: "03", note: "Unread student notices", icon: Bell },
];

export default function StudentDashboard() {
  const user = getStoredUser();

  return (
    <section className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.10),_transparent_28%),linear-gradient(180deg,#f7fafc_0%,#eff6ff_48%,#ecfeff_100%)] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#14532d_52%,#0f766e_100%)] p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] md:p-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100">
            Student Portal
          </span>
          <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
            Welcome, {user?.name || "Student"}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-200 sm:text-base">
            Your dashboard is view-only. You can check attendance, admission details, fee receipts,
            notifications, and your personal profile from one place.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{item.title}</p>
                    <p className="mt-3 text-3xl font-black text-slate-900">{item.value}</p>
                    <p className="mt-2 text-sm text-slate-500">{item.note}</p>
                  </div>
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                    <Icon size={22} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <UserCircle2 size={24} />
              </span>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Personal Profile</h2>
                <p className="text-sm text-slate-500">Student account information</p>
              </div>
            </div>

            <div className="mt-6 space-y-4 text-sm text-slate-700">
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <span className="font-semibold">Name:</span> {user?.name || "-"}
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <span className="font-semibold">Email:</span> {user?.email || "-"}
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <span className="font-semibold">Role:</span> Student
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Student Access Scope</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {[
                "View attendance",
                "View admission details",
                "View fee receipts",
                "View notifications",
                "View personal profile",
                "No edit or delete permission",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
