import { FiCommand, FiSearch } from 'react-icons/fi'
import { useState } from 'react'
import CommandMenu from './CommandMenu'

const Search = () => {
  const [open, setOpen] = useState(false)
  return (
    <>
    <div className='relative mb-4 flex items-center rounded bg-stone-200 px-2 py-1.5 text-sm'>
      <FiSearch className='mr-2 shrink-0 text-stone-500' />
      <input
       onFocus={(e)=>{
        e.target.blur()
        setOpen(true)
       }}
        type="text"
        placeholder='Search'
        className='w-full min-w-0 bg-transparent pr-12 text-stone-700 placeholder:text-stone-400 focus:outline-none'
      />
      <span className='absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-0.5 rounded bg-stone-50 p-1 text-xs text-stone-500 shadow'>
        <FiCommand />K
      </span>
    </div>

    <CommandMenu open={open} setOpen={setOpen}/>
    </>
  )
}

export default Search
