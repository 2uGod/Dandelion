// 실제 API 연동 전까지 사용하는 테스트용 함수입니다.
// 나중에 fetch로 교체하면 됩니다.
// 사용 예: const res = await detectPest(file)

export async function detectPest(file) {
    // 파일 타입/크기 등 서버 요구조건 사전 검사 지점
    await sleep(900); // 네트워크 대기 모사
    const labels = [
      "잎마름병 (Leaf Blight)",
      "흰가루병 (Powdery Mildew)",
      "도열병 (Rice Blast)",
      "진딧물 피해 (Aphids)",
      "총채벌레 피해 (Thrips)"
    ];
    const mainIdx = Math.floor(Math.random() * labels.length);
    const topK = shuffle(labels.filter((_, i) => i !== mainIdx))
      .slice(0, 3)
      .map((label, i) => ({ label, score: 0.42 - i * 0.08 }));
  
    return {
      label: labels[mainIdx],
      confidence: 0.78,
      topK,
      tips: [
        "의심 부위를 격리하고 전정 도구를 소독하세요.",
        "초기 증상일 때는 생물농약/친환경 약제를 우선 검토하세요.",
        "증상이 확산되면 라벨 기준에 맞는 약제를 사용하세요."
      ],
    };
  }
  
  function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }
  function shuffle(arr){ return [...arr].sort(() => Math.random() - 0.5); }