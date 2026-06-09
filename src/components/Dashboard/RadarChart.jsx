import { FiShield } from 'react-icons/fi';
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
    { name: 'Khayelitsha', reports: 84 },
    { name: 'Philippi', reports: 62 },
    { name: 'Nyanga', reports: 71 },
    { name: 'Langa', reports: 48 },
    { name: 'Gugulethu', reports: 56 },
    { name: 'Mitchells Plain', reports: 67 },
];

function RadarCharts() {
    return (
        <div className='col-span-12 overflow-hidden rounded border border-stone-300 xl:col-span-4'>
            <div className='p-4'>
                <h3 className="flex items-center gap-1.5 font-medium"><FiShield /> Report Locations</h3>
            </div>

            <ResponsiveContainer width="100%" height={250}>
                <RadarChart
                    data={data}
                    margin={{ top: 20, right: 40, bottom: 20, left: 40 }}
                >
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis />
                    <Radar name="Video reports" dataKey="reports" stroke="#57B74A" fill="#57B74A" fillOpacity={0.55} />
                    <Tooltip />
                    <Legend />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    )
}

export default RadarCharts
