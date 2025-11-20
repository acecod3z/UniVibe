import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    src?: string;
    alt?: string;
    fallback?: string;
    size?: "sm" | "md" | "lg" | "xl";
}

function Avatar({ className, src, alt = "Avatar", fallback = "U", size = "md", ...props }: AvatarProps) {
    const sizeClasses = {
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-14 w-14 text-base",
        xl: "h-20 w-20 text-xl",
    };

    return (
        <div
            className={cn(
                "relative flex shrink-0 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700",
                sizeClasses[size],
                className
            )}
            {...props}
        >
            {src ? (
                <img
                    src={src}
                    alt={alt}
                    className="w-full h-full object-cover"
                />
            ) : (
                <span>{fallback}</span>
            )}
        </div>
    );
}

export { Avatar };
