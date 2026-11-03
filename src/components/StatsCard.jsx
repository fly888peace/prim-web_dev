/**
 * 统计卡（对应 demo 里的「结果卡」）。
 * 数字全部从 posts 数据里算出来，不是写死的——
 * 加一篇记录，这里的数字会自己变。
 */
export default function StatsCard({ total, games, latest }) {
  return (
    <article className="panel panel-half card">
      <p className="section-kicker">统计</p>
      <h3 className="panel-title">一共记了多少</h3>

      <div className="stats-grid">
        <div className="stats-item">
          <span>记录</span>
          <strong>{total}</strong>
        </div>
        <div className="stats-item">
          <span>游戏</span>
          <strong>{games}</strong>
        </div>
        <div className="stats-item">
          <span>最近更新</span>
          <strong className="stats-date">{latest}</strong>
        </div>
      </div>
    </article>
  );
}
