import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setErrorMessage('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Mật khẩu phải có tối thiểu 8 ký tự.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      await register({ fullName, email, password });
      // Redirect to verify-email with email prefilled
      navigate(`/verify-email?email=${encodeURIComponent(email)}`, { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || 'Đăng ký không thành công. Email có thể đã được sử dụng.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-slate-100">
      <Card className="max-w-md w-full p-8 space-y-6 bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-xl">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-2xl mb-1 ring-1 ring-emerald-500/40">
            SR
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Đăng Ký Ứng Viên</h1>
          <p className="text-sm text-slate-400">
            Khởi tạo hồ sơ ứng tuyển minh bạch trên nền tảng SmartRecruit
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 text-sm rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-start gap-2">
            <span className="font-bold">!</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Họ và Tên</label>
            <Input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nguyễn Văn A"
              required
              disabled={loading}
              className="bg-slate-800/80 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Địa chỉ Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ungvien@example.com"
              required
              disabled={loading}
              className="bg-slate-800/80 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Mật khẩu (tối thiểu 8 ký tự)
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              disabled={loading}
              className="bg-slate-800/80 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full py-2.5 font-medium bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30"
          >
            {loading ? 'Đang tạo tài khoản...' : 'Đăng Ký Tài Khoản'}
          </Button>
        </form>

        <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          Đã có tài khoản?{' '}
          <Link
            to="/login"
            className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </Card>
    </div>
  );
}
