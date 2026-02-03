"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { IoMdClose } from "react-icons/io";
import BannerUploadTerm from "@/components/BannerUploadTerm/page";
import HeaderMobile from '@/components/HeaderMobile/page';

interface UploadTerm {
  id: string;
  description: string;
}

export default function UploadTermPage() {
  const [term, setTerm] = useState<UploadTerm>({ id: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch UploadTerm on mount
  useEffect(() => {
    const fetchTerm = async () => {
      try {
        const response = await axios.get("/api/admin/receipts/terms");
        setTerm(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load terms");
        setLoading(false);
      }
    };
    fetchTerm();
  }, []);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-0 mt-0 mb-20 md:mt-20 md:mb-20 mb-4 md:rounded-xl overflow-hidden">
        <div className="min-h-dvh pt-0 m-0 rounded-3xl bg-white shadow relative flex items-center justify-center">
          <div className="text-center">Loading terms...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-0 mt-0 mb-20 md:mt-20 md:mb-20 mb-4 md:rounded-xl overflow-hidden">
        <div className="min-h-dvh pt-0 m-0 rounded-3xl bg-white shadow relative flex items-center justify-center">
          <div className="text-center text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-0 px-0 mb-20 md:mt-20 md:mb-0 mb-4 rounded-xl px-2">
      
      <HeaderMobile showBack={true} />

     <div className="md:pt-4 pt-16 mb-0 py-4 px-4 md:px-4">
        <BannerUploadTerm />
      </div>

      <div className="min-h-dvh pt-0 m-0 rounded-3xl bg-white shadow relative">
        <div className="space-y-4 md:p-10 p-6 pb-20">
          <h3 className="text-black text-base font-bold">เงื่อนไขการสะสมพอยท์</h3>

          {term.description ? (
            <div
              className="prose text-sm mb-2 prose-ol:list-decimal prose-ol:pl-6 prose-ul:list-disc prose-ul:pl-6"
              dangerouslySetInnerHTML={{ __html: term.description }}
            />
          ) : (
            <p className="text-gray-500">No terms defined.</p>
          )}
        </div>
      </div>
    </div>
  );
}