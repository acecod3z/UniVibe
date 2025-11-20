import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "./Button";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-4">
                    {title && <h2 className="text-xl font-heading font-bold">{title}</h2>}
                    <Button variant="ghost" size="icon" onClick={onClose} className="absolute right-4 top-4">
                        <X className="h-5 w-5" />
                    </Button>
                </div>
                {children}
            </div>
        </div>
    );
}
