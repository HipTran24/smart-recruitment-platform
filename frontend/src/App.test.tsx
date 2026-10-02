// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, expect, it, afterEach } from 'vitest';
import App from './App';

describe('App routes', () => {
  afterEach(() => {
    cleanup();
  });

  describe('Recruiter Workspace', () => {
    it('renders the recruiter console route', () => {
      window.history.pushState({}, '', '/recruiter-console');
      render(<App />);

      expect(screen.getByRole('heading', { name: /Hiring Operations Dashboard/i })).toBeInTheDocument();
    });

    it('renders only one sidebar on the recruiter jobs route', () => {
      window.history.pushState({}, '', '/recruiter/jobs');
      render(<App />);

      expect(screen.getAllByText(/SmartRecruit/i).length).toBeGreaterThanOrEqual(1);
    });

    it('renders the jobs requisitions route', () => {
      window.history.pushState({}, '', '/job-requisitions');
      render(<App />);

      expect(screen.getByRole('heading', { name: /Job Requisitions & Postings/i })).toBeInTheDocument();
    });
  });

  describe('Candidate Workspace', () => {
    it('renders the candidate applications route', () => {
      window.history.pushState({}, '', '/my-applications');
      render(<App />);

      expect(screen.getByText(/Welcome back, Harriet/i)).toBeInTheDocument();
      expect(screen.getByText(/Candidate Portal/i)).toBeInTheDocument();
    });

    it('renders the explore jobs route', () => {
      window.history.pushState({}, '', '/explore-jobs');
      render(<App />);

      expect(screen.getByText(/Explore Career Opportunities/i)).toBeInTheDocument();
    });

    it('renders the view details route', () => {
      window.history.pushState({}, '', '/views_details');
      render(<App />);

      expect(screen.getByRole('heading', { name: /UX Strategist/i })).toBeInTheDocument();
    });
  });

  describe('Admin Workspace', () => {
    it('renders the admin console overview route', () => {
      window.history.pushState({}, '', '/admin-console');
      render(<App />);

      expect(screen.getByText(/Admin Console Overview/i)).toBeInTheDocument();
    });
  });
});
