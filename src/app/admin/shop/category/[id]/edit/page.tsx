"use client";

import { useForm } from "react-hook-form";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { shopCategorySchema, ShopCategoryFormValues } from "@/lib/validations/shopCategory";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ColorPicker from "@/components/ui/ColorPicker";

export default function EditShopCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [uploading, setUploading] = useState(false);

  const form = useForm<ShopCategoryFormValues>({
    resolver: zodResolver(shopCategorySchema),
    defaultValues: {
      name: "",
      slug: "",
      imageUrl: "",
      color: "#9dc93c",
    },
  });

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`/api/admin/shop/category/${id}`);
      const data = await res.json();
      form.reset({
        ...data,
        color: data.color || "#9dc93c",
      });
    }
    if (id) fetchData();
  }, [id, form]);

  const onSubmit = async (data: ShopCategoryFormValues) => {
    try {
      const res = await fetch(`/api/admin/shop/category/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("เกิดข้อผิดพลาด");

      router.push("/admin/shop/category");
    } catch (error) {
      console.error(error);
      alert("ไม่สามารถบันทึกข้อมูลได้");
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/shop/uploadcategory", {
      method: "POST",
      body: formData,
    });
    const result = await res.json();

    form.setValue("imageUrl", result.path);
    setUploading(false);
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">แก้ไขหมวดหมู่ร้านค้า</h1>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1">ชื่อหมวดหมู่</label>
          <Input
            placeholder="ชื่อหมวดหมู่"
            {...form.register("name")}
            onChange={(e) => {
              const name = e.target.value;
              form.setValue("name", name);
              form.setValue("slug", generateSlug(name));
            }}
            className="input"
          />
          {form.formState.errors.name && (
            <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>
          )}
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>
          <Input className="input" placeholder="slug" {...form.register("slug")} />
          {form.formState.errors.slug && (
            <p className="text-red-500 text-sm">{form.formState.errors.slug.message}</p>
          )}
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium mb-1">รูปภาพ</label>
          <Input className="file-input" type="file" accept="image/*" onChange={handleUpload} />
          {uploading && <p className="text-sm text-gray-500">กำลังอัปโหลด...</p>}

          {form.watch("imageUrl") && (
            <Image
              width={600}
              height={600}
              src={form.watch("imageUrl") || "/images/no-image.png"}
              alt="preview"
              className="w-32 h-32 object-cover mt-2 rounded"
            />
          )}

          {form.formState.errors.imageUrl && (
            <p className="text-red-500 text-sm">{form.formState.errors.imageUrl.message}</p>
          )}
        </div>

        <ColorPicker
          value={form.watch("color")}
          onChange={(color) =>
            form.setValue("color", color, { shouldValidate: true })
          }
        />

        <Button type="submit" className="w-full">อัพเดต</Button>
      </form>
    </div>
  );
}
