import { useEffect, useMemo, useState } from 'react'
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
import { fetchIncidents } from '../../api'

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function getLastSixMonths() {
    const now = new Date()
    return Array.from({ length: 6 }, (_, index) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1)
        return MONTH_NAMES[d.getMonth()]
    })
}

function ActivityGraph({ token, incidents: propIncidents }) {
    const [localIncidents, setLocalIncidents] = useState([])
    const [loading, setLoading] = useState(Boolean(token && !propIncidents))
    const [error, setError] = useState('')
    const incidents = propIncidents ?? localIncidents

    useEffect(() => {
        if (propIncidents) {
            return
        }

        if (!token) return
        let active = true
        fetchIncidents(token)
            .then((data) => {
                if (!active) return
                setLocalIncidents(Array.isArray(data) ? data : [])
            })
            .catch((err) => {
                if (!active) return
                setError(err?.message || 'Unable to load activity data.')
                setLocalIncidents([])
            })
            .finally(() => { if (active) setLoading(false) })

        return () => { active = false }
    }, [token, propIncidents])

    const chartData = useMemo(() => {
        const labels = getLastSixMonths()
        const data = labels.map((name) => ({ name, reports: 0, verified: 0 }))

        incidents.forEach((incident) => {
            const raw = incident.date || incident.createdAt || incident.created_at || incident.reportedAt || incident.reported_at || incident.submittedAt || incident.submitted_at || incident.incident_date || incident.occurredAt || incident.occurred_at || incident.timestamp || incident.time_reported || incident.timeReported || null
            const d = raw ? new Date(raw) : null
            if (!d || Number.isNaN(d.getTime())) return
            const label = MONTH_NAMES[d.getMonth()]
            const idx = labels.indexOf(label)
            if (idx === -1) return
            const status = String(incident.status || '').toLowerCase()
            const isVerified = ['verified', 'confirmed', 'resolved', 'closed'].some((term) => status.includes(term))
            data[idx].reports += 1
            if (isVerified) data[idx].verified += 1
        })

        return data
    }, [incidents])

    return (
        <div className='col-span-12 overflow-hidden rounded border border-stone-300 xl:col-span-8'>
            <div className='p-4'>
                <h3 className="flex items-center gap-1.5 font-medium"><FiVideo /> Report Activity</h3>
            </div>

            {error ? (
                <div className='px-4 text-sm text-red-700'>{error}</div>
            ) : null}

            {loading ? (
                <div className='px-4 text-sm text-stone-500'>Loading activity data…</div>
            ) : null}

            <div className='h-[250px]'>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
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
