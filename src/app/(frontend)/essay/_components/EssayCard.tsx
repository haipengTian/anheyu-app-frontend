/**
 * 即刻短文卡片（[custom] 二开新增）
 */
"use client";

import { useEffect, useRef } from "react";
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import { Icon } from "@iconify/react";
import { PostContent } from "@/components/post/PostContent";
import { renderMusicPlayerHtml } from "@/lib/marked-extensions";
import { essayImageColumns } from "@/lib/essay";
import { cn } from "@/lib/utils";
import { formatDateTimeParts } from "@/utils/date";
import type { Essay } from "@/types/essay";

const GRID_CLASS = { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3" } as const;

interface EssayCardProps {
  essay: Essay;
  ownerName: string;
  ownerAvatar?: string;
}

export function EssayCard({ essay, ownerName, ownerAvatar }: EssayCardProps) {
  const galleryRef = useRef<HTMLDivElement>(null);
  const hasImages = essay.images.length > 0;

  useEffect(() => {
    const el = galleryRef.current;
    if (!el || !hasImages) return;
    Fancybox.bind(el, "[data-fancybox]", { groupAll: true });
    return () => Fancybox.unbind(el);
  }, [hasImages]);

  const published = formatDateTimeParts(essay.published_at);
  const columns = essayImageColumns(essay.images.length);

  return (
    <article className="rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow duration-300 hover:shadow-md">
      <header className="flex items-center gap-3">
        {ownerAvatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={ownerAvatar} alt={`${ownerName}头像`} className="h-10 w-10 rounded-full border border-border object-cover" />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
            {ownerName.charAt(0)}
          </div>
        )}
        <div className="min-w-0">
          <div className="font-semibold text-foreground">{ownerName}</div>
          <time dateTime={essay.published_at} className="text-xs text-muted-foreground tabular-nums">
            {published.date} {published.time}
          </time>
        </div>
      </header>

      {essay.content && (
        <p className="mt-3 whitespace-pre-wrap break-words text-[15px] leading-7 text-foreground">{essay.content}</p>
      )}

      {hasImages && (
        <div ref={galleryRef} className={cn("mt-3 grid gap-2", GRID_CLASS[columns])}>
          {essay.images.map((src, i) => (
            <a
              key={`${src}-${i}`}
              href={src}
              data-fancybox={`essay-${essay.id}`}
              className={cn("block overflow-hidden rounded-lg bg-muted", columns === 1 ? "max-h-[420px]" : "aspect-square")}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`短文配图 ${i + 1}`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </a>
          ))}
        </div>
      )}

      {essay.videos.map((src, i) => (
        <video key={`${src}-${i}`} src={src} controls preload="metadata" className="mt-3 w-full rounded-lg bg-black" />
      ))}

      {essay.link_url && (
        <a
          href={essay.link_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm transition-colors hover:border-primary hover:text-primary"
        >
          <Icon icon="ri:link" width={18} className="shrink-0" />
          <span className="truncate">{essay.link_title || essay.link_url}</span>
        </a>
      )}

      {essay.music_id && (
        <div className="mt-3">
          <PostContent
            content={renderMusicPlayerHtml({
              neteaseId: essay.music_id,
              name: essay.music_name,
              artist: essay.music_artist,
              pic: essay.music_cover,
              instanceKey: essay.id,
            })}
          />
        </div>
      )}

      {(essay.address || essay.source) && (
        <footer className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {essay.address && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
              <Icon icon="ri:map-pin-line" width={14} />
              {essay.address}
            </span>
          )}
          {essay.source && <span className="rounded-full bg-muted px-2.5 py-1">来自 {essay.source}</span>}
        </footer>
      )}
    </article>
  );
}
