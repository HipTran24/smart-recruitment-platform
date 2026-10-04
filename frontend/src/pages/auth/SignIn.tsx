import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function SignIn() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"candidate" | "recruiter" | "admin">("recruiter");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Điền nhanh tài khoản mẫu theo vai trò
  const handleSelectRole = (selectedRole: "candidate" | "recruiter" | "admin") => {
    setRole(selectedRole);
    setError(null);
    if (selectedRole === "candidate") {
      setEmail("candidate@smartrecruit.io");
      setPassword("Candidate@2026");
    } else if (selectedRole === "recruiter") {
      setEmail("recruiter@smartrecruit.io");
      setPassword("Recruiter@2026");
    } else {
      setEmail("admin@smartrecruit.io");
      setPassword("AdminSecure@2026");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Please enter both email address and password.");
      return;
    }

    setIsLoading(true);

    // Giả lập xác thực và điều hướng vào đúng Workspace theo Role
    setTimeout(() => {
      setIsLoading(false);

      // Lưu trạng thái đăng nhập giả lập vào sessionStorage để điều hướng
      sessionStorage.setItem("smartrecruit_auth", JSON.stringify({
        email,
        role: role.toUpperCase(),
        token: "mock-jwt-token-xyz"
      }));

      if (role === "admin") {
        navigate("/admin");
      } else if (role === "candidate") {
        navigate("/my-applications");
      } else {
        navigate("/recruiter/console");
      }
    }, 600);
  };

  return (
    <div className="min-h-screen w-full bg-[#070b14] text-white flex items-center justify-center font-sans antialiased selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 px-6 py-10 lg:py-16 items-center">
        
        {/* Cột trái: Giới thiệu thương hiệu & Thẻ hồ sơ AI Match Card */}
        <div className="lg:col-span-7 space-y-10 lg:pr-12 relative">
          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">SmartRecruit</span>
          </Link>

          {/* Tiêu đề & Mô tả */}
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/50 text-cyan-400 text-xs font-semibold tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>Modular Monolith · Gemini 2.5 Flash</span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Streamline Your Hiring with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                AI-Powered Precision.
              </span>
            </h1>
            <p className="text-slate-400 text-sm lg:text-base leading-relaxed">
              SmartRecruit empowers recruiters and candidates with smart skill-matching, transparent scoring insights, and human-in-the-loop workflows.
            </p>
          </div>

          {/* Thẻ AI Candidate Preview (Sophia Chen) */}
          <div className="max-w-md bg-[#0e1628]/80 border border-slate-800/80 rounded-2xl p-5 shadow-2xl backdrop-blur-md relative">
            {/* Header Thẻ ứng viên */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-700/80 border border-slate-600 flex items-center justify-center text-xs font-bold text-slate-200">
                  SC
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">Sophia Chen</h3>
                  <p className="text-[11px] text-slate-400">Senior Frontend Architect</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full border border-teal-500/40 bg-teal-950/40 text-teal-300 text-xs font-bold shadow-[0_0_10px_rgba(20,184,166,0.15)]">
                98% MATCH
              </span>
            </div>

            {/* Chỉ số Skills & Performance */}
            <div className="py-4 space-y-3">
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 block">
                SKILLS OVERLAP &amp; PERFORMANCE INDEX
              </span>

              {/* Skill 1 */}
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                  <span>React 19 &amp; TypeScript</span>
                  <span className="text-cyan-400 font-bold">98%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-cyan-400 h-full rounded-full w-[98%]" />
                </div>
              </div>

              {/* Skill 2 */}
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                  <span>Spring Boot &amp; REST APIs</span>
                  <span className="text-blue-400 font-bold">94%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full w-[94%]" />
                </div>
              </div>

              {/* Skill 3 */}
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                  <span>Gemini 2.5 Flash Integration</span>
                  <span className="text-indigo-400 font-bold">90%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full w-[90%]" />
                </div>
              </div>
            </div>

            {/* AI Recommendation Banner */}
            <div className="pt-3 border-t border-slate-800/60 flex items-center gap-2 text-xs text-cyan-400">
              <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24">
                <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" />
              </svg>
              <span className="text-[11px] leading-tight">
                AI recommendation: Score Explanation Breakdown available for review.
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500 font-medium tracking-wide">
            Enterprise RBAC · Candidate / Recruiter / Admin Architecture
          </p>
        </div>

        {/* Cột phải: Form Đăng nhập */}
        <div className="lg:col-span-5">
          <div className="bg-[#0e1424] border border-slate-800/90 rounded-3xl p-7 lg:p-8 shadow-2xl shadow-black/80 backdrop-blur-xl">
            {/* Header Form */}
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-white tracking-tight">Welcome back</h2>
              <p className="text-xs text-slate-400 mt-1">Please enter your credentials to access your workspace.</p>
            </div>

            {/* Demo Quick Role Switcher */}
            <div className="mb-5">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Select Workspace / Role
              </label>
              <div className="grid grid-cols-3 gap-2 p-1 bg-[#141b2d] rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => handleSelectRole("candidate")}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition ${
                    role === "candidate"
                      ? "bg-indigo-600 text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Candidate
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectRole("recruiter")}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition ${
                    role === "recruiter"
                      ? "bg-indigo-600 text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Recruiter
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectRole("admin")}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition ${
                    role === "admin"
                      ? "bg-indigo-600 text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-300 flex items-center gap-2.5">
                <svg className="w-4 h-4 shrink-0 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#141b2d] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#141b2d] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              {/* Remember me & Forgot password */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-[#141b2d] text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 transition cursor-pointer"
                  />
                  <span className="text-xs text-slate-400">Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Nút Đăng nhập */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/25 transition active:scale-[0.99] flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <span>Sign In as {role.charAt(0).toUpperCase() + role.slice(1)}</span>
                )}
              </button>
            </form>

            {/* Phân cách */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-500">
                <span className="bg-[#0e1424] px-3">Or continue with</span>
              </div>
            </div>

            {/* Đăng nhập với Google */}
            <button
              type="button"
              onClick={() => {
                setIsLoading(true);
                setTimeout(() => {
                  setIsLoading(false);
                  sessionStorage.setItem("smartrecruit_auth", JSON.stringify({
                    email: "google.user@gmail.com",
                    role: role.toUpperCase(),
                    provider: "GOOGLE_OIDC"
                  }));
                  if (role === "admin") navigate("/admin");
                  else if (role === "candidate") navigate("/my-applications");
                  else navigate("/recruiter/console");
                }, 500);
              }}
              className="w-full py-2.5 px-4 bg-[#141b2d] hover:bg-slate-800/60 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 transition flex items-center justify-center gap-2.5"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google OIDC</span>
            </button>

            {/* Chuyển sang Đăng ký */}
            <p className="text-center text-xs text-slate-400 mt-5">
              New to SmartRecruit?{" "}
              <Link to="/signup" className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}