import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchPublishedPosts,
  fetchProjects,
  fetchSiteContent,
  DEFAULT_HOME,
  DEFAULT_ABOUT,
  type BlogPost,
  type Project,
  type HomeContent,
  type AboutContent,
} from "@/lib/content-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Becky Biranu — Creative Developer & Video Editor" },
      {
        name: "description",
        content:
          "Portfolio of Becky Biranu — a creative developer crafting clean, functional web experiences.",
      },
      { property: "og:title", content: "Becky Biranu — Creative Developer" },
      {
        property: "og:description",
        content: "Frontend & backend developer building practical, user-focused web applications.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [home, setHome] = useState<HomeContent>(DEFAULT_HOME);
  const [about, setAbout] = useState<AboutContent>(DEFAULT_ABOUT);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  useEffect(() => {
    fetchSiteContent<HomeContent>("home", DEFAULT_HOME).then(setHome);
    fetchSiteContent<AboutContent>("about", DEFAULT_ABOUT).then(setAbout);
    fetchProjects().then(setProjects);
  }, []);

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
    let mx = 0, my = 0, cx = 0, cy = 0;
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

    // ===== Scroll reveals (static elements only — async cards skip this) =====
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) en.target.classList.add("in");
        });
      },
      { threshold: 0.12 },
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

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

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      io.disconnect();
    };
  }, []);

  // ===== 3D Tilt (re-attach when async cards mount) =====
  useEffect(() => {
    const cleanups: Array<() => void> = [];
    document.querySelectorAll<HTMLElement>(".tilt").forEach((el) => {
      const onMove = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateY(${px * 10}deg) rotateX(${-py * 10}deg) translateY(-4px)`;
        const inner = el.querySelector<HTMLElement>(".portrait-frame, .thumb");
        if (inner) inner.style.transform = `translateZ(30px)`;
      };
      const onLeave = () => {
        el.style.transform = "";
        const inner = el.querySelector<HTMLElement>(".portrait-frame, .thumb");
        if (inner) inner.style.transform = "";
      };
      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
      cleanups.push(() => {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
      });
    });
    // re-observe new reveal elements as well
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => en.isIntersecting && en.target.classList.add("in")),
      { threshold: 0.12 },
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    cleanups.push(() => io.disconnect());
    return () => cleanups.forEach((c) => c());
  }, [projects, about]);


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
          {home.badge && <div className="badge reveal">{home.badge}</div>}
          <h1 className="hero-title reveal">{home.title}</h1>
          <p className="hero-sub reveal">{home.subtitle}</p>
          <p className="hero-desc reveal">{home.description}</p>
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
          <h2>{about.heading}</h2>
        </div>
        <div className="about-layout">
          <div className="portrait-wrap reveal tilt">
            <div className="portrait-frame">
              {about.portrait && (
                <img
                  src={about.portrait}
                  alt="Portrait of Becky Biranu"
                  className="portrait-img"
                  loading="lazy"
                />
              )}
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
              {about.bio.map((p, i) => (
                <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
              ))}
            </div>
            <div className="skills-grid">
              {about.skills.map((s) => (
                <div key={s.title} className="glass card skill">
                  <Ring value={s.value} />
                  <h4>{s.title}</h4>
                  <p>{s.detail}</p>
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
        {projects.length === 0 ? (
          <div className="blog-empty glass">
            <p>No projects yet.</p>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((p, i) => (
              <article
                key={p.id}
                className="glass project-card tilt"
                style={{ animationDelay: `${i * 80}ms`, cursor: "pointer" }}
                onClick={() => setActiveProject(p)}
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
                  ) : p.image_url ? (
                    <img src={p.image_url} alt={p.title} loading="lazy" className="thumb-img" />
                  ) : (
                    <span className="thumb-num">{String(i + 1).padStart(2, "0")}</span>
                  )}
                </div>
                <div className="project-meta">
                  <h3>{p.title}</h3>
                  <p>{p.description}</p>
                  <div className="tags">
                    {p.tech.split(" · ").filter(Boolean).map((t) => (
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
        )}
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
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const btn = form.querySelector(".drop-btn") as HTMLButtonElement;
            const data = new FormData(form);
            const userEmail = String(data.get("user_email") || "").trim();
            const original = btn.textContent;
            btn.disabled = true;
            btn.textContent = "Sending…";
            try {
              const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  service_id: "service_gl5ibkm",
                  template_id: "template_4qq1m6t",
                  user_id: "L3Ps1-ihRB72OQToc",
                  template_params: {
                    from_name: data.get("name"),
                    user_email: userEmail,
                    from_email: userEmail,
                    message: data.get("message"),
                    reply_to: userEmail,
                  },
                }),
              });
              if (!res.ok) throw new Error(await res.text());
              btn.textContent = "Sent ✓";
              form.reset();
            } catch (err) {
              console.error(err);
              btn.textContent = "Failed — retry";
            } finally {
              setTimeout(() => {
                btn.textContent = original;
                btn.disabled = false;
              }, 2400);
            }
          }}
        >
          <div className="row">
            <label>
              <span>Name</span>
              <input required name="name" type="text" placeholder="Your name" />
            </label>
            <label>
              <span>Email</span>
              <input required name="user_email" type="email" placeholder="you@domain.com" />
            </label>
          </div>
          <label>
            <span>Message</span>
            <textarea required name="message" rows={5} placeholder="Tell me about your project…" />
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

      {/* Project Modal */}
      {activeProject && (
        <div className="modal open" onClick={(e) => { if (e.target === e.currentTarget) setActiveProject(null); }}>
          <div className="modal-inner glass">
            <button className="modal-close" onClick={() => setActiveProject(null)}>×</button>
            <h3 style={{ fontSize: 26, marginBottom: 8, fontWeight: 600 }}>{activeProject.title}</h3>
            <p style={{ fontSize: 12, letterSpacing: ".2em", textTransform: "uppercase", color: "#7fe3ff", marginBottom: 18 }}>{activeProject.tech}</p>
            <p style={{ color: "#b9c2d4", lineHeight: 1.7 }}>{activeProject.full_text || activeProject.description}</p>
          </div>
        </div>
      )}
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

function formatDate(s: string) {
  return new Date(s).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function getClientId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("becky_client_id");
  if (!id) {
    id = (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36));
    localStorage.setItem("becky_client_id", id);
  }
  return id;
}

type Comment = { id: string; post_id: string; author_name: string; content: string; created_at: string };

function BlogSection() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [active, setActive] = useState<BlogPost | null>(null);
  const [popup, setPopup] = useState<string | null>(null);
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [likedByMe, setLikedByMe] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchPublishedPosts().then(async (list) => {
      setPosts(list);
      if (list.length === 0) return;
      const ids = list.map((p) => p.id);
      const clientId = getClientId();
      const { data: likes } = await supabase
        .from("blog_likes" as any)
        .select("post_id, client_id")
        .in("post_id", ids);
      const counts: Record<string, number> = {};
      const mine: Record<string, boolean> = {};
      (likes ?? []).forEach((l: any) => {
        counts[l.post_id] = (counts[l.post_id] ?? 0) + 1;
        if (l.client_id === clientId) mine[l.post_id] = true;
      });
      setLikeCounts(counts);
      setLikedByMe(mine);
    });
  }, []);

  const openPost = (p: BlogPost) => {
    setActive(p);
    if (p.popup && p.popup.trim()) setPopup(p.popup);
  };

  const toggleLike = async (postId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (likedByMe[postId]) return;
    const clientId = getClientId();
    setLikedByMe((m) => ({ ...m, [postId]: true }));
    setLikeCounts((c) => ({ ...c, [postId]: (c[postId] ?? 0) + 1 }));
    const { error } = await supabase.from("blog_likes" as any).insert({ post_id: postId, client_id: clientId });
    if (error && !String(error.message).includes("duplicate")) {
      setLikedByMe((m) => ({ ...m, [postId]: false }));
      setLikeCounts((c) => ({ ...c, [postId]: Math.max(0, (c[postId] ?? 1) - 1) }));
    }
  };

  return (
    <>
      <section id="blog" className="section">
        <div className="section-head reveal">
          <span className="kicker">03 / Journal</span>
          <h2>Notes from the <span className="grad">edge</span>.</h2>
          <p className="section-sub">Essays, experiments and field notes — written and published from the studio.</p>
        </div>

        {posts.length === 0 ? (
          <div className="blog-empty glass">
            <p>No articles published yet. Check back soon.</p>
          </div>
        ) : (
          <div className="blog-grid">
            {posts.map((post, i) => {
              const snippet = post.excerpt?.trim() || stripHtml(post.content);
              const liked = !!likedByMe[post.id];
              const count = likeCounts[post.id] ?? 0;
              return (
                <article
                  key={post.id}
                  className="glass project-card tilt blog-card"
                  onClick={() => openPost(post)}
                  style={{ animationDelay: `${i * 90}ms`, cursor: "pointer" }}
                >
                  <div className="blog-thumb">
                    {post.image_url ? (
                      <img src={post.image_url} alt={post.title} loading="lazy" className="thumb-img" />
                    ) : (
                      <div className="blog-thumb-placeholder">📝</div>
                    )}
                  </div>
                  <div className="blog-body">
                    <p className="blog-date">{formatDate(post.created_at)}</p>
                    <h3 className="blog-title">{post.title}</h3>
                    <p className="blog-snippet">{snippet}</p>
                    <div className="blog-footer">
                      <span className="blog-link">Read full <span className="arrow">→</span></span>
                      <button
                        className={`like-btn${liked ? " liked" : ""}`}
                        onClick={(e) => toggleLike(post.id, e)}
                        aria-label="Like"
                        disabled={liked}
                      >
                        <span className="heart">{liked ? "♥" : "♡"}</span>
                        <span className="count">{count}</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {active && (
        <BlogModal
          post={active}
          onClose={() => setActive(null)}
          liked={!!likedByMe[active.id]}
          likeCount={likeCounts[active.id] ?? 0}
          onLike={() => toggleLike(active.id)}
        />
      )}

      {popup && (
        <div className="modal open" style={{ zIndex: 300 }} onClick={(e) => { if (e.target === e.currentTarget) setPopup(null); }}>
          <div className="modal-inner glass" style={{ maxWidth: 440, textAlign: "center" }}>
            <button className="modal-close" onClick={() => setPopup(null)}>×</button>
            <h3 style={{ fontSize: 22, marginBottom: 14 }}>A note from Becky</h3>
            <p style={{ color: "#b9c2d4", lineHeight: 1.7, marginBottom: 20 }}>{popup}</p>
            <button className="drop-btn primary" onClick={() => setPopup(null)}>Got it</button>
          </div>
        </div>
      )}
    </>
  );
}

function BlogModal({ post, onClose, liked, likeCount, onLike }: {
  post: BlogPost; onClose: () => void; liked: boolean; likeCount: number; onLike: () => void;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  const reload = async () => {
    const { data } = await supabase
      .from("blog_comments" as any)
      .select("*")
      .eq("post_id", post.id)
      .order("created_at", { ascending: false });
    setComments((data ?? []) as any);
  };

  useEffect(() => { reload(); }, [post.id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setPosting(true);
    const { error } = await supabase.from("blog_comments" as any).insert({
      post_id: post.id,
      author_name: name.trim() || "Anonymous",
      content: text.trim(),
    });
    setPosting(false);
    if (!error) { setText(""); reload(); }
  };

  return (
    <div className="modal open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-inner glass" style={{ maxWidth: 720 }}>
        <button className="modal-close" onClick={onClose}>×</button>
        {post.image_url && (
          <img src={post.image_url} alt={post.title} style={{ width: "100%", borderRadius: 14, marginBottom: 18, maxHeight: 360, objectFit: "cover" }} />
        )}
        <h3 style={{ fontSize: 28, marginBottom: 8 }}>{post.title}</h3>
        <p style={{ fontSize: 12, letterSpacing: ".2em", textTransform: "uppercase", color: "#7fe3ff", marginBottom: 18 }}>
          {formatDate(post.created_at)}
        </p>
        <div style={{ color: "#b9c2d4", lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: post.content }} />

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 26, paddingTop: 18, borderTop: "1px solid rgba(127,227,255,.15)" }}>
          <button className={`like-btn${liked ? " liked" : ""}`} onClick={onLike} disabled={liked} aria-label="Like article">
            <span className="heart">{liked ? "♥" : "♡"}</span>
            <span className="count">{likeCount} {likeCount === 1 ? "like" : "likes"}</span>
          </button>
          <span style={{ color: "#7a8499", fontSize: 13 }}>{comments.length} {comments.length === 1 ? "comment" : "comments"}</span>
        </div>

        <form onSubmit={submit} style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            className="comment-input"
            placeholder="Your name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
          />
          <textarea
            className="comment-input"
            placeholder="Share your thoughts…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            maxLength={2000}
            required
          />
          <button className="drop-btn primary" type="submit" disabled={posting || !text.trim()} style={{ alignSelf: "flex-start" }}>
            {posting ? "Posting…" : "Post comment"}
          </button>
        </form>

        <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 12 }}>
          {comments.map((c) => (
            <div key={c.id} className="comment-item">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <strong style={{ color: "#e6ecf8", fontSize: 14 }}>{c.author_name}</strong>
                <span style={{ color: "#7a8499", fontSize: 12 }}>{formatDate(c.created_at)}</span>
              </div>
              <p style={{ color: "#b9c2d4", fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{c.content}</p>
            </div>
          ))}
          {comments.length === 0 && (
            <p style={{ color: "#7a8499", fontSize: 13, textAlign: "center", padding: "12px 0" }}>Be the first to comment.</p>
          )}
        </div>
      </div>
    </div>
  );
}

const CSS = `
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#05060a;color:#e7ecf3;font-family:'Sora','Space Grotesk',Inter,system-ui,sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden;cursor:none}
body.light{background:#f4f6fb;color:#0b0e16}
body.light .glass{background:rgba(255,255,255,0.55);border-color:rgba(0,0,0,0.06)}
body.light .nav{background:rgba(255,255,255,0.6)}
body.light .hero-sub,body.light .bio{color:#2a3145}
body.light .hero-desc,body.light .section-sub,body.light .blog-snippet,body.light .blog-empty,body.light .project-meta p,body.light .skill p,body.light .contact-form span{color:#4a5468}
body.light .scroll-hint,body.light .footer{color:#5a6480}
body.light .bio strong{color:#0b0e16}
body.light .portrait-badge{color:#0b0e16;background:rgba(255,255,255,.7)}
body.light .theme-toggle{border-color:rgba(0,0,0,.15)}
body.light .nav-links a{color:#0b0e16}
body.light #cursor{border-color:rgba(10,20,40,.6)}
a{color:inherit;text-decoration:none}
img{max-width:100%;display:block}

#bg-canvas{position:fixed;inset:0;width:100vw;height:100vh;z-index:0;pointer-events:none;opacity:.7}
body.light #bg-canvas{opacity:.35}

#cursor{position:fixed;top:0;left:0;width:40px;height:40px;border-radius:50%;border:1px solid rgba(120,220,255,.55);pointer-events:none;z-index:9999;mix-blend-mode:difference;transition:width .2s,height .2s}
#cursor-dot{position:fixed;top:0;left:0;width:6px;height:6px;border-radius:50%;background:#7fe3ff;box-shadow:0 0 12px #7fe3ff;pointer-events:none;z-index:9999}
@media (hover:none){#cursor,#cursor-dot{display:none}html,body{cursor:auto}}

.glass{background:rgba(18,22,34,0.45);backdrop-filter:blur(22px) saturate(140%);border:1px solid rgba(255,255,255,0.08);border-radius:20px}

.nav{position:fixed;top:18px;left:50%;transform:translateX(-50%);z-index:50;display:flex;align-items:center;gap:32px;padding:10px 18px;border-radius:999px}
.nav .logo{font-weight:700;letter-spacing:.04em}
.nav .logo span{color:#7fe3ff}
.nav-links{display:flex;gap:22px;font-size:14px}
.nav-links a{opacity:.75;transition:opacity .2s,color .2s}
.nav-links a:hover{opacity:1;color:#7fe3ff}
.theme-toggle{background:transparent;border:1px solid rgba(255,255,255,.15);color:inherit;width:32px;height:32px;border-radius:50%;cursor:none;font-size:14px}
@media (max-width:640px){.nav-links{display:none}}

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

.drop-btn{position:relative;display:inline-flex;align-items:center;justify-content:center;padding:16px 30px;border-radius:999px;font-size:15px;font-weight:500;cursor:none;overflow:hidden;border:none;transition:transform .25s cubic-bezier(.34,1.56,.64,1),box-shadow .3s;isolation:isolate;letter-spacing:.01em}
.drop-btn.primary{background:linear-gradient(135deg,#7fe3ff,#a78bfa);color:#06080f;box-shadow:0 10px 30px -8px rgba(127,227,255,.55),inset 0 1px 0 rgba(255,255,255,.6),inset 0 -8px 16px rgba(0,0,0,.12)}
.drop-btn.primary:hover{transform:translateY(-3px) scale(1.03)}
.drop-btn.ghost{background:rgba(255,255,255,.04);color:inherit;border:1px solid rgba(255,255,255,.12);backdrop-filter:blur(10px)}
.drop-btn.ghost:hover{background:rgba(127,227,255,.1);border-color:rgba(127,227,255,.4);transform:translateY(-3px)}
.drop-btn::before{content:"";position:absolute;inset:0;border-radius:inherit;background:radial-gradient(120% 80% at 50% 0%,rgba(255,255,255,.55),transparent 60%);pointer-events:none;mix-blend-mode:overlay;opacity:.7}
.ripple{position:absolute;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.7),rgba(127,227,255,.3) 40%,transparent 70%);transform:scale(0);animation:ripple .8s ease-out forwards;pointer-events:none}
@keyframes ripple{to{transform:scale(1);opacity:0}}

.section{position:relative;z-index:1;max-width:1200px;margin:0 auto;padding:120px 24px}
.section-head{margin-bottom:48px;max-width:720px}
.section-head.center{margin:0 auto 48px;text-align:center}
.kicker{display:inline-block;font-size:12px;letter-spacing:.3em;text-transform:uppercase;color:#7fe3ff;margin-bottom:14px}
.section-head h2{font-size:clamp(32px,5vw,56px);font-weight:600;letter-spacing:-.02em;line-height:1.05}
.section-sub{margin-top:18px;color:#8a93a8;font-size:15px;line-height:1.7;max-width:560px}

.blog-link{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:#7fe3ff;letter-spacing:.06em;transition:gap .3s}
.blog-link .arrow{transition:transform .3s}
.project-card:hover .blog-link{gap:12px}
.project-card:hover .blog-link .arrow{transform:translateX(4px)}
.blog-empty{max-width:520px;margin:0 auto;padding:40px;text-align:center;color:#8a93a8;font-size:15px}

.blog-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:16px;max-width:1000px;margin:0 auto}
.blog-card{padding:0;overflow:hidden;display:flex;flex-direction:column;aspect-ratio:1/1}
.blog-thumb{position:relative;width:100%;aspect-ratio:16/10;overflow:hidden;background:linear-gradient(135deg,#0ea5e9,#6366f1,#a855f7);flex-shrink:0}
.blog-thumb .thumb-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .8s cubic-bezier(.2,.8,.2,1)}
.blog-card:hover .thumb-img{transform:scale(1.06)}
.blog-thumb-placeholder{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:32px;opacity:.6}
.blog-body{padding:10px 12px 12px;display:flex;flex-direction:column;gap:4px;flex:1;min-height:0}
.blog-date{font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:#7fe3ff;margin:0}
.blog-title{font-size:14px;font-weight:600;line-height:1.25;margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.blog-snippet{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;color:#8a93a8;font-size:11.5px;line-height:1.45;margin:0}
.blog-footer{margin-top:auto;padding-top:6px;display:flex;align-items:center;justify-content:space-between;gap:6px}
.like-btn{display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border-radius:999px;border:1px solid rgba(255,120,180,.3);background:rgba(255,120,180,.08);color:#ffb3d1;font-size:12px;cursor:pointer;transition:all .25s;font-family:inherit}
.like-btn:hover:not(:disabled){background:rgba(255,120,180,.18);transform:translateY(-1px)}
.like-btn.liked{background:rgba(255,80,140,.22);border-color:rgba(255,80,140,.55);color:#ff7fb0}
.like-btn .heart{font-size:14px;line-height:1}
.like-btn:disabled{cursor:default}
.comment-input{width:100%;padding:12px 14px;border-radius:10px;border:1px solid rgba(127,227,255,.18);background:rgba(8,12,22,.5);color:#e6ecf8;font-family:inherit;font-size:14px;resize:vertical;outline:none;transition:border-color .2s}
.comment-input:focus{border-color:rgba(127,227,255,.5)}
.comment-item{padding:12px 14px;border-radius:10px;background:rgba(127,227,255,.04);border:1px solid rgba(127,227,255,.1)}
body.light .blog-snippet,body.light .comment-item p{color:#4a5468}
body.light .comment-item{background:rgba(10,20,40,.04);border-color:rgba(10,20,40,.1)}
body.light .comment-input{background:rgba(255,255,255,.6);color:#0b0e16;border-color:rgba(10,20,40,.15)}
@media(max-width:640px){.blog-grid{grid-template-columns:repeat(2,1fr);gap:12px}.blog-title{font-size:13px}.blog-body{padding:8px 10px 10px}}

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
.skills-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
.skill{display:flex;flex-direction:column;align-items:flex-start;gap:10px;transition:transform .4s cubic-bezier(.2,.8,.2,1)}
.skill h4{font-size:18px;font-weight:500}
.skill p{font-size:13px;color:#7a8499}
@media (max-width:900px){.about-layout{grid-template-columns:1fr}.portrait-wrap{position:relative;top:0;max-width:420px;margin:0 auto}}
@media (max-width:540px){.skills-grid{grid-template-columns:1fr}}

.ring-bg{fill:none;stroke:rgba(255,255,255,.08);stroke-width:5}
.ring-fg{fill:none;stroke:#7fe3ff;stroke-width:5;stroke-linecap:round;filter:drop-shadow(0 0 6px rgba(127,227,255,.6));transition:stroke-dashoffset 1s ease}
.ring-text{fill:#e7ecf3;font-size:14px;font-weight:600;font-family:inherit}

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
.thumb-live{position:absolute;inset:0;border:0;background:#0b0e16;transform-origin:top left;transform:scale(.5);width:200%;height:200%;pointer-events:none}
.project-links{display:flex;gap:10px;margin-top:12px;flex-wrap:wrap}
.project-link{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;font-size:12px;font-weight:500;color:#7fe3ff;background:rgba(127,227,255,.08);border:1px solid rgba(127,227,255,.25);transition:all .3s;cursor:none}
.project-link:hover{background:rgba(127,227,255,.18);border-color:rgba(127,227,255,.5);transform:translateY(-1px)}
.project-meta{padding:18px 10px 10px}
.project-meta h3{font-size:20px;font-weight:600;margin-bottom:6px}
.project-meta p{font-size:14px;color:#8a93a8;margin-bottom:14px}
.tags{display:flex;flex-wrap:wrap;gap:6px}
.tag{font-size:11px;padding:4px 10px;border-radius:999px;background:rgba(127,227,255,.08);color:#7fe3ff;border:1px solid rgba(127,227,255,.18)}

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

.reveal{opacity:0;transform:translateY(24px);transition:opacity .9s cubic-bezier(.2,.8,.2,1),transform .9s cubic-bezier(.2,.8,.2,1)}
.reveal.in{opacity:1;transform:none}

.footer{position:relative;z-index:1;display:flex;justify-content:space-between;padding:40px 32px;font-size:12px;color:#5a6480;border-top:1px solid rgba(255,255,255,.05);flex-wrap:wrap;gap:10px}

.modal{position:fixed;inset:0;z-index:200;background:rgba(2,4,10,.7);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:24px;opacity:0;pointer-events:none;transition:opacity .35s}
.modal.open{opacity:1;pointer-events:auto}
.modal-inner{max-width:560px;width:100%;padding:40px;position:relative;transform:scale(.96);transition:transform .4s cubic-bezier(.2,.8,.2,1)}
.modal.open .modal-inner{transform:scale(1)}
.modal-close{position:absolute;top:14px;right:18px;background:transparent;border:none;color:inherit;font-size:28px;cursor:none;line-height:1}
`;
