import * as React from "react";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { Avatar } from "./ui/Avatar";
import { Image as ImageIcon, Video, Hash, MapPin } from "lucide-react";

interface ComposerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ComposerModal({ isOpen, onClose }: ComposerModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="New Post">
            <div className="space-y-4">
                <div className="flex gap-3">
                    <Avatar fallback="ME" />
                    <textarea
                        className="w-full h-32 resize-none bg-transparent border-none focus:ring-0 text-lg placeholder:text-slate-400"
                        placeholder="What's happening on campus?"
                    />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="text-teal-500">
                            <ImageIcon className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-violet-500">
                            <Video className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-slate-500">
                            <Hash className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-slate-500">
                            <MapPin className="h-5 w-5" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 font-medium">0/200</span>
                        <Button size="sm" className="rounded-full px-6">
                            Post
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
