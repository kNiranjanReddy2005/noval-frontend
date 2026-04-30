import { useState } from "react";
import Logo from "../assets/Logo.png";
import { apiRequest } from "../config/api";

export default function Register() {
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("");

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await apiRequest("/register", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      setStatus("Registered successfully! Please sign in.");
      setFormData({ name: "", email: "", password: "", confirmPassword: "" });
      window.location.href = "/login";
    } catch (error) {
      setError(error.message || "Unable to connect. Check your network and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#16244a] via-[#1b295a] to-[#243b7a] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-6xl bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">

        {/* Left Section */}
        <div className="flex flex-col justify-center items-center text-center px-6 sm:px-10 py-12 bg-white/5">
          <img
            className="w-32 h-32 sm:w-40 sm:h-40 object-contain mb-6"
            src={Logo}
            alt="Hospital Logo"
          />
          <h1 className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold leading-snug max-w-xl">
            SABARAMATI HOSPITAL AND COLLEGE OF NURSING
          </h1>
          <p className="mt-5 text-sm sm:text-base text-white/90 bg-[#2ac454] px-5 py-3 rounded-full max-w-xl shadow-md">
            Approved By Indian Nursing Council, New Delhi &amp; Affiliated to Utkal University
          </p>
        </div>

        {/* Right Section */}
        <div className="bg-white px-6 sm:px-10 md:px-14 py-10 sm:py-12 flex items-center justify-center">
          <div className="w-full max-w-md">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 text-center">Register</h2>
            <p className="text-gray-500 text-center mt-2 mb-8">Create your account</p>

            {/* Error Banner */}
            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}
            {status && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
                {status}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-700 outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-700 outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type={show ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-700 outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input
                  type={show ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-700 outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition"
                />
              </div>

              {/* Show Password */}
              <div className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={show}
                  onChange={() => setShow(!show)}
                  className="accent-teal-700"
                />
                Show Passwords
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-700 hover:bg-teal-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl shadow-md transition duration-300"
              >
                {loading ? "Creating…" : "SIGN UP"}
              </button>
            </form>

            {/* Sign In */}
            <p className="text-center text-sm text-gray-600 mt-6">
              Already have an account?{" "}
              <a href="/login" className="text-teal-700 font-semibold hover:underline">
                Sign in
              </a>
            </p>

            
          </div>
        </div>
      </div>
    </div>
  );
}
