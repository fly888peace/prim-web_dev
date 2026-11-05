import { site } from "../data/site.js";
import Nav from "./Nav.jsx";
import PageHeading from "./PageHeading.jsx";
import AnimatedCardGrid from "./AnimatedCardGrid.jsx";
import TryCard from "./TryCard.jsx";

// 关于页：结构和首页一样——顶部 hero + 几张卡。
// 它自己仍然是服务端组件；TryCard 是客户端组件（要发请求），
// 服务端组件里放客户端组件是允许的，反过来才需要 "use client"。
export default function AboutView() {
  return (
    <AnimatedCardGrid className="dashboard-grid">
      <article className="hero-stage panel-full">
        <Nav />
        <PageHeading title={site.about.title} subtitle={site.about.subtitle} />
      </article>

      <article className="panel panel-full card about-panel">
        <p className="section-kicker">这个站</p>
        <p className="about-lead">{site.about.intro}</p>
      </article>

      <TryCard />

      <article className="panel panel-half card about-panel">
        <p className="section-kicker">规矩</p>
        <ul className="about-list">
          {site.about.notes.map((note, index) => (
            <li key={index}>{note}</li>
          ))}
        </ul>
      </article>

      <article className="panel panel-half card about-panel">
        <p className="section-kicker">技术</p>
        <p className="about-copy">{site.about.colophon}</p>
      </article>
    </AnimatedCardGrid>
  );
}
