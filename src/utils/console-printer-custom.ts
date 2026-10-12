/**
 * 控制台欢迎语（[custom] 二开替换上游 console-printer.ts，去掉原作者品牌）
 */
import { useSiteConfigStore } from "@/store/site-config-store";

interface ConsoleLine {
  message: string;
  styles: string[];
}

const BADGE = "color:white; background-color:#425AEF; padding:2px 6px; border-radius:3px";

export function buildConsoleLines(siteName: string, subTitle: string): ConsoleLine[] {
  const name = siteName.trim() || "本站";
  const lines: ConsoleLine[] = [
    { message: `%c 欢迎来到 ${name} %c ${subTitle.trim()}`, styles: [BADGE, ""] },
    { message: "%c HELLO %c 你已打开控制台，欢迎交流。", styles: [BADGE, ""] },
  ];
  return lines;
}

let hasPrinted = false;

export function printConsoleWelcome() {
  if (hasPrinted || typeof window === "undefined") return;
  hasPrinted = true;

  setTimeout(() => {
    const config = useSiteConfigStore.getState().siteConfig;
    for (const line of buildConsoleLines(config?.APP_NAME || "", config?.SUB_TITLE || "")) {
      console.log(line.message, ...line.styles);
    }
  }, 1000);
}
