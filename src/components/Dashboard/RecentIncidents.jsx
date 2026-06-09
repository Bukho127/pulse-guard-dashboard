import { FiAlertTriangle, FiArrowUpRight, FiEdit } from 'react-icons/fi';
import { incidents } from './incidentData';

function RecentIncidents() {
    return (
        <div className='col-span-12 overflow-hidden rounded border border-stone-300 p-4'>
            <div className='mb-4 flex items-center justify-between'>
                <h3 className="font-medium items-center gap-2 flex"><FiAlertTriangle /> Recent Incidents</h3>
                <button className='text-sm text-stone-500 hover:text-green-600 transition-colors duration-200 flex items-center gap-1'>
                    View All

                </button>

            </div>
            <div className='overflow-x-auto'>
                <table className='w-full min-w-[680px] table-auto'>
                    <TableHeader />
                    <tbody>
                        {incidents.map((incident, index) => (
                            <TableRow key={incident.id} {...incident} order={index + 1} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )

}

const TableHeader = () => {
    return (
        <thead>
            <tr className=' text-sm font-normal text-stone-500'>
                <th className='text-start p-2'>Incident ID</th>
                <th className='text-left p-2'>Location</th>
                <th className='text-left p-2'>Status</th>
                <th className='text-left p-2'>Priority</th>
                <th className='text-left p-2'>Date</th>
                <th className='w-8 p-2'></th>
            </tr>
        </thead>
    )

}

const statusStyles = {
    Open: 'text-red-700',
    'In Progress': 'text-amber-700',
    Resolved: 'text-green-700',
}

const priorityStyles = {
    High: 'text-red-600',
    Medium: 'text-amber-600',
    Low: 'text-green-600',
}

const TableRow = ({ id, location, status, priority, date, order }) => {
    return (
        <tr className={`text-sm ${order % 2 === 0 ? 'bg-stone-100' : 'bg-white'}`}>
            <td className='flex cursor-pointer items-center gap-2 p-2 text-[#57B74A] underline underline-offset-2 transition-colors duration-200 hover:text-green-600'>
                 {id}
                <FiArrowUpRight />
            </td>
            <td className='p-2'>{location}</td>
            <td className='p-2'>
                <span className={`rounded px-2 py-1 text-xs font-medium ${statusStyles[status]}`}>
                    {status}
                </span>
            </td>
            <td className={`p-2 font-medium ${priorityStyles[priority]}`}>{priority}</td>
            <td className='p-2'>{date}</td>
            <td className='p-2 text-right'>
                <button className='text-sm text-stone-500 hover:text-green-600 transition-colors duration-200 flex items-center gap-1'>
                    <FiEdit />
                </button>
            </td>
        </tr>
    )
}

export default RecentIncidents
