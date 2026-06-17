import { useEffect, useMemo, useState } from 'react'
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
import { fetchAllIncidents } from '../../api'

const DEFAULT_COLORS = ['#57B74A', '#2563eb', '#d97706', '#7c3aed', '#ec4899', '#14b8a6']
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function getLastSixMonths() {
    const now = new Date()
    return Array.from({ length: 6 }, (_, index) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1)
        return MONTH_NAMES[d.getMonth()]
    })
}

function buildLocationKey(location) {
    return String(location || 'Unknown').trim().toLowerCase().replace(/\s+/g, '_')
}

function RadarCharts({ token, incidents: propIncidents }) {
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
        fetchAllIncidents(token)
            .then((data) => {
                if (!active) return
                setLocalIncidents(Array.isArray(data) ? data : [])
            })
            .catch((err) => {
                if (!active) return
                setError(err?.message || 'Unable to load location data.')
                setLocalIncidents([])
            })
            .finally(() => { if (active) setLoading(false) })

        return () => { active = false }
    }, [token, propIncidents])

    const { chartData, locations } = useMemo(() => {
        const labels = getLastSixMonths()
        const monthData = labels.map((period) => ({ period }))
        const locationTotals = {}

        incidents.forEach((incident) => {
            const raw = incident.date || incident.createdAt || incident.created_at || incident.reportedAt || incident.reported_at || incident.submittedAt || incident.submitted_at || incident.incident_date || incident.occurredAt || incident.occurred_at || incident.timestamp || incident.time_reported || incident.timeReported || null
            const d = raw ? new Date(raw) : null
            if (!d || Number.isNaN(d.getTime())) return
            const label = MONTH_NAMES[d.getMonth()]
            const index = labels.indexOf(label)
            if (index === -1) return

            const location = incident.location || incident.address || 'Unknown'
            const key = buildLocationKey(location)
            const entry = monthData[index]
            entry[key] = (entry[key] || 0) + 1
            locationTotals[key] = (locationTotals[key] || 0) + 1
        })

        const sortedLocations = Object.entries(locationTotals)
            .sort(([, aCount], [, bCount]) => bCount - aCount)
            .slice(0, 4)
            .map(([key]) => key)

        const finalLocations = sortedLocations.map((key, index) => ({
            name: incidents.find((incident) => buildLocationKey(incident.location || incident.address || 'Unknown') === key)?.location || key,
            key,
            color: DEFAULT_COLORS[index] || '#475569',
        }))

        const chartData = monthData.map((entry) =>
            finalLocations.reduce(
                (acc, location) => ({
                    ...acc,
                    [location.key]: entry[location.key] || 0,
                }),
                { period: entry.period }
            )
        )

        return { chartData, locations: finalLocations }
    }, [incidents])

    return (
        <div className='col-span-12 overflow-hidden rounded border border-stone-300 xl:col-span-4'>
            <div className='p-4'>
                <h3 className="flex items-center gap-1.5 font-medium"><FiMapPin /> Report Locations</h3>
            </div>

            {error ? (
                <div className='p-4 text-sm text-red-700'>{error}</div>
            ) : null}

            {loading ? (
                <div className='p-4 text-sm text-stone-500'>Loading location data…</div>
            ) : null}

            <ResponsiveContainer width="100%" height={250}>
                <RadarChart
                    data={chartData}
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
