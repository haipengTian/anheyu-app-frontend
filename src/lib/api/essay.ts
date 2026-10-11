/**
 * 即刻短文 API（[custom] 二开新增）
 * 公开：GET /api/public/essays
 * 后台：/api/essays（需要管理员登录）
 */

import { apiClient } from "./client";
import type { Essay, EssayListParams, EssayListResponse, EssayPayload } from "@/types/essay";

function listQuery({ page = 1, pageSize = 20 }: EssayListParams): string {
  return new URLSearchParams({ page: String(page), pageSize: String(pageSize) }).toString();
}

export const essayApi = {
  async getPublicList(params: EssayListParams = {}): Promise<EssayListResponse> {
    const response = await apiClient.get<EssayListResponse>(`/api/public/essays?${listQuery(params)}`);
    if (response.code === 200 && response.data) return response.data;
    throw new Error(response.message || "获取短文列表失败");
  },

  async getAdminList(params: EssayListParams = {}): Promise<EssayListResponse> {
    const response = await apiClient.get<EssayListResponse>(`/api/essays?${listQuery(params)}`);
    if (response.code === 200 && response.data) return response.data;
    throw new Error(response.message || "获取短文列表失败");
  },

  async create(data: EssayPayload): Promise<Essay> {
    const response = await apiClient.post<Essay>("/api/essays", data);
    if (response.code === 200 && response.data) return response.data;
    throw new Error(response.message || "创建短文失败");
  },

  async update(id: number, data: EssayPayload): Promise<Essay> {
    const response = await apiClient.put<Essay>(`/api/essays/${id}`, data);
    if (response.code === 200 && response.data) return response.data;
    throw new Error(response.message || "更新短文失败");
  },

  async delete(id: number): Promise<void> {
    const response = await apiClient.delete(`/api/essays/${id}`);
    if (response.code !== 200) throw new Error(response.message || "删除短文失败");
  },
};
