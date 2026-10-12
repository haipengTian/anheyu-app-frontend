import { describe, expect, it } from "vitest";
import { resolveArticleAuthor } from "./seo-author";

describe("resolveArticleAuthor", () => {
  const config = { APP_NAME: "Super-Thp的个人空间", frontDesk: { siteOwner: { name: "Super-Thp" } } };

  it("优先用文章自己的版权作者", () => {
    expect(resolveArticleAuthor("别人", config as never)).toBe("别人");
  });

  it("没有版权作者时用站点拥有者", () => {
    expect(resolveArticleAuthor("", config as never)).toBe("Super-Thp");
    expect(resolveArticleAuthor(undefined, config as never)).toBe("Super-Thp");
  });

  it("没有站点拥有者时用站点名，都没有返回空字符串", () => {
    expect(resolveArticleAuthor(null, { APP_NAME: "站点" } as never)).toBe("站点");
    expect(resolveArticleAuthor(null, null)).toBe("");
  });
});
