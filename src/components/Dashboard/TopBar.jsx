import Notifications from "./Notifications"


const TopBar = () => {
  return (
    <div className='mb-3 mt-2 border-b border-stone-200 px-4 pb-3.5'>
      <div className='flex items-center justify-between '>
        <div>
          <span className='block text-sm font-bold'>
            Welcome Back, Bukho!
          </span>
          <span className='block text-xs text-stone-500'>
            Saturday, May 2nd 2026
          </span>
        </div>
        <Notifications/>
      </div>
    
        
     
    </div>
  )
}

export default TopBar
