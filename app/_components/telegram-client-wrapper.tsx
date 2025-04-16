'use client';

import dynamic from "next/dynamic";

// Динамически импортируем компонент для инициализации Telegram, чтобы он загружался только на клиенте
const TelegramInit = dynamic(
  () => import("./telegram-init"),
  { ssr: false }
);

export default function TelegramClientWrapper() {
  return (
    <TelegramInit />
  );
} 