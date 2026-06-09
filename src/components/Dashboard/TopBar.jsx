import Notifications from "./Notifications"

const formattedDate = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
}).format(new Date())

const TopBar = () => {
  return (
    <div className='mb-3 mt-2 border-b border-stone-200 px-4 pb-3.5'>
      <div className='flex items-center justify-between '>
        <div>
          <span className='block text-sm font-bold'>
            Welcome Back, Bukho!
          </span>
          <span className='block text-xs text-stone-500'>
            {formattedDate}
          </span>
        </div>
        <Notifications/>
      </div>
    
        
     
    </div>
  )
}

export default TopBar
