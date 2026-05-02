import { FiSettings } from 'react-icons/fi'

const Settings = () => {
    return (
        <div
            className='flex sticky top-[calc(100vh_-_48px_-16px)] flex-col h-12 border-t px-2 border-stone-300 justify-end text-sm font-semibold'
        >
            <div className='flex items-center gap-2'>
                <FiSettings />
                Settings

            </div>


        </div>
    )
}

export default Settings
