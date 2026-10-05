import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { authService } from '../../services/auth.service';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyEmail } = useAuth();

  const initialEmail = searchParams.get('email') || '';
  const initialToken = searchParams.get('token') || '';

  const [email, setEmail] = useState(initialEmail);
  const [token, setToken] = useState(initialToken);
  const [loading, setLoading] = useState(false);
  const [fetchingTestToken, setFetchingTestToken] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!token) {
      setErrorMessage('Vui lòng nhập mã token xác thực email.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      await verifyEmail(token);
      setSuccessMessage('Xác minh địa chỉ email thành công! Bạn có thể tiếp tục sử dụng hệ thống.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Token xác minh không hợp lệ hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchTestToken = async () => {
    if (!email) {
      setErrorMessage('Vui lòng nhập email để truy vấn test mailbox.');
      return;
    }
    setFetchingTestToken(true);
    setErrorMessage(null);
    try {
      const fetched = await authService.fetchLocalTestVerificationToken(email);
      if (fetched) {
        setToken(fetched);
        setSuccessMessage('Đã tìm thấy token xác minh từ Test Mailbox!');
      } else {
        setErrorMessage('Không tìm thấy token nào cho email này trong Test Mailbox.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi gọi Test Mailbox harness.');
    } finally {
      setFetchingTestToken(false);
    }
  };

  useEffect(() => {
    // If token passed in URL query param, automatically verify
    if (initialToken) {
      handleVerify();
    }
  }, [initialToken]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-slate-100">
      <Card className="max-w-md w-full p-8 space-y-6 bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-xl">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-2xl mb-1 ring-1 ring-emerald-500/40">
            ✓
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Xác Minh Địa Chỉ Email</h1>
          <p className="text-sm text-slate-400">
            Kích hoạt tài khoản để nộp hồ sơ ứng tuyển và nhận cập nhật phỏng vấn
          </p>
        </div>

        {successMessage && (
          <div className="p-3 text-sm rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-start gap-2">
            <span className="font-bold">✓</span>
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 text-sm rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-start gap-2">
            <span className="font-bold">!</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {!successMessage ? (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Email đã đăng ký</label>
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
                <label className="text-xs font-semibold text-slate-300">Mã Token Xác Minh</label>
                {email && (
                  <button
                    type="button"
                    onClick={handleFetchTestToken}
                    disabled={fetchingTestToken}
                    className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors underline font-medium"
                  >
                    {fetchingTestToken ? 'Đang đọc mailbox...' : 'Lấy token test local'}
                  </button>
                )}
              </div>
              <Input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Nhập mã token từ email hoặc test mailbox"
                required
                disabled={loading}
                className="bg-slate-800/80 border-slate-700 text-white placeholder-slate-500 font-mono text-sm focus:border-emerald-500"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full py-2.5 font-medium bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30"
            >
              {loading ? 'Đang xác minh...' : 'Xác Nhận Email'}
            </Button>
          </form>
        ) : (
          <div className="pt-2">
            <Button
              variant="primary"
              className="w-full py-2.5 font-medium bg-emerald-600 hover:bg-emerald-500 text-white"
              onClick={() => navigate('/my-applications', { replace: true })}
            >
              Tiếp Tục Đến Cổng Ứng Viên
            </Button>
          </div>
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
