import { FiAlertTriangle, FiCheckCircle, FiClock } from 'react-icons/fi'
import { incidents } from './incidentData'

const statusIcons = {
  Open: FiAlertTriangle,
  'In Progress': FiClock,
  Resolved: FiCheckCircle,
}

function Incidents() {
  return (
    <div className='px-4'>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h2 className='text-lg font-semibold text-stone-950'>Confirmed Incidents</h2>
          <p className='text-sm text-stone-500'>Operational incidents currently tracked by the response team.</p>
        </div>
        <button className='rounded bg-[#57B74A] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600'>
          New Incident
        </button>
      </div>

      <div className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3'>
        {incidents.map((incident) => {
          const StatusIcon = statusIcons[incident.status]

          return (
            <article key={incident.id} className='rounded border border-stone-300 p-4 shadow-sm'>
              <div className='mb-4 flex items-start justify-between gap-3'>
                <div>
                  <p className='text-sm font-semibold text-[#57B74A]'>{incident.id}</p>
                  <h3 className='mt-1 font-medium text-stone-950'>{incident.location}</h3>
                </div>
                <StatusIcon className='shrink-0 text-stone-500' />
              </div>

              <div className='space-y-2 text-sm'>
                <div className='flex justify-between gap-3'>
                  <span className='text-stone-500'>Status</span>
                  <span className='font-medium text-stone-950'>{incident.status}</span>
                </div>
                <div className='flex justify-between gap-3'>
                  <span className='text-stone-500'>Priority</span>
                  <span className='font-medium text-stone-950'>{incident.priority}</span>
                </div>
                <div className='flex justify-between gap-3'>
                  <span className='text-stone-500'>Reported</span>
                  <span className='font-medium text-stone-950'>{incident.date}</span>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

export default Incidents
