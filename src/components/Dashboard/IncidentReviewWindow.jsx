import { FiX, FiPlayCircle, FiMapPin, FiCheckCircle, FiSlash } from 'react-icons/fi';

const DetailRow = ({ label, value }) => {
    return (
        <div className='flex items-center justify-between gap-3 border-b border-stone-100 pb-2 last:border-b-0 last:pb-0'>
            <span className='text-stone-500'>{label}</span>
            <span className='font-medium text-stone-950'>{value}</span>
        </div>
    )
}

const IncidentReviewModal = ({ incident, onAcknowledge, onClose, onIgnore }) => {
     console.log('video_url:', incident?.video_url)
     console.log('full incident:', incident)
    return (
        <div
            className='fixed inset-0 z-50 flex items-center justify-center bg-stone-950/50 px-4 py-6'
            role='dialog'
            aria-modal='true'
            aria-labelledby='incident-review-title'
            onClick={onClose}
        >
            <div
                className='w-full max-w-4xl overflow-hidden rounded-lg border border-stone-300 bg-white shadow-xl'
                onClick={(event) => event.stopPropagation()}
            >
                <div className='flex items-start justify-between gap-4 border-b border-stone-200 p-4'>
                    <div>
                        <p className='text-sm font-semibold text-[#57B74A]'>{incident.id}</p>
                        <h2 id='incident-review-title' className='mt-1 text-lg font-semibold text-stone-950'>
                            Incident review
                        </h2>
                    </div>
                    <button
                        type='button'
                        onClick={onClose}
                        aria-label='Close incident review'
                        className='rounded border border-stone-300 p-2 text-stone-500 transition-colors duration-200 hover:text-gray-900 hover:bg-gray-200'
                    >
                        <FiX />
                    </button>
                </div>

                <div className='grid gap-4 p-4 lg:grid-cols-[1fr_260px]'>
                    <div className='overflow-hidden rounded border border-stone-300 bg-stone-950'>
                        {incident.videoUrl || incident.video_url ? (
                            <video
                                className='aspect-video w-full bg-stone-950'
                                controls
                                src={incident.videoUrl || incident.video_url}
                            />
                        ) : (
                            <div className='flex aspect-video min-h-64 flex-col justify-between bg-stone-950 p-4 text-white'>
                                <div className='flex items-center justify-between text-xs text-stone-300'>
                                    <span className='rounded bg-white/10 px-2 py-1'>{incident.date}</span>
                                    <span className='rounded bg-red-500 px-2 py-1 font-semibold'>REC</span>
                                </div>
                                <div className='flex flex-1 items-center justify-center'>
                                    <FiPlayCircle className='text-6xl text-white/80' />
                                </div>
                                <div className='flex items-center gap-2 text-sm text-stone-200'>
                                    <FiMapPin />
                                    <span>{incident.location}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <aside className='rounded border border-stone-300 p-4'>
                        <h3 className='font-medium text-stone-950'>Incident details</h3>
                        <div className='mt-4 space-y-3 text-sm'>
                            <DetailRow label='Location' value={incident.location} />
                            <DetailRow label='Status' value={incident.status} />
                            <DetailRow label='Priority' value={incident.priority} />
                            <DetailRow label='Reported' value={incident.date} />
                        </div>

                        <div className='mt-6 flex flex-col gap-2'>
                            <button
                                type='button'
                                onClick={onAcknowledge}
                                className='flex items-center justify-center gap-2 rounded bg-[#57B74A] px-3 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-green-600'
                            >
                                <FiCheckCircle />
                                Acknowledge
                            </button>
                            <button
                                type='button'
                                onClick={onIgnore}
                                className='flex items-center justify-center gap-2 rounded border border-stone-300 px-3 py-2 text-sm font-medium text-stone-600 transition-colors duration-200 hover:border-red-500 hover:text-red-600'
                            >
                                <FiSlash />
                                Ignore
                            </button>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    )
}

export default IncidentReviewModal