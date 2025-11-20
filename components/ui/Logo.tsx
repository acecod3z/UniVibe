import * as React from "react";
import { cn } from "@/lib/utils";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
    withText?: boolean;
}

export function Logo({ className, withText = true, ...props }: LogoProps) {
    return (
        <div className="flex items-center gap-2">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={cn("w-8 h-8 text-violet-600 dark:text-violet-400", className)}
                {...props}
            >
                <path d="M4 4v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.342a2 2 0 0 0-.602-1.43l-4.44-4.342A2 2 0 0 0 13.56 2H6a2 2 0 0 0-2 2z" />
                <path d="M9 13h6" />
                <path d="M9 17h3" />
                <path d="M14 2v6h6" />
            </svg>
            {withText && (
                <span className="font-heading font-bold text-xl bg-gradient-to-r from-teal-400 to-violet-600 bg-clip-text text-transparent">
                    UniVibe
                </span>
            )}
        </div>
    );
}
