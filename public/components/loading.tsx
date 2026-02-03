// app/loading.tsx
import React from 'react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-gray-200 rounded-full border-t-4 border-paseo animate-spin"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <span className="text-sm font-semibold text-paseo">
            <svg
              className="w-8 h-8 animate-pulse"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="#9DC93C"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </span>
        </div>
      </div>
      <div className="text-gray-600 mt-4 text-center text-sm">กำลังโหลดข้อมูล...</div>
    </div>
  );
}