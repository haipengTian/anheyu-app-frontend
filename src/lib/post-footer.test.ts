import { describe, expect, it } from "vitest";
import { buildPostFooterText } from "./post-footer";

describe("buildPostFooterText", () => {
  it("使用站点名和站长名", () => {
    expect(buildPostFooterText("Super-Thp的个人空间", "Super-Thp")).toEqual({
      siteName: "Super-Thp的个人空间",
      description: "来自 Super-Thp 的最新文章",
    });
  });

  it("没有站长名时用站点名", () => {
    expect(buildPostFooterText("Super-Thp的个人空间", "  ").description).toBe("来自 Super-Thp的个人空间 的最新文章");
  });

  it("配置还没加载（服务端渲染）时不出现原作者名", () => {
    const text = buildPostFooterText(undefined, null);
    expect(text).toEqual({ siteName: "", description: "本站最新文章" });
    expect(JSON.stringify(text)).not.toMatch(/安知鱼|安和鱼|AnHeYu/i);
  });
});
