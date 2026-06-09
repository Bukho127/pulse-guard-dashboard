import React from 'react'
import { FiTrendingUp } from 'react-icons/fi';
import { FiTrendingDown } from 'react-icons/fi';

function StatisticsCards() {
    return (
        <>
            <Card
                title="Total Users"
                value="1,234"
                description="Increase by 12.5% from last month"
                pillText="3.456%"
                trend="up"
                period="From 1st Jan to 31st Jan"
            />
            <Card
                title="Total Revenue"
                value="5,678"
                description="Increase by 8.2% from last month"
                pillText="2.889%"
                trend="up"
                period="From 1st Jan to 31st Jan"
            />
            <Card
                title="Conversion Rate"
                value="4.5%"
                description="Decrease by 1.2% from last month"
                pillText="2.7%"
                trend="down"
                period="From 1st Jan to 31st Jan"
            />
        </>
    )
}
const Card = ({ title, value, description, pillText, trend, period }) => {
    return <div className="col-span-4 p-4 rounded border border-stone-300 shadow">
        <div className="flex mb-8 items-start justify-between">
            <div>
                <h3 className="text-stone-500 mb-2 text-sm">{title}</h3>
                <p className="text-3xl font-semibold">${value}</p>
            </div>
              <span className={`text-sm font-medium flex items-center gap-1 font-medium px-2 py-1 rounded ${trend === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {trend === 'up' ? <FiTrendingUp /> : <FiTrendingDown />}
                {pillText}
              </span>
        </div>
        <p className="text-xs text-stone-500">{period}</p>
    </div>

}

export default StatisticsCards;