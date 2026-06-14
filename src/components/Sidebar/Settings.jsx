import { useState } from 'react'
import { FiLogOut, FiSettings } from 'react-icons/fi'

const Settings = ({ onSignOut }) => {
    const [isOpen, setIsOpen] = useState(false)

    const handleSignOut = () => {
        setIsOpen(false)
        onSignOut()
    }

    return (
        <div
            className='sticky top-[calc(100vh_-_48px_-16px)] border-t border-stone-300 px-2 pt-2 text-sm '
        >
            {isOpen && (
                <div className='absolute bottom-14 left-2 right-2 rounded border border-stone-300 bg-white p-1 shadow-lg'>
                    <button
                        type='button'
                        onClick={handleSignOut}
                        className='flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-stone-600 transition-colors hover:bg-stone-100 hover:text-gray-700'
                    >
                        <FiLogOut className='shrink-0 text-base' />
                        <span className='truncate'>Sign out</span>
                    </button>
                </div>
            )}
            <button
                type='button'
                onClick={() => setIsOpen((current) => !current)}
                aria-expanded={isOpen}
                className='flex w-full items-center gap-2 rounded border border-stone-300 bg-white px-2 py-1.5 text-left text-stone-600 transition-colors hover:bg-stone-100 hover:text-gray-700'
            >
                <FiSettings className='shrink-0 text-base' />
                <span className='truncate'>Settings</span>
            </button>
        </div>
    )
}

export default Settings
