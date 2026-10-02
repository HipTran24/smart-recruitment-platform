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
});
