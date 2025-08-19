// src/services/aiApi.js
import api from "../api/axios";

/**
 * AI 상담 (프롬프트 → 답변)
 * BE 예시: POST /ai/pest-advisor { text, context }
 *  - context: { plant, species, recentPests: [] }
 */
export async function chatPlantAdvisor(text, context) {
  try {
    const { data } = await api.post("/ai/pest-advisor", { text, context });
    return data?.data?.answer || "답변을 생성하지 못했어요.";
  } catch (e) {
    // fallback rule-based 답변
    const base =
      "상세한 상태(잎 색 변화, 반점 모양/크기, 습도/물주기/일조)를 더 알려주시면 정확도가 높아져요.\n";
    const species = context?.species ? `현재 선택된 종: ${context.species}\n` : "";
    const hint =
      "- 잎이 누렇게 변함: 과습/배수 문제 또는 질소 과다/부족 가능성\n" +
      "- 점성 물질/개미: 진딧물 의심\n" +
      "- 수침성 반점 + 저온다습: 역병 의심\n";
    return `임시 답변(베이스룰)\n${species}${base}\n${hint}`;
  }
}
