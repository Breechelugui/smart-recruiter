import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

export default function BackToDashboardButton({ className = "" }) {
  const navigate = useNavigate();
  const { role } = useAuth();

  const to = role === "recruiter" ? "/recruiter" : "/interviewee";

  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-700 ${className}`}
    >
      Back to Dashboard
    </button>
  );
}
