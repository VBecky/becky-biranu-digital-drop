import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import beckyPortrait from "@/assets/becky-portrait.png.asset.json";
import { blogStore, type BlogPost } from "@/lib/blog-store";




export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Becky Biranu — Creative Developer & Video Editor" },
      {
        name: "description",
        content:
          "Portfolio of Becky Biranu — a creative developer crafting futuristic, immersive digital experiences with liquid UI and motion design.",
      },
      { property: "og:title", content: "Becky Biranu — Creative Developer" },
      {
        property: "og:description",
        content: "Futuristic portfolio with liquid water-drop UI, glassmorphism and motion.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  useEffect(() => {
    // ===== Particles =====
    const canvas = document.getElementById("bg-canvas") as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const particles: { x: number; y: number; vx: number; vy: number; r: number }[] = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.8 + 0.4,
      });
    }
    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
        g.addColorStop(0, "rgba(120,220,255,0.9)");
        g.addColorStop(1, "rgba(120,220,255,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
        ctx.fill();
      }
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.hypot(dx, dy);
          if (d < 120) {
            ctx.strokeStyle = `rgba(120,220,255,${0.12 * (1 - d / 120)})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    // ===== Custom cursor =====
    const cursor = document.getElementById("cursor")!;
    const cursorDot = document.getElementById("cursor-dot")!;
    let mx = 0,
      my = 0,
      cx = 0,
      cy = 0;
    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      cursorDot.style.transform = `translate(${mx - 3}px, ${my - 3}px)`;
    };
    window.addEventListener("mousemove", onMove);
    const tick = () => {
      cx += (mx - cx) * 0.15;
      cy += (my - cy) * 0.15;
      cursor.style.transform = `translate(${cx - 20}px, ${cy - 20}px)`;
      requestAnimationFrame(tick);
    };
    tick();

    // ===== Water drop ripple =====
    document.querySelectorAll<HTMLElement>(".drop-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const rect = btn.getBoundingClientRect();
        const ripple = document.createElement("span");
        ripple.className = "ripple";
        const size = Math.max(rect.width, rect.height) * 1.8;
        ripple.style.width = ripple.style.height = size + "px";
        ripple.style.left = (e as MouseEvent).clientX - rect.left - size / 2 + "px";
        ripple.style.top = (e as MouseEvent).clientY - rect.top - size / 2 + "px";
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 800);
      });
    });

    // ===== Scroll reveals =====
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) en.target.classList.add("in");
        });
      },
      { threshold: 0.12 },
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

    // ===== Tilt =====
    document.querySelectorAll<HTMLElement>(".tilt").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${px * 10}deg) rotateX(${-py * 10}deg) translateY(-4px)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });

    // ===== Smooth anchor nav =====
    document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href")!.slice(1);
        const el = document.getElementById(id);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });

    // ===== Theme toggle =====
    const themeBtn = document.getElementById("theme-toggle");
    themeBtn?.addEventListener("click", () => {
      document.body.classList.toggle("light");
    });

    // ===== Project modal =====
    const modal = document.getElementById("project-modal")!;
    const modalBody = document.getElementById("modal-body")!;
    document.querySelectorAll<HTMLElement>(".project-card").forEach((card) => {
      card.addEventListener("click", () => {
        modalBody.innerHTML = `
          <h3>${card.dataset.title}</h3>
          <p class="tech">${card.dataset.tech}</p>
          <p>${card.dataset.full}</p>
        `;
        modal.classList.add("open");
      });
    });
    document.getElementById("modal-close")?.addEventListener("click", () => modal.classList.remove("open"));
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("open");
    });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      io.disconnect();
    };
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <div id="cursor" />
      <div id="cursor-dot" />
      <canvas id="bg-canvas" />

      <nav className="nav glass">
        <div className="logo">BB<span>.</span></div>
        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#projects">Projects</a>
          <a href="#blog">Blog</a>
          <a href="#contact">Contact</a>
        </div>
        <button id="theme-toggle" className="theme-toggle" aria-label="Toggle theme">◐</button>
      </nav>

      {/* HERO */}
      <section id="home" className="hero">
        <div className="hero-inner">
          <div className="badge reveal">● Available for work — 2026</div>
          <h1 className="hero-title reveal">
            Hi, I'm <span className="grad">Becky Biranu</span>
          </h1>
          <p className="hero-sub reveal">Creative Developer & Video Editor</p>
          <p className="hero-desc reveal">
            I build responsive, functional web applications using modern technologies. I focus on creating clean, efficient, and user-friendly digital experiences.
          </p>
          <div className="hero-ctas reveal">
            <a href="#projects" className="drop-btn primary">View Projects</a>
            <a href="#contact" className="drop-btn ghost">Contact Me</a>
          </div>
        </div>
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="scroll-hint">scroll ↓</div>
      </section>

      {/* ABOUT */}
      <section id="about" className="section">
        <div className="section-head reveal">
          <span className="kicker">01 / About</span>
          <h2>A developer obsessed with detail.</h2>
        </div>
        <div className="about-layout">
          <div className="portrait-wrap reveal tilt">
            <div className="portrait-frame">
              <img
                src={beckyPortrait.url}
                alt="Portrait of Becky Biranu"
                className="portrait-img"
                width={1024}
                height={1024}
                loading="lazy"
              />
              <span className="portrait-glow" />
              <span className="portrait-ring" />
              <div className="portrait-badge glass">
                <span className="pulse-dot" />
                Available for Q1 2026
              </div>
            </div>
          </div>
          <div className="about-right">
            <div className="glass card bio reveal">
              <p>
                Hi, I'm <strong>Becky</strong> — a frontend and backend developer. I build responsive, user-focused web applications using HTML, CSS, JavaScript, PHP, MySQL, and Python. I work across both frontend and backend development, creating complete, functional websites with clean interfaces and reliable server-side logic.
              </p>
              <p>
                My focus is on building practical, efficient, and maintainable web solutions. I enjoy turning ideas into working products, from simple websites to database-driven applications. I'm currently looking for freelance opportunities and full-time roles where I can contribute, grow my skills, and work on real-world projects.
              </p>
            </div>
            <div className="skills-grid">
              {[
                { t: "Frontend", v: 85, d: "HTML · CSS · JavaScript" },
                { t: "Backend", v: 80, d: "Python · SQL" },
                { t: "Automation", v: 78, d: "Selenium · WebScraping" },
              ].map((s) => (
                <div key={s.t} className="glass card skill tilt reveal">
                  <Ring value={s.v} />
                  <h4>{s.t}</h4>
                  <p>{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section id="projects" className="section">
        <div className="section-head reveal">
          <span className="kicker">02 / Selected work</span>
          <h2>Projects that move.</h2>
        </div>
        <div className="projects-grid">
          {PROJECTS.map((p: any, i) => (
            <article
              key={p.title}
              className="glass project-card tilt reveal"
              data-title={p.title}
              data-tech={p.tech}
              data-full={p.full}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="thumb" style={{ background: p.bg }}>
                <span className="thumb-glow" />
                {p.live ? (
                  <iframe
                    src={p.live}
                    title={p.title}
                    className="thumb-live"
                    loading="lazy"
                    sandbox="allow-scripts allow-same-origin"
                  />
                ) : p.img ? (
                  <img src={p.img} alt={p.title} loading="lazy" className="thumb-img" />
                ) : (
                  <span className="thumb-num">0{i + 1}</span>
                )}
              </div>
              <div className="project-meta">
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
                <div className="tags">
                  {p.tech.split(" · ").map((t: string) => (
                    <span key={t} className="tag">{t}</span>
                  ))}
                </div>
                {(p.link || p.live) && (
                  <div className="project-links">
                    {p.link && (
                      <a href={p.link} target="_blank" rel="noreferrer" className="project-link" onClick={(e) => e.stopPropagation()}>
                        <span>GitHub</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M9 7h8v8"/></svg>
                      </a>
                    )}
                    {p.live && (
                      <a href={p.live} target="_blank" rel="noreferrer" className="project-link" onClick={(e) => e.stopPropagation()}>
                        <span>Live</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M9 7h8v8"/></svg>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* BLOG */}
      <BlogSection />


      {/* CONTACT */}
      <section id="contact" className="section contact">
        <div className="section-head reveal center">
          <span className="kicker">04 / Contact</span>
          <h2>Let's build something <span className="grad">luminous</span>.</h2>
        </div>
        <form
          className="glass contact-form reveal"
          onSubmit={(e) => {
            e.preventDefault();
            const btn = e.currentTarget.querySelector(".drop-btn") as HTMLElement;
            btn.textContent = "Sent ✓";
            (e.currentTarget as HTMLFormElement).reset();
            setTimeout(() => (btn.textContent = "Send Message"), 2200);
          }}
        >
          <div className="row">
            <label>
              <span>Name</span>
              <input required type="text" placeholder="Your name" />
            </label>
            <label>
              <span>Email</span>
              <input required type="email" placeholder="you@domain.com" />
            </label>
          </div>
          <label>
            <span>Message</span>
            <textarea required rows={5} placeholder="Tell me about your project…" />
          </label>
          <button className="drop-btn primary" type="submit">Send Message</button>
        </form>
        <div className="socials reveal">
          {[
            { n: "GitHub", h: "https://github.com/VBecky/" },
            { n: "LinkedIn", h: "https://et.linkedin.com/in/bekuma-biranu-470bab2b1" },
            { n: "Email", h: "mailto:bekumabiranu978@gmail.com" },
          ].map((s) => (
            <a key={s.n} href={s.h} className="social glass">{s.n}</a>
          ))}
        </div>
      </section>

      <footer className="footer">
        <span>© 2026 Becky Biranu</span>
        <span>Designed & built with obsession.</span>
      </footer>

      {/* Modal */}
      <div id="project-modal" className="modal">
        <div className="modal-inner glass">
          <button id="modal-close" className="modal-close">×</button>
          <div id="modal-body" />
        </div>
      </div>
    </>
  );
}

function Ring({ value }: { value: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  return (
    <svg className="ring" width="72" height="72" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r={r} className="ring-bg" />
      <circle
        cx="36"
        cy="36"
        r={r}
        className="ring-fg"
        strokeDasharray={c}
        strokeDashoffset={off}
        transform="rotate(-90 36 36)"
      />
      <text x="36" y="41" textAnchor="middle" className="ring-text">{value}</text>
    </svg>
  );
}

import projBanking from "@/assets/proj-banking.jpg";
import projEncrypt from "@/assets/proj-encrypt.jpg";
import projPortfolio from "@/assets/proj-portfolio.jpg";
import projExpense from "@/assets/proj-expense.jpg";
import projStudentDashboard from "@/assets/proj-student-dashboard.jpg";
import projQuiz from "@/assets/proj-quiz.jpg";

const PROJECTS = [
  {
    title: "Banking System",
    desc: "Tkinter desktop banking app with secure accounts.",
    tech: "Python · Tkinter · SQLite",
    full: "A full-featured desktop banking system built in Python with Tkinter. Handles account creation, deposits, withdrawals, transfers and transaction history with a clean, focused GUI.",
    bg: "linear-gradient(135deg,#0ea5e9,#6366f1,#a855f7)",
    img: projBanking,
    link: "https://github.com/VBecky/banking-system",
  },
  {
    title: "Encrypt / Decrypt File",
    desc: "Tkinter file encryptor with strong symmetric crypto.",
    tech: "Python · Tkinter · Cryptography",
    full: "A desktop file encryption tool built with Python and Tkinter. Encrypts and decrypts any file format with a generated key, wrapped in a minimal, security-first interface.",
    bg: "linear-gradient(135deg,#10b981,#22d3ee,#0ea5e9)",
    img: projEncrypt,
    link: "https://github.com/VBecky/File-encryptor",
  },
  {
    title: "Portfolio",
    desc: "Personal developer portfolio — live on the web.",
    tech: "HTML · CSS · JavaScript",
    full: "A personal portfolio website showcasing projects, skills and journey. Built from scratch with vanilla HTML, CSS and JavaScript — embedded live below.",
    bg: "linear-gradient(135deg,#f43f5e,#a855f7,#3b82f6)",
    live: "https://vbecky.github.io/beckyweb/",
    link: "https://github.com/VBecky/beckyweb",
  },
  {
    title: "Expense Tracker",
    desc: "Track spending, budgets and category breakdowns.",
    tech: "Python · Tkinter · Charts",
    full: "An expense tracker that logs daily spending, groups it by category and visualises budgets at a glance — built to make personal finance feel calm, not anxious.",
    bg: "linear-gradient(135deg,#a855f7,#ec4899,#f59e0b)",
    img: projExpense,
    link: "https://github.com/VBecky/Expense-tracker",
  },
  {
    title: "Student Dashboard",
    desc: "Academic dashboard for progress, courses and schedule.",
    tech: "Python · Tkinter · Data",
    full: "A student dashboard that centralises grades, attendance, upcoming assignments and course progress in a clean, data-rich interface.",
    bg: "linear-gradient(135deg,#3b82f6,#8b5cf6,#ec4899)",
    img: projStudentDashboard,
    link: "https://github.com/VBecky/Student-Dashboard",
  },
  {
    title: "Quize Webapp",
    desc: "Interactive quiz app with score tracking and timers.",
    tech: "HTML · CSS · JavaScript",
    full: "A responsive quiz web application with multiple-choice questions, real-time scoring, progress tracking and a polished game-like experience.",
    bg: "linear-gradient(135deg,#10b981,#0ea5e9,#6366f1)",
    img: projQuiz,
    link: "https://github.com/VBecky/quize-app",
  },
];

const CSS = `
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#05060a;color:#e7ecf3;font-family:'Sora','Space Grotesk',Inter,system-ui,sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden;cursor:none}
body.light{background:#f4f6fb;color:#0b0e16}
body.light .glass{background:rgba(255,255,255,0.55);border-color:rgba(0,0,0,0.06)}
body.light .nav{background:rgba(255,255,255,0.6)}
a{color:inherit;text-decoration:none}
img{max-width:100%;display:block}

#bg-canvas{position:fixed;inset:0;width:100vw;height:100vh;z-index:0;pointer-events:none;opacity:.7}
body.light #bg-canvas{opacity:.35}

/* cursor */
#cursor{position:fixed;top:0;left:0;width:40px;height:40px;border-radius:50%;border:1px solid rgba(120,220,255,.55);pointer-events:none;z-index:9999;mix-blend-mode:difference;transition:width .2s,height .2s}
#cursor-dot{position:fixed;top:0;left:0;width:6px;height:6px;border-radius:50%;background:#7fe3ff;box-shadow:0 0 12px #7fe3ff;pointer-events:none;z-index:9999}
@media (hover:none){#cursor,#cursor-dot{display:none}html,body{cursor:auto}}

/* glass */
.glass{background:rgba(18,22,34,0.45);backdrop-filter:blur(22px) saturate(140%);border:1px solid rgba(255,255,255,0.08);border-radius:20px}

/* nav */
.nav{position:fixed;top:18px;left:50%;transform:translateX(-50%);z-index:50;display:flex;align-items:center;gap:32px;padding:10px 18px;border-radius:999px}
.nav .logo{font-weight:700;letter-spacing:.04em}
.nav .logo span{color:#7fe3ff}
.nav-links{display:flex;gap:22px;font-size:14px}
.nav-links a{opacity:.75;transition:opacity .2s,color .2s}
.nav-links a:hover{opacity:1;color:#7fe3ff}
.theme-toggle{background:transparent;border:1px solid rgba(255,255,255,.15);color:inherit;width:32px;height:32px;border-radius:50%;cursor:none;font-size:14px}
@media (max-width:640px){.nav-links{display:none}}

/* hero */
.hero{position:relative;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:120px 24px 80px;z-index:1;overflow:hidden}
.hero-inner{max-width:900px;text-align:center;position:relative;z-index:2}
.badge{display:inline-block;padding:6px 14px;border-radius:999px;border:1px solid rgba(127,227,255,.3);font-size:12px;color:#7fe3ff;background:rgba(127,227,255,.06);margin-bottom:22px}
.hero-title{font-size:clamp(40px,8vw,96px);font-weight:700;line-height:1.02;letter-spacing:-.03em;margin-bottom:18px}
.grad{background:linear-gradient(120deg,#7fe3ff,#a78bfa 50%,#f0abfc);-webkit-background-clip:text;background-clip:text;color:transparent}
.hero-sub{font-size:clamp(16px,2.2vw,22px);color:#9aa6bd;margin-bottom:10px;font-weight:300}
.hero-desc{font-size:15px;color:#7a8499;max-width:520px;margin:0 auto 36px}
.hero-ctas{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
.scroll-hint{position:absolute;bottom:30px;left:50%;transform:translateX(-50%);font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:#5a6480;animation:bob 2s ease-in-out infinite}
@keyframes bob{50%{transform:translate(-50%,8px)}}
.orb{position:absolute;border-radius:50%;filter:blur(80px);opacity:.45;z-index:1;pointer-events:none}
.orb-1{width:480px;height:480px;background:#7fe3ff;top:-100px;left:-120px;animation:float 14s ease-in-out infinite}
.orb-2{width:520px;height:520px;background:#a78bfa;bottom:-160px;right:-140px;animation:float 18s ease-in-out infinite reverse}
@keyframes float{50%{transform:translate(40px,30px) scale(1.1)}}

/* water drop button */
.drop-btn{position:relative;display:inline-flex;align-items:center;justify-content:center;padding:16px 30px;border-radius:999px;font-size:15px;font-weight:500;cursor:none;overflow:hidden;border:none;transition:transform .25s cubic-bezier(.34,1.56,.64,1),box-shadow .3s;isolation:isolate;letter-spacing:.01em}
.drop-btn.primary{background:linear-gradient(135deg,#7fe3ff,#a78bfa);color:#06080f;box-shadow:0 10px 30px -8px rgba(127,227,255,.55),inset 0 1px 0 rgba(255,255,255,.6),inset 0 -8px 16px rgba(0,0,0,.12)}
.drop-btn.primary:hover{transform:translateY(-3px) scale(1.03);box-shadow:0 18px 45px -8px rgba(127,227,255,.7),inset 0 1px 0 rgba(255,255,255,.7),inset 0 -8px 16px rgba(0,0,0,.15)}
.drop-btn.ghost{background:rgba(255,255,255,.04);color:inherit;border:1px solid rgba(255,255,255,.12);backdrop-filter:blur(10px)}
.drop-btn.ghost:hover{background:rgba(127,227,255,.1);border-color:rgba(127,227,255,.4);transform:translateY(-3px)}
.drop-btn::before{content:"";position:absolute;inset:0;border-radius:inherit;background:radial-gradient(120% 80% at 50% 0%,rgba(255,255,255,.55),transparent 60%);pointer-events:none;mix-blend-mode:overlay;opacity:.7}
.ripple{position:absolute;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.7),rgba(127,227,255,.3) 40%,transparent 70%);transform:scale(0);animation:ripple .8s ease-out forwards;pointer-events:none}
@keyframes ripple{to{transform:scale(1);opacity:0}}

/* sections */
.section{position:relative;z-index:1;max-width:1200px;margin:0 auto;padding:120px 24px}
.section-head{margin-bottom:48px;max-width:720px}
.section-head.center{margin:0 auto 48px;text-align:center}
.kicker{display:inline-block;font-size:12px;letter-spacing:.3em;text-transform:uppercase;color:#7fe3ff;margin-bottom:14px}
.section-head h2{font-size:clamp(32px,5vw,56px);font-weight:600;letter-spacing:-.02em;line-height:1.05}
.section-sub{margin-top:18px;color:#8a93a8;font-size:15px;line-height:1.7;max-width:560px}

/* blog */
.blog-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
@media (max-width:1000px){.blog-grid{grid-template-columns:repeat(2,1fr)}}
@media (max-width:640px){.blog-grid{grid-template-columns:1fr}}
.blog-card{padding:14px;display:flex;flex-direction:column;cursor:none;transition:transform .5s cubic-bezier(.2,.8,.2,1),box-shadow .4s}
.blog-card:hover{box-shadow:0 30px 60px -20px rgba(167,139,250,.25),0 0 0 1px rgba(167,139,250,.3)}
.blog-thumb{position:relative;aspect-ratio:16/10;border-radius:14px;overflow:hidden;display:flex;align-items:flex-start;justify-content:flex-start;padding:14px}
.blog-thumb-glow{position:absolute;inset:0;background:radial-gradient(circle at 25% 15%,rgba(255,255,255,.45),transparent 55%),radial-gradient(circle at 80% 90%,rgba(0,0,0,.25),transparent 60%);mix-blend-mode:overlay;pointer-events:none}
.blog-cat{position:relative;font-size:11px;letter-spacing:.22em;text-transform:uppercase;padding:6px 12px;border-radius:999px;background:rgba(8,12,22,.55);backdrop-filter:blur(10px);color:#e7ecf3;border:1px solid rgba(255,255,255,.12)}
.blog-meta{padding:18px 10px 12px;display:flex;flex-direction:column;gap:10px;flex:1}
.blog-info{display:flex;gap:8px;font-size:12px;color:#7a8499;letter-spacing:.08em}
.blog-info .dot{opacity:.5}
.blog-meta h3{font-size:19px;font-weight:600;line-height:1.3;letter-spacing:-.01em}
.blog-meta p{font-size:14px;color:#8a93a8;line-height:1.6;flex:1}
.blog-link{display:inline-flex;align-items:center;gap:8px;font-size:13px;color:#7fe3ff;letter-spacing:.08em;margin-top:6px;transition:gap .3s}
.blog-link .arrow{transition:transform .3s}
.blog-card:hover .blog-link{gap:14px}
.blog-card:hover .blog-link .arrow{transform:translateX(4px)}
.blog-cta{display:flex;justify-content:center;margin-top:36px}

/* about */
.about-layout{display:grid;grid-template-columns:0.7fr 1.3fr;gap:32px;align-items:start}
.card{padding:28px}
.portrait-wrap{position:sticky;top:100px;perspective:1200px}
.portrait-frame{position:relative;aspect-ratio:4/5;border-radius:28px;overflow:hidden;border:1px solid rgba(127,227,255,.18);box-shadow:0 40px 80px -30px rgba(127,227,255,.35),0 0 0 1px rgba(167,139,250,.12) inset;transform-style:preserve-3d;transition:transform .6s cubic-bezier(.2,.8,.2,1)}
.portrait-img{width:100%;height:100%;object-fit:cover;display:block;filter:saturate(1.05) contrast(1.05);transition:transform .8s cubic-bezier(.2,.8,.2,1)}
.portrait-frame:hover .portrait-img{transform:scale(1.04)}
.portrait-glow{position:absolute;inset:-40%;background:radial-gradient(circle at 30% 20%,rgba(127,227,255,.35),transparent 55%),radial-gradient(circle at 70% 80%,rgba(167,139,250,.3),transparent 55%);mix-blend-mode:screen;pointer-events:none;animation:portraitGlow 8s ease-in-out infinite}
.portrait-ring{position:absolute;inset:10px;border-radius:22px;border:1px solid rgba(255,255,255,.08);pointer-events:none}
@keyframes portraitGlow{0%,100%{opacity:.7;transform:rotate(0deg)}50%{opacity:1;transform:rotate(6deg)}}
.portrait-badge{position:absolute;left:16px;bottom:16px;display:inline-flex;align-items:center;gap:8px;padding:10px 14px;border-radius:999px;font-size:12px;letter-spacing:.08em;color:#e7ecf3;background:rgba(8,12,22,.55);backdrop-filter:blur(14px)}
.pulse-dot{width:8px;height:8px;border-radius:999px;background:#7fe3ff;box-shadow:0 0 0 0 rgba(127,227,255,.7);animation:pulseDot 1.8s ease-out infinite}
@keyframes pulseDot{0%{box-shadow:0 0 0 0 rgba(127,227,255,.7)}70%{box-shadow:0 0 0 12px rgba(127,227,255,0)}100%{box-shadow:0 0 0 0 rgba(127,227,255,0)}}
.about-right{display:flex;flex-direction:column;gap:18px}
.bio{display:flex;flex-direction:column;gap:14px;font-size:16px;line-height:1.75;color:#b9c2d4}
.bio strong{color:#e7ecf3;font-weight:600}
.bio em{color:#7fe3ff;font-style:normal}
.bio-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:10px;padding-top:20px;border-top:1px solid rgba(255,255,255,.06)}
.bio-stats div{display:flex;flex-direction:column;gap:4px}
.bio-stats strong{font-size:24px;font-weight:600;color:#7fe3ff;font-family:'Sora',sans-serif;letter-spacing:-.02em}
.bio-stats span{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#7a8499}
.skills-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
.skill{display:flex;flex-direction:column;align-items:flex-start;gap:10px;transition:transform .4s cubic-bezier(.2,.8,.2,1)}
.skill h4{font-size:18px;font-weight:500}
.skill p{font-size:13px;color:#7a8499}
@media (max-width:900px){.about-layout{grid-template-columns:1fr}.portrait-wrap{position:relative;top:0;max-width:420px;margin:0 auto}}
@media (max-width:540px){.skills-grid{grid-template-columns:1fr}.bio-stats{grid-template-columns:1fr 1fr}}

/* ring */
.ring-bg{fill:none;stroke:rgba(255,255,255,.08);stroke-width:5}
.ring-fg{fill:none;stroke:url(#g);stroke-width:5;stroke-linecap:round;stroke:#7fe3ff;filter:drop-shadow(0 0 6px rgba(127,227,255,.6));transition:stroke-dashoffset 1s ease}
.ring-text{fill:#e7ecf3;font-size:14px;font-weight:600;font-family:inherit}

/* projects */
.projects-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
@media (max-width:1000px){.projects-grid{grid-template-columns:repeat(2,1fr)}}
@media (max-width:640px){.projects-grid{grid-template-columns:1fr}}
.project-card{padding:14px;cursor:none;transition:transform .5s cubic-bezier(.2,.8,.2,1),box-shadow .4s}
.project-card:hover{box-shadow:0 30px 60px -20px rgba(127,227,255,.25),0 0 0 1px rgba(127,227,255,.3)}
.thumb{position:relative;aspect-ratio:4/3;border-radius:14px;overflow:hidden;display:flex;align-items:flex-end;justify-content:flex-start;padding:18px}
.thumb-glow{position:absolute;inset:0;background:radial-gradient(circle at 30% 20%,rgba(255,255,255,.4),transparent 50%);mix-blend-mode:overlay}
.thumb-num{position:relative;font-size:48px;font-weight:700;color:rgba(255,255,255,.85);letter-spacing:-.04em;text-shadow:0 2px 20px rgba(0,0,0,.25)}
.thumb-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .8s cubic-bezier(.2,.8,.2,1)}
.project-card:hover .thumb-img{transform:scale(1.06)}
.thumb-live{position:absolute;inset:0;width:100%;height:100%;border:0;background:#0b0e16;transform-origin:top left;transform:scale(.5);width:200%;height:200%;pointer-events:none}
.project-links{display:flex;gap:10px;margin-top:12px;flex-wrap:wrap}
.project-link{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;font-size:12px;font-weight:500;color:#7fe3ff;background:rgba(127,227,255,.08);border:1px solid rgba(127,227,255,.25);transition:all .3s;cursor:none}
.project-link:hover{background:rgba(127,227,255,.18);border-color:rgba(127,227,255,.5);transform:translateY(-1px)}
.project-meta{padding:18px 10px 10px}
.project-meta h3{font-size:20px;font-weight:600;margin-bottom:6px}
.project-meta p{font-size:14px;color:#8a93a8;margin-bottom:14px}
.tags{display:flex;flex-wrap:wrap;gap:6px}
.tag{font-size:11px;padding:4px 10px;border-radius:999px;background:rgba(127,227,255,.08);color:#7fe3ff;border:1px solid rgba(127,227,255,.18)}

/* contact */
.contact-form{max-width:720px;margin:0 auto;padding:32px;display:flex;flex-direction:column;gap:18px}
.row{display:grid;grid-template-columns:1fr 1fr;gap:18px}
@media (max-width:600px){.row{grid-template-columns:1fr}}
.contact-form label{display:flex;flex-direction:column;gap:8px}
.contact-form span{font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#7a8499}
.contact-form input,.contact-form textarea{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px 16px;color:inherit;font:inherit;font-size:15px;transition:border-color .25s,background .25s;resize:vertical;cursor:none}
.contact-form input:focus,.contact-form textarea:focus{outline:none;border-color:rgba(127,227,255,.55);background:rgba(127,227,255,.05)}
.contact-form .drop-btn{align-self:flex-start;margin-top:8px}
.socials{display:flex;gap:14px;justify-content:center;margin-top:32px;flex-wrap:wrap}
.social{padding:12px 22px;border-radius:999px;font-size:14px;transition:transform .25s,color .25s,border-color .25s}
.social:hover{transform:translateY(-3px);color:#7fe3ff;border-color:rgba(127,227,255,.4)}

/* reveal */
.reveal{opacity:0;transform:translateY(24px);transition:opacity .9s cubic-bezier(.2,.8,.2,1),transform .9s cubic-bezier(.2,.8,.2,1)}
.reveal.in{opacity:1;transform:none}

/* footer */
.footer{position:relative;z-index:1;display:flex;justify-content:space-between;padding:40px 32px;font-size:12px;color:#5a6480;border-top:1px solid rgba(255,255,255,.05);flex-wrap:wrap;gap:10px}

/* modal */
.modal{position:fixed;inset:0;z-index:200;background:rgba(2,4,10,.7);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:24px;opacity:0;pointer-events:none;transition:opacity .35s}
.modal.open{opacity:1;pointer-events:auto}
.modal-inner{max-width:560px;width:100%;padding:40px;position:relative;transform:scale(.96);transition:transform .4s cubic-bezier(.2,.8,.2,1)}
.modal.open .modal-inner{transform:scale(1)}
.modal-close{position:absolute;top:14px;right:18px;background:transparent;border:none;color:inherit;font-size:28px;cursor:none;line-height:1}
#modal-body h3{font-size:26px;margin-bottom:8px;font-weight:600}
#modal-body .tech{font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#7fe3ff;margin-bottom:18px}
#modal-body p{color:#b9c2d4;line-height:1.7}
`;
