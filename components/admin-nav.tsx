"use client";

import { Home, Activity, Settings, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AdminNav() {
  const pathname = usePathname();

  const links = [
    {
      name: "Главная",
      href: "/",
      icon: Home,
    },
    {
      name: "Статус систем",
      href: "/admin/status",
      icon: Activity,
    },
    {
      name: "Настройки",
      href: "/admin/settings",
      icon: Settings,
    },
    {
      name: "Пользователи",
      href: "/admin/users",
      icon: User,
    },
  ];

  return (
    <div className="flex flex-col gap-2 p-4 border-b md:border-r md:border-b-0 md:min-h-screen">
      <h2 className="text-lg font-bold mb-4">Администрирование</h2>
      <nav className="space-y-2">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link href={link.href} key={link.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className="w-full justify-start"
              >
                <link.icon className="mr-2 h-4 w-4" />
                {link.name}
              </Button>
            </Link>
          );
        })}
      </nav>
    </div>
  );
} 