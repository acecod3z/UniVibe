import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "secondary" | "outline" | "destructive" | "verified" | "ambassador";
}

function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
    const variants = {
        default: "border-transparent bg-slate-900 text-slate-50 hover:bg-slate-900/80 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/80",
        secondary: "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-100/80 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-800/80",
        outline: "text-slate-950 dark:text-slate-50 border-slate-200 dark:border-slate-800",
        destructive: "border-transparent bg-red-500 text-slate-50 hover:bg-red-500/80 dark:bg-red-900 dark:text-slate-50 dark:hover:bg-red-900/80",
        verified: "border-transparent bg-blue-500 text-white hover:bg-blue-600 gap-1 pl-1.5 pr-2",
        ambassador: "border-transparent bg-amber-400 text-slate-900 hover:bg-amber-500",
    };

    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:focus:ring-slate-300",
                variants[variant],
                className
            )}
            {...props}
        >
            {variant === "verified" && <Check className="w-3 h-3" />}
            {children}
        </div>
    );
}

export { Badge };
