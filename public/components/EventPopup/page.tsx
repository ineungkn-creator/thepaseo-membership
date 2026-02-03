"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Link from "next/link";
import Image from "next/image";

interface EventPopupProps {
  title: string
  description: string
  imageUrl?: string
  linkUrl?: string
}

export default function EventPopup({ title, description, imageUrl, linkUrl }: EventPopupProps) {
  const [open, setOpen] = useState(true)

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem("hasSeenPopup")
    if (!hasSeenPopup) {
      setOpen(true)
      localStorage.setItem("hasSeenPopup", "false")
    }
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="sm:max-w-lg sm:rounded-2xl p-0 overflow-hidden">
    {imageUrl && (
      <div className="relative w-full h-56">
        <Image src={imageUrl} alt="event image" fill className="object-cover" />
      </div>
    )}
    <div className="p-6">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
      </DialogHeader>
      <p className="text-gray-600 mt-2">{description}</p>

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" onClick={() => setOpen(false)}>ปิด</Button>
        {linkUrl && (
          <Button asChild>
            <Link href={linkUrl} rel="noopener noreferrer">ดูรายละเอียด</Link>
          </Button>
        )}
      </div>
    </div>
  </DialogContent>
</Dialog>
  )
}
