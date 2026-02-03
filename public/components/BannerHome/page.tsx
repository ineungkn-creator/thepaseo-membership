"use client"

import React, { useEffect, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image";
import Link from 'next/link';

type BannerHome = {
  id: string
  title: string
  linkUrl: string
  imageUrl: string
  isActive: boolean
  startDate: string | null
  endDate: string | null
  order: number
}

export default function BannerHomePage() {
  const [banners, setBanners] = useState<BannerHome[]>([])
  const [loading, setLoading] = useState(true)
  
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true },
    [Autoplay({ delay: 5000, stopOnInteraction: true })]
  )

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch("/api/banner/bannerhome")
        if (!res.ok) throw new Error("Failed to fetch banners")
        const data = await res.json()
        const now = new Date()
        // กรองแบนเนอร์ที่ isActive และยังไม่ถึง endDate
        const activeBanners = data
          .filter((banner: BannerHome) => {
            const endDate = banner.endDate ? new Date(banner.endDate) : null
            return banner.isActive && (!endDate || endDate >= now)
          })
          .sort((a: BannerHome, b: BannerHome) => a.order - b.order)
        setBanners(activeBanners)
      } catch (error) {
        console.error("Error fetching banners:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBanners()
  }, [])

  useEffect(() => {
  }, [emblaApi])

  return (
    <>
      {/* ซ่อนทั้งหมดถ้า loading หรือไม่มีแบนเนอร์ */}
      {loading || banners.length === 0 ? null : (
        <div className="embla w-full overflow-hidden rounded-2xl shadow" ref={emblaRef}>
          <div className="embla__container h-full flex">
            {banners.map((banner) => (
              <div
                className="embla__slide flex items-center justify-center overflow-hidden"
                key={banner.id}
              >
                <Link
                  href={banner.linkUrl}
                  rel="noopener noreferrer"
                  className="w-full flex aspect-square items-center justify-center"
                >
                  <Image
                    src={banner.imageUrl}
                    alt={banner.title}
                    width={600}
                    height={600}
                    className="object-cover w-full md:max-h-homebanner max-h-homebanner-mb h-60"
                  />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* แสดง Skeleton เฉพาะตอนโหลด */}
      {loading && (
        <div className="embla w-full overflow-hidden rounded-2xl shadow">
          <div className="embla__container h-full flex">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="embla__slide flex items-center justify-center"
              >
                <Skeleton className="w-full aspect-square rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}