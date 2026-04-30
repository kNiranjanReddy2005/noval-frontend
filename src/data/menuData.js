import {
  FaBoxes,
  FaBuilding,
  FaCalendarCheck,
  FaChartBar,
  FaChalkboardTeacher,
  FaClock,
  FaComments,
  FaFileAlt,
  FaFileInvoiceDollar,
  FaFileSignature,
  FaHeadset,
  FaKey,
  FaMoneyBillWave,
  FaTools,
  FaUserCog,
  FaUserPlus,
  FaUsers,
} from "react-icons/fa";
import { MdOutlineFactCheck } from "react-icons/md";

const menuData = {
  "Academic Hub": {
    color: {
      active: "bg-blue-600 text-white",
      light: "bg-blue-50 text-blue-700",
      border: "border-blue-600",
      hover: "hover:bg-blue-100",
      text: "text-sm md:text-[12px] lg:text-[18px] font-semibold",
    },
    items: [
      {
        name: "Admission",
        path: "/dashboard/academichub/admission",
        icon: FaUserPlus,
        bg: "bg-blue-200",
      },
      {
        name: "Attendence",
        path: "/dashboard/academichub/attedence",
        icon: MdOutlineFactCheck,
        bg: "bg-blue-300",
      },
      {
        name: "Exam",
        path: "/dashboard/academichub/exam",
        icon: FaFileAlt,
        bg: "bg-blue-400",
      },
      {
        name: "Leave Management",
        path: "/dashboard/academichub/leave",
        icon: FaCalendarCheck,
        bg: "bg-blue-300",
      },
      {
        name: "NOC & Clearance",
        path: "/dashboard/academichub/noc",
        icon: FaFileSignature,
        bg: "bg-blue-200",
      },
    ],
  },
  "Finance & Account": {
    color: {
      active: "bg-green-600 text-white",
      light: "bg-green-50 text-green-700",
      border: "border-green-600",
      hover: "hover:bg-green-100",
      text: "text-sm md:text-[12px] lg:text-[18px] font-semibold",
    },
    items: [
      {
        name: "Vouchers",
        path: "/dashboard/finance/bank-book",
        icon: FaChalkboardTeacher,
        bg: "bg-green-300",
      },
      {
        name: "Leader",
        path: "/dashboard/finance/journal",
        icon: FaUsers,
        bg: "bg-green-400",
      },
      {
        name: "Fees & Dues",
        path: "/dashboard/finance/contra",
        icon: FaMoneyBillWave,
        bg: "bg-green-500",
      },
      {
        name: "Audit",
        path: "/dashboard/finance/profit-loss",
        icon: FaFileInvoiceDollar,
        bg: "bg-green-400",
      },
      {
        name: "Reports",
        path: "/dashboard/finance/balance-sheet",
        icon: FaChartBar,
        bg: "bg-green-300",
      },
    ],
  },
  "Operation & Admin": {
    color: {
      active: "bg-yellow-500 text-white",
      light: "bg-yellow-50 text-yellow-700",
      border: "border-yellow-600",
      hover: "hover:bg-yellow-100",
      text: "text-sm md:text-[12px] lg:text-[18px] font-semibold",
    },
    items: [
      {
        name: "Inventory",
        path: "/dashboard/admin/attendance",
        icon: FaBoxes,
        bg: "bg-yellow-300",
      },
      {
        name: "Support",
        path: "/dashboard/admin/leave",
        icon: FaHeadset,
        bg: "bg-yellow-400",
      },
      {
        name: "Communication",
        path: "/dashboard/admin/application",
        icon: FaComments,
        bg: "bg-yellow-300",
      },
      {
        name: "Registration",
        path: "/dashboard/admin/registration",
        icon: FaUserPlus,
        bg: "bg-yellow-200",
      },
    ],
  },
  "Control System": {
    color: {
      active: "bg-purple-600 text-white",
      light: "bg-purple-50 text-purple-700",
      border: "border-purple-600",
      hover: "hover:bg-purple-100",
      text: "text-sm md:text-md font-semibold",
    },
    items: [
      {
        name: "Department access",
        path: "/dashboard/control/exam-attendance",
        icon: FaBuilding,
        bg: "bg-purple-300",
      },
      {
        name: "Setting up",
        path: "/dashboard/control/course",
        icon: FaTools,
        bg: "bg-purple-400",
      },
      {
        name: "Personal setting",
        path: "/dashboard/control/batch",
        icon: FaUserCog,
        bg: "bg-purple-500",
      },
      {
        name: "Password Manager",
        path: "/dashboard/control/password",
        icon: FaKey,
        bg: "bg-purple-400",
      },
      {
        name: "Class Timing & Fees Structure",
        path: "/dashboard/control/str",
        icon: FaClock,
        bg: "bg-purple-300",
      },
    ],
  },
};

export default menuData;
