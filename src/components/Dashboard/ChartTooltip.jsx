const ChartTooltip = ({ active, label, payload }) => {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className='min-w-40 rounded border border-stone-300 bg-white p-3 text-sm shadow-lg'>
      <p className='mb-2 font-medium text-stone-950'>{label}</p>
      <div className='space-y-1.5'>
        {payload.map((item) => (
          <div key={item.dataKey} className='flex items-center justify-between gap-4'>
            <span className='flex min-w-0 items-center gap-2 text-stone-500'>
              <span
                className='size-2 shrink-0 rounded-full'
                style={{ backgroundColor: item.color }}
              />
              <span className='truncate'>{item.name}</span>
            </span>
            <span className='font-semibold text-stone-950'>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ChartTooltip
