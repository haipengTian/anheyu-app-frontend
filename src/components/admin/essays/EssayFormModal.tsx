/**
 * 即刻短文新增/编辑弹窗（[custom] 二开新增）
 * 与 DocSeriesFormModal 相同：外层控制开关，内层在打开时挂载，初始值直接来自 props
 */
"use client";

import { useCallback, useState } from "react";
import { Button, Input, ModalBody, ModalFooter, Switch, Textarea, addToast } from "@heroui/react";
import { Pencil, Feather } from "lucide-react";
import { AdminDialog } from "@/components/admin/AdminDialog";
import { fetchMusicDetail } from "@/components/admin/article-editor/extensions/music-block";
import { FormImageUpload } from "@/components/ui/form-image-upload";
import { FormStringList } from "@/components/ui/form-string-list";
import { useCreateEssay, useUpdateEssay } from "@/hooks/queries/use-essays";
import {
  EMPTY_ESSAY_PAYLOAD,
  essayToPayload,
  fromDateTimeLocal,
  parseStringList,
  stringifyStringList,
  toDateTimeLocal,
} from "@/lib/essay";
import type { Essay, EssayPayload } from "@/types/essay";

const MAX_IMAGES = 9;

interface EssayFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editItem?: Essay | null;
}

export default function EssayFormModal({ isOpen, onClose, editItem }: EssayFormModalProps) {
  const isEdit = !!editItem;
  return (
    <AdminDialog
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
      header={{
        title: isEdit ? "编辑短文" : "发布短文",
        description: "文字、图片、视频至少填写一项",
        icon: isEdit ? Pencil : Feather,
      }}
    >
      {isOpen && <EssayFormContent editItem={editItem} onClose={onClose} />}
    </AdminDialog>
  );
}

function EssayFormContent({ editItem, onClose }: { editItem?: Essay | null; onClose: () => void }) {
  const isEdit = !!editItem;
  const initial = editItem ? essayToPayload(editItem) : EMPTY_ESSAY_PAYLOAD;

  const [form, setForm] = useState<EssayPayload>(initial);
  const [imagesRaw, setImagesRaw] = useState(stringifyStringList(initial.images));
  const [videosRaw, setVideosRaw] = useState(stringifyStringList(initial.videos));
  const [publishedLocal, setPublishedLocal] = useState(initial.published_at ? toDateTimeLocal(initial.published_at) : "");
  const [uploadUrl, setUploadUrl] = useState("");
  const [isFetchingMusic, setIsFetchingMusic] = useState(false);

  const createEssay = useCreateEssay();
  const updateEssay = useUpdateEssay();

  const setField = useCallback(<K extends keyof EssayPayload>(key: K, value: EssayPayload[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  // 上传框的值先留在框里（上传成功或手动粘贴），点「加入图片」才追加到列表，避免逐字输入时追加残缺地址
  const isImagesFull = parseStringList(imagesRaw).length >= MAX_IMAGES;
  const appendUploadedImage = useCallback(() => {
    const url = uploadUrl.trim();
    if (!url) return;
    setImagesRaw(prev => stringifyStringList([...parseStringList(prev), url]));
    setUploadUrl("");
  }, [uploadUrl]);

  const handleFetchMusic = useCallback(async () => {
    const id = form.music_id.trim();
    if (!/^\d+$/.test(id)) {
      addToast({ title: "请先填写数字格式的网易云歌曲 ID", color: "warning", timeout: 3000 });
      return;
    }
    setIsFetchingMusic(true);
    try {
      const detail = await fetchMusicDetail(id);
      if (!detail) {
        addToast({ title: "没有找到这首歌，请检查 ID 或手动填写", color: "warning", timeout: 3000 });
        return;
      }
      setForm(prev => ({ ...prev, music_name: detail.name, music_artist: detail.artist, music_cover: detail.pic }));
    } finally {
      setIsFetchingMusic(false);
    }
  }, [form.music_id]);

  const handleSubmit = useCallback(async () => {
    const payload: EssayPayload = {
      ...form,
      content: form.content.trim(),
      images: parseStringList(imagesRaw),
      videos: parseStringList(videosRaw),
      address: form.address.trim(),
      source: form.source.trim(),
      link_url: form.link_url.trim(),
      link_title: form.link_title.trim(),
      music_id: form.music_id.trim(),
      music_name: form.music_name.trim(),
      music_artist: form.music_artist.trim(),
      music_cover: form.music_cover.trim(),
      published_at: fromDateTimeLocal(publishedLocal) ?? (isEdit ? initial.published_at : undefined),
    };

    if (!payload.content && payload.images.length === 0 && payload.videos.length === 0) {
      addToast({ title: "文字、图片、视频至少填写一项", color: "warning", timeout: 3000 });
      return;
    }

    try {
      if (isEdit && editItem) {
        await updateEssay.mutateAsync({ id: editItem.id, data: payload });
        addToast({ title: "已保存", color: "success", timeout: 2000 });
      } else {
        await createEssay.mutateAsync(payload);
        addToast({ title: "已发布", color: "success", timeout: 2000 });
      }
      onClose();
    } catch (error) {
      addToast({ title: error instanceof Error ? error.message : "操作失败", color: "danger", timeout: 4000 });
    }
  }, [form, imagesRaw, videosRaw, publishedLocal, isEdit, editItem, initial.published_at, createEssay, updateEssay, onClose]);

  const isSubmitting = createEssay.isPending || updateEssay.isPending;

  return (
    <>
      <ModalBody className="gap-4">
        <Textarea
          label="文字内容"
          placeholder="此刻的想法……"
          value={form.content}
          onValueChange={v => setField("content", v)}
          minRows={4}
          maxRows={10}
          maxLength={2000}
        />

        <FormStringList
          label="图片地址"
          description="最多 9 张；也可以用下方上传框上传后加入"
          value={imagesRaw}
          onValueChange={setImagesRaw}
          placeholder="https://"
          addButtonText="添加图片地址"
          maxItems={MAX_IMAGES}
        />
        <div className="flex items-end gap-2">
          <FormImageUpload
            label="上传图片"
            value={uploadUrl}
            onValueChange={setUploadUrl}
            hidePreview
            className="min-w-0 flex-1"
          />
          <Button variant="flat" onPress={appendUploadedImage} isDisabled={!uploadUrl.trim() || isImagesFull}>
            加入图片
          </Button>
        </div>

        <FormStringList
          label="视频地址"
          description="最多 4 个"
          value={videosRaw}
          onValueChange={setVideosRaw}
          placeholder="https://"
          addButtonText="添加视频地址"
          maxItems={4}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="地点" value={form.address} onValueChange={v => setField("address", v)} maxLength={50} />
          <Input label="来源" value={form.source} onValueChange={v => setField("source", v)} maxLength={50} />
          <Input label="外链地址" value={form.link_url} onValueChange={v => setField("link_url", v)} placeholder="https://" />
          <Input label="外链标题" value={form.link_title} onValueChange={v => setField("link_title", v)} maxLength={100} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="网易云歌曲 ID"
            value={form.music_id}
            onValueChange={v => setField("music_id", v)}
            endContent={
              <Button size="sm" variant="flat" onPress={handleFetchMusic} isLoading={isFetchingMusic}>
                获取歌曲信息
              </Button>
            }
          />
          <Input label="歌名" value={form.music_name} onValueChange={v => setField("music_name", v)} maxLength={100} />
          <Input label="歌手" value={form.music_artist} onValueChange={v => setField("music_artist", v)} maxLength={100} />
          <Input label="封面地址" value={form.music_cover} onValueChange={v => setField("music_cover", v)} />
        </div>

        <div className="grid items-center gap-4 sm:grid-cols-2">
          <Input
            type="datetime-local"
            label="发布时间"
            // HeroUI 只对 date/time 等类型默认上浮标签，漏了 datetime-local，给个空占位符避免标签压住「年/月/日」
            placeholder=" "
            description="留空则使用当前时间"
            value={publishedLocal}
            onValueChange={setPublishedLocal}
          />
          <Switch isSelected={form.is_published} onValueChange={v => setField("is_published", v)}>
            公开
          </Switch>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button variant="flat" onPress={onClose}>
          取消
        </Button>
        <Button color="primary" onPress={handleSubmit} isLoading={isSubmitting}>
          {isEdit ? "保存修改" : "发布"}
        </Button>
      </ModalFooter>
    </>
  );
}
