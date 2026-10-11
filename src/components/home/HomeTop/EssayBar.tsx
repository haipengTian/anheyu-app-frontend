/**
 * 首页「即刻」滚动条（[custom] 二开新增，样式沿用上游遗留的 EssayBar.module.css）
 */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { usePublicEssays } from "@/hooks/queries/use-essays";
import { essaySummary } from "@/lib/essay";
import styles from "./EssayBar.module.css";

const BAR_SIZE = 5;
const ITEM_HEIGHT = 30; // 与 .essayItem 的 height 保持一致
const INTERVAL_MS = 3000;

export function EssayBar() {
  const { data } = usePublicEssays({ page: 1, pageSize: BAR_SIZE });
  const items = useMemo(
    () => (data?.list ?? []).map(essay => ({ id: essay.id, text: essaySummary(essay) })).filter(item => item.text),
    [data]
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length < 2) return;
    const timer = setInterval(() => setIndex(i => (i + 1) % items.length), INTERVAL_MS);
    return () => clearInterval(timer);
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <div className={styles.essayBarContainer}>
      <Link href="/essay" className={styles.essayLogo} aria-label="即刻短文">
        <Icon icon="ri:quill-pen-line" className={styles.essayLogoIcon} />
      </Link>
      <div className={styles.essayCarouselWrapper}>
        <Link href="/essay" className={styles.essayCarouselLink}>
          <div
            data-testid="essay-carousel"
            className={styles.essayCarousel}
            style={{ transform: `translateY(-${(index % items.length) * ITEM_HEIGHT}px)` }}
          >
            {items.map(item => (
              <div key={item.id} className={styles.essayItem}>
                {item.text}
              </div>
            ))}
          </div>
        </Link>
      </div>
      <Link href="/essay" className={styles.essayMoreBtn} aria-label="查看全部短文">
        <Icon icon="ri:arrow-right-circle-line" width={24} />
      </Link>
    </div>
  );
}
