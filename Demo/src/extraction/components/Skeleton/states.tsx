/**
 * Skeleton state matrix for the Kitchen Sink. The reduced-motion fallback is
 * exercised by the sink's own motion switcher (data-reduced-motion on <html>).
 */
import type { ReactNode } from "react";
import { Skeleton, SkeletonCard, SkeletonRow, SkeletonText } from "./Skeleton";

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "text",
    label: "Text — 3 lines, last short",
    render: () => <SkeletonText />
  },
  {
    key: "text-one",
    label: "Text — single line, sized",
    render: () => <Skeleton variant="text" lines={1} width={12} />
  },
  {
    key: "row",
    label: "Row — list-row silhouette",
    render: () => <SkeletonRow />
  },
  {
    key: "card",
    label: "Card — framed panel of bones",
    render: () => <SkeletonCard />
  },
  {
    key: "block",
    label: "Block — media/chart placeholder",
    render: () => <Skeleton variant="block" height={8} />
  },
  {
    key: "block-sized",
    label: "Block — square thumb",
    render: () => <Skeleton variant="block" width={8} height={8} />
  }
];
