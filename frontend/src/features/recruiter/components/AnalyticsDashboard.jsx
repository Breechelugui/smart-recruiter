import { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';

// Modern color palette with gradients
const COLORS = {
  primary: '#8b5cf6',
  success: '#10b981', 
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#6366f1',
  pink: '#ec4899'
};

const GRADIENT_COLORS = [
  { start: '#8b5cf6', end: '#7c3aed' }, // Purple
  { start: '#10b981', end: '#059669' }, // Green
  { start: '#f59e0b', end: '#d97706' }, // Orange
  { start: '#ef4444', end: '#dc2626' }, // Red
  { start: '#6366f1', end: '#4f46e5' }, // Blue
  { start: '#ec4899', end: '#db2777' }, // Pink
];

const AnalyticsDashboard = ({ submissions, assessments, questions }) => {
  // Calculate comprehensive statistics
  const analytics = useMemo(() => {
    const totalSubmissions = submissions.length;
    const submittedSubmissions = submissions.filter(s => s.status === 'submitted' || s.status === 'graded');
    const gradedSubmissions = submissions.filter(s => s.status === 'graded');
    
    // Performance distribution with modern colors
    const performanceData = [
      { name: 'Excellent', count: 0, value: 0, color: COLORS.success, icon: '🏆' },
      { name: 'Good', count: 0, value: 0, color: COLORS.info, icon: '👍' },
      { name: 'Average', count: 0, value: 0, color: COLORS.warning, icon: '📊' },
      { name: 'Below Avg', count: 0, value: 0, color: '#f97316', icon: '📉' },
      { name: 'Poor', count: 0, value: 0, color: COLORS.danger, icon: '❌' }
    ];

    // Question difficulty analysis
    const questionAnalysis = questions.map(question => {
      const questionAnswers = submissions.flatMap(s => s.answers || []).filter(a => a.question_id === question.id);
      const totalAttempts = questionAnswers.length;
      const correctAnswers = questionAnswers.filter(a => a.points_earned && a.points_earned >= question.points * 0.7).length;
      const avgScore = totalAttempts > 0 ? questionAnswers.reduce((sum, a) => sum + (a.points_earned || 0), 0) / totalAttempts : 0;
      const difficulty = totalAttempts > 0 ? (correctAnswers / totalAttempts) * 100 : 0;

      return {
        questionTitle: question.title?.substring(0, 30) + (question.title?.length > 30 ? '...' : ''),
        totalAttempts,
        avgScore: Math.round((avgScore / question.points) * 100) || 0,
        difficulty: Math.round(difficulty),
        questionType: question.question_type
      };
    });

    // Time-based performance
    const timePerformance = submissions
      .filter(s => s.submitted_at && s.started_at)
      .map(s => {
        const duration = new Date(s.submitted_at) - new Date(s.started_at);
        const minutes = Math.floor(duration / 60000);
        const score = typeof s.score === 'number' && typeof s.max_score === 'number' 
          ? Math.round((s.score / s.max_score) * 100) 
          : 0;
        return { minutes, score };
      })
      .filter(s => s.minutes > 0 && s.minutes <= 300) // Filter reasonable times
      .sort((a, b) => a.minutes - b.minutes);

    // Assessment completion rates
    const assessmentStats = assessments.map(assessment => {
      const assessmentSubmissions = submissions.filter(s => s.assessment_id === assessment.id);
      const completed = assessmentSubmissions.filter(s => s.status === 'submitted' || s.status === 'graded');
      const graded = assessmentSubmissions.filter(s => s.status === 'graded');
      const avgScore = graded.length > 0 
        ? Math.round(graded.reduce((sum, s) => sum + (s.score / s.max_score) * 100, 0) / graded.length)
        : 0;

      return {
        title: assessment.title?.substring(0, 25) + (assessment.title?.length > 25 ? '...' : ''),
        total: assessmentSubmissions.length,
        completed: completed.length,
        graded: graded.length,
        completionRate: assessmentSubmissions.length > 0 ? Math.round((completed.length / assessmentSubmissions.length) * 100) : 0,
        avgScore
      };
    });

    // Calculate performance distribution
    gradedSubmissions.forEach(submission => {
      const percentage = typeof submission.score === 'number' && typeof submission.max_score === 'number'
        ? (submission.score / submission.max_score) * 100
        : 0;

      if (percentage >= 90) {
        performanceData[0].count++;
        performanceData[0].value++;
      } else if (percentage >= 75) {
        performanceData[1].count++;
        performanceData[1].value++;
      } else if (percentage >= 60) {
        performanceData[2].count++;
        performanceData[2].value++;
      } else if (percentage >= 40) {
        performanceData[3].count++;
        performanceData[3].value++;
      } else {
        performanceData[4].count++;
        performanceData[4].value++;
      }
    });

    // Answer patterns by question type
    const questionTypeStats = questions.reduce((acc, question) => {
      const type = question.question_type;
      if (!acc[type]) acc[type] = { total: 0, avgScore: 0, count: 0 };
      acc[type].total++;
      
      const questionAnswers = submissions.flatMap(s => s.answers || []).filter(a => a.question_id === question.id);
      if (questionAnswers.length > 0) {
        const avgScore = questionAnswers.reduce((sum, a) => sum + (a.points_earned || 0), 0) / questionAnswers.length;
        acc[type].avgScore += avgScore;
        acc[type].count++;
      }
      
      return acc;
    }, {});

    Object.keys(questionTypeStats).forEach(type => {
      if (questionTypeStats[type].count > 0) {
        questionTypeStats[type].avgScore = Math.round((questionTypeStats[type].avgScore / questionTypeStats[type].count) * 100);
      }
    });

    return {
      totalSubmissions,
      submittedSubmissions: submittedSubmissions.length,
      gradedSubmissions: gradedSubmissions.length,
      averageScore: gradedSubmissions.length > 0 
        ? Math.round(gradedSubmissions.reduce((sum, s) => sum + (s.score / s.max_score) * 100, 0) / gradedSubmissions.length)
        : 0,
      performanceData,
      questionAnalysis,
      timePerformance,
      assessmentStats,
      questionTypeStats,
      passRate: gradedSubmissions.length > 0 
        ? Math.round((gradedSubmissions.filter(s => (s.score / s.max_score) >= 0.7).length / gradedSubmissions.length) * 100)
        : 0
    };
  }, [submissions, assessments, questions]);

  // Modern custom tooltip with better styling
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border-0 shadow-2xl rounded-2xl backdrop-blur-lg border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="font-bold text-gray-900 text-sm">{label}</p>
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          </div>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between py-1">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="text-sm font-medium text-gray-700">{entry.name}</span>
              </div>
              <span className="text-sm font-bold text-gray-900">
                {entry.value || entry.count}{entry.name.includes('%') ? '%' : ''}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Submissions</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalSubmissions}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.averageScore}%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pass Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.passRate}%</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Graded</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.gradedSubmissions}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Performance Distribution</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-purple-600 font-medium">Live</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={analytics.performanceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {analytics.performanceData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    stroke="#fff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {analytics.performanceData.map((entry, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                ></div>
                <div>
                  <p className="text-xs font-medium text-gray-700">{entry.icon}</p>
                  <p className="text-xs text-gray-500">{entry.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Question Difficulty Analysis */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Question Difficulty Analysis</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-600 font-medium">Top 5</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart 
              data={analytics.questionAnalysis.slice(0, 5)}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="questionTitle" 
                angle={-45} 
                textAnchor="end" 
                height={80} 
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="avgScore" 
                fill={COLORS.primary} 
                radius={[8, 4]}
                animationDuration={1000}
              />
              <Bar 
                dataKey="difficulty" 
                fill={COLORS.success} 
                radius={[8, 4]}
                animationDuration={1200}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Time Performance */}
      {analytics.timePerformance.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Time vs Performance Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.timePerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="minutes" label={{ value: 'Time (minutes)', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="score" stroke="#8b5cf6" name="Score %" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Assessment Statistics */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment Performance</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assessment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Score</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.assessmentStats.map((assessment, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{assessment.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{assessment.total}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{assessment.completed}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full" 
                          style={{ width: `${assessment.completionRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{assessment.completionRate}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{assessment.avgScore}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Question Type Analysis */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by Question Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(analytics.questionTypeStats).map(([type, stats]) => (
            <div key={type} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 capitalize">{type.replace('_', ' ')}</h4>
                <span className="text-sm text-gray-500">{stats.total} questions</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">{stats.avgScore}%</div>
              <div className="text-xs text-gray-500">Average Score</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
