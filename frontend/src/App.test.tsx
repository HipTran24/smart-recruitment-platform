// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, expect, it, afterEach } from 'vitest';
import App from './App';

describe('App routes', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the recruiter console route', () => {
    window.history.pushState({}, '', '/recruiter-console');
    render(<App />);

    expect(screen.getByRole('heading', { name: /Hiring Operations Dashboard/i })).toBeInTheDocument();
  });

  it('renders only one sidebar on the recruiter jobs route', () => {
    window.history.pushState({}, '', '/recruiter/jobs');
    render(<App />);

    expect(screen.getAllByText(/SmartRecruit/i)).toHaveLength(1);
  });

  it('renders the jobs requisitions route', () => {
    window.history.pushState({}, '', '/job-requisitions');
    render(<App />);

    expect(screen.getByRole('heading', { name: /Job Requisitions & Postings/i })).toBeInTheDocument();
  });

  describe('Shared Authentication', () => {
    it('renders the sign in route', () => {
      window.history.pushState({}, '', '/signin');
      render(<App />);

      expect(screen.getByRole('heading', { name: /Welcome back/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sign in with Google OIDC/i })).toBeInTheDocument();
    });

    it('renders the sign up route', () => {
      window.history.pushState({}, '', '/signup');
      render(<App />);

      expect(screen.getByRole('heading', { name: /Create an account/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sign up with Google OIDC/i })).toBeInTheDocument();
    });

    it('renders the forgot password route', () => {
      window.history.pushState({}, '', '/forgot-password');
      render(<App />);

      expect(screen.getByRole('heading', { name: /Forgot password\?/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Send Recovery Link/i })).toBeInTheDocument();
    });
  });
});
