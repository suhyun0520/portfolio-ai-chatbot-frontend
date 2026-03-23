<template>
  <div class="page">
    <div class="app">
      <!-- Header -->
      <header class="header">
        <div class="title">
          <div class="appname">Docx RAG Chat</div>
          <div class="subtitle">문서 기반 Q&A (프론트 MVP)</div>
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

      <!-- Sources -->
      <!-- <section v-if="lastSources.length" class="sources">
        <details open>
          <summary>근거(Sources) 보기</summary>
          <ul>
            <li v-for="(s, idx) in lastSources" :key="idx" class="source-item">
              <div class="source-head">
                <span class="badge">{{ s.source }} #{{ s.chunk }}</span>
                <span class="score">score: {{ s.score }}</span>
              </div>
              <div class="snippet">{{ s.snippet }}</div>
            </li>
          </ul>
        </details>
      </section> -->

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
  { role: "assistant", content: "안녕하세요! 문서 기반으로만 답변할게요. docx를 업로드해 주세요.\ndd" }
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
    const data = await sendChat(q, { top_k: 5, dist_threshold: 2.0 });

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

