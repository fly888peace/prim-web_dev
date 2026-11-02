// 页脚年份：给 <span id="year"> 填上当前年份
export function initYear() {
  var el = document.getElementById("year");
  if (!el) return;
  el.textContent = new Date().getFullYear();
}
