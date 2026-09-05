import { defineConfig, presetUno, presetIcons } from "unocss";

export default defineConfig({
  // 预设
  presets: [
    // UnoCSS 的核心预设
    presetUno(),
    // 图标预设
    presetIcons({
      scale: 1.2,
      // 使用 CDN 加载图标
      cdn: "https://esm.sh/",
    }),
  ],
});
