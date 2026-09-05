import { createRouter, createWebHistory } from "vue-router";
import Chat from "../views/chat.vue";

// 路由配置
const routes = [
  {
    path: "/",
    name: "Chat",
    component: Chat,
  },
  {
    path: "/history",
    name: "History",
    component: () => import("../views/history.vue"),
  }
];

// 创建路由实例
const router = createRouter({
  history: createWebHistory(), // 使用 HTML5 History 模式
  routes,
});

// 导出路由
export default router;
