import React from 'react'
import { FiUser } from 'react-icons/fi';
import {
    LineChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    Line,
} from "recharts";

const data = [
    { name: 'Jan', users: 4000, revenue: 2400 },
    { name: 'Feb', users: 3000, revenue: 1398 },
    { name: 'Mar', users: 2000, revenue: 9800 },
    { name: 'Apr', users: 2780, revenue: 3908 },
    { name: 'May', users: 1890, revenue: 4800 },
    { name: 'Jun', users: 2390, revenue: 3800 },
];

function ActivityGraph() {
    return (
        <div className='col-span-8 overflow-hidden rounded border border-stone-300'>
            <div className='p-4'>
                <h3 className="flex items-center gap-1.5 font-medium"><FiUser /> Activity</h3>
            </div>

            <LineChart
                width={730}
                height={250}
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#8884d8" />
                <Line type="monotone" dataKey="revenue" stroke="#82ca9d" />
            </LineChart>
        </div>
    )
}

export default ActivityGraph