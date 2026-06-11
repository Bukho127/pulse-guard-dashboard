import AccountToggle from './AccountToggle'
import RouteSelect from './RouteSelect'
import Search from './Search'
import Settings from './Settings'


const Sidebar = ({ onSignOut }) => {
  return (
    <div >
        <div className ='overflow-y-scroll sticky top-4 h-[calc(100vh-32px-48px)]'>
            <AccountToggle/>
            <Search/>
            <RouteSelect/>
        </div>
       <Settings onSignOut={onSignOut} />
    </div>
  )
}

export default Sidebar
