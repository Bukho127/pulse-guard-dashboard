import Notifications from "./Notifications"

const formattedDate = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
}).format(new Date())

const TopBar = ({ officer, token }) => {
  return (
    <div className='mb-3 mt-2 border-b border-stone-200 px-4 pb-3.5'>
      <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
        <div>
          <span className='block text-sm font-bold'>
            Welcome Back, {officer?.name || 'Officer'}!
          </span>
          <span className='block text-xs text-stone-500'>
            {formattedDate}
          </span>
        </div>
        <div className='flex items-center gap-3'>
          <Notifications token={token} />
        </div>
      </div>
    </div>
  )
}

export default TopBar
