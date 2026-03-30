# 牵引 AI

基于 Vue 3 + TypeScript 的 AI 对话应用，支持多模型切换、流式输出、Markdown 渲染。

## 技术栈

- **框架**：Vue 3.5 + TypeScript 5.9
- **构建**：Vite 7
- **状态管理**：Pinia 3
- **UI 组件**：Naive UI 2
- **样式**：SCSS + UnoCSS
- **Markdown**：markdown-it + highlight.js + KaTeX

## 功能特性

**多模型切换**
内置 6 种模型可选，包括本地 Mock 模式和多种 AI 模型。切换模型后立即生效，无需刷新页面。

**Mock 模式**
本地模拟 AI 回复，支持打字机效果。无需配置 API Key，适合开发调试和演示环境。Mock 响应内容预设了多种前端相关话题。

**流式输出**
AI 回复逐字渲染，模拟真实打字效果。采用回调模式设计，`onChunk` 实时接收内容，API 层与视图层完全解耦。

**Markdown 渲染**
集成 markdown-it 解析器，支持：

- 代码高亮（highlight.js，支持多种编程语言）
- LaTeX 数学公式（KaTeX，支持行内 `$...$` 和块级 `$$...$$`）
- 代码块复制按钮

**暗色主题**
亮/暗模式一键切换，采用 CSS 变量 + 类名切换方案。玻璃态 UI 设计，使用 `backdrop-filter` 实现毛玻璃效果。

**对话持久化**
基于 Pinia + localStorage 实现多会话管理：

- 创建新对话
- 切换历史对话
- 删除对话
- 页面刷新数据不丢失

**AI 生成标题**
首次对话时自动调用 AI 生成简短标题（不超过 20 字），无需手动输入，提升对话列表可读性。

**消息动画**
使用 Vue `TransitionGroup` 实现消息进出动画，新消息从下方渐入，提升交互体验。

## 模型列表

| 模型        | 标识符                         | 需要 API Key | 说明          |
| --------- | --------------------------- | ---------- | ----------- |
| Mock      | mock                        | ❌          | 本地模拟，适合开发测试 |
| 通用对话      | LongCat-Flash-Chat          | ✅          | 标准对话模型      |
| 思考模型      | LongCat-Flash-Thinking      | ✅          | 深度推理        |
| 思考模型 2601 | LongCat-Flash-Thinking-2601 | ✅          | 深度推理增强版     |
| 轻量 MoE    | LongCat-Flash-Lite          | ✅          | 轻量混合专家模型    |
| 多模态       | LongCat-Flash-Omni-2603     | ✅          | 支持图片输入（开发中） |

## 项目结构

```
src/
├── api/
│   └── chat.ts              # API 请求封装，流式回调处理
├── components/
│   ├── MarkdownPreview/
│   │   └── index.vue        # Markdown 渲染组件
│   └── Sidebar/
│       └── index.vue        # 侧边栏组件
├── hooks/
│   ├── useTheme.ts          # 主题切换 Hook
│   └── useVirtualScroll.ts  # 虚拟滚动 Hook（待应用）
├── router/
│   └── index.ts             # 路由配置
├── store/
│   └── chat.ts              # Pinia 状态管理
├── styles/                  # 全局样式
├── types/
│   └── chat.ts              # TypeScript 类型定义
└── views/
    └── chat.vue             # 主页面
```

## 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 8

### 安装运行

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build
```

### 环境变量

创建 `.env` 文件：

```env
VITE_LONGCAT_KEY=your_api_key_here
```

## 如何添加新的 API

### 1. 添加模型配置

在 `src/api/chat.ts` 中的 `modelList` 添加新模型：

```typescript
export const modelList = [
  { id: "mock", name: "Mock (测试)" },
  // ... 现有模型
  { id: "your-new-model", name: "新模型名称" },  // 新增
]
```

### 2. 配置 API 代理

在 `vite.config.ts` 中添加代理：

```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api/openai': {
        target: 'https://your-api-endpoint.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/openai/, '')
      }
    }
  }
})
```

### 3. 修改请求逻辑

在 `src/api/chat.ts` 的 `sendChatMessage` 函数中处理新模型：

```typescript
export async function sendChatMessage(
  content: string,
  model: string,
  options: { onChunk, onDone, onError }
) {
  // Mock 模式
  if (model === 'mock') {
    // ... 现有逻辑
    return
  }

  // 真实 API 调用
  const response = await fetch('/api/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_YOUR_API_KEY}`
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content }]
    })
  })
  // ... 处理响应
}
```

### 4. 添加环境变量

在 `.env` 中添加新的 API Key：

```env
VITE_YOUR_API_KEY=your_api_key_here
```

### 5. 类型定义（可选）

在 `src/types/chat.ts` 中扩展类型：

```typescript
export interface Message {
  role: 'user' | 'assistant'
  content: string
  // 可扩展：timestamp、model 等
}
```

## 实现细节

### 流式响应

```typescript
await sendChatMessage(content, model, {
  onChunk: (text) => {
    lastMessage.content += text  // 实时追加内容
  },
  onDone: () => {
    loading.value = false
    hasEnd.value = true  // 显示复制按钮
  },
  onError: (err) => {
    console.error(err)
  }
})
```

### AI 生成标题

```typescript
async function generateTitleWithAI(content: string): Promise<string> {
  const response = await fetch('/api/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_LONGCAT_KEY}`
    },
    body: JSON.stringify({
      model: 'LongCat-Flash-Lite',
      messages: [{ 
        role: 'user', 
        content: `请为以下对话生成一个简洁的中文标题（不超过20个字符）:\n${content}` 
      }]
    })
  })
  // 返回生成的标题
}
```

### 主题切换

```typescript
const toggleTheme = () => {
  themeMode.value = themeMode.value === 'light' ? 'dark' : 'light'
  document.documentElement.classList.toggle('dark')
}
```

### 对话持久化

MIT
