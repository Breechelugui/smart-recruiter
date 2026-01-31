import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import useAuth from "../../hooks/useAuth";

export default function PageWrapper({ children }) {
  const { role } = useAuth();
  const showSidebar = role === "recruiter";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex">
        {showSidebar && <Sidebar />}

        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}