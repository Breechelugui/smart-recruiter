import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../../../components/layout/PageWrapper";
import Button from "../../../components/common/Button";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchAssessments } from "../../assessments/assessmentSlice";

export default function RecruiterAssessments() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items: assessments, loading } = useAppSelector((s) => s.assessments);

  useEffect(() => {
    dispatch(fetchAssessments());
  }, [dispatch]);

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
                    {assessment.questions?.length || 0}
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
