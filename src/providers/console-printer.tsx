"use client";

import { useEffect } from "react";
import { printConsoleWelcome } from "@/utils/console-printer-custom"; // [custom] 替换上游 console-printer

export function ConsolePrinter() {
  useEffect(() => {
    printConsoleWelcome();
  }, []);

  return null;
}
