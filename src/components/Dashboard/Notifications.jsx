import { FiBell, FiX, FiAlertCircle } from "react-icons/fi";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { API_BASE_URL, fetchUnreadNotifications } from "../../api";
import useSound from "use-sound";
import emptyStateImage from "../../assets/images/notification-empty-state.svg";
import notificationSfx from "../../assets/sounds/notification-sound.mp3";

// ---------------------------------------------------------------------------
// Notifications — bell button + modal
// ---------------------------------------------------------------------------

const Notifications = ({ token }) => {
    const [notificationCount, setNotificationCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(Boolean(token));
    const [error, setError] = useState("");

    // Sound setup
    const [play] = useSound(notificationSfx, { volume: 1 });

    // Keep a stable ref so the socket listener always calls the latest `play`
    const playRef = useRef(play);
    useEffect(() => {
        playRef.current = play;
    }, [play]);

    // Unlock the AudioContext on first user interaction (browser autoplay policy)
    useEffect(() => {
        const unlock = () => {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) new AudioCtx().resume();
            window.removeEventListener("click", unlock);
        };
        window.addEventListener("click", unlock);
        return () => window.removeEventListener("click", unlock);
    }, []);

    // Fetch notifications on demand (called when the bell is clicked)
    const loadNotifications = () => {
        if (!token) {
            setNotificationCount(0);
            setNotifications([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError("");

        fetchUnreadNotifications(token)
            .then(({ count, notifications: unread }) => {
                setNotificationCount(count);
                setNotifications(unread);
            })
            .catch((err) => {
                setError(err?.message || "Unable to load notifications.");
                setNotificationCount(0);
                setNotifications([]);
            })
            .finally(() => setLoading(false));
    };

    // Fetch initial unread count on mount / token change
    useEffect(() => {
        let active = true;
        if (!token) return;

        fetchUnreadNotifications(token)
            .then(({ count, notifications: unread }) => {
                if (!active) return;
                setError("");
                setNotificationCount(count);
                setNotifications(unread);
            })
            .catch((err) => {
                if (!active) return;
                setError(err?.message || "Unable to load notifications.");
                setNotificationCount(0);
                setNotifications([]);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [token]);

    // Real-time socket connection — only reconnects when token changes
    useEffect(() => {
        if (!token) return;

        const socket = io(API_BASE_URL, { auth: { token } });

        socket.on("connect", () => {
            console.log("CONNECTED:", socket.id);
        });

        socket.on("notification:new", (data) => {
            console.log("REALTIME EVENT RECEIVED:", data);
        });

        socket.on("notification:new", async (notification) => {
            try {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx && AudioCtx.state === "suspended") {
                    const ctx = new AudioCtx();
                    await ctx.resume();
                }

                playRef.current?.();
            } catch (err) {
                console.error("Notification sound error:", err);
            }

            setNotificationCount((prev) => prev + 1);
            setNotifications((prev) => [notification, ...prev]);
        });

        socket.on("connect_error", (err) => {
            setError(err?.message || "Unable to connect to notifications.");
        });

        return () => socket.disconnect();
    }, [token]); // play  is deliberately excluded — handled via ref above

    const handleOpen = () => {
        setIsOpen(true);
        loadNotifications();
    };

    const ariaLabel = error
        ? "Unable to load notifications"
        : `${notificationCount} unread notification${notificationCount !== 1 ? "s" : ""}`;

    return (
        <>
            <button
                type="button"
                onClick={handleOpen}
                aria-label={ariaLabel}
                title={ariaLabel}
                className="relative rounded-2xl border border-stone-200 p-2 transition-colors hover:bg-gray-100 cursor-pointer"
            >
                <FiBell className={loading ? "animate-pulse" : ""} />

                {!loading && notificationCount > 0 && (
                    <span
                        aria-hidden="true"
                        className="absolute -right-1 -top-1 flex size-6 items-center justify-center
                                   rounded-full bg-red-500 text-[11px] font-bold leading-none
                                   text-white border-white border-[3px]"
                    >
                        {notificationCount > 99 ? "99+" : notificationCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <NotificationModal
                    error={error}
                    loading={loading}
                    notifications={notifications}
                    onClose={() => setIsOpen(false)}
                    play={play}
                />
            )}
        </>
    );
};

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------

const NotificationModal = ({ error, loading, notifications, onClose, play }) => {
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
                        className="rounded border border-stone-200 p-2 text-stone-500 transition-colors hover:bg-gray-100"
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
                                    key={notification.id ?? notification._id ?? index}
                                    notification={notification}
                                />
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

// ---------------------------------------------------------------------------
// Individual item
// ---------------------------------------------------------------------------

const NotificationItem = ({ notification }) => {
    const title =
        notification.title ||
        notification.type ||
        notification.subject ||
        "New notification";

    const message =
        notification.message ||
        notification.body ||
        notification.description ||
        notification.text ||
        "A new dashboard notification was received.";

    const rawDate =
        notification.createdAt ||
        notification.created_at ||
        notification.timestamp ||
        notification.date;

    const formattedDate = rawDate
        ? new Date(rawDate).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
        })
        : null;

    return (

        <li className="rounded border border-stone-200 bg-stone-50 p-3">
            <div className="flex items-start gap-3">
                <span
                    className="mt-1.5 size-2 shrink-0 rounded-full bg-red-500"
                    aria-label="Unread"
                />
                <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-stone-950">
                        {title}
                    </h3>
                    <p className="mt-1 text-sm text-stone-600">
                        {message}
                    </p>
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

export default Notifications;
