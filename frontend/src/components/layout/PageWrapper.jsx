import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import useAuth from "../../hooks/useAuth";

export default function PageWrapper({ children }) {
  const { role } = useAuth();
  const showSidebar = role === "recruiter" || role === "interviewee";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      <div className="sticky top-0 z-50">
        <Navbar />
      </div>

      <div className="flex flex-1">
        {showSidebar && <Sidebar />}

        <main className="flex-1 p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          {children}
        </main>
      </div>
      
      <Footer />
    </div>
  );
}
