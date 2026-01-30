import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../../../components/layout/PageWrapper";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchAssessments } from "../../assessments/assessmentSlice";
import { fetchInvitations, sendInvitation } from "../../invitations/invitationsSlice";
import BackToDashboardButton from "../../../components/common/BackToDashboardButton";
import apiClient from "../../../services/apiClient";
import { fetchSubmissions } from "../../submissions/submissionsSlice";
import CSVUploader from "../components/CSVUploader";

export default function RecruiterInvitations() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { items: assessments, loading: assessmentsLoading } = useAppSelector((s) => s.assessments);
  const { items: invitations, loading: invitationsLoading } = useAppSelector((s) => s.invitations);
  const { items: submissions } = useAppSelector((s) => s.submissions);

  const [form, setForm] = useState({
    assessment_id: "",
    candidate_email: "",
  });
  const [bulkEmails, setBulkEmails] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showCSVUpload, setShowCSVUpload] = useState(false);

  useEffect(() => {
    dispatch(fetchAssessments());
    dispatch(fetchInvitations());
    dispatch(fetchSubmissions());
  }, [dispatch]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "candidate_email") setEmailError("");
  };

  const resolveEmailToUserId = async (email) => {
    try {
      const { data } = await apiClient.get(`/api/users/by-email/${email}`);
      return data.id;
    } catch {
      return null;
    }
  };

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    if (!form.assessment_id || !form.candidate_email) return;
    const userId = await resolveEmailToUserId(form.candidate_email);
    if (!userId) {
      setEmailError("Email not registered. Please ask the candidate to sign up first.");
      return;
    }
    const res = await dispatch(sendInvitation({ assessment_id: form.assessment_id, interviewee_id: userId }));
    if (sendInvitation.fulfilled.match(res)) {
      setForm({ assessment_id: "", candidate_email: "" });
      alert("Invitation sent successfully!");
    } else {
      console.error("Send invitation error:", res);
      alert("Backend error: " + (res.payload || res.error?.message || "Unknown error"));
    }
  };

  const handleCSVEmails = (emails) => {
    setBulkEmails(emails.join(', '));
    setShowCSVUpload(false);
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (!form.assessment_id || !bulkEmails.trim()) return;
    const emails = bulkEmails
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);
    let successCount = 0;
    for (const email of emails) {
      const userId = await resolveEmailToUserId(email);
      if (!userId) {
        alert(`Email not registered: ${email}`);
        continue;
      }
      const res = await dispatch(sendInvitation({ assessment_id: form.assessment_id, interviewee_id: userId }));
      if (sendInvitation.fulfilled.match(res)) {
        successCount++;
      } else {
        console.error("Bulk invitation error for", email, res);
        alert(`Failed to send to ${email}: ${res.payload || res.error?.message || "Unknown error"}`);
      }
    }
    setBulkEmails("");
    alert(`Invitations sent to ${successCount} of ${emails.length} recipient(s).`);
  };

  const allAssessments = assessments; // Show all assessments, not just published

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Invitations</h2>
            <p className="text-sm text-slate-500">Send assessment invitations to candidates</p>
          </div>
          <BackToDashboardButton />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Send Invitation Form */}
          <div className="space-y-6">
            {/* Single Email */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Send Single Invitation</h3>
              <form onSubmit={handleSingleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Assessment</label>
                  <select
                    name="assessment_id"
                    value={form.assessment_id}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select an assessment</option>
                    {allAssessments.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.title} ({a.status})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Candidate Email</label>
                  <input
                    name="candidate_email"
                    type="email"
                    value={form.candidate_email}
                    onChange={handleFormChange}
                    placeholder="candidate@example.com"
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  {emailError && <p className="text-xs text-red-600 mt-1">{emailError}</p>}
                </div>
                <button
                  type="submit"
                  disabled={invitationsLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-semibold"
                >
                  {invitationsLoading ? "Sending..." : "Send Invitation"}
                </button>
              </form>
            </div>

            {/* Bulk Email */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Send Bulk Invitations</h3>
              <form onSubmit={handleBulkSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Assessment</label>
                  <select
                    name="assessment_id"
                    value={form.assessment_id}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select an assessment</option>
                    {allAssessments.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.title} ({a.status})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Candidate Emails</label>
                  <div className="space-y-3">
                    <textarea
                      value={bulkEmails}
                      onChange={(e) => setBulkEmails(e.target.value)}
                      placeholder="alice@example.com, bob@example.com, carol@example.com"
                      rows={4}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowCSVUpload(!showCSVUpload)}
                        className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded"
                      >
                        {showCSVUpload ? "Hide CSV" : "Upload CSV"}
                      </button>
                    </div>
                    {showCSVUpload && (
                      <CSVUploader onEmailsExtracted={handleCSVEmails} />
                    )}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={invitationsLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-semibold"
                >
                  {invitationsLoading ? "Sending..." : "Send Bulk Invitations"}
                </button>
              </form>
            </div>
          </div>

          {/* Invitations List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900">Sent Invitations</h3>
            </div>

            {invitationsLoading ? (
              <div className="p-6 text-sm text-slate-600">Loading invitations...</div>
            ) : invitations.length === 0 ? (
              <div className="p-6 text-sm text-slate-600">No invitations sent yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-6 py-3 font-semibold text-slate-700">Assessment</th>
                      <th className="text-left px-6 py-3 font-semibold text-slate-700">Candidate</th>
                      <th className="text-left px-6 py-3 font-semibold text-slate-700">Status</th>
                      <th className="text-left px-6 py-3 font-semibold text-slate-700">Test Status</th>
                      <th className="text-left px-6 py-3 font-semibold text-slate-700">Sent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invitations.map((inv) => {
                      const assessment = assessments.find((a) => a.id === inv.assessment_id);
                      const submission = submissions.find((s) => s.assessment_id === inv.assessment_id && s.interviewee_id === inv.interviewee_id);
                      const testStatus = submission ? submission.status : 'not_started';
                      
                      return (
                        <tr key={inv.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-6 py-4">
                            <p className="font-medium text-slate-900">{assessment?.title || "-"}</p>
                            <p className="text-xs text-slate-500">ID: {inv.assessment_id}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium text-slate-900">{inv.interviewee?.full_name || inv.interviewee?.username || 'Unknown'}</p>
                            <p className="text-xs text-slate-500">{inv.interviewee?.email || inv.candidate_email}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-block px-2 py-1 text-xs font-semibold rounded capitalize ${
                                inv.status === "accepted"
                                  ? "bg-green-100 text-green-700"
                                  : inv.status === "declined"
                                  ? "bg-red-100 text-red-700"
                                  : inv.status === "pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {inv.status === 'pending' ? 'Invitation Sent' : inv.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-block px-2 py-1 text-xs font-semibold rounded capitalize ${
                                testStatus === "graded"
                                  ? "bg-green-100 text-green-700"
                                  : testStatus === "submitted"
                                  ? "bg-blue-100 text-blue-700"
                                  : testStatus === "in_progress"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {testStatus.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs text-slate-600">
                              {inv.created_at ? new Date(inv.created_at).toLocaleDateString() : "-"}
                            </p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
