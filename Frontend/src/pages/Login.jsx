import { useState } from "react";
import axios from "../api/axios";
import { useAuthStore } from "../store/authStore";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail, UserPlus } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/login", { email, password });
      setAuth(res.data.user, res.data.token);
      navigate("/dashboard");
    } catch (err) {
      alert("Login failed! Check your credentials.", err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <h2 className="text-3xl font-bold text-slate-800 mb-2 text-center">
          Welcome Back
        </h2>
        <p className="text-slate-500 text-center mb-8">
          Access your distributed URL dashboard
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* ... Email and Password fields remain the same ... */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-3 text-slate-400"
                size={20}
              />
              <input
                type="email"
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="name@company.com"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-3 text-slate-400"
                size={20}
              />
              <input
                type="password"
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-slate-600">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-blue-600 font-semibold hover:text-blue-700 transition-colors inline-flex items-center gap-1"
            >
              <UserPlus size={16} />
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
