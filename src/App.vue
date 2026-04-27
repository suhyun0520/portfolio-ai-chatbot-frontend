<template>
    <div class="page">
        <div class="app">
            <!-- Header -->
            <header class="header">
                <div class="title">
                    <div class="appname">AI 포트폴리오 챗봇</div>
                </div>

                <label class="upload">
                    <input type="file" accept=".docx" @change="onUpload" />
                    docx 업로드
                </label>
            </header>

            <!-- Chat -->
            <main class="chat" ref="chatAreaRef">
                <div v-for="(m, i) in messages" :key="i" class="msg" :class="m.role">
                    <div class="meta">{{ formatRole(m.role) }}</div>
                    <div class="bubble">{{ m.content }}</div>
                </div>
                <div v-if="isLoading" class="loading">처리 중…</div>
            </main>

            <!-- Input -->
            <footer class="inputbar">
                <input
                    class="input"
                    v-model="input"
                    placeholder="질문을 입력하세요…"
                    @keydown.enter="onSend"
                />
                <button class="btn" :disabled="isLoading" @click="onSend">보내기</button>
            </footer>
        </div>
    </div>
</template>



<script setup>
import { ref, nextTick } from "vue";
import { uploadDocx, sendChat } from "./api";

const messages = ref([
  {
    role: "assistant",
    content: `안녕하세요!
저는 이수현님의 포트폴리오 문서를 기반으로 답변하는 AI 챗봇입니다.

사용자가 질문을 입력하면 관련 문서를 검색하고,
검색된 내용을 바탕으로 AI가 답변을 생성하는 RAG 구조로 개발되었습니다.

질문 예시
- 어떤 프로젝트를 진행했나요?
- 사용 가능한 기술 스택은 무엇인가요?
- 백엔드 개발 경험이 있나요?
- 주요 경력과 담당 업무를 알려주세요.

<이 챗봇에 사용한 기술>
- FrontEnd: Vue3, JavaScript, CSS
- BackEnd: Python, FastAPI
- LLM: OpenAI GPT-4o mini
- Embedding: OpenAI text-embedding-3-small
- Vector Database: Pinecone
- RAG Pipeline: 문서 임베딩, 벡터 검색, 답변 생성
- Deployment: Vercel, Render
- Version Control: Git, GitHub
`
  }
]);

const input = ref("");
const isLoading = ref(false);
const lastSources = ref([]);
const chatAreaRef = ref(null);

async function scrollToBottom() {
    await nextTick();
    const el = chatAreaRef.value;
    if (el) el.scrollTop = el.scrollHeight;
}

function formatRole(role) {
    return role === "user" ? "나" : "AI";
}

async function onUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // 같은 파일 재업로드 가능하도록 초기화
    e.target.value = "";

    try {
        isLoading.value = true;
        const result = await uploadDocx(file);
        messages.value.push({
            role: "assistant",
            content: `업로드 완료: ${result.source} (chunks: ${result.chunks})`
        });
        await scrollToBottom();
    } catch (err) {
        messages.value.push({
            role: "assistant",
            content: `업로드 실패: ${String(err.message || err)}`
        });
        await scrollToBottom();
    } finally {
        isLoading.value = false;
    }
}

async function onSend() {
    const q = input.value.trim();
    if (!q || isLoading.value) return;

    messages.value.push({ role: "user", content: q });
    input.value = "";
    lastSources.value = [];
    await scrollToBottom();

    try {
        isLoading.value = true;
        const data = await sendChat(q, { top_k: 7, dist_threshold: 2.0 });

        messages.value.push({ role: "assistant", content: data.answer || "(응답 없음)" });
        lastSources.value = data.sources || [];
        await scrollToBottom();
    } catch (err) {
        messages.value.push({ role: "assistant", content: `에러: ${String(err.message || err)}` });
        await scrollToBottom();
    } finally {
        isLoading.value = false;
    }
}
</script>

