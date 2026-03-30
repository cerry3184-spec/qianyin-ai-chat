<script setup lang="ts">
import { computed } from "vue";
import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import katex from "katex";
import "katex/dist/katex.min.css";

interface Props {
  content: string;
}

const props = defineProps<Props>();

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  highlight: (str: string, lang: string) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code class="language-${lang}">${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`;
      } catch { }
    }
    return `<pre class="hljs"><code>${hljs.highlight(str, { language: 'plaintext', ignoreIllegals: true }).value}</code></pre>`;
  }
});

const renderedContent = computed(() => {
  let content = props.content || "";

  content = content.replace(/\$\$([\s\S]*?)\$\$/g, (_, tex) => {
    const trimmed = tex.trim();
    if (trimmed.includes('\\begin') || trimmed.includes('matrix') || trimmed.includes('align')) {
      return `<pre class="latex-block">${trimmed}</pre>`;
    }
    try {
      return katex.renderToString(trimmed, {
        displayMode: true,  // 或 false
        throwOnError: false,
        errorColor: "#666"
      });
    } catch { }
    return `<code class="latex-fallback">$$${trimmed}$$</code>`;
  });

  content = content.replace(/\$([^\$\n]+?)\$/g, (_, tex) => {
    const trimmed = tex.trim();
    if (trimmed.includes('\\begin') || trimmed.includes('matrix')) {
      return `<code>${trimmed}</code>`;
    }
    try {
      return katex.renderToString(trimmed, {
        displayMode: false,
        throwOnError: false,
        errorColor: "#666"
      });

    } catch { }
    return `<code class="latex-fallback">$${trimmed}$$</code>`;
  });

  return md.render(content);
});
</script>

<template>
  <div class="markdown-wrapper" v-html="renderedContent"></div>
</template>

<style scoped lang="scss">
.markdown-wrapper {
  line-height: 1.6;
  word-break: break-word;
}

.markdown-wrapper :deep(pre) {
  background: #1a1a1a;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
}

.markdown-wrapper :deep(code) {
  background: #1a1a1a;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  color: #e5e7eb;
}

.markdown-wrapper :deep(.katex-display) {
  margin: 16px 0;
  overflow-x: auto;
}

.markdown-wrapper :deep(.katex) {
  color: #333333;
}

.markdown-wrapper :deep(.hljs) {
  background: #1a1a1a;
  color: #e5e7eb;
}

.markdown-wrapper :deep(a) {
  color: #e3ecf9;
}

.markdown-wrapper :deep(strong) {
  color: #333333;
}

.markdown-wrapper :deep(em) {
  color: #d1d5db;
}
</style>
