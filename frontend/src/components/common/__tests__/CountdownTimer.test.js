import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CountdownTimer from '../CountdownTimer';

// Mock fetch for auto-submission
global.fetch = jest.fn();

describe('CountdownTimer', () => {
  const mockOnTimeExpire = jest.fn();
  const defaultProps = {
    timeLimit: 1, // 1 minute for quick testing
    onTimeExpire: mockOnTimeExpire,
    submissionId: 123
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    // Clear any existing notifications
    document.body.innerHTML = '';
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders countdown timer with correct initial time', () => {
    render(<CountdownTimer {...defaultProps} />);
    
    expect(screen.getByText('Time Remaining')).toBeInTheDocument();
    expect(screen.getByText('01:00')).toBeInTheDocument();
  });

  test('displays correct time format', () => {
    render(<CountdownTimer {...defaultProps} timeLimit={2} />);
    
    expect(screen.getByText('02:00')).toBeInTheDocument();
  });

  test('counts down every second', () => {
    render(<CountdownTimer {...defaultProps} />);
    
    expect(screen.getByText('01:00')).toBeInTheDocument();
    
    // Fast-forward 1 second
    jest.advanceTimersByTime(1000);
    
    expect(screen.getByText('00:59')).toBeInTheDocument();
  });

  test('shows warning color when time is low', () => {
    render(<CountdownTimer {...defaultProps} timeLimit={1} />);
    
    // Fast-forward to 30 seconds (should show orange warning)
    jest.advanceTimersByTime(30 * 1000);
    
    const timerContainer = screen.getByText('00:30').closest('div').closest('div');
    expect(timerContainer).toHaveClass('text-orange-600');
  });

  test('shows critical warning when very low time', () => {
    render(<CountdownTimer {...defaultProps} timeLimit={1} />);
    
    // Fast-forward to 10 seconds (should show red warning)
    jest.advanceTimersByTime(50 * 1000);
    
    const timerContainer = screen.getByText('00:10').closest('div').closest('div');
    expect(timerContainer).toHaveClass('text-red-600');
  });

  test('calls onTimeExpire when time reaches zero', async () => {
    render(<CountdownTimer {...defaultProps} />);
    
    // Fast-forward to expiry
    jest.advanceTimersByTime(60 * 1000);
    
    await waitFor(() => {
      expect(mockOnTimeExpire).toHaveBeenCalledTimes(1);
    });
  });

  test('shows expired state when time reaches zero', async () => {
    render(<CountdownTimer {...defaultProps} />);
    
    // Fast-forward to expiry
    jest.advanceTimersByTime(60 * 1000);
    
    await waitFor(() => {
      expect(screen.getByText('TIME EXPIRED - Auto-submitting...')).toBeInTheDocument();
    });
  });

  test('shows warning notification at 5 minutes', () => {
    render(<CountdownTimer {...defaultProps} timeLimit={6} />);
    
    // Fast-forward to 5 minutes
    jest.advanceTimersByTime(60 * 1000);
    
    expect(screen.getByText('Low Time')).toBeInTheDocument();
  });

  test('shows hurry warning at 1 minute', () => {
    render(<CountdownTimer {...defaultProps} timeLimit={2} />);
    
    // Fast-forward to 1 minute
    jest.advanceTimersByTime(60 * 1000);
    
    expect(screen.getByText('HURRY!')).toBeInTheDocument();
  });

  test('does not count down when paused', () => {
    render(<CountdownTimer {...defaultProps} isPaused={true} />);
    
    expect(screen.getByText('01:00')).toBeInTheDocument();
    
    // Fast-forward 10 seconds
    jest.advanceTimersByTime(10 * 1000);
    
    // Should still show 1 minute
    expect(screen.getByText('01:00')).toBeInTheDocument();
  });

  test('auto-submits when time expires and no callback provided', async () => {
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(() => 'test-token'),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    });

    // Mock alert
    window.alert = jest.fn();

    render(<CountdownTimer timeLimit={1} submissionId={123} />);
    
    // Mock successful fetch response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });

    // Fast-forward to expiry
    jest.advanceTimersByTime(60 * 1000);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://127.0.0.1:8000/api/submissions/123/submit',
        {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json'
          }
        }
      );
    });

    expect(window.alert).toHaveBeenCalledWith('Time expired! Your assessment has been automatically submitted.');
  });

  test('handles auto-submission failure gracefully', async () => {
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(() => 'test-token'),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    });

    // Mock alert
    window.alert = jest.fn();

    render(<CountdownTimer timeLimit={1} submissionId={123} />);
    
    // Mock failed fetch response
    fetch.mockRejectedValueOnce(new Error('Network error'));

    // Fast-forward to expiry
    jest.advanceTimersByTime(60 * 1000);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        'Time expired! There was an issue auto-submitting. Please submit manually.'
      );
    });
  });

  test('applies custom className', () => {
    const customClass = 'custom-timer-class';
    render(<CountdownTimer {...defaultProps} className={customClass} />);
    
    const timerContainer = screen.getByText('Time Remaining').closest('div').closest('div');
    expect(timerContainer).toHaveClass(customClass);
  });

  test('shows correct color based on time percentage', () => {
    const { rerender } = render(<CountdownTimer {...defaultProps} timeLimit={10} />);
    
    // Green for > 25% time
    let timerContainer = screen.getByText('10:00').closest('div').closest('div');
    expect(timerContainer).toHaveClass('text-green-600');
    
    // Re-render with 2 minutes (20% time)
    rerender(<CountdownTimer {...defaultProps} timeLimit={2} />);
    timerContainer = screen.getByText('02:00').closest('div').closest('div');
    expect(timerContainer).toHaveClass('text-orange-600');
    
    // Re-render with 30 seconds (5% time) - should be red
    rerender(<CountdownTimer {...defaultProps} timeLimit={0.5} />);
    timerContainer = screen.getByText('00:30').closest('div').closest('div');
    expect(timerContainer).toHaveClass('text-red-600');
  });

  test('displays timer icon', () => {
    render(<CountdownTimer {...defaultProps} />);
    
    // Check for clock icon (SVG)
    const timerIcon = document.querySelector('svg');
    expect(timerIcon).toBeInTheDocument();
  });

  test('displays warning icon when time is low', () => {
    render(<CountdownTimer {...defaultProps} timeLimit={1} />);
    
    // Fast-forward to show warning
    jest.advanceTimersByTime(30 * 1000);
    
    // Check for warning icon
    const warningIcons = document.querySelectorAll('svg');
    expect(warningIcons.length).toBeGreaterThan(1); // Timer + warning icon
  });

  test('cleans up interval on unmount', () => {
    const { unmount } = render(<CountdownTimer {...defaultProps} />);
    
    // Fast-forward some time
    jest.advanceTimersByTime(10 * 1000);
    
    // Unmount component
    unmount();
    
    // Fast-forward more time - should not cause errors
    jest.advanceTimersByTime(10 * 1000);
    
    // Should not have called onTimeExpire
    expect(mockOnTimeExpire).not.toHaveBeenCalled();
  });
});
