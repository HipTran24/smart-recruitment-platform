// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import VerifyEmail from './VerifyEmail';
import { Input } from '../../components/ui/Input';

vi.mock('../../auth/AuthContext', () => ({
  useAuth: () => ({
    user: null, status: 'anonymous',
    login: vi.fn().mockRejectedValue(new Error('Thông tin đăng nhập không hợp lệ.')),
    register: vi.fn(), requestPasswordReset: vi.fn(),
    confirmPasswordReset: vi.fn(), verifyEmail: vi.fn(),
  }),
}));

afterEach(cleanup);

describe('SCRUM-87 accessible authentication forms', () => {
  it.each([
    [Login, ['Địa chỉ Email', 'Mật khẩu']],
    [Register, ['Họ và Tên', 'Địa chỉ Email', 'Mật khẩu (tối thiểu 8 ký tự)']],
    [ForgotPassword, ['Địa chỉ Email']],
    [ResetPassword, ['Email tài khoản', 'Token Đặt Lại', 'Mật khẩu mới', 'Xác nhận mật khẩu mới']],
    [VerifyEmail, ['Email đã đăng ký', 'Mã Token Xác Minh']],
  ] as const)('exposes every field by its visible label (case %#)', (Page, labels) => {
    render(<MemoryRouter><Page /></MemoryRouter>);
    for (const label of labels) {
      const input = screen.getByLabelText(label);
      expect(input.tagName).toBe('INPUT');
      input.focus();
      expect(document.activeElement).toBe(input);
    }
  });

  it('announces a rejected login without discarding the entered email', async () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Địa chỉ Email'), { target: { value: 'candidate@example.test' } });
    fireEvent.change(screen.getByLabelText('Mật khẩu'), { target: { value: 'synthetic-password' } });
    fireEvent.click(screen.getByRole('button', { name: 'Đăng Nhập' }));
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('Thông tin đăng nhập không hợp lệ.');
    expect((screen.getByLabelText('Địa chỉ Email') as HTMLInputElement).value).toBe('candidate@example.test');
  });
});

describe('shared Input semantics', () => {
  it('keeps repeated labels unique across mounted instances', () => {
    render(<><Input label="Email" /><Input label="Email" /></>);
    const inputs = screen.getAllByLabelText('Email');
    expect(inputs[0].id).not.toBe(inputs[1].id);
  });

  it('associates validation errors while preserving a caller description', () => {
    render(<><span id="policy">Policy</span><Input label="Email" error="Email không hợp lệ" aria-describedby="policy" /></>);
    const input = screen.getByLabelText('Email');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    const ids = input.getAttribute('aria-describedby')!.split(' ');
    expect(ids).toContain('policy');
    expect(ids.some(id => document.getElementById(id)?.textContent === 'Email không hợp lệ')).toBe(true);
  });

  it('associates helper text and preserves an explicit ID', () => {
    render(<Input id="custom-email" label="Email" helperText="Dùng email tài khoản" />);
    const input = screen.getByLabelText('Email');
    expect(input.id).toBe('custom-email');
    const description = document.getElementById(input.getAttribute('aria-describedby')!);
    expect(description?.textContent).toBe('Dùng email tài khoản');
  });
});
