import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function SignUp() {
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState<"candidate" | "recruiter">("candidate");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setError("Please provide a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    if (!agreeTerms) {
      setError("Please accept the Terms of Service, Privacy Policy, and Consent.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);

      // Lưu demo auth và chuyển hướng sau 1.5 giây
      setTimeout(() => {
        sessionStorage.setItem("smartrecruit_auth", JSON.stringify({
          email,
          fullName,
          role: accountType.toUpperCase(),
          token: "mock-new-reg-jwt"
        }));
        if (accountType === "candidate") {
          navigate("/my-applications");
        } else {
          navigate("/recruiter/console");
        }
      }, 1500);
    }, 800);
  };

  return (
    <div className="min-h-screen w-full bg-[#070b14] text-white flex flex-col justify-between selection:bg-indigo-500 selection:text-white font-sans antialiased">
      {/* Vùng nội dung chính chia 2 cột */}
      <div className="flex-1 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 px-6 py-10 lg:py-16 items-center">
        
        {/* Cột trái: Giới thiệu thương hiệu & Điểm nổi bật */}
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

          {/* Badge & Tiêu đề */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/50 text-cyan-400 text-xs font-semibold tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>AI-Assisted Precision Recruiting</span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Join SmartRecruit and <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                Transform Your Hiring Journey.
              </span>
            </h1>

            <p className="text-slate-400 text-sm lg:text-base leading-relaxed max-w-xl">
              Whether you are a candidate seeking transparent career matches or a recruiter orchestrating structured evaluations, SmartRecruit delivers ethical, human-in-the-loop workflows.
            </p>
          </div>

          {/* Feature List Cards */}
          <div className="space-y-3 max-w-lg bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm">
            {/* Feature 1 */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 transition hover:border-slate-700">
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-blue-950/60 border border-blue-800/50 flex items-center justify-center text-blue-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-slate-200">Explainable Skill Matching</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            </div>

            {/* Feature 2 */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 transition hover:border-slate-700">
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-indigo-950/60 border border-indigo-800/50 flex items-center justify-center text-indigo-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-slate-200">No Auto-Reject Policy (Human-in-the-Loop)</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            </div>

            {/* Feature 3 */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 transition hover:border-slate-700">
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-teal-950/60 border border-teal-800/50 flex items-center justify-center text-teal-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-slate-200">Candidate Data Privacy &amp; Consent</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            </div>
          </div>

          <p className="text-xs text-slate-500 font-medium tracking-wide">
            Enterprise RBAC · Candidate / Recruiter Roles
          </p>
        </div>

        {/* Cột phải: Form Đăng ký */}
        <div className="lg:col-span-5">
          <div className="bg-[#0e1424] border border-slate-800/90 rounded-3xl p-7 lg:p-8 shadow-2xl shadow-black/80 backdrop-blur-xl">
            {isSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/10">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">Account Created!</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Welcome aboard, <strong className="text-white">{fullName}</strong>. Launching your {accountType} workspace now...
                </p>
                <div className="flex items-center justify-center gap-2 text-indigo-400 text-xs font-semibold pt-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Redirecting...</span>
                </div>
              </div>
            ) : (
              <>
                {/* Header Form */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white tracking-tight">Create an account</h2>
                  <p className="text-xs text-slate-400 mt-1">Get started in minutes with SmartRecruit.</p>
                </div>

                {/* Toggle loại tài khoản: Candidate / Recruiter */}
                <div className="grid grid-cols-2 gap-3 mb-5 p-1 bg-[#141b2d] rounded-2xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setAccountType("candidate")}
                    className={`flex items-center gap-3 p-3 rounded-xl transition text-left relative ${
                      accountType === "candidate"
                        ? "bg-[#1c253d] border border-indigo-500/50 shadow-md shadow-indigo-500/10 text-white"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${accountType === "candidate" ? "text-indigo-400" : "text-slate-400"}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7 7z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold block leading-none">Candidate</span>
                      <span className="text-[10px] text-slate-400 block mt-1">Looking for jobs</span>
                    </div>
                    {accountType === "candidate" && (
                      <span className="w-2 h-2 rounded-full bg-indigo-500 absolute top-3 right-3 shadow-[0_0_6px_rgba(99,102,241,0.8)]" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setAccountType("recruiter")}
                    className={`flex items-center gap-3 p-3 rounded-xl transition text-left relative ${
                      accountType === "recruiter"
                        ? "bg-[#1c253d] border border-indigo-500/50 shadow-md shadow-indigo-500/10 text-white"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${accountType === "recruiter" ? "text-indigo-400" : "text-slate-400"}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold block leading-none">Recruiter</span>
                      <span className="text-[10px] text-slate-400 block mt-1">Hiring talent</span>
                    </div>
                    {accountType === "recruiter" && (
                      <span className="w-2 h-2 rounded-full bg-indigo-500 absolute top-3 right-3 shadow-[0_0_6px_rgba(99,102,241,0.8)]" />
                    )}
                  </button>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-300 flex items-center gap-2.5">
                    <svg className="w-4 h-4 shrink-0 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                {/* Form Fields */}
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7 7z" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          if (error) setError(null);
                        }}
                        placeholder="e.g. Alex Johnson"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-[#141b2d] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                      />
                    </div>
                  </div>

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
                        placeholder="At least 8 characters"
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

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </span>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (error) setError(null);
                        }}
                        placeholder="Re-enter your password"
                        className="w-full pl-10 pr-10 py-2.5 bg-[#141b2d] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {showConfirmPassword ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          )}
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Checkbox Điều khoản */}
                  <div className="flex items-start gap-2.5 pt-1">
                    <input
                      type="checkbox"
                      id="agreeTerms"
                      checked={agreeTerms}
                      onChange={(e) => {
                        setAgreeTerms(e.target.checked);
                        if (error) setError(null);
                      }}
                      className="w-4 h-4 mt-0.5 rounded border-slate-700 bg-[#141b2d] text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 transition cursor-pointer"
                    />
                    <label htmlFor="agreeTerms" className="text-[11px] text-slate-400 leading-normal cursor-pointer select-none">
                      I agree to the Terms of Service, Privacy Policy, and Candidate Data Consent.
                    </label>
                  </div>

                  {/* Nút Tạo Tài Khoản */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/25 transition active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Registering account...</span>
                      </>
                    ) : (
                      <span>Create {accountType.charAt(0).toUpperCase() + accountType.slice(1)} Account</span>
                    )}
                  </button>
                </form>

                {/* Phân cách */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-500">
                    <span className="bg-[#0e1424] px-3">Or sign up with</span>
                  </div>
                </div>

                {/* Đăng ký với Google */}
                <button
                  type="button"
                  onClick={() => {
                    setIsLoading(true);
                    setTimeout(() => {
                      setIsLoading(false);
                      sessionStorage.setItem("smartrecruit_auth", JSON.stringify({
                        email: "candidate.google@gmail.com",
                        role: accountType.toUpperCase(),
                        provider: "GOOGLE_OIDC"
                      }));
                      if (accountType === "candidate") navigate("/my-applications");
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
                  <span>Sign up with Google OIDC</span>
                </button>

                {/* Chuyển sang Đăng nhập */}
                <p className="text-center text-xs text-slate-400 mt-5">
                  Already have an account?{" "}
                  <Link to="/signin" className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline">
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-4 text-center border-t border-slate-900 text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
        <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span>Enterprise-grade security · SmartRecruit Identity Service</span>
      </footer>
    </div>
  );
}