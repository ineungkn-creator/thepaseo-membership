"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import RichTextEditor from "@/components/RichTextEditor/page";

interface UploadTerm {
  id: string;
  description: string;
  images?: string[];
}


export default function ReceiptTerms() {
  const [term, setTerm] = useState<UploadTerm>({ id: "", description: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch UploadTerm on mount
  useEffect(() => {
    const fetchTerm = async () => {
      const res = await axios.get("/api/admin/receipts/terms");
      setTerm({
        id: res.data.id,
        description: res.data.description,
      });
      setImages(res.data.images || []);
      setLoading(false);
    };

    fetchTerm();
  }, []);

  const handleUploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post(
      "/api/admin/receipts/termsupload",
      formData
    );

    setImages((prev) => [...prev, res.data.path]);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put("/api/admin/receipts/terms", {
        id: term.id,
        description: term.description,
        images,
      });
      setIsEditing(false);
      alert("Terms updated successfully");
    } catch (err) {
      setError("Failed to update terms");
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

  return (
    <div className="bg-white p-10 rounded-lg flex-1 mr-4">
      <h1 className="text-2xl font-bold mb-4">Receipt Upload Terms</h1>

      <div className="flex flex-row justify-between mb-4">
        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-2">Images</h2>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleUploadImage(e.target.files[0]);
                  }
                }}
                className="file-input"
              />

              <div className="grid grid-cols-4 gap-4 mt-4">
                {images.map((img) => (
                  <div key={img} className="relative">
                    <img src={img} className="rounded border h-32 w-full object-cover" />
                    <button
                      onClick={() =>
                        setImages((prev) => prev.filter((i) => i !== img))
                      }
                      className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded"
                    >
                      ลบ
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">
                Terms Description
              </label>
              <RichTextEditor
                value={term.description || ""}
                onChange={(value: string) => setTerm({ ...term, description: value })}
              />
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                className="px-4 py-2 bg-paseo text-white rounded-lg hover:bg-paseo-hover disabled:opacity-50"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-paseo text-white rounded-lg hover:bg-paseo-hover disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div>
            <h2 className="text-lg font-semibold mb-2">Current Terms</h2>

              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {images.map((img) => (
                    <img
                      key={img}
                      src={img}
                      className="rounded border object-cover w-full"
                      alt="Receipt term"
                    />
                  ))}
                </div>
              )}

            <div
              className="text-gray-700 mb-6 prose"
              dangerouslySetInnerHTML={{ __html: term.description || "No terms defined" }}
            />

            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-paseo text-white rounded-lg hover:bg-paseo-hover disabled:opacity-50"
            >
              Edit Terms
            </button>
          </div>
        )}
      </div>
    </div>
  );
}