<script setup lang="ts">
import { onMounted, ref, nextTick } from "vue";
import MarkdownPreview from "../components/MarkdownPreview/index.vue";
import { sendChatMessage, modelList } from "../api/chat";
import { useChatStore } from "@/store/chat";
import Sidebar from "../components/Sidebar/index.vue";
import { NScrollbar, useMessage } from "naive-ui";
import { useTheme } from "@/hooks/useTheme";
import { useVirtualScroll } from "@/hooks/useVirtualScroll";

//ok啊，这里是响应式数据来了//
const inputText = ref("");
const chatStore = useChatStore();

// 主题切换
const { isDark, toggleTheme } = useTheme();

const sidebarVisible = ref(true);
const scrollbarRef = ref<InstanceType<typeof NScrollbar> | null>(null);
const currentModel = ref(modelList[0]?.id ?? 'mock');
const message = useMessage();
let hasEnd = ref(false);

const scrollToBottom = () => {
  nextTick(() => {
    scrollbarRef.value?.scrollTo({
      top: Number.MAX_SAFE_INTEGER,
      behavior: 'smooth'
    });
  });
};
const copyMessage = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    message.success('复制成功')
  } catch {
    message.error('复制失败')
  }
}

const {
  initContainerHeight
} = useVirtualScroll(() => chatStore.messages, {
  itemHeight: 100,
  buffer: 3
});

onMounted(() => {
  chatStore.loadConversation();
  if (!chatStore.currentId) {
    chatStore.createConversation();
  }
  nextTick(() => {
    const el = scrollbarRef.value?.$el;
    if (el) initContainerHeight(el);
  });
});

const loading = ref(false);

const handleSend = async () => {
  console.log(inputText.value);
  if (!inputText.value.trim() || loading.value) return;

  hasEnd.value = false;

  const userMessage = inputText.value;
  chatStore.addMessage({
    role: "user",
    content: userMessage
  });
  inputText.value = "";
  loading.value = true;

  chatStore.addMessage({ role: "assistant", content: "" });

  scrollToBottom();
  let hasStart = ref(false);


  await sendChatMessage(userMessage, currentModel.value, {
    onChunk: (text: string) => {
      if (!hasStart.value) {
        hasStart.value = true;
        loading.value = false;
      }
      const lastMessage = chatStore.messages[chatStore.messages.length - 1];
      if (lastMessage) {
        lastMessage.content += text;
      }
    },
    onDone: () => {
      loading.value = false;
      hasEnd.value = true;
      nextTick(() => scrollToBottom());
    },
    onError: (error: Error) => {
      console.error("请求失败", error);
      loading.value = false;
    }
  });
};
</script>

<template>
  <n-layout>
    <div class="chat-container" :class="{ dark: isDark }">
      <Sidebar v-if="sidebarVisible" class="chat-sidebar" />

      <div class="chat-content">

        <div class="chat-header">
          <div class="round">
            <h1>牵引 AI 对话盒子</h1>
            <p class="subtitle">基于 {{ currentModel }} 模型</p>
          </div>
          <div class="header-right">
            <select v-model="currentModel" class="model-select">
              <option v-for="model in modelList" :key="model.id" :value="model.id">
                {{ model.name }}
              </option>
            </select>
            <!-- 主题切换按钮 -->
            <button class="theme-toggle" @click="toggleTheme">
              {{ isDark ? '☀️' : '🌙' }}
            </button>
          </div>
        </div>

        <div class="chat-message-container">
          <NScrollbar class="chat-messages" ref="scrollbarRef">
            <div class="message-list">
              <div v-for="(msg, index) in chatStore.messages" :key="index" class="message" :class="msg.role">
                <div class="message-content">
                  <div class="copy-contanier">
                    <MarkdownPreview v-if="msg.role === 'assistant'" :content="msg.content" />
                    <template v-else>{{ msg.content }}</template>
                  </div>

                  <button class="copy" @click="copyMessage(msg.content)" v-if="msg.role === 'assistant' && hasEnd">
                    <span class="tooltip" data-text-initial="Copy to clipboard" data-text-end="Copied!"></span>
                    <span>
                      <svg class="clipboard" xmlns="http://www.w3.org/2000/svg" version="1.1"
                        xmlns:xlink="http://www.w3.org/1999/xlink" width="20" height="20" x="0" y="0"
                        viewBox="0 0 6.35 6.35" style="enable-background:new 0 0 512 512" xml:space="preserve">
                        <g>
                          <path
                            d="M2.43.265c-.3 0-.548.236-.573.53h-.328a.74.74 0 0 0-.735.734v3.822a.74.74 0 0 0 .735.734H4.82a.74.74 0 0 0 .735-.734V1.529a.74.74 0 0 0-.735-.735h-.328a.58.58 0 0 0-.573-.53zm0 .529h1.49c.032 0 .049.017.049.049v.431c0 .032-.017.049-.049.049H2.43c-.032 0-.05-.017-.05-.049V.843c0-.032.018-.05.05-.05zm-.901.53h.328c.026.292.274.528.573.528h1.49a.58.58 0 0 0 .573-.529h.328a.2.2 0 0 1 .206.206v3.822a.2.2 0 0 1-.206.205H1.53a.2.2 0 0 1-.206-.205V1.529a.2.2 0 0 1 .206-.206z"
                            fill="currentColor"></path>
                        </g>
                      </svg>
                      <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" version="1.1"
                        xmlns:xlink="http://www.w3.org/1999/xlink" width="18" height="18" x="0" y="0"
                        viewBox="0 0 24 24" style="enable-background:new 0 0 512 512" xml:space="preserve">
                        <g>
                          <path
                            d="M9.707 19.121a.997.997 0 0 1-1.414 0l-5.646-5.647a1.5 1.5 0 0 1 0-2.121l.707-.707a1.5 1.5 0 0 1 2.121 0L9 14.171l9.525-9.525a1.5 1.5 0 0 1 2.121 0l.707.707a1.5 1.5 0 0 1 0 2.121z"
                            fill="currentColor" data-original="#000000"></path>
                        </g>
                      </svg>
                    </span>
                  </button>
                </div>
              </div>
              <div v-if="loading" class="message assistant">
                <div class="message-content loading-content">
                  <div class="loading"></div>
                </div>
              </div>
            </div>
          </NScrollbar>
        </div>

        <div class="chat-input-container">
          <textarea v-model="inputText" :disabled="loading" placeholder="请输入...,enter+ctrl发送"
            @keydown.enter.ctrl="handleSend" class="input" />
          <button :disabled="!inputText.trim() || loading" @click="handleSend" class="chat-button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="input-icon"
              v-if="!loading">
              <path fill-rule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm.53 5.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l1.72-1.72v5.69a.75.75 0 0 0 1.5 0v-5.69l1.72 1.72a.75.75 0 1 0 1.06-1.06l-3-3Z"
                clip-rule="evenodd" />
            </svg>

            <n-spin v-if="loading" size="medium"></n-spin>
          </button>
        </div>
      </div>
    </div>
  </n-layout>
</template>


<style scoped lang="scss">
.chat-container {
  height: 100vh;
  display: flex;
  flex-direction: row;
  margin: 0 auto;
}

.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-right: 48px;
  margin-left: 48px;
}

.chat-header {
  text-align: center;
  position: relative;
  padding: 20px 0;

  .round {
    position: relative;
    border-radius: 20px;
    padding: 16px 32px;
    background: linear-gradient(135deg,
        rgba(255, 255, 255, 0.6) 0%,
        rgba(255, 255, 255, 0.2) 50%,
        rgba(255, 255, 255, 0.4) 100%);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.5);
    box-shadow:
      0 8px 32px rgba(79, 109, 245, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.8),
      inset 0 -1px 0 rgba(255, 255, 255, 0.2);
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg,
          transparent,
          rgba(255, 255, 255, 0.4),
          transparent);
      animation: shimmer 3s infinite;
    }
  }

  h1 {
    position: relative;
    font-size: 26px;
    font-weight: 700;
    background: linear-gradient(135deg, #1a1a2e 0%, #4f6df5 50%, #6b8aff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .subtitle {
    position: relative;
    font-size: 14px;
    font-weight: 400;
    margin-top: 6px;
    color: #666;
  }

  .header-right {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .theme-toggle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.1);
    background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%);
    cursor: pointer;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

    &:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(79, 109, 245, 0.15);
    }
  }

  .model-select {
    padding: 10px 36px 10px 14px;
    border-radius: 10px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%);
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: #1a1a2e;
    outline: none;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    transition: all 0.25s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

    &:hover {
      border-color: #4f6df5;
      box-shadow: 0 4px 12px rgba(79, 109, 245, 0.15);
    }

    &:focus {
      border-color: #4f6df5;
      box-shadow: 0 0 0 3px rgba(79, 109, 245, 0.12);
    }

    option {
      padding: 10px;
      background: #fff;
      color: #333;
    }
  }
}

.chat-message-container {
  flex: 1;
  overflow: hidden;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px 0;

  .message-list {
    padding: 0 20px;
  }
}

.message {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 20px;
  position: relative;
  transition: all 0.4s;

  &.user {
    flex-direction: row;
    justify-content: flex-end;

    .message-content {
      position: relative;
      background: linear-gradient(135deg,
          rgba(255, 255, 255, 0.4) 0%,
          rgba(255, 255, 255, 0.1) 50%,
          rgba(255, 255, 255, 0.3) 100%);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.5);
      border-radius: 20px;
      box-shadow:
        0 8px 32px rgba(40, 97, 255, 0.612),
        inset 0 1px 0 rgba(255, 255, 255, 0.6),
        inset 0 -1px 0 rgba(255, 255, 255, 0.1);

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 50%;
        background: linear-gradient(to bottom, rgba(255, 255, 255, 0.3), transparent);
        border-radius: 20px 20px 0 0;
        pointer-events: none;
      }
    }
  }
}

.message-content {
  border-radius: 18px;
  line-height: 1.6;
  word-break: break-word;
  padding: 12px 30px;
  font-size: 16px;
}

.loading-content {
  min-width: 60px;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }

  100% {
    left: 100%;
  }
}

.loading {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  animation: spin 2s linear infinite;
}

.loading::after {
  content: "";
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  border-radius: 50%;
  box-shadow: inset 0px 0px 12px #0099ff;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.chat-input-container {
  width: 100%;
  margin: 0 auto;
  margin-bottom: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to bottom, rgb(227, 213, 255), rgb(255, 231, 231));
  box-shadow: 0 4px 10px rgba(0, 0, 0, .02), 0 2px 4px rgba(0, 0, 0, 0.25);
  border-radius: 30px;
  padding: 3px;
}

.input {
  overflow: hidden;
  flex: 1;
  line-height: 1.6;
  letter-spacing: 0.5px;
  padding: 12px 20px;
  border-radius: 30px;
  outline: none;
  border: none;
  font-size: 18px;
  grid-column: 1 / 3;
  grid-row: 1 / 3;

  &:disabled {
    cursor: not-allowed;
  }
}

.chat-button {
  border-radius: 50px;
  border: 1px solid #eee;
  outline: none;
  color: rgba(0, 72, 255, 0.643);
  background-color: #fff;
  width: 50px;
  height: 50px;
  cursor: pointer;
  grid-row: 1 / 3;
  grid-column: 2 / 3;
  justify-self: flex-end;
}

.input-icon {
  display: inline-block;
  width: 50px;
  height: 50px;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
}
</style>

<!-- 暗色主题样式 -->
<style lang="scss">
.dark {
  .chat-container {
    background-color: #1a1a1a;
  }

  .chat-content {
    background-color: #1a1a1a;
  }

  .chat-header {
    .round {
      background: linear-gradient(135deg,
          rgba(60, 60, 60, 0.6) 0%,
          rgba(60, 60, 60, 0.2) 50%,
          rgba(60, 60, 60, 0.4) 100%);
      border: 1px solid rgba(100, 100, 100, 0.5);

      h1 {
        background: linear-gradient(135deg, #ffffff 0%, #6b8aff 50%, #a0b4ff 100%);
        -webkit-background-clip: text;
        background-clip: text;
      }

      .subtitle {
        color: #999;
      }
    }
  }

  .message-content {
    background: linear-gradient(135deg,
        rgba(60, 60, 80, 0.4) 0%,
        rgba(60, 60, 80, 0.1) 50%,
        rgba(60, 60, 80, 0.3) 100%);
    border: 1px solid rgba(100, 100, 100, 0.5);
    color: #e0e0e0;
  }

  .model-select {
    background: linear-gradient(135deg, #2a2a3a 0%, #2a2a3a 100%);
    border: 1px solid rgba(100, 100, 100, 0.3);
    color: #e0e0e0;

    option {
      background: #2a2a2a;
      color: #e0e0e0;
    }
  }

  .theme-toggle {
    background: linear-gradient(135deg, #2a2a3a 0%, #2a2a3a 100%);
    border: 1px solid rgba(100, 100, 100, 0.3);
  }

  .input {
    background: #2a2a2a;
    color: #e0e0e0;

    &::placeholder {
      color: #666;
    }
  }

  .chat-input-container {
    background: linear-gradient(to bottom, #2a2a3a, #2a2a3a);
  }

  .chat-button {
    background-color: #2a2a2a;
    border: 1px solid rgba(100, 100, 100, 0.3);
    color: #6b8aff;
  }
}




//这里复制按钮的css
/* From Uiverse.io by Juanes200122 */
/* tooltip settings 👇 */

.copy {
  /* button */
  --button-bg: #ffffff;
  --button-hover-bg: #464646;
  --button-text-color: #474747;
  --button-hover-text-color: #8bb9fe;
  --button-border-radius: 10px;
  --button-diameter: 36px;
  --button-outline-width: 1px;
  --button-outline-color: rgb(141, 141, 141);
  /* tooltip */
  --tooltip-bg: #f4f3f3;
  --toolptip-border-radius: 4px;
  --tooltip-font-family: Menlo, Roboto Mono, monospace;
  /* 👆 this field should not be empty */
  --tooltip-font-size: 12px;
  /* 👆 this field should not be empty */
  --tootip-text-color: rgb(50, 50, 50);
  --tooltip-padding-x: 7px;
  --tooltip-padding-y: 7px;
  --tooltip-offset: 8px;
  /* --tooltip-transition-duration: 0.3s; */
  /* 👆 if you need a transition, 
  just remove the comment,
  but I didn't like the transition :| */
}

.copy {
  box-sizing: border-box;
  width: var(--button-diameter);
  height: var(--button-diameter);
  border-radius: var(--button-border-radius);
  background-color: var(--button-bg);
  color: var(--button-text-color);
  border: none;
  cursor: pointer;
  position: relative;
  outline: none;
  margin-top: 20px;
}

.tooltip {
  position: absolute;
  opacity: 0;
  visibility: 0;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  font: var(--tooltip-font-size) var(--tooltip-font-family);
  color: var(--tootip-text-color);
  background: var(--tooltip-bg);
  padding: var(--tooltip-padding-y) var(--tooltip-padding-x);
  border-radius: var(--toolptip-border-radius);
  pointer-events: none;
  transition: all var(--tooltip-transition-duration) cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.tooltip::before {
  content: attr(data-text-initial);
}

.tooltip::after {
  content: "";
  position: absolute;
  bottom: calc(var(--tooltip-padding-y) / 2 * -1);
  width: var(--tooltip-padding-y);
  height: var(--tooltip-padding-y);
  background: inherit;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  z-index: -999;
  pointer-events: none;
}

.copy svg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.checkmark {
  display: none;
}

/* actions */

.copy:hover .tooltip,
.copy:focus:not(:focus-visible) .tooltip {
  opacity: 1;
  visibility: visible;
  top: calc((100% + var(--tooltip-offset)) * -1);
}

.copy:focus:not(:focus-visible) .tooltip::before {
  content: attr(data-text-end);
}

.copy:focus:not(:focus-visible) .clipboard {
  display: none;
}

.copy:focus:not(:focus-visible) .checkmark {
  display: block;
}

.copy:hover,
.copy:focus {
  background-color: var(--button-hover-bg);
}

.copy:active {
  outline: var(--button-outline-width) solid var(--button-outline-color);
}

.copy:hover svg {
  color: var(--button-hover-text-color);
}
</style>

<style>
::-webkit-scrollbar {
  display: none;
}
</style>