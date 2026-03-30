
export interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export interface ChatParams {
  model: string
  messages: ChatMessage[]
  temperature?: number
  top_p?: number
  presence_penalty?: number
  frequency_penalty?: number
}

const mockResponses = [
  "你好！我是 AI 助手，有什么可以帮助你的吗？",
  "这是一个模拟的响应，用于测试聊天功能。",
  "Vue 3 使用 Composition API 让代码组织更灵活。",
  "Pinia 是 Vue 3 的状态管理库，比 Vuex 更轻量。",
  "很高兴和你聊天！有什么技术问题想要了解吗？",
  "学习前端开发需要多练习，多动手写代码。",
  "HTTP 协议是前后端通信的基础。",
  "TypeScript 为 JavaScript 提供了类型系统。",
  "其实我觉得这里的东西还是方便，但是未来ai会不会直接变成随想随用的东西呢，不知道，不好说"
];

export const modelList = [
  { id: "mock", name: "Mock (测试)" },
  { id: "LongCat-Flash-Chat", name: "通用对话" },
  { id: "LongCat-Flash-Thinking", name: "LongCat-Flash-Thinking" },
  { id: "LongCat-Flash-Thinking-2601", name: "LongCat-Flash-Thinking-2601" },
  { id: "LongCat-Flash-Lite", name: "轻量MoE" },
  { id: "LongCat-Flash-Omni-2603", name: "多模态，目前不可用" },
]

function getMockContent(): string {
  const index = Math.floor(Math.random() * mockResponses.length);
  return mockResponses[index] || mockResponses[0]!;
}

export async function sendChatMessage(
  content: string,
  model: string = "mock",
  options: {
    onChunk?: (text: string) => void
    onDone?: () => void
    onError?: (error: Error) => void
  } = {}
) {
  const { onChunk, onDone, onError } = options

  if (model === 'mock') {
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))

    const mockText = getMockContent()
    const chunks = mockText.match(/.{1,3}/g) || [mockText]

    for (const chunk of chunks) {
      await new Promise(resolve => setTimeout(resolve, 30))
      onChunk?.(chunk)
    }

    onDone?.()
    return
  }

  try {
    const response = await fetch(`/api/openai/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + import.meta.env.VITE_LONGCAT_KEY
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "user", content: content }]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      onError?.(new Error(`API错误: ${response.status} - ${errorText}`))
      return
    }

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content

    if (reply) {
      for (const char of reply) {
        await new Promise(resolve => setTimeout(resolve, 20))
        onChunk?.(char)
      }
    }

    onDone?.()
  } catch (error) {
    onError?.(error as Error)
  }
}