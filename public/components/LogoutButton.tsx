'use client'
import { signOut } from 'next-auth/react'
import { MdLogout } from "react-icons/md";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/auth/login' })}
      className="flex flex-row"
    >
      <MdLogout />
      <span>ออกจากระบบ</span>
    </button>
  )
}
