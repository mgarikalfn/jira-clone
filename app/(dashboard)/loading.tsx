import { Loader } from 'lucide-react'
import React from 'react'

const DashboardLoading = () => {
  return (
    <div className='h-full fle items-center justify-center'>
       <Loader className='size-6 animate-spin text-muted-foreground'/>
    </div>
  )
}

export default DashboardLoading