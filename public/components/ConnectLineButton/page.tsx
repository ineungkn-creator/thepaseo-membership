"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import liff from "@line/liff"
import { FaLine } from "react-icons/fa6";
import { RiVerifiedBadgeFill } from "react-icons/ri";

export default function ConnectLineButton() {
  const { data: session, status } = useSession()
  const [isLiffReady, setIsLiffReady] = useState(false)
  const [isInLineApp, setIsInLineApp] = useState(false)
  const [loading, setLoading] = useState(false)

  const user = session?.user as any

  useEffect(() => {
    const initLiff = async () => {
      try {
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LINE_LIFF_ID! })
        setIsLiffReady(true)
        setIsInLineApp(liff.isInClient())
      } catch (err) {
        console.error("LIFF init failed", err)
      }
    }
    initLiff()
  }, [])

  const handleConnectLineWeb = () => {
    setLoading(true)
    const clientId = process.env.NEXT_PUBLIC_LINE_CLIENT_ID
    const redirectUri = encodeURIComponent(
      `${process.env.NEXT_PUBLIC_BASE_URL}/auth/link-line`
    )
    const state = user?.id
    const lineAuthUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=openid%20profile%20email`
    window.location.href = lineAuthUrl
  }

  const handleConnectLineLiff = async () => {
    try {
      if (!isLiffReady) return alert("LIFF ยังไม่พร้อม")
      setLoading(true)

      if (!liff.isLoggedIn()) {
        liff.login({
          redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/link-line?state=${user?.id}`,
        })
        return
      }

      const idToken = liff.getIDToken()
      const res = await fetch("/api/auth/link-line", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, userId: user?.id }),
      })

      if (res.ok) {
        alert("เชื่อมต่อ LINE สำเร็จ 🎉")
        window.location.reload()
      } else {
        const data = await res.json()
        alert(`เชื่อมต่อไม่สำเร็จ: ${data.error}`)
      }
    } catch (err) {
      console.error("Connect LINE (LIFF) failed:", err)
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ LINE")
    } finally {
      setLoading(false)
    }
  }

  // 🟢 สถานะเชื่อมต่อแล้ว
  const isConnected = !!user?.lineId || !!user?.lineToken

  // 🔄 Loading
  if (status === "loading") {
    return (
      <button
        disabled
        className="w-full flex items-center justify-center gap-2 bg-gray-300 text-gray-700 font-medium px-4 py-2 rounded-xl animate-pulse"
      >
        ตรวจสอบสถานะบัญชี...
      </button>
    )
  }

  // ✅ ถ้าเชื่อมแล้ว → ปุ่มสีเทา + ✅ Verify
  if (isConnected) {
    return (
      <button
        disabled
        className="w-full flex items-center justify-start gap-2 cursor-not-allowed"
      >
        <FaLine className="text-line bg-white rounded" size={32}/>
        <span className="w-full flex flex-row items-center gap-2 bg-gray-200 text-gray-600 px-4 py-1 rounded-lg border border-gray-300">เชื่อมต่อ
        <RiVerifiedBadgeFill className="text-paseo" size={24} />
        </span>
        
      </button>
    )
  }

  return (
    <button
      onClick={isInLineApp ? handleConnectLineLiff : handleConnectLineWeb}
      disabled={loading}
      className="w-full flex items-center justify-start gap-2 transition-all shadow-sm">
      <FaLine className="text-line bg-white rounded" size={32}/>
      <span className={`w-full bg-gray-300 text-gray-600 px-4 py-1 rounded-lg ${
        loading
          ? "bg-gray-400 border border-gray-500 cursor-wait"
          : "bg-gray-500 border border-gray-600 hover:bg-gray-600 cursor-pointer"
      }`}
      
      >
        {loading ? "กำลังเชื่อมต่อ..." : "ผูก LINE"}
      </span>
      
    </button>
  )
}
