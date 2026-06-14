import { useEffect, useState } from 'react'
import StatisticsCards from './StatisticsCards'
import ActivityGraph from './ActivityGraph'
import RadarCharts from './RadarChart'
import RecentIncidents from './RecentIncidents'
import { fetchIncidents } from '../../api'

const normalizeIncident = (incident, index) => {
    const id = incident.id || incident._id || incident.incident_id || `UNKNOWN-${index + 1}`
    const location = incident.location || incident.address || incident.city || 'Unknown location'
    const status = incident.status || incident.state || 'Open'
    const priority = incident.priority || incident.severity || 'Medium'
    const date =
        incident.date ||
        incident.createdAt ||
        incident.created_at ||
        incident.reportedAt ||
        incident.reported_at ||
        incident.submittedAt ||
        incident.submitted_at ||
        incident.incident_date ||
        incident.occurredAt ||
        incident.occurred_at ||
        incident.timestamp ||
        incident.time_reported ||
        incident.timeReported ||
        'Unknown'

    return {
        ...incident,
        id,
        location,
        status,
        priority,
        date,
    }
}

function Grid({ token }) {
    const [incidents, setIncidents] = useState([])
    const [loading, setLoading] = useState(Boolean(token))
    const [error, setError] = useState('')

    useEffect(() => {
        if (!token) return

        let active = true

        fetchIncidents(token)
            .then((data) => {
                if (!active) return

                const normalized = Array.isArray(data)
                    ? data.map((incident, index) => normalizeIncident(incident, index))
                    : []
                setIncidents(normalized)
            })
            .catch((err) => {
                if (!active) return
                setError(err?.message || 'Unable to load incidents.')
                setIncidents([])
            })
            .finally(() => {
                if (active) {
                    setLoading(false)
                }
            })

        return () => {
            active = false
        }
    }, [token])

    const handleIncidentStatusChange = (id, nextStatus) => {
        setIncidents((current) =>
            current.map((incident) =>
                incident.id === id ? { ...incident, status: nextStatus } : incident
            )
        )
    }

    return (
        <div className='grid grid-cols-12 gap-3 px-4'>
            <StatisticsCards incidents={incidents} />
            <ActivityGraph incidents={incidents} />
            <RadarCharts incidents={incidents} />
            <RecentIncidents
                incidents={incidents}
                loading={loading}
                error={error}
                onIncidentStatusChange={handleIncidentStatusChange}
                token={token}
            />
        </div>
    )
}

export default Grid
