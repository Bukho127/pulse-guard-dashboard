import { useMemo, useState } from 'react';
import {
    FiAlertTriangle,
    FiArrowUpRight,
    FiChevronDown,
    FiEdit,
    FiFilter,
    FiX,
} from 'react-icons/fi';
import { incidents } from './incidentData';

function RecentIncidents() {
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [openFilter, setOpenFilter] = useState(null);

    const locations = useMemo(
        () => [...new Set(incidents.map((incident) => incident.location))].sort(),
        []
    );

    const filteredIncidents = useMemo(() => {
        return incidents.filter((incident) => {
            const matchesDate = selectedDate ? incident.date === selectedDate : true;
            const matchesLocation = selectedLocation ? incident.location === selectedLocation : true;

            return matchesDate && matchesLocation;
        });
    }, [selectedDate, selectedLocation]);

    const hasActiveFilters = Boolean(selectedDate || selectedLocation);

    const clearFilters = () => {
        setSelectedDate('');
        setSelectedLocation('');
        setOpenFilter(null);
    };

    return (
        <div className='col-span-12 overflow-hidden rounded border border-stone-300 p-4'>
            <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                <h3 className="font-medium items-center gap-2 flex"><FiAlertTriangle /> Recent Incidents</h3>
                <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                    <label className='flex items-center gap-2 rounded border border-stone-300 bg-white px-3 py-2 text-sm text-stone-600 transition-colors duration-200 hover:border-green-600 focus-within:border-green-600'>
                        <FiFilter className='shrink-0' />
                        <input
                            type='date'
                            value={selectedDate}
                            onChange={(event) => setSelectedDate(event.target.value)}
                            className='bg-transparent text-sm text-stone-900 outline-none'
                            aria-label='Filter incidents by date'
                        />
                    </label>

                    <LocationDropdown
                        locations={locations}
                        open={openFilter === 'location'}
                        selectedLocation={selectedLocation}
                        setOpen={(open) => setOpenFilter(open ? 'location' : null)}
                        setSelectedLocation={setSelectedLocation}
                    />

                    {hasActiveFilters ? (
                        <button
                            type='button'
                            onClick={clearFilters}
                            className='flex items-center gap-1 rounded border border-stone-300 px-3 py-2 text-sm text-stone-500 transition-colors duration-200 hover:border-green-600 hover:text-green-600'
                        >
                            <FiX />
                            Clear
                        </button>
                    ) : null}
                </div>

            </div>
            <div className='overflow-x-auto'>
                <table className='w-full min-w-[680px] table-auto'>
                    <TableHeader />
                    <tbody>
                        {filteredIncidents.map((incident, index) => (
                            <TableRow key={incident.id} {...incident} order={index + 1} />
                        ))}
                    </tbody>
                </table>
                {filteredIncidents.length === 0 ? (
                    <div className='flex min-h-32 items-center justify-center rounded border border-dashed border-stone-300 text-sm text-stone-500'>
                        No incidents match the selected filters.
                    </div>
                ) : null}
            </div>
        </div>
    )

}

const LocationDropdown = ({ locations, open, selectedLocation, setOpen, setSelectedLocation }) => {
    const chooseLocation = (location) => {
        setSelectedLocation(location);
        setOpen(false);
    };

    return (
        <div className='relative'>
            <button
                type='button'
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                aria-controls='location-filter-options'
                className='flex min-h-10 w-full items-center justify-between gap-3 rounded border border-stone-300 bg-white px-3 py-2 text-left text-sm text-stone-900 outline-none transition-colors duration-200 hover:border-green-600 focus:border-green-600 sm:w-44'
            >
                <span className={selectedLocation ? 'truncate text-stone-950' : 'truncate text-stone-500'}>
                    {selectedLocation || 'All locations'}
                </span>
                <FiChevronDown
                    className={`shrink-0 text-stone-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                />
            </button>

            {open ? (
                <div
                    id='location-filter-options'
                    className='absolute right-0 z-20 mt-2 w-full min-w-44 overflow-hidden rounded border border-stone-300 bg-white p-1 shadow-lg'
                >
                    <FilterOption
                        selected={!selectedLocation}
                        onClick={() => chooseLocation('')}
                    >
                        All locations
                    </FilterOption>
                    {locations.map((location) => (
                        <FilterOption
                            key={location}
                            selected={selectedLocation === location}
                            onClick={() => chooseLocation(location)}
                        >
                            {location}
                        </FilterOption>
                    ))}
                </div>
            ) : null}
        </div>
    )
}

const FilterOption = ({ children, onClick, selected }) => {
    return (
        <button
            type='button'
            onClick={onClick}
            className={`flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm transition-colors duration-200 ${
                selected
                    ? 'bg-green-50 font-medium text-green-700'
                    : 'text-stone-700 hover:bg-stone-100 hover:text-stone-950'
            }`}
        >
            <span>{children}</span>
            {selected ? <FiFilter className='text-[#57B74A]' /> : null}
        </button>
    )
}

const TableHeader = () => {
    return (
        <thead>
            <tr className=' text-sm font-normal text-stone-500'>
                <th className='text-start p-2'>Incident ID</th>
                <th className='text-left p-2'>Location</th>
                <th className='text-left p-2'>Status</th>
                <th className='text-left p-2'>Priority</th>
                <th className='text-left p-2'>Date</th>
                <th className='w-8 p-2'></th>
            </tr>
        </thead>
    )

}

const statusStyles = {
    Open: 'text-red-700',
    'In Progress': 'text-amber-700',
    Resolved: 'text-green-700',
}

const priorityStyles = {
    High: 'text-red-600',
    Medium: 'text-amber-600',
    Low: 'text-green-600',
}

const TableRow = ({ id, location, status, priority, date, order }) => {
    return (
        <tr className={`text-sm ${order % 2 === 0 ? 'bg-stone-100' : 'bg-white'}`}>
            <td className='flex cursor-pointer items-center gap-2 p-2 text-[#57B74A] underline underline-offset-2 transition-colors duration-200 hover:text-green-600'>
                 {id}
                <FiArrowUpRight />
            </td>
            <td className='p-2'>{location}</td>
            <td className='p-2'>
                <span className={`rounded px-2 py-1 text-xs font-medium ${statusStyles[status]}`}>
                    {status}
                </span>
            </td>
            <td className={`p-2 font-medium ${priorityStyles[priority]}`}>{priority}</td>
            <td className='p-2'>{date}</td>
            <td className='p-2 text-right'>
                <button className='text-sm text-stone-500 hover:text-green-600 transition-colors duration-200 flex items-center gap-1'>
                    <FiEdit />
                </button>
            </td>
        </tr>
    )
}

export default RecentIncidents
