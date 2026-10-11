/**
 * 即刻短文纯函数（[custom] 二开新增）
 */

import type { Essay, EssayPayload } from "@/types/essay";

export const ESSAY_SUMMARY_MAX = 60;

export const EMPTY_ESSAY_PAYLOAD: EssayPayload = {
  content: "",
  images: [],
  videos: [],
  address: "",
  source: "",
  link_url: "",
  link_title: "",
  music_id: "",
  music_name: "",
  music_artist: "",
  music_cover: "",
  is_published: true,
};

type SummarySource = Pick<Essay, "content" | "images" | "videos" | "music_id" | "link_url">;

/** 首页滚动条用的一行摘要 */
export function essaySummary(essay: SummarySource): string {
  const firstLine = essay.content
    .split(/\r?\n/)
    .map(line => line.trim())
    .find(Boolean);
  if (firstLine) {
    const chars = Array.from(firstLine);
    return chars.length > ESSAY_SUMMARY_MAX ? `${chars.slice(0, ESSAY_SUMMARY_MAX).join("")}…` : firstLine;
  }
  if (essay.images.length > 0) return "[图片]";
  if (essay.videos.length > 0) return "[视频]";
  if (essay.music_id) return "[音乐]";
  if (essay.link_url) return "[链接]";
  return "";
}

/** FormStringList 的值是 JSON 字符串数组 */
export function parseStringList(raw: string): string[] {
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value
      .filter((item): item is string => typeof item === "string")
      .map(item => item.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

export function stringifyStringList(list: string[]): string {
  return JSON.stringify(list);
}

/** ISO 时间 → <input type="datetime-local"> 的值（本地时间，精确到分钟） */
export function toDateTimeLocal(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** <input type="datetime-local"> 的值 → ISO 时间 */
export function fromDateTimeLocal(local: string): string | undefined {
  if (!local) return undefined;
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

/** 图片宫格列数：1 张单列大图，2/4 张两列，其余三列 */
export function essayImageColumns(count: number): 1 | 2 | 3 {
  if (count <= 1) return 1;
  if (count === 2 || count === 4) return 2;
  return 3;
}

/** 编辑已有短文时，把响应转成请求体 */
export function essayToPayload(essay: Essay): EssayPayload {
  return {
    content: essay.content,
    published_at: essay.published_at,
    images: essay.images,
    videos: essay.videos,
    address: essay.address,
    source: essay.source,
    link_url: essay.link_url,
    link_title: essay.link_title,
    music_id: essay.music_id,
    music_name: essay.music_name,
    music_artist: essay.music_artist,
    music_cover: essay.music_cover,
    is_published: essay.is_published,
  };
}
