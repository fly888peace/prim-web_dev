import { useEffect, useState } from "react";

/**
 * 一个很小的「路由」：把「当前在哪一页」记在地址栏里，而不是记在内存里。
 *
 * 为什么不用 useState 存页面？因为一刷新就丢了，链接也没法发给别人。
 * 这里用 window.location.pathname 当唯一的数据源：
 *   - 进页面时读一次，决定显示哪一页
 *   - navigate() 改地址栏，同时同步 state，让界面立刻跟着变
 *   - 用户按浏览器前进/后退，popstate 触发，重新读一遍
 *
 * 真实项目里不手搓这个，用 react-router；再往后 Next.js 用「文件夹就是路由」把它替掉。
 */
export function useRoute() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handler = () => setPath(window.location.pathname);
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  function navigate(to) {
    if (to === path) return;
    window.history.pushState({}, "", to);
    setPath(to);
  }

  return { path, navigate };
}
