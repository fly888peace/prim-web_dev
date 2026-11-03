// 页脚：年份直接算，不再需要 js/year.js 去 getElementById 找 span 再填字。
export default function Footer() {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} 游戏记录</p>
    </footer>
  );
}
