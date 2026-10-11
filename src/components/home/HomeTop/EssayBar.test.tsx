import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EssayBar } from "./EssayBar";

const { usePublicEssaysMock } = vi.hoisted(() => ({ usePublicEssaysMock: vi.fn() }));

vi.mock("@/hooks/queries/use-essays", () => ({ usePublicEssays: usePublicEssaysMock }));
vi.mock("@iconify/react", () => ({ Icon: () => <span data-testid="icon" /> }));

function essay(id: number, content: string) {
  return {
    id,
    content,
    images: [],
    videos: [],
    music_id: "",
    link_url: "",
  };
}

describe("EssayBar", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    usePublicEssaysMock.mockReset();
  });

  it("没有短文时不渲染", () => {
    usePublicEssaysMock.mockReturnValue({ data: { list: [], total: 0 } });
    const { container } = render(<EssayBar />);
    expect(container).toBeEmptyDOMElement();
  });

  it("渲染摘要并链接到 /essay", () => {
    usePublicEssaysMock.mockReturnValue({ data: { list: [essay(1, "第一条"), essay(2, "第二条")], total: 2 } });
    render(<EssayBar />);
    expect(screen.getByText("第一条")).toBeInTheDocument();
    for (const link of screen.getAllByRole("link")) {
      expect(link).toHaveAttribute("href", "/essay");
    }
  });

  it("每 3 秒滚动到下一条", () => {
    usePublicEssaysMock.mockReturnValue({ data: { list: [essay(1, "第一条"), essay(2, "第二条")], total: 2 } });
    render(<EssayBar />);
    const carousel = screen.getByTestId("essay-carousel");
    expect(carousel.style.transform).toBe("translateY(-0px)");
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(carousel.style.transform).toBe("translateY(-30px)");
  });

  it("只取最新 5 条", () => {
    usePublicEssaysMock.mockReturnValue({ data: { list: [], total: 0 } });
    render(<EssayBar />);
    expect(usePublicEssaysMock).toHaveBeenCalledWith({ page: 1, pageSize: 5 });
  });
});
