/**
 * 即刻短文管理（[custom] 二开新增）
 */
"use client";

import { useCallback, useState } from "react";
import {
  Button,
  Pagination,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  addToast,
  useDisclosure,
} from "@heroui/react";
import { Feather, Plus, ShieldAlert } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { TableEmptyState } from "@/components/admin/TableEmptyState";
import EssayFormModal from "@/components/admin/essays/EssayFormModal";
import { ESSAY_TABLE_COLUMNS, useEssayRenderCell } from "@/components/admin/essays/EssayTableColumns";
import { useAdminEssays, useDeleteEssay } from "@/hooks/queries/use-essays";
import type { Essay } from "@/types/essay";

const PAGE_SIZE = 10;

export default function EssaysAdminPage() {
  const [page, setPage] = useState(1);
  const [editItem, setEditItem] = useState<Essay | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Essay | null>(null);
  const formModal = useDisclosure();
  const deleteModal = useDisclosure();

  const { data, isLoading, isFetching } = useAdminEssays({ page, pageSize: PAGE_SIZE });
  const deleteEssay = useDeleteEssay();
  const essays = data?.list ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));

  const openNew = useCallback(() => {
    setEditItem(null);
    formModal.onOpen();
  }, [formModal]);

  const handleAction = useCallback(
    (item: Essay, key: "edit" | "delete") => {
      if (key === "edit") {
        setEditItem(item);
        formModal.onOpen();
      } else {
        setDeleteTarget(item);
        deleteModal.onOpen();
      }
    },
    [formModal, deleteModal]
  );
  const renderCell = useEssayRenderCell(handleAction);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteEssay.mutateAsync(deleteTarget.id);
      addToast({ title: "已删除", color: "success", timeout: 2000 });
    } catch (error) {
      addToast({ title: error instanceof Error ? error.message : "删除失败", color: "danger", timeout: 3000 });
    }
    deleteModal.onClose();
    setDeleteTarget(null);
  }, [deleteTarget, deleteEssay, deleteModal]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner label="加载中..." />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">即刻短文</h1>
          <p className="mt-1 text-xs text-muted-foreground">共 {data?.total ?? 0} 条，前台 /essay 和首页滚动条只显示公开的</p>
        </div>
        <Button size="sm" color="primary" startContent={<Plus className="h-3.5 w-3.5" />} onPress={openNew}>
          发布短文
        </Button>
      </div>

      <Table
        aria-label="即刻短文列表"
        bottomContent={
          totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination isCompact showControls color="primary" page={page} total={totalPages} onChange={setPage} />
            </div>
          )
        }
      >
        <TableHeader columns={ESSAY_TABLE_COLUMNS}>
          {column => (
            <TableColumn key={column.key} align={column.key === "actions" ? "center" : "start"}>
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={essays}
          isLoading={isFetching}
          loadingContent={<Spinner size="sm" />}
          emptyContent={
            <TableEmptyState
              icon={Feather}
              hasFilter={false}
              filterEmptyText=""
              emptyText="还没有短文"
              emptyHint="点击「发布短文」写第一条"
              action={{ label: "发布短文", onPress: openNew }}
            />
          }
        >
          {item => <TableRow key={item.id}>{columnKey => <TableCell>{renderCell(item, columnKey)}</TableCell>}</TableRow>}
        </TableBody>
      </Table>

      <EssayFormModal isOpen={formModal.isOpen} onClose={formModal.onClose} editItem={editItem} />

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onOpenChange={deleteModal.onOpenChange}
        title="删除短文"
        description="确定要删除这条短文吗？此操作不可撤销。"
        confirmText="删除"
        confirmColor="danger"
        icon={<ShieldAlert className="h-5 w-5 text-danger" />}
        iconBg="bg-danger-50"
        loading={deleteEssay.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
