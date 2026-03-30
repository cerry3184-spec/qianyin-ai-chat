<script lang="ts" setup>
import { useChatStore } from "@/store/chat";
import { useTheme } from "@/hooks/useTheme";

const createConversation = () => {
  useChatStore().createConversation();
}

const { isDark } = useTheme();
</script>

<template>
  <div class="sidebar-container" :class="{ dark: isDark }">
    <!-- From Uiverse.io by SelfMadeSystem -->
    <button class="btn btn-primary" @click="createConversation">
      <span class="btn-txt">新建对话</span>
      <kbd class="btn-kbd">GO</kbd>
    </button>



    <div class="history-list">
      <div v-for="conv in useChatStore().conversations" :key="conv.id" class="history-item-wrapper"
        :class="{ 'active': conv.id === useChatStore().currentId }">
        <div class="history-item" @click="useChatStore().switchConversation(conv.id)">
          <span class="sidebar-title">{{ conv.title }}</span>
        </div>
        <button class="delete-btn" @click="useChatStore().deleteConversation(conv.id)">
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.sidebar-container {
  flex-direction: column;
  flex-shrink: 0;
  width: 19%;
  height: 100%;
  background-color: rgb(245, 249, 255);
  box-sizing: border-box;
  overflow-y: auto;
  display: flex;
  align-items: center;
}

.btn {
  margin: 3rem 0.5rem;
  padding: 0.8rem 1.5rem;
  border-radius: 1.2rem;
  border: none;
  font-weight: 600;
  font-size: 20px;
  width: 75%;
  cursor: pointer;
}

.btn kbd {
  margin: 0.25rem;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
}

.btn-primary {
  background: linear-gradient(#1f5afe, #0f4cf5);
  color: white;
  box-shadow: inset 0pt 4pt 3pt -2pt #386fff, 0pt 4pt 5pt -3pt #0009;
  border-bottom: 2pt solid #083acd;
  transition: all 0.5s ease;
}

.btn-primary:hover {
  border-bottom: 4pt solid #083acd;
  translate: 0pt -1pt;
}

.btn-primary:active {
  box-shadow: inset 0pt 4pt 3pt -2pt #386fff, 0pt 4pt 5pt -3pt #0000;
  border-bottom: 1pt solid #083acd;
  translate: 0pt 0pt;
}

.btn-primary kbd {
  background-color: #3e6eff;
  box-shadow: inset 0pt -3pt 3pt -2pt #1f54f0, inset 0pt 3pt 3pt -2pt #658dff,
    0pt 2pt 2pt -2pt #0005, 0pt 0pt 0pt 2pt #0d47f0;
}

.btn-base {
  background: #386fff;
}

.delete-btn {
  display: inline-block;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
}


.history-list {
  flex: 1;
  overflow-y: auto;
  box-sizing: border-box;
  display: flex;
  width: 75%;
  flex-direction: column;
  align-items: center;
}

.history-item-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  margin: 8px 0;
  gap: 8px;
}

.history-item {
  flex: 1;
  cursor: pointer;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  border-radius: 12px;
  background: #7dfff6;
  transition: all 0.2s ease;
}

.history-item:hover {
  background: #e8e8e8;
}

.history-item-wrapper.active .history-item {
  background: linear-gradient(135deg, #4e6df5 0%, #3ee9dd 100%);
  color: white;
}

.delete-btn {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: white;
  color: #999;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
}

.delete-btn:hover {
  background: #ff4d4f;
  border-color: #ff4d4f;
  color: white;
}
</style>

<!-- 暗色主题样式 -->
<style lang="scss">
.dark {
  .sidebar-container {
    background-color: #0d0d0d;
    border-right: 1px solid rgba(80, 80, 100, 0.2);
  }

  .btn-primary {
    background: linear-gradient(135deg, #4f6df5 0%, #3a5ae5 100%);
    box-shadow: 
      inset 0 2px 4px rgba(120, 130, 255, 0.3),
      0 4px 12px rgba(0, 0, 0, 0.4);
    border-bottom: 2pt solid #2a4acd;

    &:hover {
      border-bottom: 4pt solid #2a4acd;
    }
  }

  .history-item {
    background: linear-gradient(135deg, #1e1e28 0%, #252530 100%);
    color: #d8d8e8;
    border: 1px solid rgba(80, 80, 100, 0.2);
  }

  .history-item:hover {
    background: linear-gradient(135deg, #2a2a3a 0%, #323240 100%);
    border-color: rgba(100, 100, 140, 0.3);
  }

  .history-item-wrapper.active .history-item {
    background: linear-gradient(135deg, #4e6df5 0%, #3a5ce5 100%);
    color: #ffffff;
    border-color: rgba(120, 130, 255, 0.4);
    box-shadow: 0 4px 12px rgba(79, 109, 245, 0.3);
  }

  .delete-btn {
    background: #1e1e28;
    border: 1px solid rgba(80, 80, 100, 0.25);
    color: #8888a0;

    &:hover {
      background: #ff4d4f;
      border-color: #ff4d4f;
      color: #ffffff;
    }
  }

  .sidebar-title {
    color: #c8c8d8;
  }
}
</style>
