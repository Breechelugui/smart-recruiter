import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AnalyticsDashboard from '../AnalyticsDashboard';

// Mock Recharts components
jest.mock('recharts', () => ({
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
}));

describe('AnalyticsDashboard', () => {
  const mockSubmissions = [
    {
      id: 1,
      assessment_id: 1,
      interviewee_id: 1,
      status: 'graded',
      score: 85,
      max_score: 100,
      submitted_at: '2024-01-15T10:30:00Z',
      started_at: '2024-01-15T09:30:00Z',
      answers: [
        { question_id: 1, points_earned: 8 },
        { question_id: 2, points_earned: 17 }
      ]
    },
    {
      id: 2,
      assessment_id: 1,
      interviewee_id: 2,
      status: 'graded',
      score: 92,
      max_score: 100,
      submitted_at: '2024-01-15T11:00:00Z',
      started_at: '2024-01-15T10:00:00Z',
      answers: [
        { question_id: 1, points_earned: 10 },
        { question_id: 2, points_earned: 18 }
      ]
    },
    {
      id: 3,
      assessment_id: 2,
      interviewee_id: 3,
      status: 'submitted',
      score: null,
      max_score: 50,
      submitted_at: '2024-01-15T12:00:00Z',
      started_at: '2024-01-15T11:00:00Z',
      answers: []
    }
  ];

  const mockAssessments = [
    {
      id: 1,
      title: 'JavaScript Assessment',
      questions: [
        { id: 1, title: 'What is closure?', question_type: 'subjective', points: 10 },
        { id: 2, title: 'Write a factorial function', question_type: 'coding', points: 20 }
      ]
    },
    {
      id: 2,
      title: 'Python Assessment',
      questions: [
        { id: 3, title: 'What is list comprehension?', question_type: 'subjective', points: 15 }
      ]
    }
  ];

  const mockQuestions = [
    { id: 1, title: 'What is closure?', question_type: 'subjective', points: 10 },
    { id: 2, title: 'Write a factorial function', question_type: 'coding', points: 20 },
    { id: 3, title: 'What is list comprehension?', question_type: 'subjective', points: 15 }
  ];

  const defaultProps = {
    submissions: mockSubmissions,
    assessments: mockAssessments,
    questions: mockQuestions
  };

  test('renders analytics dashboard with key metrics', () => {
    render(<AnalyticsDashboard {...defaultProps} />);
    
    // Check key metrics cards
    expect(screen.getByText('Total Submissions')).toBeInTheDocument();
    expect(screen.getByText('Average Score')).toBeInTheDocument();
    expect(screen.getByText('Pass Rate')).toBeInTheDocument();
    expect(screen.getByText('Graded')).toBeInTheDocument();
    
    // Check values
    expect(screen.getByText('3')).toBeInTheDocument(); // Total submissions
    expect(screen.getByText('89%')).toBeInTheDocument(); // Average score
    expect(screen.getByText('100%')).toBeInTheDocument(); // Pass rate (2/2 passed)
    expect(screen.getByText('2')).toBeInTheDocument(); // Graded submissions
  });

  test('renders performance distribution chart', () => {
    render(<AnalyticsDashboard {...defaultProps} />);
    
    expect(screen.getByText('Performance Distribution')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie')).toBeInTheDocument();
  });

  test('renders question difficulty analysis', () => {
    render(<AnalyticsDashboard {...defaultProps} />);
    
    expect(screen.getByText('Question Difficulty Analysis')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar')).toBeInTheDocument();
  });

  test('renders time vs performance analysis', () => {
    render(<AnalyticsDashboard {...defaultProps} />);
    
    expect(screen.getByText('Time vs Performance Analysis')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('line')).toBeInTheDocument();
  });

  test('renders assessment performance table', () => {
    render(<AnalyticsDashboard {...defaultProps} />);
    
    expect(screen.getByText('Assessment Performance')).toBeInTheDocument();
    expect(screen.getByText('JavaScript Assessment')).toBeInTheDocument();
    expect(screen.getByText('Python Assessment')).toBeInTheDocument();
  });

  test('renders question type analysis', () => {
    render(<AnalyticsDashboard {...defaultProps} />);
    
    expect(screen.getByText('Performance by Question Type')).toBeInTheDocument();
    expect(screen.getByText('Subjective')).toBeInTheDocument();
    expect(screen.getByText('Coding')).toBeInTheDocument();
  });

  test('calculates correct statistics', () => {
    render(<AnalyticsDashboard {...defaultProps} />);
    
    // Check average score calculation: (85 + 92) / 2 = 88.5 -> 89%
    expect(screen.getByText('89%')).toBeInTheDocument();
    
    // Check pass rate: both submissions passed (score >= 70)
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  test('handles empty data gracefully', () => {
    const emptyProps = {
      submissions: [],
      assessments: [],
      questions: []
    };
    
    render(<AnalyticsDashboard {...emptyProps} />);
    
    expect(screen.getByText('Total Submissions')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument(); // Average score
  });

  test('handles submissions without scores', () => {
    const submissionsWithUngraded = [
      ...mockSubmissions,
      {
        id: 4,
        assessment_id: 1,
        interviewee_id: 4,
        status: 'submitted',
        score: null,
        max_score: 100,
        submitted_at: '2024-01-15T13:00:00Z',
        started_at: '2024-01-15T12:00:00Z',
        answers: []
      }
    ];
    
    render(
      <AnalyticsDashboard 
        submissions={submissionsWithUngraded}
        assessments={mockAssessments}
        questions={mockQuestions}
      />
    );
    
    expect(screen.getByText('4')).toBeInTheDocument(); // Total submissions
    expect(screen.getByText('2')).toBeInTheDocument(); // Graded submissions
  });

  test('displays correct completion rates in assessment table', () => {
    render(<AnalyticsDashboard {...defaultProps} />);
    
    // JavaScript Assessment: 2 submissions, 2 completed (graded)
    expect(screen.getByText('100%')).toBeInTheDocument(); // Completion rate
    
    // Python Assessment: 1 submission, 1 completed (submitted)
    expect(screen.getByText('100%')).toBeInTheDocument(); // Completion rate
  });

  test('shows question difficulty analysis with correct data', () => {
    render(<AnalyticsDashboard {...defaultProps} />);
    
    // Should show question titles truncated if too long
    expect(screen.getByText(/What is closure/)).toBeInTheDocument();
    expect(screen.getByText(/Write a factorial/)).toBeInTheDocument();
  });

  test('calculates question type performance correctly', () => {
    render(<AnalyticsDashboard {...defaultProps} />);
    
    // Should show performance for subjective and coding questions
    const subjectiveElements = screen.getAllByText(/Subjective/i);
    const codingElements = screen.getAllByText(/Coding/i);
    
    expect(subjectiveElements.length).toBeGreaterThan(0);
    expect(codingElements.length).toBeGreaterThan(0);
  });

  test('handles time performance data correctly', () => {
    render(<AnalyticsDashboard {...defaultProps} />);
    
    // Should render time vs performance chart
    expect(screen.getByText('Time vs Performance Analysis')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  test('filters out unreasonable completion times', () => {
    const submissionsWithExtremeTimes = [
      ...mockSubmissions,
      {
        id: 5,
        assessment_id: 1,
        interviewee_id: 5,
        status: 'graded',
        score: 75,
        max_score: 100,
        submitted_at: '2024-01-15T14:00:00Z',
        started_at: '2024-01-15T08:00:00Z', // 6 hours - should be filtered out
        answers: []
      }
    ];
    
    render(
      <AnalyticsDashboard 
        submissions={submissionsWithExtremeTimes}
        assessments={mockAssessments}
        questions={mockQuestions}
      />
    );
    
    // Should still render without errors
    expect(screen.getByText('Time vs Performance Analysis')).toBeInTheDocument();
  });

  test('displays custom tooltip for charts', () => {
    render(<AnalyticsDashboard {...defaultProps} />);
    
    // Charts should have tooltips
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });

  test('shows legends for charts', () => {
    render(<AnalyticsDashboard {...defaultProps} />);
    
    // Charts should have legends
    expect(screen.getByTestId('legend')).toBeInTheDocument();
  });

  test('handles missing question data gracefully', () => {
    const assessmentsWithoutQuestions = [
      { id: 1, title: 'Assessment Without Questions', questions: [] }
    ];
    
    render(
      <AnalyticsDashboard 
        submissions={mockSubmissions}
        assessments={assessmentsWithoutQuestions}
        questions={[]}
      />
    );
    
    expect(screen.getByText('Assessment Performance')).toBeInTheDocument();
    expect(screen.getByText('Assessment Without Questions')).toBeInTheDocument();
  });

  test('calculates pass rate correctly with threshold', () => {
    const submissionsWithMixedScores = [
      {
        id: 1,
        assessment_id: 1,
        interviewee_id: 1,
        status: 'graded',
        score: 65, // Below pass threshold (70%)
        max_score: 100,
        submitted_at: '2024-01-15T10:30:00Z',
        started_at: '2024-01-15T09:30:00Z',
        answers: []
      },
      {
        id: 2,
        assessment_id: 1,
        interviewee_id: 2,
        status: 'graded',
        score: 85, // Above pass threshold
        max_score: 100,
        submitted_at: '2024-01-15T11:00:00Z',
        started_at: '2024-01-15T10:00:00Z',
        answers: []
      }
    ];
    
    render(
      <AnalyticsDashboard 
        submissions={submissionsWithMixedScores}
        assessments={mockAssessments}
        questions={mockQuestions}
      />
    );
    
    // Pass rate should be 50% (1 out of 2 passed)
    expect(screen.getByText('50%')).toBeInTheDocument();
  });
});
