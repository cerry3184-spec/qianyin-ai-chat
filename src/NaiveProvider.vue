<script setup lang="ts">
import { computed } from "vue";
import { NConfigProvider, NMessageProvider, NDialogProvider, darkTheme } from "naive-ui";
import { useTheme } from "./hooks/useTheme";

const { themeOverrides, darkThemeOverrides, isDark } = useTheme();

// 根据主题选择对应的 overrides
const currentThemeOverrides = computed(() => {
  return isDark.value ? darkThemeOverrides.value : themeOverrides.value;
});
</script>

<template>
  <!-- 使用 :theme 切换亮/暗主题，:theme-overrides 切换主题颜色 -->
  <NConfigProvider :theme="isDark ? darkTheme : null" :theme-overrides="currentThemeOverrides">
    <NMessageProvider>
      <NDialogProvider>
        <router-view />
      </NDialogProvider>
    </NMessageProvider>
  </NConfigProvider>
</template>