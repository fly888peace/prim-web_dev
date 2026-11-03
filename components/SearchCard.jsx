"use client";

/**
 * 筛选卡（对应 demo 里的「输入卡」）。
 *
 * 它自己**不存**关键字——存的话，下面那一列记录卡就收不到变化了。
 * 关键字存在 HomePage 里，通过 value / onChange 传进来。
 * 这叫「受控组件」：输入框显示什么完全由父组件说了算。
 */
export default function SearchCard({ value, onChange, count, total }) {
  return (
    <article className="panel panel-half card">
      <p className="section-kicker">筛选</p>
      <h3 className="panel-title">找一篇记录</h3>

      <input
        className="search-input"
        type="search"
        value={value}
        placeholder="输入游戏名，或标题里的几个字"
        aria-label="按关键字筛选记录"
        onChange={(event) => onChange(event.target.value)}
      />

      <p className="panel-note">
        {value.trim() ? `筛选出 ${count} 篇（共 ${total} 篇）` : `共 ${total} 篇记录`}
      </p>
    </article>
  );
}
