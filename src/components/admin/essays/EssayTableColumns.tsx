/**
 * 即刻短文表格列（[custom] 二开新增）
 */
"use client";

import { useCallback } from "react";
import { Button, Chip, Tooltip } from "@heroui/react";
import { Edit, Trash2 } from "lucide-react";
import { essaySummary } from "@/lib/essay";
import { formatDateTimeParts } from "@/utils/date";
import type { Essay } from "@/types/essay";

export const ESSAY_TABLE_COLUMNS = [
  { key: "content", label: "内容" },
  { key: "media", label: "附件" },
  { key: "status", label: "状态" },
  { key: "published", label: "发布时间" },
  { key: "actions", label: "操作" },
];

export function useEssayRenderCell(onAction: (item: Essay, key: "edit" | "delete") => void) {
  return useCallback(
    (item: Essay, columnKey: React.Key) => {
      switch (columnKey) {
        case "content":
          return <p className="max-w-[360px] truncate text-sm">{essaySummary(item) || "-"}</p>;
        case "media": {
          const parts = [
            item.images.length > 0 && `${item.images.length} 图`,
            item.videos.length > 0 && `${item.videos.length} 视频`,
            item.music_id && "音乐",
            item.link_url && "链接",
          ].filter(Boolean);
          return <span className="text-xs text-muted-foreground">{parts.join(" · ") || "-"}</span>;
        }
        case "status":
          return (
            <Chip size="sm" variant="flat" color={item.is_published ? "success" : "default"}>
              {item.is_published ? "公开" : "隐藏"}
            </Chip>
          );
        case "published": {
          const { date, time } = formatDateTimeParts(item.published_at);
          return (
            <div className="text-xs tabular-nums text-muted-foreground">
              <div>{date}</div>
              <div className="text-muted-foreground/60">{time}</div>
            </div>
          );
        }
        case "actions":
          return (
            <div className="flex items-center justify-center gap-1">
              <Tooltip content="编辑" size="sm">
                <Button isIconOnly size="sm" variant="light" radius="full" aria-label="编辑" onPress={() => onAction(item, "edit")}>
                  <Edit className="h-3.5 w-3.5" />
                </Button>
              </Tooltip>
              <Tooltip content="删除" size="sm" color="danger">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  radius="full"
                  color="danger"
                  aria-label="删除"
                  onPress={() => onAction(item, "delete")}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </Tooltip>
            </div>
          );
        default:
          return null;
      }
    },
    [onAction]
  );
}
