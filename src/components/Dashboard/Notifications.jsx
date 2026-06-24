import { FiBell } from "react-icons/fi";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import useSound from "use-sound";
import notificationSfx from "../../assets/sounds/notification-sound.mp3";
import NotificationModal from "./NotificationModal";
import { API_BASE_URL, fetchUnreadNotifications, markNotificationAsRead } from "../../api";

// ---------------------------------------------------------------------------
// Notifications — bell button + modal orchestrator
// ---------------------------------------------------------------------------

const Notifications = ({ token }) => {
    const [notificationCount, setNotificationCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(Boolean(token));
    const [error, setError] = useState("");

    // Sound setup
    const [play] = useSound(notificationSfx, { volume: 1 });

    const handleMarkAsRead = async (notificationId) => {
        // A. Snapshot current states for rollback safety
        const backupNotifications = [...notifications];
        const backupCount = notificationCount;

        // B. Instant UI update: Filter out the element and decrement the main badge
        setNotifications((prev) => prev.filter((n) => n.notification_id !== notificationId));
        setNotificationCount((prev) => Math.max(0, prev - 1));

        // C. Fire database update in the background
        try {
            await markNotificationAsRead(token, notificationId);
        } catch (err) {
            console.error("Failed to sync read status on server, rolling back:", err);
            // D. Rollback instantly if backend request fails (e.g. timeout or unauthorized)
            setNotifications(backupNotifications);
            setNotificationCount(backupCount);
        }
    };

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
    }, [token]); // play is deliberately excluded — handled via ref above

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
                    onMarkAsRead={handleMarkAsRead}
                    onClose={() => setIsOpen(false)}
                />
            )}
        </>
    );
};

export default Notifications;
