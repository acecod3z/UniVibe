import * as React from "react";
import { Avatar } from "./ui/Avatar";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from "lucide-react";
import Image from "next/image";

interface PostCardProps {
    author: {
        name: string;
        handle: string;
        avatar: string;
        uni: string;
        verified?: boolean;
    };
    content: {
        text: string;
        image?: string;
        timestamp: string;
        likes: number;
        comments: number;
    };
}

export function PostCard({ author, content }: PostCardProps) {
    return (
        <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                    <Avatar src={author.avatar} fallback={author.name[0]} />
                    <div>
                        <div className="flex items-center gap-1">
                            <span className="font-bold text-sm">{author.name}</span>
                            {author.verified && <Badge variant="verified" className="h-4 w-4 p-0 rounded-full flex items-center justify-center" />}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>@{author.handle}</span>
                            <span>•</span>
                            <span>{author.uni}</span>
                            <span>•</span>
                            <span>{content.timestamp}</span>
                        </div>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </div>

            <div className="px-4 mb-3">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{content.text}</p>
            </div>

            {content.image && (
                <div className="relative w-full aspect-[4/3] bg-slate-100 dark:bg-slate-800 mb-3">
                    <Image
                        src={content.image}
                        alt="Post content"
                        fill
                        className="object-cover"
                    />
                </div>
            )}

            <div className="px-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="px-0 hover:bg-transparent hover:text-red-500 gap-1.5 text-slate-600 dark:text-slate-400">
                        <Heart className="h-5 w-5" />
                        <span className="text-xs font-medium">{content.likes}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="px-0 hover:bg-transparent hover:text-blue-500 gap-1.5 text-slate-600 dark:text-slate-400">
                        <MessageCircle className="h-5 w-5" />
                        <span className="text-xs font-medium">{content.comments}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="px-0 hover:bg-transparent hover:text-green-500 gap-1.5 text-slate-600 dark:text-slate-400">
                        <Share2 className="h-5 w-5" />
                    </Button>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-yellow-500 text-slate-600 dark:text-slate-400">
                    <Bookmark className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
}
