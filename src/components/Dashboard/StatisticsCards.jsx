import { useEffect, useState } from 'react'
import { FiTrendingDown, FiTrendingUp } from 'react-icons/fi';
import { fetchAllIncidents } from '../../api'

function StatisticsCards({ token, incidents: propIncidents }) {
    const [localIncidents, setLocalIncidents] = useState([])
    const incidents = propIncidents ?? localIncidents

    useEffect(() => {
        if (propIncidents) return
        if (!token) return

        let active = true
        fetchAllIncidents(token)
            .then((data) => {
                if (!active) return
                setLocalIncidents(Array.isArray(data) ? data : [])
            })
            .catch(() => {
                if (!active) return
                setLocalIncidents([])
            })

        return () => { active = false }
    }, [token, propIncidents])

    const total = incidents.length
    const verified = incidents.filter((inc) => {
        const status = String(inc.status || '').toLowerCase()
        return ['verified', 'confirmed', 'resolved', 'closed', 'acknowledged'].some((term) => status.includes(term))
    }).length
    const pending = incidents.filter((inc) => {
        const status = String(inc.status || '').toLowerCase()
        return !['verified', 'confirmed', 'resolved', 'closed', 'acknowledged'].some((term) => status.includes(term))
    }).length

    return (
        <>
            <Card
                title="Video Reports"
                value={total.toLocaleString()}
                pillText=""
                trend="up"
                period="Submitted in the last 30 days"
            />
            <Card
                title="Verified Incidents"
                value={verified.toLocaleString()}
                pillText=""
                trend="up"
                period="Confirmed by review team"
            />
            <Card
                title="Pending Review"
                value={pending.toLocaleString()}
                pillText=""
                trend="down"
                period="Awaiting evidence assessment"
            />
        </>
    )
}
const Card = ({ title, value, pillText, trend, period }) => {
    return <div className="col-span-12 rounded border border-stone-300 p-4 shadow md:col-span-4">
        <div className="flex mb-8 items-start justify-between">
            <div>
                <h3 className="text-stone-500 mb-2 text-sm">{title}</h3>
                <p className="text-3xl font-semibold">{value}</p>
            </div>
              <span className={`flex items-center gap-1 rounded px-2 py-1 text-sm font-medium ${trend === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {trend === 'up' ? <FiTrendingUp /> : <FiTrendingDown />}
                {pillText}
              </span>
        </div>
        <p className="text-xs text-stone-500">{period}</p>
    </div>

}

export default StatisticsCards;
