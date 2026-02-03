// components/GreenCard.tsx
'use client';

import React, { ReactNode } from 'react';

interface GreenCardProps {
  title?: string;
  children: ReactNode;
}

export default function GreenCard({ title, children }: GreenCardProps) {
  return (
      <div>{children}</div>
  );
}
