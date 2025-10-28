import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

const LoadingProduct = () => {
    return (
        <>
            <div className='flex gap-2 flex-wrap'>
                <Skeleton className="h-[300px] w-[250px] rounded-xl" />
                <Skeleton className="h-[300px] w-[250px] rounded-xl" />
                <Skeleton className="h-[300px] w-[250px] rounded-xl" />
                <Skeleton className="h-[300px] w-[250px] rounded-xl" />
            </div>
    </>
    )
}

export default LoadingProduct
