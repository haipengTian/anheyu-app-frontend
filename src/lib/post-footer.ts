/**
 * 文章页底部栏文案（[custom] 二开新增，替换上游写死的「安知鱼」兜底值）
 * 服务端渲染时站点配置还没进 store，这里返回中性文案而不是原作者名。
 */
export function buildPostFooterText(
  appName?: string | null,
  ownerName?: string | null
): { siteName: string; description: string } {
  const siteName = appName?.trim() || "";
  const owner = ownerName?.trim() || siteName;
  return { siteName, description: owner ? `来自 ${owner} 的最新文章` : "本站最新文章" };
}
