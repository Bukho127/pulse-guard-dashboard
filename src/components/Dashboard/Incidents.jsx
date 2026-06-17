import { useState, useEffect } from 'react'
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
} from 'react-icons/fi'
import { fetchIncidents } from "../../api"; 
import { useAuth } from "../../context/AuthContext";

const statusIcons = {
  pending: FiAlertTriangle,
  acknowledged: FiClock,
  resolved: FiCheckCircle,
}

const statusLabels = {
  pending: 'Open',
  acknowledged: 'In Progress',
  resolved: 'Resolved',
}

function Incidents({ token: propToken }) {
  const { token: authToken } = useAuth() // Get token from your auth context
  const token = propToken || authToken
  const [incidents, setIncidents] = useState([])
  const [pagination, setPagination] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const limit = 10 // Items per page

  useEffect(() => {
    const loadIncidents = async () => {
      if (!token) {
        setError('Authentication token missing')
        return
      }

      setLoading(true)
      setError(null)

      try {
        const result = await fetchIncidents(token, currentPage, limit)
        setIncidents(result.incidents)
        setPagination(result.pagination)
      } catch (err) {
        console.error('Failed to load incidents:', err)
        setError(err.message || 'Failed to load incidents')
      } finally {
        setLoading(false)
      }
    }

    loadIncidents()
  }, [currentPage, token, limit])

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className='px-4'>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h2 className='text-lg font-semibold text-stone-950'>Confirmed Incidents</h2>
          <p className='text-sm text-stone-500'>Operational incidents currently tracked by the response team.</p>
        </div>
        <button className='rounded bg-[#57B74A] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600'>
          New Incident
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className='mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700'>
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className='flex items-center justify-center py-12'>
          <p className='text-stone-500'>Loading incidents...</p>
        </div>
      )}

      {/* Incidents Grid */}
      {!loading && incidents.length > 0 && (
        <>
          <div className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3'>
            {incidents.map((incident) => {
              const StatusIcon = statusIcons[incident.status] || FiAlertTriangle
              const displayStatus = statusLabels[incident.status] || incident.status

              return (
                <article 
                  key={incident.incident_id} 
                  className='rounded border border-stone-300 p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer'
                >
                  <div className='mb-4 flex items-start justify-between gap-3'>
                    <div>
                      <p className='text-sm font-semibold text-[#57B74A]'>
                        #{incident.incident_id}
                      </p>
                      <h3 className='mt-1 font-medium text-stone-950'>
                        {incident.address || 'Location unavailable'}
                      </h3>
                    </div>
                    <StatusIcon className='shrink-0 text-stone-500' />
                  </div>

                  <div className='space-y-2 text-sm'>
                    <div className='flex justify-between gap-3'>
                      <span className='text-stone-500'>Status</span>
                      <span className='font-medium text-stone-950'>{displayStatus}</span>
                    </div>
                    <div className='flex justify-between gap-3'>
                      <span className='text-stone-500'>Reported</span>
                      <span className='font-medium text-stone-950'>
                        {formatDate(incident.created_at)}
                      </span>
                    </div>
                    {incident.User && (
                      <div className='flex justify-between gap-3'>
                        <span className='text-stone-500'>Reporter</span>
                        <span className='font-medium text-stone-950 truncate'>
                          {incident.User.full_name}
                        </span>
                      </div>
                    )}
                  </div>
                </article>
              )
            })}
          </div>

          {/* Pagination Controls */}
          {pagination && pagination.pages > 1 && (
            <div className='mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <div className='text-sm text-stone-500'>
                Page {pagination.page} of {pagination.pages} ({pagination.total} total incidents)
              </div>
              <div className='flex gap-2'>
                this is pagination
                <button
                  type='button'
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={!pagination.hasPrev || loading}
                  aria-label='Previous incidents page'
                  className='inline-flex min-h-10 items-center gap-2 rounded border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-950 transition-colors hover:border-green-600 hover:text-green-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-stone-300 disabled:hover:text-stone-950'
                >
                  <FiChevronLeft className='shrink-0' />
                  Previous
                </button>
                <button
                  type='button'
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={!pagination.hasNext || loading}
                  aria-label='Next incidents page'
                  className='inline-flex min-h-10 items-center gap-2 rounded border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-950 transition-colors hover:border-green-600 hover:text-green-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-stone-300 disabled:hover:text-stone-950'
                >
                  Next
                  <FiChevronRight />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && incidents.length === 0 && !error && (
        <div className='py-12 text-center'>
          <p className='text-stone-500'>No incidents found</p>
        </div>
      )}
    </div>
  )
}

export default Incidents
