import { NavLink } from 'react-router-dom'
import {
  FiActivity,
  FiAlertTriangle,
  FiBarChart2,
  FiCalendar,
  FiCheckCircle,
  FiMap,
} from 'react-icons/fi'

const RouteButton = ({ icon: Icon, selected, title }) => (
  <div
    className={`flex items-center gap-2 rounded px-2 py-1.5 text-sm transition-[box-shadow, _background-color,_color] ${
      selected
        ? 'bg-white text-stone-950 shadow '
        : 'hover:bg-stone-200 bg-transparent text-stone-500 shadow-none'
    }`}
  >
    <Icon className='shrink-0 text-base' />
    <span className='truncate'>{title}</span>
  </div>
)

const RouteSelect = () => {
  const routes = [
    { title: 'Dashboard', path: '/dashboard', icon: FiActivity, end: true },
    { title: 'Confirmed incidents', path: '/dashboard/incidents', icon: FiCheckCircle },
    { title: 'Pending Reports', path: '/dashboard/reports', icon: FiAlertTriangle },
    { title: 'Analysis', path: '/dashboard/analysis', icon: FiBarChart2 },
    { title: 'Heatmap', path: '/dashboard/heatmap', icon: FiMap },
    { title: 'Schedule', path: '/dashboard/schedule', icon: FiCalendar },
  ]

  return (
    <nav className='space-y-1.5'>
      {routes.map((route) => (
        <NavLink
          key={route.path}
          to={route.path}
          end={route.end}
          className='block'
        >
          {({ isActive }) => (
            <RouteButton
              icon={route.icon}
              selected={isActive}
              title={route.title}
            />
          )}
        </NavLink>
      ))}
    </nav>
  )
}

export default RouteSelect;
