import type { GlobalThemeOverrides } from "naive-ui";
import { ref, computed} from "vue";

// 主色调 - 你可以改成自己喜欢的颜色
const PrimaryColor = "#cbbde9ff";

// 主题类型
export type ThemeMode = 'light' | 'dark';

// 当前主题模式
const themeMode = ref<ThemeMode>('light');

// 基础主题配置
const baseThemeOverrides: GlobalThemeOverrides = {
  common: {
    borderRadius: "6px",
    heightLarge: "40px",
    fontSizeLarge: "18px",
  },
};

/**
 * 主题 hook - 管理亮/暗主题切换
 */
export function useTheme() {

  const toggleTheme = () => {
    themeMode.value = themeMode.value === 'light' ? 'dark' : 'light';

    if (themeMode.value === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // 设置主题
  const setTheme = (mode: ThemeMode) => {
    themeMode.value = mode;
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // 判断是否是暗色主题
  const isDark = computed(() => themeMode.value === 'dark');

  // 计算主题覆盖配置
  const themeOverrides = computed<GlobalThemeOverrides>(() => {
    const primaryColor = PrimaryColor;
    const primaryColorHover = lightenDarkenColor(PrimaryColor, 30);
    const primaryColorPressed = lightenDarkenColor(PrimaryColor, -30);

    return {
      common: {
        ...baseThemeOverrides.common,
        primaryColor,
        primaryColorHover,
        primaryColorPressed,
        primaryColorSuppl: getComplementaryColor(PrimaryColor),
      },
    };
  });

  // 暗色主题覆盖配置
  const darkThemeOverrides = computed<GlobalThemeOverrides>(() => {
    return {
      ...themeOverrides.value,
      common: {
        ...themeOverrides.value.common,
        // 暗色主题的背景色
        bodyColor: '#1a1a1a',
        cardColor: '#2a2a2a',
        modalColor: '#2a2a2a',
        popoverColor: '#2a2a2a',
        tableColor: '#2a2a2a',
        inputColor: '#2a2a2a',
        actionColor: '#2a2a2a',
        borderColor: '#3a3a3a',
        dividerColor: '#3a3a3a',
        // 暗色主题的文字颜色
        textColorBase: '#ffffff',
        textColor1: '#ffffff',
        textColor2: '#cccccc',
        textColor3: '#999999',
      },
    };
  });

  return {
    themeMode,
    isDark,
    toggleTheme,
    setTheme,
    themeOverrides,
    darkThemeOverrides,
  };
}

/**
 * 调整颜色亮度
 */
function lightenDarkenColor(col: string, amt: number): string {
  let usePound = false;
  if (col[0] === "#") {
    col = col.slice(1);
    usePound = true;
  }

  const num = parseInt(col, 16);

  let r = (num >> 16) + amt;
  r = Math.max(0, Math.min(255, r));

  let g = ((num >> 8) & 0x00ff) + amt;
  g = Math.max(0, Math.min(255, g));

  let b = (num & 0x0000ff) + amt;
  b = Math.max(0, Math.min(255, b));

  const rHex = r.toString(16).padStart(2, "0");
  const gHex = g.toString(16).padStart(2, "0");
  const bHex = b.toString(16).padStart(2, "0");

  return (usePound ? "#" : "") + rHex + gHex + bHex;
}

/**
 * 获取互补色
 */
function getComplementaryColor(hex: string): string {
  hex = hex.slice(1);

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const compR = (255 - r).toString(16).padStart(2, "0");
  const compG = (255 - g).toString(16).padStart(2, "0");
  const compB = (255 - b).toString(16).padStart(2, "0");

  return `#${compR}${compG}${compB}`;
}