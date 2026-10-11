import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EssayCard } from "./EssayCard";
import type { Essay } from "@/types/essay";

vi.mock("@fancyapps/ui", () => ({ Fancybox: { bind: vi.fn(), unbind: vi.fn() } }));
vi.mock("@fancyapps/ui/dist/fancybox/fancybox.css", () => ({}));
vi.mock("@iconify/react", () => ({ Icon: () => <span /> }));
vi.mock("@/components/post/PostContent", () => ({
  PostContent: ({ content }: { content: string }) => (
    <div data-testid="music-player" data-has-music={content.includes('data-music-id="186016"')} />
  ),
}));

const base: Essay = {
  id: 7,
  created_at: "2025-07-01T04:00:00Z",
  updated_at: "2025-07-01T04:00:00Z",
  content: "沙茶面一般般\n姜母鸭还阔以",
  published_at: "2025-07-01T04:00:00Z",
  images: ["https://img.example.com/1.jpg", "https://img.example.com/2.jpg"],
  videos: [],
  address: "厦门",
  source: "super-thp",
  link_url: "",
  link_title: "",
  music_id: "",
  music_name: "",
  music_artist: "",
  music_cover: "",
  is_published: true,
};

describe("EssayCard", () => {
  afterEach(cleanup);

  it("渲染作者、文字、图片、地点和来源", () => {
    render(<EssayCard essay={base} ownerName="Super-Thp" />);
    expect(screen.getByText("Super-Thp")).toBeInTheDocument();
    expect(screen.getByText(/沙茶面一般般/)).toBeInTheDocument();
    expect(screen.getAllByRole("img", { name: /短文配图/ })).toHaveLength(2);
    expect(screen.getByText("厦门")).toBeInTheDocument();
    expect(screen.getByText("来自 super-thp")).toBeInTheDocument();
  });

  it("外链卡片在新窗口打开", () => {
    render(<EssayCard essay={{ ...base, link_url: "https://example.com", link_title: "示例" }} ownerName="x" />);
    const link = screen.getByRole("link", { name: /示例/ });
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("有歌曲 ID 才渲染音乐卡片", () => {
    const { rerender } = render(<EssayCard essay={base} ownerName="x" />);
    expect(screen.queryByTestId("music-player")).not.toBeInTheDocument();
    rerender(<EssayCard essay={{ ...base, music_id: "186016", music_name: "晴天" }} ownerName="x" />);
    expect(screen.getByTestId("music-player")).toHaveAttribute("data-has-music", "true");
  });

  it("视频带播放控件", () => {
    const { container } = render(<EssayCard essay={{ ...base, videos: ["https://img.example.com/a.mp4"] }} ownerName="x" />);
    const video = container.querySelector("video");
    expect(video).toHaveAttribute("src", "https://img.example.com/a.mp4");
    expect(video).toHaveAttribute("controls");
  });
});
