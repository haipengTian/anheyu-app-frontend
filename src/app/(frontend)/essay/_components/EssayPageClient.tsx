/**
 * 即刻短文页面（[custom] 二开新增）
 */
"use client";

import { Button } from "@heroui/react";
import { BannerCard } from "@/components/common/BannerCard";
import { Spinner } from "@/components/ui";
import { useInfinitePublicEssays } from "@/hooks/queries/use-essays";
import { useSiteConfigStore } from "@/store/site-config-store";
import { EssayCard } from "./EssayCard";

const PAGE_SIZE = 20;

const BANNER = {
  tips: "即刻短文",
  title: "咸鱼的日常生活。",
  description: "随时随地，分享生活",
};

export function EssayPageClient() {
  const siteConfig = useSiteConfigStore(state => state.siteConfig);
  const ownerName = siteConfig?.frontDesk?.siteOwner?.name || siteConfig?.APP_NAME || "";
  const ownerAvatar = siteConfig?.USER_AVATAR || undefined;

  const { data, isPending, isError, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfinitePublicEssays(PAGE_SIZE);
  const essays = data?.pages.flatMap(page => page.list) ?? [];

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 px-6 py-8">
      <BannerCard tips={BANNER.tips} title={BANNER.title} description={BANNER.description} height={300} />

      {isPending && (
        <div className="flex items-center justify-center py-10">
          <Spinner />
        </div>
      )}

      {isError && <p className="text-muted-foreground">短文加载失败，请稍后再试。</p>}

      {!isPending && !isError && essays.length === 0 && <p className="text-muted-foreground">还没有短文</p>}

      <div className="columns-1 gap-4 md:columns-2 [&>*]:mb-4 [&>*]:break-inside-avoid">
        {essays.map(essay => (
          <EssayCard key={essay.id} essay={essay} ownerName={ownerName} ownerAvatar={ownerAvatar} />
        ))}
      </div>

      {hasNextPage && (
        <div className="flex justify-center">
          <Button variant="flat" onPress={() => fetchNextPage()} isLoading={isFetchingNextPage}>
            加载更多
          </Button>
        </div>
      )}
    </div>
  );
}
