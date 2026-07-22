"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { ThemeToggle } from "./ThemeToggle";
import { 
  LayoutDashboard, 
  ClipboardList,
  AlertTriangle,
  Presentation,
  LogOut,
  Users,
  ShieldCheck,
  Building2,
  SlidersHorizontal,
  X,    // Icon Close
  Activity,
  ShieldAlert,
  BookOpen
} from "lucide-react";

export function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const role = session?.user?.role;
  
  // State untuk melacak apakah sidebar terbuka di HP
  const [isOpen, setIsOpen] = useState(false);

  // Efek pintar: Otomatis tutup sidebar kalau user mengklik menu/pindah halaman
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const getMenu = () => {
    const common = [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
      { name: "Buku Panduan", href: "/panduan", icon: BookOpen },
    ];

    if (role === "SUPER_ADMIN") {
      return [
        ...common,
        { name: "Master Ruangan", href: "/master/ruangan", icon: Building2 },
        { name: "Master Parameter", href: "/master/parameter", icon: SlidersHorizontal },
        { name: "Manajemen User", href: "/users", icon: Users },
        { name: "Sensus Harian", href: "/sensus/input", icon: ClipboardList },
        { name: "Kejadian Infeksi", href: "/infections", icon: AlertTriangle },
        { name: "Audit Kepatuhan", href: "/audit", icon: ShieldCheck },
        { name: "Kurva Epidemiologi", href: "/epidemiologi", icon: Activity },
        { name: "ICRA Bangunan", href: "/icra/bangunan", icon: Building2 },
        { name: "ICRA Program", href: "/icra/program", icon: ShieldAlert },
        { name: "Mode Presentasi", href: "/presentation", icon: Presentation },
      ];
    }

    if (role === "USER_RUANGAN") {
      return [
        { name: "Input Sensus Harian", href: "/sensus/input", icon: ClipboardList },
        { name: "Laporan Infeksi", href: "/infections", icon: AlertTriangle },
        { name: "Audit Kepatuhan", href: "/audit", icon: ShieldCheck },
      ];
    }

    if (role === "VIEWER") {
      return [
        ...common,
        { name: "Kejadian Infeksi", href: "/infections", icon: AlertTriangle },
        { name: "Audit Kepatuhan", href: "/audit", icon: ShieldCheck },
        { name: "Mode Presentasi", href: "/presentation", icon: Presentation },
      ];
    }

    return common;
  };

  const menus = getMenu();

  return (
    <>
      {/* 1. Tombol Hamburger Mengapung (Hanya tampil di Mobile saat sidebar tertutup) */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* 2. Layar Gelap (Backdrop) saat sidebar terbuka di HP */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-900/60 z-40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 3. Container Sidebar Utama (Animasi Slide In/Out) */}
      <div 
        className={`w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col h-screen fixed top-0 left-0 z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Logo Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-start">
          <div>
            <Image 
              src="/logo.png" 
              alt="Logo PPI" 
              width={110} 
              height={50} 
              className="object-contain mb-4 drop-shadow-sm" 
              unoptimized={true} 
            />
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-none">
              PPI <span className="text-emerald-600">IPCN</span>
            </h1>
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase mt-2">
              Sistem Surveilans RS
            </p>
          </div>
          
          {/* Tombol Close (X) di dalam Sidebar untuk HP */}
          <button 
            onClick={() => setIsOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-0.5">
          {menus.map((menu) => {
            const Icon = menu.icon;
            const isActive = menu.href === '/' ? pathname === '/' : pathname.startsWith(menu.href);
            return (
              <Link
                key={menu.name}
                href={menu.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${
                  isActive
                    ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-r-4 border-emerald-600 font-bold"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {menu.name}
              </Link>
            );
          })}
        </div>

        {/* Footer: User + Theme + Logout */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-700">
          {session?.user && (
            <div className="px-4 py-2 mb-1">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{session.user.name}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">{session.user.role?.replace("_", " ")}</p>
            </div>
          )}
          <div className="flex items-center gap-1 px-2">
            <ThemeToggle />
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex-1 flex items-center gap-2 px-3 py-2.5 text-sm text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}