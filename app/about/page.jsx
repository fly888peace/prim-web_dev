// app/about/page.jsx → 网站路径 "/about"
// 想加一个新页面？在 app/ 下新建一个文件夹 + page.jsx 就行，不用改任何路由配置。
import AboutView from "../../components/AboutView.jsx";

export default function Page() {
  return <AboutView />;
}
