import React from 'react'
import { FiEye } from 'react-icons/fi';
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    Legend,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const data = [
    { name: 'Jan', users: 4000 },
    { name: 'Feb', users: 3000 },
    { name: 'Mar', users: 2000 },
    { name: 'Apr', users: 2780 },
    { name: 'May', users: 1890 },
    { name: 'Jun', users: 2390 },
];

function RadarCharts() {
    return (
        <div className='col-span-4 overflow-hidden rounded border border-stone-300'>
            <div className='p-4'>
                <h3 className="flex items-center gap-1.5 font-medium"><FiEye />Usage</h3>
            </div>

            <ResponsiveContainer width="100%" height={250}>
                <RadarChart
                    data={data}
                    margin={{ top: 20, right: 40, bottom: 20, left: 40 }}
                >
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis />
                    <Radar name="Users" dataKey="users" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    <Tooltip />
                    <Legend />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    )
}

export default RadarCharts