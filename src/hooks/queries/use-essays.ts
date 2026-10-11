/**
 * 即刻短文 Query Hooks（[custom] 二开新增）
 */

import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { essayApi } from "@/lib/api/essay";
import type { EssayListParams, EssayPayload } from "@/types/essay";

export const essayKeys = {
  all: ["essays"] as const,
  public: (params: EssayListParams) => [...essayKeys.all, "public", params] as const,
  publicInfinite: (pageSize: number) => [...essayKeys.all, "public-infinite", pageSize] as const,
  admin: (params: EssayListParams) => [...essayKeys.all, "admin", params] as const,
};

/** 前台：固定一页（首页滚动条用） */
export function usePublicEssays(params: EssayListParams = {}) {
  return useQuery({
    queryKey: essayKeys.public(params),
    queryFn: () => essayApi.getPublicList(params),
    staleTime: 1000 * 60,
  });
}

/** 前台：/essay 页面「加载更多」 */
export function useInfinitePublicEssays(pageSize = 20) {
  return useInfiniteQuery({
    queryKey: essayKeys.publicInfinite(pageSize),
    queryFn: ({ pageParam }) => essayApi.getPublicList({ page: pageParam, pageSize }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      allPages.length * pageSize < lastPage.total ? allPages.length + 1 : undefined,
  });
}

/** 后台：分页列表 */
export function useAdminEssays(params: EssayListParams = {}) {
  return useQuery({
    queryKey: essayKeys.admin(params),
    queryFn: () => essayApi.getAdminList(params),
    placeholderData: keepPreviousData,
  });
}

function useInvalidateEssays() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: essayKeys.all, refetchType: "all" });
}

export function useCreateEssay() {
  const invalidate = useInvalidateEssays();
  return useMutation({ mutationFn: (data: EssayPayload) => essayApi.create(data), onSuccess: invalidate });
}

export function useUpdateEssay() {
  const invalidate = useInvalidateEssays();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: EssayPayload }) => essayApi.update(id, data),
    onSuccess: invalidate,
  });
}

export function useDeleteEssay() {
  const invalidate = useInvalidateEssays();
  return useMutation({ mutationFn: (id: number) => essayApi.delete(id), onSuccess: invalidate });
}
