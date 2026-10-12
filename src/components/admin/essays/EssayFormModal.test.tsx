import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import EssayFormModal from "./EssayFormModal";
import type { Essay } from "@/types/essay";

const { createMock, updateMock, toastMock } = vi.hoisted(() => ({
  createMock: vi.fn().mockResolvedValue({}),
  updateMock: vi.fn().mockResolvedValue({}),
  toastMock: vi.fn(),
}));

vi.mock("@/hooks/queries/use-essays", () => ({
  useCreateEssay: () => ({ mutateAsync: createMock, isPending: false }),
  useUpdateEssay: () => ({ mutateAsync: updateMock, isPending: false }),
}));
vi.mock("@/components/admin/AdminDialog", () => ({
  AdminDialog: ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) =>
    isOpen ? <div>{children}</div> : null,
}));
vi.mock("@/components/ui/form-string-list", () => ({
  FormStringList: ({ label }: { label: string }) => <div>{label}</div>,
}));
vi.mock("@/components/ui/form-image-upload", () => ({
  FormImageUpload: ({ label, value, onValueChange }: { label: string; value: string; onValueChange: (v: string) => void }) => (
    <input aria-label={label} value={value} onChange={e => onValueChange(e.target.value)} />
  ),
}));
vi.mock("@/components/admin/article-editor/extensions/music-block", () => ({ fetchMusicDetail: vi.fn() }));
vi.mock("@heroui/react", async () => {
  const actual = await vi.importActual<typeof import("@heroui/react")>("@heroui/react");
  return {
    ...actual,
    addToast: toastMock,
    // AdminDialog 被 mock 掉后没有 Modal 上下文，与仓库其他弹窗测试一样把这两个换成普通容器
    ModalBody: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    ModalFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  };
});

describe("EssayFormModal", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("文字和媒体都为空时提示并不提交", async () => {
    render(<EssayFormModal isOpen onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "发布" }));
    await waitFor(() => expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({ color: "warning" })));
    expect(createMock).not.toHaveBeenCalled();
  });

  it("新增时提交去掉首尾空白的请求体", async () => {
    const onClose = vi.fn();
    render(<EssayFormModal isOpen onClose={onClose} />);
    fireEvent.change(screen.getByLabelText("文字内容"), { target: { value: "  海边  " } });
    fireEvent.click(screen.getByRole("button", { name: "发布" }));
    await waitFor(() => expect(createMock).toHaveBeenCalledTimes(1));
    expect(createMock.mock.calls[0][0]).toMatchObject({ content: "海边", images: [], is_published: true });
    expect(onClose).toHaveBeenCalled();
  });

  it("上传框里的网址点「加入图片」后才进入图片列表", async () => {
    render(<EssayFormModal isOpen onClose={vi.fn()} />);
    const upload = screen.getByLabelText("上传图片");
    fireEvent.change(upload, { target: { value: "h" } });
    fireEvent.change(upload, { target: { value: "https://img.example.com/a.jpg" } });
    fireEvent.click(screen.getByRole("button", { name: "加入图片" }));
    expect(upload).toHaveValue("");
    fireEvent.click(screen.getByRole("button", { name: "发布" }));
    await waitFor(() => expect(createMock).toHaveBeenCalledTimes(1));
    expect(createMock.mock.calls[0][0].images).toEqual(["https://img.example.com/a.jpg"]);
  });

  it("编辑时回填并调用更新", async () => {
    const editItem = {
      id: 3,
      content: "旧内容",
      published_at: "2025-07-01T04:00:00.000Z",
      images: [],
      videos: [],
      address: "厦门",
      source: "",
      link_url: "",
      link_title: "",
      music_id: "",
      music_name: "",
      music_artist: "",
      music_cover: "",
      is_published: false,
    } as unknown as Essay;
    render(<EssayFormModal isOpen onClose={vi.fn()} editItem={editItem} />);
    expect(screen.getByLabelText("文字内容")).toHaveValue("旧内容");
    fireEvent.click(screen.getByRole("button", { name: "保存修改" }));
    await waitFor(() => expect(updateMock).toHaveBeenCalledTimes(1));
    expect(updateMock.mock.calls[0][0]).toMatchObject({
      id: 3,
      data: { content: "旧内容", address: "厦门", is_published: false, published_at: "2025-07-01T04:00:00.000Z" },
    });
  });
});
