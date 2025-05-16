"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RankBadgeProps {
  position: number;
  className?: string;
}

export function RankBadge({ position, className }: RankBadgeProps) {
  const getRankSuffix = (position: number): string => {
    if (position === 1) return "st";
    if (position === 2) return "nd";
    if (position === 3) return "rd";
    return "th";
  };

  const getBadgeStyle = (position: number) => {
    if (position === 1) return "bg-yellow-500 hover:bg-yellow-600";
    if (position === 2) return "bg-gray-400 hover:bg-gray-500";
    if (position === 3) return "bg-amber-700 hover:bg-amber-800";
    return "";
  };

  return (
    <Badge 
      className={cn(getBadgeStyle(position), className)}
      variant={position > 3 ? "outline" : "default"}
    >
      {position}{getRankSuffix(position)}
    </Badge>
  );
}