"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import BannerUpload from "@/components/BannerUpload/page";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react"
import Image from "next/image";
import HeaderMobile from '@/components/HeaderMobile/page';

import { CiReceipt } from "react-icons/ci";
import { IoReceipt } from "react-icons/io5";
import { MdAddAPhoto } from "react-icons/md";
import { GoFileDirectoryFill } from "react-icons/go";
import { MdPictureAsPdf } from "react-icons/md";
import { AiOutlineExclamationCircle } from "react-icons/ai";

export default function UploadPage() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ dragFree: true });
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);

  const [terms, setTerms] = useState<{
    description: string;
    images: string[];
  } | null>(null);

  // file input แยก 3 แบบ
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target as Node)) {
        setShowOptions(false);
      }
    };

    if (showOptions) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showOptions]);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      alert("กรุณาเลือกไฟล์");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    const res = await fetch("/api/receipt/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      setIsModalOpen(true);
      setFiles([]);
    } else {
      alert("บันทึกไม่สำเร็จ");
    }
    setUploading(false);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...newFiles]);
  };

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const res = await fetch("/api/admin/receipts/terms");
        const data = await res.json();

        setTerms({
          description: data.description || "",
          images: data.images || [],
        });
      } catch (err) {
        console.error("Failed to load upload terms", err);
      }
    };

    fetchTerms();
  }, []);

  useEffect(() => {
    }, [emblaApi])

  return (
    <div className="max-w-2xl mx-auto p-0 px-0 mb-20 md:mt-20 md:mb-0 mb-4 rounded-xl">
      <HeaderMobile showBack={true} />
      
      <div className="md:pt-4 pt-16 mb-0 py-4 px-4 md:px-4">
        <BannerUpload />
      </div>

      <div className="pt-0 m-0 rounded-3xl bg-white shadow relative">
        {/* ปุ่ม Test */}
        <div className="w-full flex justify-center mb-4 -top-20 absolute flex-col items-center">
          <Button
            className="rounded-full h-40 w-40 text-xl text-center bg-paseo-hover text-paseo flex flex-col border-4 border-paseo mb-2"
            onClick={() => setShowOptions(!showOptions)}
          >
            <IoReceipt size={64} />
            <span className="text-gray-500 text-center text-sm">อัพโหลดใบเสร็จ</span>
          </Button>

            <Link href="/upload/terms" className="bg-gray-100 px-2 py-1 rounded-full border border-gray-200">
              <span className="text-sm text-gray-500 text-center flex gap-1 items-center">
                <AiOutlineExclamationCircle size={16} />
                เงื่อนไขการสะสมพอยท์
              </span>
            </Link>

          {showOptions && (
            <div ref={optionsRef} className="flex flex-col justify-start items-start -mt-8 py-0 px-0 blur2 rounded-xl shadow-2xl z-50 relative border">
              <button
                className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center border rounded-full text-xs"
                onClick={() => setShowOptions(false)}
              >
                ✕
              </button>

              <Button
                className="bg-transparent w-full py-0 flex justify-start gap-2 hover:bg-paseo-hover "
                variant="outline"
                onClick={() => {
                  setShowOptions(false);
                  cameraInputRef.current?.click();
                }}
              >
                <MdAddAPhoto size={16} />
                <span className="text-xs">ถ่ายภาพ</span>
                
              </Button>

              <hr className="w-full self-center my-0 border border-t-0"></hr>

              <Button
                className="bg-transparent w-full py-0 flex justify-start gap-2 hover:bg-paseo-hover text-xs"
                variant="outline"
                onClick={() => {
                  setShowOptions(false);
                  galleryInputRef.current?.click();
                }}
              >
                <GoFileDirectoryFill size={16} />
                <span className="text-xs">คลังภาพ (เลือกหลายไฟล์)</span>
              </Button>

              <hr className="w-full self-center my-0 border border-t-0"></hr>

              <Button
                className="bg-transparent w-full py-0 flex justify-start gap-2 hover:bg-paseo-hover text-xs"
                variant="outline"
                onClick={() => {
                  setShowOptions(false);
                  pdfInputRef.current?.click();
                }}
              >
                <MdPictureAsPdf size={16} />
                <span className="text-xs">อัพโหลด PDF</span>
              </Button>
            </div>
          )}
        </div>

        {/* Hidden Inputs */}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={cameraInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          type="file"
          accept="image/*"
          multiple
          ref={galleryInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          type="file"
          accept="application/pdf"
          ref={pdfInputRef}
          className="hidden"
          onChange={handleFileChange}
        />

        {/* ส่วน preview */}
        <div
          className="space-y-4 p-10 z-60"
          style={{ paddingTop: "7rem" }}
        >
          <div className="mt-6 mb-6">

            <p className="text-sm text-gray-600 mb-2">
              ใบเสร็จที่แนบ ( {files.length} / 10 )
            </p>

            <div className="embla w-full" ref={emblaRef}>
              <div className="embla__container h-full flex gap-2">
                {Array.from({ length: 10 }).map((_, i) => {
                  const file = files[i];

                  if (file) {
                    return (
                      <div
                        className="embla__slide_upload relative flex items-center justify-center rounded-xl w-24 h-24 bg-gray-100"
                        key={i}
                      >
                        {/* ปุ่มลบ */}
                        <button
                          onClick={() => removeFile(i)}
                          className="absolute top-1 right-1 bg-gray-400 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs z-20"
                        >
                          ✕
                        </button>

                        {file.type.startsWith("image/") ? (
                          <Image
                            width={600}
                            height={600}
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="object-cover w-full h-full rounded-lg border"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center w-full h-24 rounded-xl border bg-white text-gray-700 p-4">
                            <div className="text-5xl mb-2">📄</div>
                            <span className="text-sm truncate w-full text-center">
                              {file.name}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  }

                  // ช่องว่าง
                  return (
                    <div
                      key={i}
                      className="embla__slide_upload flex items-center justify-center rounded-lg h-24 border-paseo border border-dashed text-gray-400 cursor-pointer"
                      onClick={() => cameraInputRef.current?.click()}
                    >
                      <CiReceipt className="text-paseo" size={40} />
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          <button
            onClick={handleSubmit}
            disabled={uploading}
            className="w-full text-white px-4 py-3 rounded-full disabled:opacity-50"
            style={{ backgroundColor: "#9DC93C" }}
          >
            {uploading ? "กำลังอัปโหลด..." : "ส่งใบเสร็จ"}
          </button>

        </div>

        <div className="flex flex-col items-center relative">
          {terms && (
            <div className="flex flex-col items-center relative mt-6">

              {/* Images */}
              {terms.images.length > 0 && (
                <div className="w-full px-10 flex flex-col gap-4">
                  {terms.images.map((img) => (
                    <Image
                      key={img}
                      src={img}
                      width={800}
                      height={800}
                      alt="Upload terms"
                      className="rounded-xl w-full object-contain"
                    />
                  ))}
                </div>
              )}
            </div>
          )}

            <div className="flex flex-row relative">
              <Image
                src="/upload-l.png"
                width={500}
                height={500}
                alt="ThePaseo"
                className="cover"
              />

              <Image
                src="/upload-r.png"
                width={500}
                height={500}
                alt="ThePaseo"
                className="cover"
              />

            </div>

          </div>
      </div>

      {isModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-lg">
                  <h2 className="text-lg font-bold mb-2">อัพโหลดสำเร็จ</h2>
                  <p className="text-gray-600 mb-4">เจ้าหน้าที่กำลังตรวจสอบข้อมูลให้คุณ พอยท์จะถูกมอบเข้าบัญชีภายใน 24 ชั่วโมง</p>
                  <div className="flex justify-center">
                    <Button
                      onClick={handleModalClose}
                      className="text-base text-white py-3 px-4 rounded-xl bg-paseo"
                    >
                      ตกลง
                    </Button>
                  </div>
                </div>
              </div>
            )}

    </div>
  );
}
