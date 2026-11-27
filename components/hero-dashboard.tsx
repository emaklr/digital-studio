const stats = [
  {label:"Active projects",value:"03",tone:"blue"},
  {label:"Milestones",value:"12",tone:"violet"},
  {label:"Tasks completed",value:"24",tone:"green"},
  {label:"Project health",value:"On track",tone:"blue"},
];

const activity = [
  {title:"Design direction approved",detail:"Website refresh · Today",tone:"blue"},
  {title:"Milestone marked complete",detail:"Client portal · Yesterday",tone:"green"},
  {title:"New project brief received",detail:"E-commerce store · Yesterday",tone:"violet"},
];

const projects = [
  {name:"E-commerce storefront",detail:"Design and development",progress:72,status:"In progress",tone:"blue"},
  {name:"Client portal",detail:"Requirements and UX",progress:48,status:"In review",tone:"violet"},
];

export default function HeroDashboard() {
  return (
    <section className="hero-dashboard" aria-label="Illustrative software dashboard interface">
      <div className="dashboard-frame">
        <header className="dashboard-topbar">
          <div className="dashboard-brand">
            <span className="dashboard-brand-mark">AB</span>
            <span><strong>ABEEB</strong><small>DIGITAL STUDIO</small></span>
          </div>
          <span className="dashboard-workspace-label">SAMPLE WORKSPACE</span>
          <div className="dashboard-user">
            <span className="dashboard-notification" aria-hidden="true">•</span>
            <span className="dashboard-avatar">AS</span>
            <span className="dashboard-user-name">Studio Admin</span>
          </div>
        </header>

        <div className="dashboard-layout">
          <aside className="dashboard-sidebar" aria-label="Example dashboard navigation">
            <span className="dashboard-sidebar-label">WORKSPACE</span>
            <span className="dashboard-nav-item dashboard-nav-active"><i className="dashboard-nav-icon">⌂</i>Overview</span>
            <span className="dashboard-nav-item"><i className="dashboard-nav-icon">▤</i>Projects</span>
            <span className="dashboard-nav-item"><i className="dashboard-nav-icon">◉</i>Clients</span>
            <span className="dashboard-nav-item"><i className="dashboard-nav-icon">✓</i>Tasks</span>
            <span className="dashboard-nav-item"><i className="dashboard-nav-icon">▧</i>Reports</span>
            <span className="dashboard-sidebar-bottom">SETTINGS</span>
            <span className="dashboard-nav-item"><i className="dashboard-nav-icon">⚙</i>Preferences</span>
          </aside>

          <div className="dashboard-main">
            <div className="dashboard-heading">
              <div><small>WORKSPACE / OVERVIEW</small><h2>Project overview</h2></div>
              <span className="dashboard-range">Last 30 days <b>⌄</b></span>
            </div>

            <div className="dashboard-stats">
              {stats.map((stat)=><div className="dashboard-stat" key={stat.label}>
                <span className={"dashboard-stat-icon stat-"+stat.tone} aria-hidden="true">{stat.tone==="green"?"✓":stat.tone==="violet"?"▦":"◫"}</span>
                <span><small>{stat.label}</small><strong>{stat.value}</strong></span>
              </div>)}
            </div>

            <div className="dashboard-insights">
              <section className="dashboard-chart-card">
                <div className="dashboard-card-heading"><div><strong>Project activity</strong><small>Milestones across active work</small></div><span className="dashboard-live-dot">Live view</span></div>
                <div className="dashboard-chart">
                  <div className="dashboard-chart-y"><span>12</span><span>9</span><span>6</span><span>3</span><span>0</span></div>
                  <svg viewBox="0 0 440 142" role="img" aria-label="Illustrative project activity line chart">
                    <defs><linearGradient id="studio-chart-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1985f6" stopOpacity=".18"/><stop offset="1" stopColor="#1985f6" stopOpacity="0"/></linearGradient></defs>
                    <path d="M0 18H440 M0 48H440 M0 78H440 M0 108H440" className="dashboard-chart-grid"/>
                    <path d="M4 116 C26 109 35 91 61 96 S94 100 116 82 S149 76 174 82 S210 57 235 63 S265 61 288 46 S318 59 345 42 S378 39 402 25 S427 28 436 17 L436 134 L4 134Z" fill="url(#studio-chart-fill)"/>
                    <path d="M4 116 C26 109 35 91 61 96 S94 100 116 82 S149 76 174 82 S210 57 235 63 S265 61 288 46 S318 59 345 42 S378 39 402 25 S427 28 436 17" className="dashboard-chart-line"/>
                    <circle cx="436" cy="17" r="4.5" className="dashboard-chart-point"/>
                  </svg>
                </div>
                <div className="dashboard-chart-x"><span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span></div>
              </section>

              <section className="dashboard-activity-card">
                <div className="dashboard-card-heading"><div><strong>Recent activity</strong><small>Updates from your team</small></div><span className="dashboard-more">•••</span></div>
                <div className="dashboard-activity-list">
                  {activity.map((item)=><div className="dashboard-activity-item" key={item.title}>
                    <span className={"dashboard-activity-marker marker-"+item.tone}>{item.tone==="green"?"✓":item.tone==="violet"?"▦":"•"}</span>
                    <span><strong>{item.title}</strong><small>{item.detail}</small></span>
                  </div>)}
                </div>
              </section>
            </div>

            <section className="dashboard-projects-card">
              <div className="dashboard-card-heading"><div><strong>Active projects</strong><small>A quick view of current work</small></div><span className="dashboard-all-projects">View projects</span></div>
              <div className="dashboard-project-list">
                {projects.map((project)=><div className="dashboard-project-row" key={project.name}>
                  <span className={"dashboard-project-icon project-"+project.tone}>{project.tone==="blue"?"W":"P"}</span>
                  <span className="dashboard-project-name"><strong>{project.name}</strong><small>{project.detail}</small></span>
                  <span className="dashboard-progress"><i style={{width:project.progress+"%"}}/></span>
                  <span className="dashboard-progress-value">{project.progress}%</span>
                  <span className={"dashboard-project-status status-"+project.tone}>{project.status}</span>
                </div>)}
              </div>
            </section>
          </div>
        </div>
      </div>

      <div className="dashboard-workflow-card">
        <div className="dashboard-workflow-heading"><span className="dashboard-workflow-symbol">✓</span><span><strong>Project workflow</strong><small>Keep every milestone moving</small></span></div>
        <div className="dashboard-workflow-step"><span className="workflow-check workflow-done">✓</span><span>Discovery & planning</span><b>Done</b></div>
        <div className="dashboard-workflow-step"><span className="workflow-check workflow-done">✓</span><span>Design direction</span><b>Done</b></div>
        <div className="dashboard-workflow-step"><span className="workflow-check workflow-current">•</span><span>Development</span><b className="workflow-in-progress">In progress</b></div>
        <div className="dashboard-workflow-step"><span className="workflow-check">4</span><span>Testing & launch</span><b className="workflow-pending">Pending</b></div>
      </div>
    </section>
  );
}
