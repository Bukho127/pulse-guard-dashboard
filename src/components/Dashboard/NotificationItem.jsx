import React from "react";

const NotificationItem = ({ notification, onMarkAsRead }) => {
    const id = notification.notification_id;

    const title =
        notification.title ||
        notification.notification_type || // Matches your notification_type column
        notification.type ||
        "New Notification";

    const message =
        notification.message ||
        notification.description ||
        "A new dashboard notification was received.";

    // Fallback logic including your schema's 'sent_at' column
    const rawDate =
        notification.sent_at || 
        notification.createdAt ||
        notification.created_at ||
        notification.timestamp;

    const formattedDate = rawDate
        ? new Date(rawDate).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
          })
        : null;

    return (
        <li 
            className="rounded border border-stone-200 bg-stone-50 p-3 hover:bg-stone-100 transition-colors cursor-pointer"
            onClick={() => onMarkAsRead(id)}
        >
            <div className="flex items-start gap-3">
                <span
                    className="mt-1.5 size-2 shrink-0 rounded-full bg-red-500"
                    aria-label="Unread"
                />
                <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-stone-950">
                        {title}
                    </h3>
                    <p className="mt-1 text-sm text-stone-600 break-words">{message}</p>
                    {formattedDate && (
                        <time
                            className="mt-2 block text-xs text-stone-400"
                            dateTime={new Date(rawDate).toISOString()}
                        >
                            {formattedDate}
                        </time>
                    )}
                </div>
            </div>
        </li>
    );
};

export default NotificationItem;