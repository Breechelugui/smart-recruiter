import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { logout } from "../../features/auth/authSlice";
import useAuth from "../../hooks/useAuth";
import { fetchNotifications, markNotificationRead } from "../../features/notifications/notificationsSlice";

export default function Navbar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { items: notifications } = useAppSelector((state) => state.notifications);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user) {
      dispatch(fetchNotifications());
    }
  }, [dispatch, user]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      dispatch(markNotificationRead(notification.id));
    }
    setShowNotifications(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-sm">
            {"</>"}
          </div>
          <div>
            <h1 className="font-bold leading-tight text-slate-900">Smart Recruiter</h1>
            <p className="text-xs text-slate-500">
              {role === "recruiter"
                ? "RECRUITER MANAGEMENT PORTAL"
                : "CANDIDATE ASSESSMENT PORTAL"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-700"
            >
              Notifications
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 h-5 min-w-5 px-1.5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-slate-200">
                  <h3 className="font-semibold text-slate-900">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-sm text-slate-500">No notifications</div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 ${
                          !notification.is_read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-sm text-slate-900">{notification.title}</p>
                            <p className="text-xs text-slate-600 mt-1">{notification.message}</p>
                          </div>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full ml-2 mt-1"></div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-500">ACCOUNT</p>
            <p className="text-sm font-semibold text-slate-700">{user?.email}</p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-700"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
