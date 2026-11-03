import { site } from "../data/site.js";
import Nav from "./Nav.jsx";
import PageHeading from "./PageHeading.jsx";
import AnimatedCardGrid from "./AnimatedCardGrid.jsx";

// 关于页：结构和首页一样——顶部 hero + 几张卡。
// 纯展示，没有任何交互，所以它是服务端组件，顶上不用 "use client"。
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
