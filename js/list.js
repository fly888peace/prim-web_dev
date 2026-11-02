// 首页：记录条目整组错峰上浮
import { revealGroup } from "./motion.js";

export function initList() {
  revealGroup(".list", ".entry", { y: 22, gap: 120, duration: 820 });
}
