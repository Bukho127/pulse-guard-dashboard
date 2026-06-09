import { FiTrendingDown, FiTrendingUp } from 'react-icons/fi';

function StatisticsCards() {
    return (
        <>
            <Card
                title="Video Reports"
                value="1,234"
                pillText="12.5%"
                trend="up"
                period="Submitted in the last 30 days"
            />
            <Card
                title="Verified Incidents"
                value="326"
                pillText="8.2%"
                trend="up"
                period="Confirmed by review team"
            />
            <Card
                title="Pending Review"
                value="47"
                pillText="6.1%"
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
