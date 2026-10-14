"use client";

import { Input, Select, SelectItem } from "@heroui/react";
import { StorageSecretField } from "./StorageSecretField";
import type {
  StoragePolicy,
  StoragePolicySettings,
} from "@/types/storage-policy";

const CHANNELS = [
  { key: "s3", label: "S3 兼容存储" },
  { key: "cfr2", label: "R2 渠道" },
  { key: "telegram", label: "Telegram" },
  { key: "discord", label: "Discord" },
  { key: "huggingface", label: "Hugging Face" },
  { key: "webdav", label: "WebDAV" },
];

export function ImgBedForm({
  form,
  onChange,
}: {
  form: Partial<StoragePolicy>;
  onChange: (form: Partial<StoragePolicy>) => void;
}) {
  const settings = form.settings ?? {};
  const updateSettings = (patch: Partial<StoragePolicySettings>) =>
    onChange({
      ...form,
      is_private: false,
      settings: { ...settings, ...patch, upload_method: "server" },
    });
  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-primary border-b border-border/40 pb-2">
        图床配置
      </div>
      <Input
        label="图床地址"
        labelPlacement="outside"
        size="sm"
        isRequired
        placeholder="https://img.thpvip.xyz"
        value={form.server ?? ""}
        onValueChange={(server) => onChange({ ...form, server })}
        description="填写图床站点的 HTTPS 地址，不包含 /upload 或 /file 路径。"
      />
      <StorageSecretField
        label="API Token"
        isRequired
        value={form.secret_key ?? ""}
        onValueChange={(secret_key) => onChange({ ...form, secret_key })}
        description="在图床后台创建带上传、删除权限的令牌；仅由博客后端使用，文件需允许公开读取。"
      />
      <Input
        label="图床目录"
        labelPlacement="outside"
        size="sm"
        isRequired
        placeholder="blog/articles"
        value={form.base_path ?? ""}
        onValueChange={(base_path) => onChange({ ...form, base_path })}
        description="建议文章、评论、头像分别使用独立目录；不要使用空格或特殊符号。"
      />
      <Input
        label="应用内挂载路径"
        labelPlacement="outside"
        size="sm"
        isRequired
        placeholder="/imgbed"
        value={form.virtual_path ?? ""}
        onValueChange={(virtual_path) => onChange({ ...form, virtual_path })}
        description="博客文件管理中的目录，需要唯一。"
      />
      <Select
        label="上传渠道"
        labelPlacement="outside"
        size="sm"
        selectedKeys={[settings.upload_channel ?? "s3"]}
        onSelectionChange={(keys) => {
          const key = Array.from(
            keys,
          )[0] as StoragePolicySettings["upload_channel"];
          if (key) updateSettings({ upload_channel: key });
        }}
      >
        {CHANNELS.map((channel) => (
          <SelectItem key={channel.key} textValue={channel.label}>
            {channel.label}
          </SelectItem>
        ))}
      </Select>
      <Input
        label="渠道名称（可选）"
        labelPlacement="outside"
        size="sm"
        value={settings.channel_name ?? ""}
        onValueChange={(channel_name) => updateSettings({ channel_name })}
        description="填写图床后台的渠道名称；留空时由所选渠道类型选择可用渠道。"
      />
      <p className="text-xs text-muted-foreground">
        文件需要允许公开读取。博客管理显示名称和目录，重命名或移动会保留文件链接。旧文件继续使用原策略；图床已有文件不会自动导入。
      </p>
      {settings.upload_channel === "cfr2" && (
        <p className="text-xs text-warning">
          Docker 图床的 R2_env 渠道使用图床服务器本地磁盘；外部对象存储可选择 S3
          渠道。
        </p>
      )}
    </div>
  );
}
