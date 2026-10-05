import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { authService } from '../../services/auth.service';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { confirmPasswordReset } = useAuth();

  const initialEmail = searchParams.get('email') || '';
  const initialToken = searchParams.get('token') || '';

  const [email, setEmail] = useState(initialEmail);
  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingTestToken, setFetchingTestToken] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newPassword) {
      setErrorMessage('Vui lòng điền token và mật khẩu mới.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('Mật khẩu mới phải có tối thiểu 8 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      await confirmPasswordReset(token, newPassword);
      setSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Đặt lại mật khẩu thất bại. Token có thể đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchTestToken = async () => {
    if (!email) {
      setErrorMessage('Vui lòng nhập email để tra cứu Test Mailbox.');
      return;
    }
    setFetchingTestToken(true);
    setErrorMessage(null);
    try {
      const fetched = await authService.fetchLocalTestResetToken(email);
      if (fetched) {
        setToken(fetched);
      } else {
        setErrorMessage('Không tìm thấy reset token nào cho email này trong Test Mailbox.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi gọi Test Mailbox.');
    } finally {
      setFetchingTestToken(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-slate-100">
      <Card className="max-w-md w-full p-8 space-y-6 bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-xl">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-2xl mb-1 ring-1 ring-emerald-500/40">
            🔒
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Đặt Lại Mật Khẩu</h1>
          <p className="text-sm text-slate-400">
            Nhập mã xác nhận để thiết lập mật khẩu bảo mật mới
          </p>
        </div>

        {success ? (
          <div className="space-y-4">
            <div className="p-3 text-sm rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
              Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại với mật khẩu mới.
            </div>
            <Button
              variant="primary"
              className="w-full py-2.5 font-medium bg-emerald-600 hover:bg-emerald-500 text-white"
              onClick={() => navigate('/login', { replace: true })}
            >
              Đến Trang Đăng Nhập
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 text-sm rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300">
                {errorMessage}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Email tài khoản</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ungvien@example.com"
                disabled={loading}
                className="bg-slate-800/80 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Token Đặt Lại</label>
                {email && (
                  <button
                    type="button"
                    onClick={handleFetchTestToken}
                    disabled={fetchingTestToken}
                    className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors underline font-medium"
                  >
                    {fetchingTestToken ? 'Đang đọc...' : 'Lấy token test'}
                  </button>
                )}
              </div>
              <Input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Nhập mã token từ thông báo"
                required
                disabled={loading}
                className="bg-slate-800/80 border-slate-700 text-white placeholder-slate-500 font-mono text-sm focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Mật khẩu mới</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                disabled={loading}
                className="bg-slate-800/80 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Xác nhận mật khẩu mới</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu'}
            </Button>
          </form>
        )}

        <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          Quay lại{' '}
          <Link
            to="/login"
            className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Đăng nhập
          </Link>
        </div>
      </Card>
    </div>
  );
}
