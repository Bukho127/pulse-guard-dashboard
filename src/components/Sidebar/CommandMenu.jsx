import { Command } from 'cmdk'
import { useEffect } from 'react'
import { useState } from 'react'
import { FiPlus, FiEye } from 'react-icons/fi'

const CommandMenu = ({
    open,
    setOpen

}) => {
const [value, setValue] = useState('')
  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [setOpen])

  return (
    <Command.Dialog 
    open={open} 
    onOpenChange={setOpen} 
    label="Global Command Menu"
    className='fixed inset-0 z-50 bg-stone-950/50 px-4'
    onClick={() => setOpen(false)}
    >
    <div onClick={(e) => e.stopPropagation()} 
    className='bg-white rounded-lg shadow-xl border-stone-300 border overflow-hidden w-full
    max-w-lg mx-auto mt-12'>
      <Command.Input
        value={value}
        onValueChange={setValue}
       placeholder='What do you want to do?'
       className='relative border-b border-stone-200 p-3 w-full  text-lg placeholder:text-stone-400 focus:outline-none' />
      <Command.List>
        <Command.Empty>
            No results found for
            <span className='text-[#57B74A]'>"{value}"</span>
        </Command.Empty>

        <Command.Group heading="Incidents" className='text-sm mb-3 text-stone-400 p-3'>
          <Command.Item className='flex cursor-pointer transition-colors p-2 text-sm
          text-stone-950 hover:bg-stone-200 rounded items-center gap-2'>
            <FiPlus/>
                New Incident
          </Command.Item>
          <Command.Item className='flex cursor-pointer transition-colors p-2 text-sm
          text-stone-950 hover:bg-stone-200 riounded items-center gap-2'>
            <FiEye/>
                View Incidents
          </Command.Item>
        </Command.Group>
      </Command.List>
      </div>
    </Command.Dialog>
  )
}

export default CommandMenu
