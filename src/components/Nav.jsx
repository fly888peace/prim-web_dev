import { site } from "../data/site.js";

/**
 * 顶部横条：左边品牌，右边导航。
 *
 * 两个页面共用这一个组件，靠 props 知道「现在在哪一页」：
 *   current    —— 当前页的 key，用来给对应链接加高亮
 *   onNavigate —— 点了链接要干什么，由上层决定（上层去改地址栏）
 *
 * 自己不知道自己该跳到哪，只负责把用户点了哪个 key 报上去。
 */
export default function Nav({ current, onNavigate }) {
  return (
    <div className="hero-topline">
      <p className="brand-eyebrow">{site.brand}</p>

      <nav className="inline-links">
        {site.nav.map((item) => (
          <a
            key={item.key}
            href={item.path}
            className={"nav-link" + (current === item.key ? " active" : "")}
            onClick={(event) => {
              event.preventDefault();
              onNavigate(item.path);
            }}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
