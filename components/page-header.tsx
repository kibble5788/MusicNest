"use client"

import type React from "react"

import { ChevronLeft } from "lucide-react"

interface PageHeaderProps {
  title: string
  onBack: () => void
  rightContent?: React.ReactNode
}

export function PageHeader({ title, onBack, rightContent}: PageHeaderProps) {

  
 

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-20 px-4 py-3 flex items-center justify-between transition-colors duration-300`}
      style={{
        backgroundColor:  "rgba(0, 0, 0, 0.2)",
        backdropFilter: 'blur(8px)',
      }}
    >
      <button onClick={onBack} className="p-1">
        <ChevronLeft className="h-6 w-6 text-white" />
      </button>

      <h1 className="text-lg font-medium text-white">{title}</h1>

      <div className="flex items-center space-x-4">{rightContent || <div className="w-6"></div>}</div>
    </div>
  )
}
