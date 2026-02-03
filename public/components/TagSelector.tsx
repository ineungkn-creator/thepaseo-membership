"use client";

import { useEffect, useState } from "react";

interface Tag {
  id: string;
  name: string;
  usage: number;
}

export default function TagSelector({
  value = [],
  onChange,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
}) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [search, setSearch] = useState("");

  // โหลดแท็กทั้งหมด
  useEffect(() => {
    fetchTags();
  }, []);

  async function fetchTags() {
    const res = await fetch("/api/admin/tags");
    setTags(await res.json());
  }

  // toggle local
  function toggle(tagId: string) {
    if (value.includes(tagId)) {
      onChange(value.filter((id) => id !== tagId));
    } else {
      onChange([...value, tagId]);
    }
  }

  return (
    <div className="p-3 border rounded-lg bg-gray-50">
      <label className="font-medium">แท็ก</label>

      {/* Search */}
      <input
        type="text"
        className="border w-full p-2 rounded mt-2"
        placeholder="ค้นหาแท็ก..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="flex flex-wrap gap-2 mt-3">
        {tags
          .filter((t) =>
            t.name.toLowerCase().includes(search.toLowerCase())
          )
          .map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggle(tag.id)}
              className={`px-3 py-1 rounded-full border text-sm ${
                value.includes(tag.id)
                  ? "bg-paseo text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              {tag.name}
            </button>
          ))}
      </div>
    </div>
  );
}
