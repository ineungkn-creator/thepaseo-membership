'use client';

import { useState, useEffect } from "react";
import { IoHeartOutline } from "react-icons/io5";
import { IoHeartSharp } from "react-icons/io5";

type Props = {
  targetId: string;
  targetType: string;
  userId: string;
};

export default function FavoriteButton({ targetId, targetType, userId }: Props) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
  if (!userId) return;
  async function fetchStatus() {
    const res = await fetch(
      `/api/favorite?userId=${userId}&targetId=${targetId}&targetType=${targetType}`
    );
    const data = await res.json();
    setIsFavorite(data.isFavorite);
  }
  fetchStatus();
}, [userId, targetId, targetType]);

  const toggle = async () => {
    if (!userId) return;
    const res = await fetch(`/api/favorite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, targetId, targetType }),
    });
    const data = await res.json();
    setIsFavorite(data.isFavorite);
  };

  return (
    <button
      onClick={toggle}
      className="text-2xl"
      aria-label={isFavorite ? "Unfavorite" : "Favorite"}
    >
      {isFavorite ? <IoHeartSharp className="text-paseo" /> : <IoHeartOutline />}
    </button>
  );
}
