<script lang="ts" setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '@/store/chat'


const router=useRouter();
const chatStore=useChatStore();

onMounted(()=>{
  chatStore.loadConversation();
})

const handleSelect=(id:string)=>{
  chatStore.switchConversation(id);
  router.push(`/`);
}

const handleDelete=(id:string)=>{
  chatStore.deleteConversation(id);
}
</script>


<template>
  <div class="history-page">
    <div class="history-header">
      <button class="back-btn" @click="router.push('/')">返回</button>
      <h1>对话历史</h1>
    </div>
    <div class="conversation-list">
      <div v-for="conv in chatStore.conversations"
          :key="conv.id"
          class="conversation-item">

          <div class="conv-info"
            @click="handleSelect(conv.id)">
            <h3>{{conv.title}}</h3>
            <p>{{conv.messages.length}}条消息</p>
          </div>

          <n-button type="danger" 
          @click="handleDelete(conv.id)">删除</n-button>
      </div>

    </div>
  </div>
</template>


<style scoped>
.history-page {
  padding: 20px;
}

.history-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.back-btn {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: #fff;
  cursor: pointer;
}

.back-btn:hover {
  background: #f5f5f5;
}

.conversation-item {
  display: flex;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.conversation-item:hover {
  background: #f5f5f5;
}
</style>