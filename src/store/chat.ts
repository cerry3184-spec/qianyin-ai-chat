import { defineStore } from "pinia";
import { ref } from "vue";
import type { Message, Conversation } from "@/types/chat";


 async function generateTitleWithAI(content:string):Promise<string>{
  try {
    const response = await fetch(`/api/openai/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + import.meta.env.VITE_LONGCAT_KEY
      },
      body: JSON.stringify({
        model: "LongCat-Flash-Lite",
        messages: [{ 
          role: "user", 
          content: `请为以下对话生成一个简洁的中文标题（不超过20个字符）:\n${content}` 
        }]
      })
    });

    if (!response.ok) throw new Error(`API错误: ${response.status}`);

    const data = await response.json();
    const title = data.choices?.[0]?.message?.content?.trim() || "";
    return title.length > 20 ? title.substring(0, 20) : title;
  } catch {
    return content.length > 20 ? content.substring(0, 20) + '...' : content;
  }
  return '';
}
  


export const useChatStore = defineStore('chat',()=>{
  const messages=ref<Message[]>([]);
  const conversations=ref<Conversation[]>([]);

  const currentId=ref<string|null>(null);
  function loadConversation(){
    const saved = localStorage.getItem('conversations');
    if(saved){
      conversations.value=JSON.parse(saved);
    }
  }

  function saveConversation(){
    localStorage.setItem('conversations',JSON.stringify(conversations.value));
  }

  function createConversation(){
    const id = Date.now().toString();
    conversations.value.unshift({
      id,
      title:'新对话',
      messages:[],
      createdAt:Date.now().toString(),
    })
    currentId.value=id;
    saveConversation();
  }

  function switchConversation(id:string){
    const conv=conversations.value.find((c:Conversation)=>c.id===id);
    if(conv){
      currentId.value=id;
      messages.value=conv.messages;
    }
  }

  function deleteConversation(id:string){
    conversations.value=conversations.value.filter((c:Conversation)=>c.id!==id);
    saveConversation();
  }

  async function addMessage(message:Message){
    messages.value.push(message);
    const conv=conversations.value.find((c:Conversation)=>c.id===currentId.value);
    if(conv){
      conv.messages=[...messages.value];
      if(message.role === 'user' && messages.value.length === 1){
        conv.title=await generateTitleWithAI(message.content);
      }
      saveConversation();
    }


  }

  return{
    messages,
    conversations,
    currentId,
    loadConversation,
    saveConversation,
    createConversation,
    switchConversation,
    deleteConversation,
    addMessage,
  }
})

