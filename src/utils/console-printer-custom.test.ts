import { afterEach, describe, expect, it, vi } from "vitest";
import { buildConsoleLines } from "./console-printer-custom";

describe("buildConsoleLines", () => {
  afterEach(() => vi.restoreAllMocks());

  it("使用站点名和副标题", () => {
    const lines = buildConsoleLines("Super-Thp的个人空间", "记录学习与生活");
    const text = lines.map(l => l.message).join("\n");
    expect(text).toContain("欢迎来到 Super-Thp的个人空间");
    expect(text).toContain("记录学习与生活");
  });

  it("不包含原作者品牌", () => {
    const text = buildConsoleLines("站点", "").map(l => l.message).join("\n");
    expect(text).not.toMatch(/安知鱼|安和鱼|AnHeYu|anheyu/i);
  });

  it("站点名为空时使用通用文案", () => {
    expect(buildConsoleLines("", "")[0].message).toContain("欢迎来到 本站");
  });
});
