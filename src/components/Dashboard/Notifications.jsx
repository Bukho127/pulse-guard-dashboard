import { FiBell, FiX } from "react-icons/fi"
import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { API_BASE_URL, fetchUnreadNotifications } from '../../api'
import emptyStateImage from '../../assets/images/notification-empty-state.svg'

const Notifications = ({ token }) => {
    const [notificationCount, setNotificationCount] = useState(0)
    const [notifications, setNotifications] = useState([])
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(Boolean(token))
    const [error, setError] = useState('')

    const loadNotifications = () => {
        if (!token) {
            setNotificationCount(0)
            setNotifications([])
            setLoading(false)
            return
        }

        setLoading(true)
        setError('')

        fetchUnreadNotifications(token)
            .then(({ count, notifications: unreadNotifications }) => {
                setNotificationCount(count)
                setNotifications(unreadNotifications)
            })
            .catch((err) => {
                setError(err?.message || 'Unable to load notifications.')
                setNotificationCount(0)
                setNotifications([])
            })
            .finally(() => {
                setLoading(false)
            })
    }

    useEffect(() => {
        let active = true

        if (!token) {
            return undefined
        }

        fetchUnreadNotifications(token)
            .then(({ count, notifications: unreadNotifications }) => {
                if (active) {
                    setError('')
                    setNotificationCount(count)
                    setNotifications(unreadNotifications)
                }
            })
            .catch((err) => {
                if (active) {
                    setError(err?.message || 'Unable to load notifications.')
                    setNotificationCount(0)
                    setNotifications([])
                }
            })
            .finally(() => {
                if (active) {
                    setLoading(false)
                }
            })

        return () => {
            active = false
        }
    }, [token])

    useEffect(() => {
        if (!token) {
            return undefined
        }

        const socket = io(API_BASE_URL, {
            auth: { token },
        })

        socket.on('connect', () => {
            console.log('Socket connected:', socket.id)
        })

        socket.on('notification:new', (notification) => {
            console.log('New notification received:', notification)
            setNotificationCount((count) => count + 1)
            setNotifications((currentNotifications) => [notification, ...currentNotifications])
        })

        socket.on('connect_error', (err) => {
            setError(err?.message || 'Unable to connect to notifications.')
        })

        return () => {
            socket.disconnect()
        }
    }, [token])

    const label = error
        ? 'Unable to load notifications'
        : `${notificationCount} unread notifications`

    return (
        <>
            <button
                type="button"
                onClick={() => {
                    setIsOpen(true)
                    loadNotifications()
                }}
                aria-label={label}
                title={label}
                className="relative rounded-2xl border border-stone-200 p-2 transition-colors hover:border-green-600 hover:text-green-700"
            >
                <FiBell className={loading ? 'animate-pulse' : ''} />
                {!loading && notificationCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex size-4.5 items-center 
                    justify-center rounded-full bg-red-500 text-[11px] font-bold 
                    leading-none text-white border-white border-[2px]">
                        {notificationCount}
                    </span>
                )}
            </button>

            {isOpen ? (
                <NotificationModal
                    error={error}
                    loading={loading}
                    notifications={notifications}
                    onClose={() => setIsOpen(false)}
                />
            ) : null}
        </>
    )
}

const NotificationModal = ({ error, loading, notifications, onClose }) => {
    const isEmpty = !loading && !error && notifications.length === 0

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
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
                    <div>
                        <h2 id="notifications-title" className="text-sm font-semibold text-stone-950">
                            Notifications
                        </h2>
                        <p className="text-xs text-stone-500">
                            Latest unread alerts
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close notifications"
                        className="rounded border border-stone-200 p-2 text-stone-500 transition-colors hover:border-green-600 hover:text-green-700"
                    >
                        <FiX />
                    </button>
                </div>

                <div className="max-h-[70vh] overflow-y-auto p-4">
                    {loading ? (
                        <div className="py-10 text-center text-sm text-stone-500">
                            Loading notifications...
                        </div>
                    ) : null}

                    {error ? (
                        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {error}
                        </div>
                    ) : null}

                    {isEmpty ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <img
                                src={emptyStateImage}
                                alt=""
                                className="mb-4 h-32 w-32"
                            />
                            <h3 className="text-sm font-semibold text-stone-950">
                                No notifications
                            </h3>
                            <p className="mt-1 text-xs text-stone-500">
                                You are all caught up.
                            </p>
                        </div>
                    ) : null}

                    {!loading && !error && notifications.length > 0 ? (
                        <div className="space-y-2">
                            {notifications.map((notification, index) => (
                                <NotificationItem
                                    key={notification.id || notification._id || index}
                                    notification={notification}
                                />
                            ))}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    )
}

const NotificationItem = ({ notification }) => {
    const title =
        notification.title ||
        notification.type ||
        notification.subject ||
        'New notification'
    const message =
        notification.message ||
        notification.body ||
        notification.description ||
        notification.text ||
        'A new dashboard notification was received.'
    const date =
        notification.createdAt ||
        notification.created_at ||
        notification.timestamp ||
        notification.date

    return (
        <article className="rounded border border-stone-200 bg-stone-50 p-3">
            <div className="flex items-start gap-3">
                <span className="mt-1 size-2 shrink-0 rounded-full bg-red-500" />
                <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-stone-950">{title}</h3>
                    <p className="mt-1 text-sm text-stone-600">{message}</p>
                    {date ? (
                        <p className="mt-2 text-xs text-stone-400">
                            {new Date(date).toLocaleString()}
                        </p>
                    ) : null}
                </div>
            </div>
        </article>
    )
}

export default Notifications
