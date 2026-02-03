'use client';

import { useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { IoMdClose } from 'react-icons/io';
import { Skeleton } from '@/components/ui/skeleton';
import Link from "next/link";
import Image from "next/image";

interface Popup {
  id: string;
  title: string;
  linkUrl: string;
  imageUrl: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

export default function HomePopup() {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true },
    [Autoplay({ delay: 5000, stopOnInteraction: true })]
  );

  useEffect(() => {
    const fetchPopups = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/banner/popup');
        if (!res.ok) {
          console.error('Failed to fetch popups:', res.status);
          return;
        }
        const data: Popup[] = await res.json();

        const today = new Date();
        const todayKey = today.toISOString().split('T')[0];

        // กรอง popup ที่ active และยังไม่ถูกซ่อนในวันนี้
        const validPopups = data.filter(
          (p) =>
            p.isActive &&
            new Date(p.startDate) <= today &&
            new Date(p.endDate) >= today &&
            localStorage.getItem(`hidePopup_${p.id}`) !== todayKey
        );

        if (validPopups.length > 0) {
          setPopups(validPopups);
          setIsOpen(true);
        }
      } catch (error) {
        console.error('Error fetching popups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPopups();
  }, []);

  useEffect(() => {
  }, [emblaApi]);

  const handleHideToday = () => {
    popups.forEach((popup) => {
      const todayKey = new Date().toISOString().split('T')[0];
      localStorage.setItem(`hidePopup_${popup.id}`, todayKey);
    });
    setIsOpen(false);
  };

  if (!isOpen || popups.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overlay p-4">
      <div className="bg-transparent max-w-md w-full relative">
        <button
          className="absolute z-50 top-2 right-2 text-white p-2 rounded-full flex justify-center items-center bg-white shadow"
          onClick={() => setIsOpen(false)}
        >
          <IoMdClose className="text-2xl text-black" />
        </button>
        <div className="embla w-full" ref={emblaRef}>
          <div className="embla__container h-full flex">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="embla__slide flex-[0_0_100%] min-w-0 flex items-center justify-center rounded-2xl"
                >
                  <Skeleton className="w-full aspect-square rounded-xl" />
                </div>
              ))
            ) : (
              popups.map((popup, index) => (
                <div
                  key={popup.id}
                  className="embla__slide flex-[0_0_100%] min-w-0 flex items-center justify-center rounded-2xl"
                >
                  <Link
                    href={popup.linkUrl}
                    rel="noopener noreferrer"
                    className="w-full flex aspect-square items-center justify-center"
                  >
                    <Image
                      src={popup.imageUrl}
                      alt={popup.title}
                      width={600}
                      height={600}
                      className="object-contain w-full h-full rounded-xl"
                      priority={index === 0}
                      loading={index === 0 ? undefined : "lazy"}
                      placeholder="blur"
                      blurDataURL="/blur-placeholder.jpg"
                    />
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="flex justify-end items-center p-0 bg-transparent">
          <button
            className="text-right text-sm text-white underline mt-2"
            onClick={handleHideToday}
          >
            ไม่แสดงวันนี้
          </button>
        </div>
      </div>
    </div>
  );
}