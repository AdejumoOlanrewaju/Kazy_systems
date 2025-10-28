"use client"
import React from 'react'
import { useEffect } from "react";
import { useLaptopStore } from "@/store/laptopStore";
const FetchDataStore = () => {

    const { fetchLaptops } = useLaptopStore()
    useEffect(() => {
        const unsubscribe = fetchLaptops();
        return () => unsubscribe();
    }, [fetchLaptops]);
    return (
        <div>

        </div>
    )
}

export default FetchDataStore
