// src/app/preview/layout.tsx
import React from 'react';

export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>; // Renderiza os filhos diretamente, sem layout extra
}
