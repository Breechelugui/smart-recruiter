import { NavLink } from "react-router-dom";
import useAuth  from "../../hooks/useAuth";
import { useAppDispatch } from "../../app/hooks";
import { logout } from "../../features/auth/authSlice";

export default function Sidebar() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = "/login";
  };

  const recruiterLinks = [
    { label: "Dashboard", to: "/recruiter" },
    { label: "Assessments", to: "/recruiter/assessments" },
    { label: "Create Assessment", to: "/recruiter/create" },
    { label: "Invitations", to: "/recruiter/invitations" },
    { label: "Results", to: "/recruiter/results" },
  ];

  const candidateLinks = [
    { label: "Dashboard", to: "/interviewee" },
    { label: "Invitations", to: "/interviewee/invitations" },
    { label: "Practice Test", to: "/interviewee/practice" },
  ];

  const links =
    user?.role === "recruiter"
      ? recruiterLinks
      : candidateLinks;

  return (
    <aside className="w-64 bg-white dark:bg-secondary-900 border-r border-secondary-200 dark:border-secondary-800 min-h-screen p-6">
      <h2 className="text-xl font-bold mb-8 text-primary-600 dark:text-primary-500">
        Smart Recruiter
      </h2>

      <nav className="space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `block px-4 py-2 rounded-md text-sm font-medium ${
                isActive
                  ? "bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300"
                  : "text-secondary-600 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-8">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 border border-red-200"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
