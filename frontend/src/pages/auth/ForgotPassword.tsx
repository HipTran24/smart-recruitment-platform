import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { requestPasswordReset } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Vui lòng nhập email.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const msg = await requestPasswordReset(email);
      setMessage(msg || 'Hướng dẫn đặt lại mật khẩu đã được gửi/ghi nhận.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Yêu cầu không thành công.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-slate-100">
      <Card className="max-w-md w-full p-8 space-y-6 bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-xl">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-2xl mb-1 ring-1 ring-emerald-500/40">
            ?
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Quên Mật Khẩu</h1>
          <p className="text-sm text-slate-400">
            Nhập email tài khoản để nhận token thiết lập lại mật khẩu
          </p>
        </div>

        {message && (
          <div className="p-3 text-sm rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 space-y-2">
            <div>{message}</div>
            <div className="pt-2">
              <Button
                variant="secondary"
                size="sm"
                className="w-full text-xs"
                onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email)}`)}
              >
                Chuyển Đến Màn Hình Đặt Lại Mật Khẩu
              </Button>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 text-sm rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300">
            {errorMessage}
          </div>
        )}

        {!message && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Địa chỉ Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ten@smartrecruit.internal"
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
              {loading ? 'Đang gửi yêu cầu...' : 'Gửi Yêu Cầu Thiết Lập'}
            </Button>
          </form>
        )}

        <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          Nhớ mật khẩu?{' '}
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
