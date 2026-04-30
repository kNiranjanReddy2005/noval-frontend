// import React from "react";
// import Sidebar from "../components/Sidebar";

// export default function ExamDashboard() {
//   const exams = [
//     { subject: "Mathematics", date: "10 May 2026", status: "Upcoming" },
//     { subject: "Physics", date: "12 May 2026", status: "Upcoming" },
//     { subject: "Chemistry", date: "15 May 2026", status: "Completed" },
//     { subject: "Biology", date: "18 May 2026", status: "Upcoming" },
//   ];

//   return (
//     <div className="min-h-screen bg-gray-100 p-6">
//     <div className="">
//         <div className="w-64 hidden md:block">
//         <Sidebar />
//       </div>
//     </div>
//      <div>
//        {/* Header */}
//       <h1 className="text-3xl font-bold mb-6 text-center">
//         Exam Dashboard
//       </h1>

//       {/* Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//         <div className="bg-white p-4 rounded-xl shadow">
//           <h2 className="text-lg font-semibold">Total Exams</h2>
//           <p className="text-2xl font-bold">4</p>
//         </div>

//         <div className="bg-white p-4 rounded-xl shadow">
//           <h2 className="text-lg font-semibold">Upcoming</h2>
//           <p className="text-2xl font-bold">3</p>
//         </div>

//         <div className="bg-white p-4 rounded-xl shadow">
//           <h2 className="text-lg font-semibold">Completed</h2>
//           <p className="text-2xl font-bold">1</p>
//         </div>
//       </div>

//       {/* Exam List */}
//       <div className="bg-white rounded-xl shadow p-4">
//         <h2 className="text-xl font-semibold mb-4">Exam Schedule</h2>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {exams.map((exam, index) => (
//             <div
//               key={index}
//               className="p-4 border rounded-lg flex justify-between items-center"
//             >
//               <div>
//                 <h3 className="font-bold">{exam.subject}</h3>
//                 <p className="text-sm text-gray-500">{exam.date}</p>
//               </div>

//               <span
//                 className={`px-3 py-1 rounded-full text-sm ${
//                   exam.status === "Completed"
//                     ? "bg-green-200"
//                     : "bg-yellow-200"
//                 }`}
//               >
//                 {exam.status}
//               </span>
//             </div>
//           ))}
//         </div>

//       </div>
//       <div className="flex justify-end mt-4">
//          <a href="http://localhost:5173/"
//               className="bg-gray-500 text-white px-5 py-2 rounded-lg text-center hover:bg-gray-700">
//               Back
//             </a>
//       </div>
//     </div>
//      </div>
//   );
// }


import React from "react";

export default function ExamDashboard() {
  const exams = [
    { subject: "Mathematics", date: "10 May 2026", status: "Upcoming" },
    { subject: "Physics", date: "12 May 2026", status: "Upcoming" },
    { subject: "Chemistry", date: "15 May 2026", status: "Completed" },
    { subject: "Biology", date: "18 May 2026", status: "Upcoming" },
  ];

  return (
    <>
      <div className="flex-1 p-6">

        {/* Header */}
        <h1 className="text-3xl font-bold mb-6 text-center">
          Exam Dashboard
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow">
            <h2 className="text-lg font-semibold">Total Exams</h2>
            <p className="text-2xl font-bold">4</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <h2 className="text-lg font-semibold">Upcoming</h2>
            <p className="text-2xl font-bold">3</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <h2 className="text-lg font-semibold">Completed</h2>
            <p className="text-2xl font-bold">1</p>
          </div>
        </div>

        {/* Exam List */}
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="text-xl font-semibold mb-4">Exam Schedule</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exams.map((exam, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg flex justify-between items-center"
              >
                <div>
                  <h3 className="font-bold">{exam.subject}</h3>
                  <p className="text-sm text-gray-500">{exam.date}</p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    exam.status === "Completed"
                      ? "bg-green-200"
                      : "bg-yellow-200"
                  }`}
                >
                  {exam.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Back Button */}
        <div className="flex justify-end mt-4">
          <a
            href="/"
            className="bg-gray-500 text-white px-5 py-2 rounded-lg text-center hover:bg-gray-700"
          >
            Back
          </a>
        </div>

      </div>
    </>
  );
}
