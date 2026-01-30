import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { acceptInvitation, declineInvitation } from "../../invitations/invitationsSlice";
import { startSubmission } from "../../submissions/submissionsSlice";
import BackToDashboardButton from "../../../components/common/BackToDashboardButton";

export default function AssessmentDetails({ invitation, onClose }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading } = useAppSelector((s) => s.invitations);
  const [actionLoading, setActionLoading] = useState(null);

  const assessment = invitation?.assessment;
  const isPublished = assessment?.status === "published";
  const canStart = invitation.status === "accepted" && isPublished;

  const handleAccept = async () => {
    setActionLoading("accept");
    try {
      await dispatch(acceptInvitation(invitation.id)).unwrap();
    } catch (error) {
      console.error("Failed to accept invitation:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async () => {
    setActionLoading("decline");
    try {
      await dispatch(declineInvitation(invitation.id)).unwrap();
      onClose();
    } catch (error) {
      console.error("Failed to decline invitation:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleStart = async () => {
    setActionLoading("start");
    try {
      const res = await dispatch(startSubmission({ assessment_id: assessment.id })).unwrap();
      navigate(`/interviewee/active-test/${res.id}`);
    } catch (error) {
      console.error("Failed to start assessment:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "Not specified";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} minutes`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {assessment?.title || "Assessment Details"}
              </h2>
              <p className="text-gray-300">
                {assessment?.description || "No description available"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-4">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              invitation.status === 'pending' 
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                : invitation.status === 'accepted'
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {invitation.status === 'pending' ? 'Pending Response' : 
               invitation.status === 'accepted' ? 'Accepted' : 'Declined'}
            </span>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              isPublished 
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
            }`}>
              {isPublished ? 'Published' : 'Draft'}
            </span>
          </div>

          {/* Assessment Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-purple-400 mb-2">Duration</h3>
                <p className="text-white flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatDuration(assessment?.time_limit)}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-purple-400 mb-2">Questions</h3>
                <p className="text-white flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {assessment?.questions?.length || 0} questions
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-purple-400 mb-2">Difficulty</h3>
                <p className="text-white flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {assessment?.difficulty || 'Not specified'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-purple-400 mb-2">Scheduled Start</h3>
                <p className="text-white flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(invitation?.scheduled_start)}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-purple-400 mb-2">Deadline</h3>
                <p className="text-white flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatDate(invitation?.scheduled_end)}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-purple-400 mb-2">Status</h3>
                <p className="text-white">
                  {canStart ? (
                    <span className="text-green-400">Ready to start</span>
                  ) : !isPublished ? (
                    <span className="text-yellow-400">Waiting for publication</span>
                  ) : invitation.status === 'pending' ? (
                    <span className="text-yellow-400">Awaiting your response</span>
                  ) : (
                    <span className="text-gray-400">Not available</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Topics/Tags */}
          {assessment?.topics && assessment.topics.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-purple-400 mb-3">Topics Covered</h3>
              <div className="flex flex-wrap gap-2">
                {assessment.topics.map((topic, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full border border-purple-500/30"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          {assessment?.instructions && (
            <div>
              <h3 className="text-sm font-semibold text-purple-400 mb-3">Instructions</h3>
              <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
                <p className="text-gray-300 whitespace-pre-wrap">{assessment.instructions}</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-700">
          <div className="flex gap-3 justify-end">
            {invitation.status === 'pending' && (
              <>
                <button
                  onClick={handleDecline}
                  disabled={actionLoading === "decline"}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-all duration-200"
                >
                  {actionLoading === "decline" ? "Declining..." : "Decline"}
                </button>
                <button
                  onClick={handleAccept}
                  disabled={actionLoading === "accept"}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-all duration-200"
                >
                  {actionLoading === "accept" ? "Accepting..." : "Accept Invitation"}
                </button>
              </>
            )}

            {canStart && (
              <button
                onClick={handleStart}
                disabled={actionLoading === "start"}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-50 text-white font-semibold rounded-xl transition-all duration-200"
              >
                {actionLoading === "start" ? "Starting..." : "Start Assessment"}
              </button>
            )}

            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
