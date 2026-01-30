import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../../../components/layout/PageWrapper";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  acceptInvitation,
  declineInvitation,
  fetchInvitations,
} from "../../invitations/invitationsSlice";
import BackToDashboardButton from "../../../components/common/BackToDashboardButton";

export default function Invitations() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, loading, error } = useAppSelector((s) => s.invitations);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    dispatch(fetchInvitations());
  }, [dispatch]);

  console.log("Invitations fetched:", items);
  console.log("Loading:", loading, "Error:", error);

  const pendingInvitations = items.filter(inv => inv.status === "pending");

  const handleAccept = async (invitationId) => {
    setActionLoading(invitationId);
    const result = await dispatch(acceptInvitation(invitationId));
    setActionLoading(null);
    
    if (acceptInvitation.fulfilled.match(result)) {
      alert("Invitation accepted! You can now start the test from your dashboard.");
      // Refetch to get updated data
      dispatch(fetchInvitations());
    } else {
      alert("Error: " + (result.payload || "Failed to accept"));
    }
  };

  const handleDecline = async (invitationId) => {
    setActionLoading(invitationId);
    const result = await dispatch(declineInvitation(invitationId));
    setActionLoading(null);
    
    if (declineInvitation.fulfilled.match(result)) {
      alert("Invitation declined.");
      // Refetch to get updated data
      dispatch(fetchInvitations());
    } else {
      alert("Error: " + (result.payload || "Failed to decline"));
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Invitations</h2>
            <p className="text-sm text-slate-500">Manage your assessment invitations</p>
          </div>
          <BackToDashboardButton />
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {loading && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-sm text-slate-600">
              Loading invitations...
            </div>
          )}

          {!loading && pendingInvitations.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-sm text-slate-600">
              No pending invitations found.
            </div>
          )}

          {!loading &&
            pendingInvitations.map((inv) => {
              const assessment = inv.assessment;
              return (
                <div
                  key={inv.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-900">
                        {assessment?.title || "Assessment"}
                      </h4>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-900 text-white capitalize">
                        {inv.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">
                      {assessment?.description || ""}
                    </p>
                    <div className="flex flex-wrap gap-6 text-xs text-slate-600 mt-4">
                      <span>
                        Time limit: {assessment?.time_limit ? `${assessment.time_limit} min` : "-"}
                      </span>
                      <span>
                        Start: {inv.scheduled_start ? new Date(inv.scheduled_start).toLocaleString() : "-"}
                      </span>
                      <span>
                        End: {inv.scheduled_end ? new Date(inv.scheduled_end).toLocaleString() : "-"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={inv.status !== "pending" || actionLoading === inv.id}
                      onClick={() => handleAccept(inv.id)}
                      className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                    >
                      {actionLoading === inv.id ? "Processing..." : "Accept"}
                    </button>
                    <button
                      type="button"
                      disabled={inv.status !== "pending" || actionLoading === inv.id}
                      onClick={() => handleDecline(inv.id)}
                      className="border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold"
                    >
                      {actionLoading === inv.id ? "Processing..." : "Decline"}
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </PageWrapper>
  );
}

