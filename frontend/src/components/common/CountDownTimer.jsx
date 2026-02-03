import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const CountdownTimer = ({ 
  timeLimit, 
  onTimeExpire, 
  submissionId, 
  isPaused = false,
  className = "" 
}) => {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60); // Convert minutes to seconds
  const [isExpired, setIsExpired] = useState(false);
  const navigate = useNavigate();

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get color based on time remaining
  const getTimeColor = () => {
    const percentage = (timeRemaining / (timeLimit * 60)) * 100;
    if (percentage <= 10) return 'text-red-600 bg-red-50 border-red-200';
    if (percentage <= 25) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  // Auto-submit when time expires
  const handleAutoSubmit = useCallback(async () => {
    setIsExpired(true);
    if (onTimeExpire) {
      await onTimeExpire();
    }
    
    // Fallback auto-submission if callback not provided
    if (submissionId) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/submissions/${submissionId}/submit`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          // Show notification and redirect
          alert('Time expired! Your assessment has been automatically submitted.');
          navigate('/interviewee');
        }
      } catch (error) {
        console.error('Auto-submission failed:', error);
        alert('Time expired! There was an issue auto-submitting. Please submit manually.');
      }
    }
  }, [onTimeExpire, submissionId, navigate]);

  useEffect(() => {
    if (isPaused || isExpired) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, isExpired, handleAutoSubmit]);

  // Warning alerts at specific times
  useEffect(() => {
    if (isPaused || isExpired) return;

    const totalSeconds = timeLimit * 60;
    const warningTimes = [
      { time: 300, message: '⚠️ 5 minutes remaining!' }, // 5 minutes
      { time: 60, message: '⚠️ 1 minute remaining!' },   // 1 minute
      { time: 30, message: '⚠️ 30 seconds remaining!' },  // 30 seconds
      { time: 10, message: '⚠️ 10 seconds remaining!' }   // 10 seconds
    ];

    warningTimes.forEach(({ time, message }) => {
      if (timeRemaining === time) {
        // Use a more subtle notification than alert
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 z-50 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg shadow-lg animate-pulse';
        notification.innerHTML = `
          <div class="flex items-center">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <span class="font-medium">${message}</span>
          </div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 5000);
      }
    });
  }, [timeRemaining, isPaused, isExpired]);

  if (isExpired) {
    return (
      <div className={`px-4 py-2 rounded-lg border-2 border-red-200 bg-red-50 ${className}`}>
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <span className="text-red-600 font-bold">TIME EXPIRED - Auto-submitting...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`px-4 py-2 rounded-lg border-2 ${getTimeColor()} ${className}`}>
      <div className="flex items-center space-x-3">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
        <div className="flex flex-col">
          <span className="text-sm font-medium">Time Remaining</span>
          <span className="text-2xl font-bold">{formatTime(timeRemaining)}</span>
        </div>
        {timeRemaining <= 300 && ( // Show warning when 5 minutes or less
          <div className="ml-auto">
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium">
                {timeRemaining <= 60 ? 'HURRY!' : 'Low Time'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CountdownTimer;
