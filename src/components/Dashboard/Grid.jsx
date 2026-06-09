import React from 'react'
import StatisticsCards from './StatisticsCards'
import ActivityGraph from './ActivityGraph'
import RadarChart from './RadarChart'
import RadarCharts from './RadarChart'

function Grid() {
    return (
        <div className='px-4 grid gap-3 grid-cols-12'>
            <StatisticsCards />
            <ActivityGraph />
            <RadarCharts/>

        </div>
    )
}

export default Grid