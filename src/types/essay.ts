/**
 * 即刻短文类型（[custom] 二开新增）
 * 与后端 model.EssayResponse / model.EssayRequest 对齐
 */

export interface Essay {
  id: number;
  created_at: string;
  updated_at: string;
  content: string;
  published_at: string;
  images: string[];
  videos: string[];
  address: string;
  source: string;
  link_url: string;
  link_title: string;
  music_id: string;
  music_name: string;
  music_artist: string;
  music_cover: string;
  is_published: boolean;
}

/** 创建/更新请求体；published_at 不传时，创建取当前时间、更新保持原值 */
export interface EssayPayload {
  content: string;
  published_at?: string;
  images: string[];
  videos: string[];
  address: string;
  source: string;
  link_url: string;
  link_title: string;
  music_id: string;
  music_name: string;
  music_artist: string;
  music_cover: string;
  is_published: boolean;
}

export interface EssayListResponse {
  list: Essay[];
  total: number;
  page: number;
  pageSize: number;
}

export interface EssayListParams {
  page?: number;
  pageSize?: number;
}
