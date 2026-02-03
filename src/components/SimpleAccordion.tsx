"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";

interface Item {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
}

export default function SimpleAccordion({ items }: { items: Item[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const isOpen = openId === item.id;

        return (
          <div
            key={item.id}
            className="border rounded-lg overflow-hidden"
          >
            {/* HEADER */}
            <button
              onClick={() =>
                setOpenId(isOpen ? null : item.id)
              }
              className={clsx(
                "w-full flex items-center justify-between px-4 py-4 text-left transition-colors",
                isOpen && "bg-paseo text-black"
              )}
            >
              <div className="font-medium">{item.title}</div>

              <ChevronDown
                className={clsx(
                  "h-4 w-4 transition-transform",
                  isOpen && "rotate-180 text-white"
                )}
              />
            </button>

            {/* CONTENT */}
            {isOpen && (
              <div className="px-4 py-3 text-sm bg-white text-gray-700">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
