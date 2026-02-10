import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../../../components/layout/PageWrapper";
import Button from "../../../components/common/Button";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchAssessments, deleteAssessment } from "../../assessments/assessmentSlice";
import { getQuestionTypeInfo, detectQuestionType } from "../../../utils/questionTypes";

export default function RecruiterAssessments() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items: assessments, loading } = useAppSelector((s) => s.assessments);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    dispatch(fetchAssessments());
  }, [dispatch]);

  const handleDeleteAssessment = async (assessmentId, assessmentTitle) => {
    console.log('Attempting to delete assessment:', { assessmentId, assessmentTitle });
    const confirmed = window.confirm(
      `Are you sure you want to delete "${assessmentTitle}"? This action cannot be undone and will remove all associated questions, invitations, and submissions.`
    );
    
    if (confirmed) {
      setDeletingId(assessmentId);
      try {
        await dispatch(deleteAssessment(assessmentId)).unwrap();
        console.log('Assessment deleted successfully');
      } catch (error) {
        console.error('Delete assessment error:', error);
        const errorMessage = error?.message || error?.detail || typeof error === 'string' ? error : 'Unknown error occurred';
        alert(`Failed to delete assessment: ${errorMessage}`);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const getQuestionTypeBreakdown = (questions) => {
    if (!questions || questions.length === 0) return { total: 0, types: [] };
    
    const typeCounts = {};
    questions.forEach(question => {
      const type = detectQuestionType(question);
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    const types = Object.entries(typeCounts).map(([type, count]) => {
      const typeInfo = getQuestionTypeInfo(type);
      return {
        type,
        count,
        icon: typeInfo.icon,
        label: typeInfo.label
      };
    });

    return {
      total: questions.length,
      types
    };
  };

  return (
    <PageWrapper>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Assessments</h2>

        <Button
          onClick={() => navigate("/recruiter/create")}
        >
          + Create Assessment
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-slate-600">Loading assessments...</div>
        ) : assessments.length === 0 ? (
          <div className="p-6 text-center text-slate-600">No assessments found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3">Title</th>
                <th className="text-left px-6 py-3">Questions</th>
                <th className="text-left px-6 py-3">Duration</th>
                <th className="text-left px-6 py-3">Status</th>
                <th className="text-right px-6 py-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {assessments.map((assessment) => (
                <tr
                  key={assessment.id}
                  className="border-b last:border-none"
                >
                  <td className="px-6 py-4 font-medium">
                    {assessment.title}
                  </td>
                  <td className="px-6 py-4">
                    {(() => {
                      const breakdown = getQuestionTypeBreakdown(assessment.questions);
                      if (breakdown.total === 0) return '0';
                      
                      return (
                        <div className="flex flex-col space-y-1">
                          <span className="font-medium">{breakdown.total} questions</span>
                          <div className="flex flex-wrap gap-1">
                            {breakdown.types.map((typeInfo, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                                title={`${typeInfo.label}: ${typeInfo.count}`}
                              >
                                <span className="mr-1">{typeInfo.icon}</span>
                                {typeInfo.count}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4">
                    {assessment.time_limit ? `${assessment.time_limit} mins` : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        assessment.status === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {assessment.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right space-x-2">
                    <Button 
                      variant="secondary"
                      onClick={() => navigate(`/recruiter/results?assessment=${assessment.id}`)}
                    >
                      View
                    </Button>

                    <Button
                      variant="danger"
                      onClick={() => handleDeleteAssessment(assessment.id, assessment.title)}
                      disabled={deletingId === assessment.id}
                      className="min-w-[80px]"
                    >
                      {deletingId === assessment.id ? 'Deleting...' : 'Delete'}
                    </Button>

                    {assessment.status === "draft" && (
                      <Button
                        onClick={() => {
                          // Publish assessment
                          fetch(`http://127.0.0.1:8000/api/assessments/${assessment.id}/publish`, {
                            method: 'POST',
                            headers: {
                              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                            }
                          }).then(() => dispatch(fetchAssessments()));
                        }}
                      >
                        Publish
                      </Button>
                    )}

                    {assessment.status === "published" && (
                      <Button 
                        variant="secondary"
                        onClick={() => navigate(`/recruiter/results?assessment=${assessment.id}`)}
                      >
                        Results
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </PageWrapper>
  );
}
