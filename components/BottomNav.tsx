import * as React from "react";
import { Home, Zap, PlusSquare, MessageSquare, User, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function BottomNav() {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-safe">
            <div className="flex items-center justify-around h-16">
                <NavItem href="/feed" icon={Home} label="Feed" />
                <NavItem href="/search" icon={Search} label="Search" />
                <div className="relative -top-5">
                    <button className="flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-r from-teal-400 to-violet-500 text-white shadow-lg shadow-violet-500/30 hover:scale-105 transition-transform">
                        <PlusSquare className="h-7 w-7" />
                    </button>
                </div>
                <NavItem href="/match" icon={Zap} label="Vibe" />
                <NavItem href="/profile" icon={User} label="Profile" />
            </div>
        </div>
    );
}

function NavItem({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
    return (
        <Link href={href} className="flex flex-col items-center justify-center w-16 h-full gap-1 text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            <Icon className="h-6 w-6" />
            <span className="text-[10px] font-medium">{label}</span>
        </Link>
    );
}
