'use client'
import { signOut } from 'next-auth/react'
import { MdLogout } from "react-icons/md";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/auth/login' })}
      className="w-full flex item-center justify-center gap-2 bg-gray-300 rounded-xl shadow-sm py-3 text-black"
    >
      <MdLogout size={24} className="text-black"/>
      <span>ออกจากระบบ</span>
    </button>
  )
}
