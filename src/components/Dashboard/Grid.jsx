import StatisticsCards from './StatisticsCards'
import ActivityGraph from './ActivityGraph'
import RadarCharts from './RadarChart'
import RecentIncidents from './RecentIncidents'

function Grid() {
    return (
        <div className='grid grid-cols-12 gap-3 px-4'>
            <StatisticsCards />
            <ActivityGraph />
            <RadarCharts />
            <RecentIncidents />
        </div>
    )
}

export default Grid
