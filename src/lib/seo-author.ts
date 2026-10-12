/**
 * 文章作者元信息（[custom] 二开新增，替换上游写死的「安知鱼」默认值）
 */
import type { SiteConfigData } from "@/types/site-config";

export function resolveArticleAuthor(copyrightAuthor: string | null | undefined, siteConfig: SiteConfigData | null): string {
  return (
    copyrightAuthor?.trim() ||
    siteConfig?.frontDesk?.siteOwner?.name?.trim() ||
    siteConfig?.APP_NAME?.trim() ||
    ""
  );
}
