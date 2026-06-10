import { FiVideo } from 'react-icons/fi';
import {
    LineChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    Line,
    ResponsiveContainer,
} from "recharts";
import ChartTooltip from './ChartTooltip';

const data = [
    { name: 'Jan', reports: 138, verified: 42 },
    { name: 'Feb', reports: 164, verified: 51 },
    { name: 'Mar', reports: 149, verified: 46 },
    { name: 'Apr', reports: 188, verified: 63 },
    { name: 'May', reports: 212, verified: 72 },
    { name: 'Jun', reports: 197, verified: 68 },
];

function ActivityGraph() {
    return (
        <div className='col-span-12 overflow-hidden rounded border border-stone-300 xl:col-span-8'>
            <div className='p-4'>
                <h3 className="flex items-center gap-1.5 font-medium"><FiVideo /> Report Activity</h3>
            </div>

            <div className='h-[250px]'>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{ top: 5, right: 24, left: 0, bottom: 5 }}
                    >
                        <CartesianGrid stroke="#e7e5e4" strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#78716c' }} axisLine={{ stroke: '#d6d3d1' }} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: '#78716c' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#a8a29e', strokeDasharray: '3 3' }} />
                        <Legend wrapperStyle={{ color: '#57534e', fontSize: 12 }} />
                        <Line type="monotone" name="Video reports" dataKey="reports" stroke="#57B74A" strokeWidth={2} />
                        <Line type="monotone" name="Verified incidents" dataKey="verified" stroke="#2563eb" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

export default ActivityGraph
