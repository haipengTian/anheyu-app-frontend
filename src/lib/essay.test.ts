import { describe, expect, it } from "vitest";
import {
  EMPTY_ESSAY_PAYLOAD,
  essayImageColumns,
  essaySummary,
  essayToPayload,
  fromDateTimeLocal,
  parseStringList,
  stringifyStringList,
  toDateTimeLocal,
} from "./essay";
import type { Essay } from "@/types/essay";

const base: Essay = {
  id: 1,
  created_at: "2025-07-01T04:00:00Z",
  updated_at: "2025-07-01T04:00:00Z",
  content: "",
  published_at: "2025-07-01T04:00:00Z",
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

describe("essaySummary", () => {
  it("取第一行非空文字", () => {
    expect(essaySummary({ ...base, content: "\n  第一行  \n第二行" })).toBe("第一行");
  });

  it("超过 60 个字截断并加省略号", () => {
    const text = "字".repeat(61);
    expect(essaySummary({ ...base, content: text })).toBe(`${"字".repeat(60)}…`);
  });

  it("没有文字时按媒体类型给占位", () => {
    expect(essaySummary({ ...base, images: ["https://a/b.jpg"] })).toBe("[图片]");
    expect(essaySummary({ ...base, videos: ["https://a/b.mp4"] })).toBe("[视频]");
    expect(essaySummary({ ...base, music_id: "123" })).toBe("[音乐]");
    expect(essaySummary({ ...base, link_url: "https://a" })).toBe("[链接]");
  });
});

describe("string list", () => {
  it("解析 FormStringList 的 JSON 值并去掉空白项", () => {
    expect(parseStringList('[" https://a ", "", 1, "https://b"]')).toEqual(["https://a", "https://b"]);
  });

  it("非法 JSON 返回空数组", () => {
    expect(parseStringList("not json")).toEqual([]);
    expect(parseStringList("")).toEqual([]);
  });

  it("序列化后可以再解析回来", () => {
    expect(parseStringList(stringifyStringList(["https://a"]))).toEqual(["https://a"]);
  });
});

describe("datetime-local 转换", () => {
  it("往返转换保持同一时刻（与本机时区无关）", () => {
    const iso = "2025-07-01T04:00:00.000Z";
    expect(fromDateTimeLocal(toDateTimeLocal(iso))).toBe(iso);
  });

  it("非法输入", () => {
    expect(toDateTimeLocal("bad")).toBe("");
    expect(fromDateTimeLocal("")).toBeUndefined();
  });
});

describe("essayImageColumns", () => {
  it.each([
    [0, 1],
    [1, 1],
    [2, 2],
    [3, 3],
    [4, 2],
    [9, 3],
  ])("%i 张图 → %i 列", (count, cols) => {
    expect(essayImageColumns(count)).toBe(cols);
  });
});

describe("essayToPayload", () => {
  it("只保留请求体字段", () => {
    const payload = essayToPayload({ ...base, content: "x", is_published: false });
    expect(payload).toEqual({ ...EMPTY_ESSAY_PAYLOAD, content: "x", is_published: false, published_at: base.published_at });
    expect(payload).not.toHaveProperty("id");
  });
});
