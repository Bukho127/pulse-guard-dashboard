import {FiChevronDown, FiChevronUp} from 'react-icons/fi'

const AccountToggle = () => {
  return (
    <div 
    className='border-b mb-4 pb-4 border-stone-300'
    >
    <button className='flex p-0.5 hover:bg-stone-200 rounded transition-colors relative gap-2
    w-full items-center' >
        <img src="https://api.dicebear.com/9.x/initials/svg?seed=Bukho&backgroundColor=57B74A&textColor=ffffff
        " alt="avatar" className='size-8 rounded-shrink bg-[#57B74A] shadow'
         />
         <div className='text-start'>
            <span className='text-sm font-bold block'>
                Bukho Mabhula
            </span>
            <span className='text-xs block'>
                Bukho@gmail.com
            </span>
         </div>
            <FiChevronDown className='absolute right-2 top-1/2  -translate-y-[calc(50%-4px)] text-sm' />
            <FiChevronUp className='absolute right-2 top-1/2  -translate-y-[calc(50%+4px)] text-sm' />
    </button>
    </div>
  )
}

export default AccountToggle
