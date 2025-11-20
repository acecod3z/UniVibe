import * as React from "react";
import { Logo } from "./ui/Logo";
import { Bell, Search } from "lucide-react";
import { Button } from "./ui/Button";

export function TopBar() {
    return (
        <div className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between px-4 h-14">
                <Logo className="h-6 w-6" />

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-slate-600 dark:text-slate-400">
                        <Search className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="relative text-slate-600 dark:text-slate-400">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white dark:border-slate-900" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
