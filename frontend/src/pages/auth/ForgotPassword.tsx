import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setError("Please enter a valid work or personal email address.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setCountdown(60);

      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 700);
  };

  const handleResend = () => {
    if (countdown > 0) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setCountdown(60);
    }, 600);
  };

  return (
    <div className="min-h-screen w-full bg-[#070b14] text-white flex flex-col justify-between selection:bg-indigo-500 selection:text-white font-sans antialiased">
      {/* Vùng nội dung chính */}
      <div className="flex-1 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 px-6 py-10 lg:py-16 items-center">
        
        {/* Cột trái: Thông điệp an toàn & Giới thiệu bảo mật */}
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

          {/* Tiêu đề & Thông điệp */}
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/40 border border-indigo-800/50 text-indigo-400 text-xs font-semibold tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span>Identity & Security Recovery</span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Reset Your Password with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                Verified Security.
              </span>
            </h1>

            <p className="text-slate-400 text-sm lg:text-base leading-relaxed">
              We protect your data and candidate assessments with enterprise-grade token encryption. Enter your registered email to receive a secure password recovery link.
            </p>
          </div>

          {/* Thẻ hướng dẫn quy trình khôi phục */}
          <div className="max-w-md bg-[#0e1628]/80 border border-slate-800/80 rounded-2xl p-5 shadow-2xl backdrop-blur-md space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800/60">
              <div className="w-9 h-9 rounded-xl bg-blue-950/60 border border-blue-800/50 flex items-center justify-center text-blue-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-100">Zero-Trust Account Recovery</h4>
                <p className="text-xs text-slate-400">Time-limited cryptographic link (15 mins)</p>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>The link will be sent directly to your registered mailbox.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Active sessions on other devices will remain safe until verified.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Check your spam or junk folder if the email does not appear shortly.</span>
              </li>
            </ul>
          </div>

          <p className="text-xs text-slate-500 font-medium tracking-wide">
            Enterprise RBAC · SmartRecruit Identity Service
          </p>
        </div>

        {/* Cột phải: Form Quên mật khẩu */}
        <div className="lg:col-span-5">
          <div className="bg-[#0e1424] border border-slate-800/90 rounded-3xl p-7 lg:p-8 shadow-2xl shadow-black/80 backdrop-blur-xl">
            {!isSubmitted ? (
              <>
                {/* Header Form */}
                <div className="mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center text-indigo-400 mb-4 shadow-lg shadow-indigo-500/10">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Forgot password?</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    No worries! Enter your email address and we will send you instructions to reset your password.
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-300 flex items-center gap-2.5 animate-fadeIn">
                    <svg className="w-4 h-4 shrink-0 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Registered Email Address
                    </label>
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

                  {/* Nút Gửi liên kết */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/25 transition active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Sending recovery link...</span>
                      </>
                    ) : (
                      <span>Send Recovery Link</span>
                    )}
                  </button>
                </form>
              </>
            ) : (
              /* Trạng thái đã gửi thành công */
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/10">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white tracking-tight">Check your email</h3>
                  <p className="text-xs text-slate-400">
                    We have dispatched password reset instructions to:
                  </p>
                  <p className="text-xs font-semibold text-indigo-400 bg-indigo-950/40 py-1 px-3 rounded-lg inline-block border border-indigo-800/40 mt-1">
                    {email}
                  </p>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed max-w-sm mx-auto">
                  Click the link inside the email to choose your new secure password. The link will expire in 15 minutes.
                </p>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={countdown > 0 || isSubmitting}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 disabled:text-slate-600 transition"
                  >
                    {countdown > 0 ? (
                      <span>Resend available in {countdown}s</span>
                    ) : (
                      <span>Didn't receive email? Click to resend</span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Trở về Đăng nhập */}
            <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
              <Link
                to="/signin"
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Sign In</span>
              </Link>
            </div>
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
