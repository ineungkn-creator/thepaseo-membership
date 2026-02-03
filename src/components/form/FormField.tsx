'use client'

import { ReactNode } from 'react'

type Props = {
  label: string
  required?: boolean
  children: ReactNode
}

export default function FormField({ label, required, children }: Props) {
  return (
    <div className="w-full flex flex-col items-start gap-1 mb-4">
      <label className="text-xs font-medium text-white -mb-7 z-40 bg-paseo border border-gray-100 py-0 px-2 ml-1 rounded-lg w-30">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}
