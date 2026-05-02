import { FiBell } from "react-icons/fi"
import { useState } from 'react'

const Notifications = () => {
    const [notificationCount, setNotificationCount] = useState(1)

    const handleNotification = () => {
        setNotificationCount(0)
    }

    return (
        <button
            type="button"
            onClick={handleNotification}
            aria-label={`${notificationCount} unread notifications`}
            className={`relative rounded-2xl border border-stone-200 p-2 `}
        >
            <FiBell />
            {notificationCount > 0 && (
                <span className="absolute -right-1 -top-1 flex size-4.5 items-center 
                justify-center rounded-full bg-red-500 text-[11px] font-bold 
                leading-none text-white border-white border-[2px]">
                    {notificationCount}
                </span>
            )}
        </button>

    )
}

export default Notifications
