// src/services/postApi.js
import api from "../api/axios";

/**
 * 서버에서 게시글 목록을 가져옵니다.
 * - 쿼리 파라미터는 백엔드 스펙에 맞게 조정하세요.
 * - 여기서는 type, q, page, limit 정도만 전송하고,
 *   정렬은 클라이언트에서 보조 정렬(서버 정렬이 있다면 그대로 사용).
 */
export async function fetchPosts({
  type = "전체",   // "전체"|"질문"|"노하우"|"일지"
  q = "",
  page = 1,
  limit = 20,
}) {
  const params = {};
  if (type && type !== "전체") params.category =
    type === "질문" ? "question" :
    type === "노하우" ? "knowhow" : "journal";
  if (q?.trim()) params.q = q.trim();
  params.page = page;
  params.limit = limit;

  const { data } = await api.get("/posts", { params });

  // 백엔드 응답 형태가 { data: [...], total, page, ... } 라고 가정
  const list = (data?.data ?? data ?? []).map(toUIModel);
  const total = data?.total ?? list.length;
  return { list, total, page, limit };
}

/**
 * 서버에 게시글을 생성합니다.
 * @param {"질문"|"노하우"|"일지"} type
 * @param {string} title
 * @param {string} content
 * @param {string[]} tags
 * @param {File[]} files - 이미지 파일 (업로드 API 확정 전까진 파일명만 전송)
 * @param {string[]} imageNames - 서버가 요구할 경우 파일명/URL
 */
export async function createPost({
  type,
  title,
  content,
  tags = [],
  files = [],
  imageNames = [],
}) {
  const category =
    type === "질문" ? "question" :
    type === "노하우" ? "knowhow" : "journal";

  // ⚠️ 이미지 업로드 엔드포인트가 별도라면 먼저 업로드 후 반환된 URL/파일명을 images에 넣어 전송하세요.
  let images = [];
  if (files?.length) images = files.map((f) => f.name); // 임시: 파일명만 전송
  else if (imageNames?.length) images = imageNames;

  const payload = { title, content, category, tags, images };

  const { data } = await api.post("/posts", payload);
  // 백엔드가 생성된 게시글을 반환한다고 가정
  return toUIModel(data?.data ?? data);
}

/** 서버 → UI 카드 모델 변환 (필드명 다를 때도 안전하게 매핑) */
function toUIModel(p) {
  if (!p) return null;
  const category = p.category || p.type; // "question" | "knowhow" | "journal" | "질문"...
  const type =
    category === "question" ? "질문" :
    category === "knowhow" ? "노하우" :
    category === "journal" ? "일지" :
    (["질문","노하우","일지"].includes(category) ? category : "질문");

  return {
    id: p.id ?? p._id ?? Date.now(),
    type,
    title: p.title ?? "",
    content: p.content ?? "",
    author: p.author?.nickname ?? p.author?.name ?? p.author ?? "익명",
    crop: p.crop ?? p.categoryName ?? "",
    createdAt: p.createdAt ?? p.created_at ?? new Date().toISOString(),
    likes: p.likes ?? p.likeCount ?? 0,
    replies: p.replies ?? p.replyCount ?? p.commentCount ?? 0,
    icon: type === "질문" ? "❓" : type === "노하우" ? "💡" : "📒",
    tags: p.tags ?? [],
    images: p.images ?? [],
  };
}
