import { FiX, FiAlertCircle } from "react-icons/fi";
import { useEffect } from "react";
import emptyStateImage from "../../assets/images/notification-empty-state.svg";
import NotificationItem from "./NotificationItem";

// ---------------------------------------------------------------------------
// Notification modal
// ---------------------------------------------------------------------------

const NotificationModal = ({ error, loading, notifications, onMarkAsRead, onClose }) => {
    const isEmpty = !loading && !error && notifications.length === 0;

    // Close on Escape key
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-end bg-stone-950/30 px-4 py-20"
            role="dialog"
            aria-modal="true"
            aria-labelledby="notifications-title"
            onClick={onClose}
        >
            <div
                className="w-full max-w-sm overflow-hidden rounded-lg border border-stone-200 bg-white shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
                    <div>
                        <h2
                            id="notifications-title"
                            className="text-sm font-semibold text-stone-950"
                        >
                            Notifications
                        </h2>
                        <p className="text-xs text-stone-500">Latest unread alerts</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close notifications"
                        className="rounded border border-stone-200 p-2 text-stone-500 transition-colors hover:bg-gray-100 cursor-pointer"
                    >
                        <FiX />
                    </button>
                </div>

                {/* Body */}
                <div className="max-h-[70vh] overflow-y-auto p-4">
                    {loading && (
                        <p className="py-10 text-center text-sm text-stone-500">
                            Loading notifications…
                        </p>
                    )}

                    {!loading && error && (
                        <div className="flex items-start gap-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            <FiAlertCircle className="mt-0.5 shrink-0" aria-hidden="true" />
                            <span>{error}</span>
                        </div>
                    )}

                    {isEmpty && (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <img src={emptyStateImage} alt="" className="mb-4 h-32 w-32" />
                            <h3 className="text-sm font-semibold text-stone-950">
                                You're all caught up
                            </h3>
                            <p className="mt-1 text-xs text-stone-500">
                                No unread notifications right now.
                            </p>
                        </div>
                    )}

                    {!loading && !error && notifications.length > 0 && (
                        <ul className="space-y-2" aria-label="Notification list">
                            {notifications.map((notification, index) => (
                                <NotificationItem
                                    // Fallback to your explicit DB primary key definition first
                                    key={notification.notification_id ?? notification.id ?? index}
                                    notification={notification}
                                    onMarkAsRead={onMarkAsRead} // <-- Forwarding handler down
                                />
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationModal;