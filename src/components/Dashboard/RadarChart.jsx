import { FiMapPin } from 'react-icons/fi'
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
import ChartTooltip from './ChartTooltip';

const data = [
    { period: 'Jan', khayelitsha: 64, philippi: 42, nyanga: 55, langa: 31 },
    { period: 'Feb', khayelitsha: 71, philippi: 47, nyanga: 62, langa: 35 },
    { period: 'Mar', khayelitsha: 68, philippi: 51, nyanga: 58, langa: 39 },
    { period: 'Apr', khayelitsha: 79, philippi: 56, nyanga: 66, langa: 44 },
    { period: 'May', khayelitsha: 84, philippi: 62, nyanga: 71, langa: 48 },
    { period: 'Jun', khayelitsha: 76, philippi: 58, nyanga: 69, langa: 41 },
];

const locations = [
    { name: 'Khayelitsha', key: 'khayelitsha', color: '#57B74A' },
    { name: 'Philippi', key: 'philippi', color: '#2563eb' },
    { name: 'Nyanga', key: 'nyanga', color: '#d97706' },
    { name: 'Langa', key: 'langa', color: '#7c3aed' },
]

function RadarCharts() {
    return (
        <div className='col-span-12 overflow-hidden rounded border border-stone-300 xl:col-span-4'>
            <div className='p-4'>
                <h3 className="flex items-center gap-1.5 font-medium"><FiMapPin /> Report Locations</h3>
            </div>

            <ResponsiveContainer width="100%" height={250}>
                <RadarChart
                    data={data}
                    margin={{ top: 18, right: 34, bottom: 34, left: 34 }}
                >
                    <PolarGrid stroke="#e7e5e4" />
                    <PolarAngleAxis dataKey="period" tick={{ fontSize: 9, fill: '#57534e' }} />
                    <PolarRadiusAxis tick={{ fontSize: 9, fill: '#78716c' }} axisLine={false} />
                    {locations.map((location) => (
                        <Radar
                            key={location.key}
                            name={location.name}
                            dataKey={location.key}
                            stroke={location.color}
                            fill={location.color}
                            fillOpacity={0.14}
                            strokeWidth={2}
                        />
                    ))}
                    <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#a8a29e' }} />
                    <Legend
                        verticalAlign="bottom"
                        align="center"
                        iconSize={6}
                        wrapperStyle={{
                            bottom: 2,
                            fontSize: 9,
                            lineHeight: '12px',
                        }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    )
}

export default RadarCharts
