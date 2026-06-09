import React from 'react'
import { FiAlertTriangle, FiEdit } from 'react-icons/fi';

function RecentIncidents() {
    return (
        <div className='col-span-12 overflow-hidden rounded border border-stone-300 p-4'>
            <div className='mb-4 flex items-center justify-between'>
                <h3 className="font-medium items-center gap-2 flex"><FiAlertTriangle /> Recent Incidents</h3>
                <button className='text-sm text-stone-500 hover:text-green-600 transition-colors duration-200 flex items-center gap-1'>
                    View All

                </button>

            </div>
            <table className='w-full table-auto'>
                <TableHeader />
                <tbody>
                    <TableRow id="INC12345" location="New York" status="Open" date="2024-06-01" order={1} />
                    <TableRow id="INC12346" location="Los Angeles" status="In Progress" date="2024-06-02" order={2} />
                    <TableRow id="INC12347" location="Chicago" status="Resolved" date="2024-06-03" order={3} />
                    <TableRow id="INC12348" location="Houston" status="Open" date="2024-06-04" order={4} />
                    <TableRow id="INC12349" location="Phoenix" status="In Progress" date="2024-06-05" order={5} />
                </tbody>

            </table>
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
                <th className='text-left p-2'>Date</th>
                <th className='w-8 p-2'></th>
            </tr>
        </thead>
    )

}

const TableRow = ({ id, location, status, date, order }) => {
    return (
        <tr className={`text-sm ${order % 2 === 0 ? 'bg-stone-100' : 'bg-white'}`}>
            <td className='p-2'>{id}</td>
            <td className='p-2'>{location}</td>
            <td className='p-2'>{status}</td>
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