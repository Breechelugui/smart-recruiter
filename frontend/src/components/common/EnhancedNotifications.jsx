import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchNotifications, markNotificationRead } from "../../../features/notifications/notificationsSlice";

export default function EnhancedNotifications() {
  const dispatch = useAppDispatch();
  const { items: notifications } = useAppSelector((state) => state.notifications);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      dispatch(markNotificationRead(notification.id));
    }
  };

  const formatNotificationMessage = (notification) => {
    switch (notification.type) {
      case "assessment_published":
        return {
          title: "Assessment Published",
          message: `The assessment "${notification.assessment_title}" has been published and is ready to take.`,
          icon: "📢",
          color: "purple"
        };
      case "assessment_scheduled":
        return {
          title: "Assessment Scheduled",
          message: `Your assessment "${notification.assessment_title}" is scheduled for ${notification.scheduled_time}.`,
          icon: "📅",
          color: "blue"
        };
      case "invitation_received":
        return {
          title: "New Invitation",
          message: `You have been invited to take "${notification.assessment_title}".`,
          icon: "📧",
          color: "yellow"
        };
      case "reminder":
        return {
          title: "Assessment Reminder",
          message: `Reminder: "${notification.assessment_title}" is scheduled to start soon.`,
          icon: "⏰",
          color: "orange"
        };
      case "deadline_approaching":
        return {
          title: "Deadline Approaching",
          message: `The deadline for "${notification.assessment_title}" is approaching.`,
          icon: "⚠️",
          color: "red"
        };
      default:
        return {
          title: "Notification",
          message: notification.message || "You have a new notification.",
          icon: "📬",
          color: "gray"
        };
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-300 hover:text-white transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowNotifications(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-96 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 z-50 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-sm text-purple-400">{unreadCount} unread</span>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <p className="text-gray-400">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => {
                  const formatted = formatNotificationMessage(notification);
                  return (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 border-b border-gray-700 cursor-pointer transition-colors ${
                        !notification.is_read ? 'bg-purple-900/20' : 'hover:bg-gray-700/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{formatted.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-semibold text-white">
                              {formatted.title}
                            </h4>
                            {!notification.is_read && (
                              <span className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-1"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-300 mt-1">
                            {formatted.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {formatTime(notification.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-700">
              <button
                onClick={() => {
                  // Mark all as read logic here
                  setShowNotifications(false);
                }}
                className="w-full text-center text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                Mark all as read
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
