import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import { Scene3DCanvas, ScrollToTopRewind } from "./Scene3D";

/* ───────────────────── THEME SYSTEM (CYBER HOLOGRAPHIC) ───────────────────── */
type Theme = "dark" | "light";

interface Colors {
  rosa: string;      // Neon Pink
  gold: string;      // Cyan
  bg: string;
  bgAlt: string;
  card: string;
  cardHover: string;
  border: string;
  muted: string;
  text: string;
  textSoft: string;
  navBg: string;
  shadow: string;
  gridLine: string;
  particleOpacity: number;
}

const THEMES: Record<Theme, Colors> = {
  dark: {
    rosa: "#f2a0b3",       // Sakura pink (Marin's blush)
    gold: "#7ec8e3",       // Marin's eye blue
    bg: "#0d0a10",         // Deep plum-black
    bgAlt: "#110e15",
    card: "#15121c",       // Dark lavender card
    cardHover: "#1c1826",
    border: "#2a2235",     // Soft purple border
    muted: "#7a7088",      // Lavender gray
    text: "#f0e8f5",       // Warm white with pink tint
    textSoft: "#c4b8d0",
    navBg: "rgba(13,10,16,0.82)",
    shadow: "rgba(0,0,0,0.4)",
    gridLine: "#f2a0b312",
    particleOpacity: 1,
  },
  light: {
    rosa: "#e0758e",
    gold: "#5aabb8",
    bg: "#fef8f9",         // Soft sakura white
    bgAlt: "#faf0f2",
    card: "#ffffff",
    cardHover: "#fffbfc",
    border: "#f0d8de",     // Pink-tinted border
    muted: "#9a8a94",
    text: "#1a0f18",
    textSoft: "#5a4558",
    navBg: "rgba(254,248,249,0.85)",
    shadow: "rgba(200,140,160,0.1)",
    gridLine: "#e0758e08",
    particleOpacity: 0.5,
  },
};

const ThemeCtx = createContext<{ theme: Theme; T: Colors; toggle: () => void }>({
  theme: "dark",
  T: THEMES.dark,
  toggle: () => {},
});

function useT() {
  return useContext(ThemeCtx);
}

/* ───────────────────── CONSTANTS ───────────────────── */
const IMGS = {
  marinLanding: "https://github.com/afporiginal/afporiginal/blob/main/images/Marin5.png?raw=true",
  marinHeroDark: "https://github.com/afporiginal/afporiginal/blob/main/images/38_Sem_Titulo_20260508142505.png?raw=true",
  marinHeroLight: "https://github.com/afporiginal/afporiginal/blob/main/images/37_Sem_Titulo_20260508142825.png?raw=true",
  marinPeace: "https://raw.githubusercontent.com/afporiginal/afporiginal/main/images/Kitagawa_Marin-removebg-preview.png",
  marinAvatar:
    "https://images.weserv.nl/?url=https://raw.githubusercontent.com/afporiginal/afporiginal/main/images/%F0%9D%96%AC%F0%9D%96%BA%F0%9D%97%8B%F0%9D%97%82%F0%9D%97%87%20%F0%9D%96%AA%F0%9D%97%82%F0%9D%97%8D%F0%9D%96%BA%F0%9D%97%80%F0%9D%96%BA%F0%9D%97%90%F0%9D%96%BA%20%E2%9C%BF.webp&w=200&h=200&fit=cover&mask=circle&output=png",
};

const GITHUB = "https://github.com/afporiginal";
const DISCORD = "https://discord.com/users/afploriginal";

const TECHS = [
  { name: "Python", icon: "🐍", color: "#3776AB" },
  { name: "Lua", icon: "🌙", color: "#000080" },
  { name: "JavaScript", icon: "⚡", color: "#F7DF1E" },
  { name: "Node.js", icon: "🟢", color: "#339933" },
  { name: "Blender", icon: "🎨", color: "#F5792A" },
  { name: "Git", icon: "📦", color: "#F05032" },
  { name: "VS Code", icon: "💎", color: "#007ACC" },
];

const WHAT_I_DO = [
  { icon: "🧩", title: "Resolver problemas", desc: "Gosto de descobrir como as coisas funcionam e testar soluções." },
  { icon: "🌐", title: "Brincar com a web", desc: "Transformar ideias em páginas e pequenas interações." },
  { icon: "🎨", title: "Misturar código e visual", desc: "A parte criativa também faz parte de programar." },
  { icon: "✨", title: "Criar por diversão", desc: "Nem toda ideia precisa virar um projeto enorme." },
];

const WHAT_I_USE = [
  { icon: "💻", title: "VS Code", desc: "My daily driver for all coding." },
  { icon: "📦", title: "Git & GitHub", desc: "Version control for everything." },
  { icon: "🟢", title: "Node.js", desc: "Backend runtime for JS/TS projects." },
  { icon: "🎨", title: "Blender", desc: "3D modeling, sculpting, rendering." },
];

/* ───────────────────── HOOKS ───────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function useTypewriter(words: string[], typingSpeed = 100, deletingSpeed = 60, pause = 2000) {
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  useEffect(() => {
    const cw = words[wordIndex];
    let t: ReturnType<typeof setTimeout>;
    if (!isDeleting && text === cw) t = setTimeout(() => setIsDeleting(true), pause);
    else if (isDeleting && text === "") { setIsDeleting(false); setWordIndex((p) => (p + 1) % words.length); }
    else { const s = isDeleting ? deletingSpeed : typingSpeed; t = setTimeout(() => setText(isDeleting ? cw.substring(0, text.length - 1) : cw.substring(0, text.length + 1)), s); }
    return () => clearTimeout(t);
  }, [text, wordIndex, isDeleting, words, typingSpeed, deletingSpeed, pause]);
  return text;
}

/* ───────────────────── THEME TOGGLE ───────────────────── */
function ThemeToggle({ size = 36 }: { size?: number }) {
  const { theme, toggle, T } = useT();
  const isDark = theme === "dark";
  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "12px",
        background: T.card,
        border: `1px solid ${T.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
        fontSize: "1.05rem",
        boxShadow: isDark ? "none" : `0 2px 8px ${T.shadow}`,
        position: "relative",
        overflow: "hidden",
        backdropFilter: "blur(8px)",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.rosa; e.currentTarget.style.transform = "rotate(15deg) scale(1.1)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "rotate(0deg) scale(1)"; }}
    >
      <span style={{ transition: "transform 0.4s ease", transform: isDark ? "rotate(0deg)" : "rotate(360deg)" }}>
        {isDark ? "☀️" : "🌙"}
      </span>
    </button>
  );
}

/* ───────────────────── PARTICLES ───────────────────── */
function Particles() {
  const { T } = useT();
  const particles = useRef(
    Array.from({ length: 40 }, (_, i) => ({ id: i, left: Math.random() * 100, size: Math.random() * 4 + 1, duration: Math.random() * 8 + 6, delay: Math.random() * 10, isRosa: Math.random() > 0.5, opacity: Math.random() * 0.35 + 0.08 }))
  ).current;
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, opacity: T.particleOpacity, transition: "opacity 0.5s ease" }}>
      {particles.map((p) => (
        <div key={p.id} style={{ position: "absolute", bottom: "-10px", left: `${p.left}%`, width: `${p.size}px`, height: `${p.size}px`, borderRadius: "50%", backgroundColor: p.isRosa ? T.rosa : T.gold, opacity: p.opacity, animation: `particle-float ${p.duration}s ${p.delay}s infinite ease-in-out` }} />
      ))}
    </div>
  );
}

/* ───────────────────── GRID BACKGROUND ───────────────────── */
function GridBackground() {
  const { T } = useT();
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0, opacity: 0.3, transition: "opacity 0.5s ease" }}>
      <div
        style={{
          position: "absolute", bottom: 0, left: "-20%", right: "-20%", height: "60%", transformOrigin: "bottom center", animation: "grid-move 4s linear infinite",
          backgroundImage: `linear-gradient(${T.gridLine} 1px, transparent 1px), linear-gradient(90deg, ${T.gridLine} 1px, transparent 1px)`, backgroundSize: "60px 60px",
          maskImage: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 80%)", WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 80%)",
        }}
      />
      <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)", width: "600px", height: "600px", borderRadius: "50%", background: `radial-gradient(circle, ${T.rosa}12 0%, transparent 70%)` }} />
    </div>
  );
}

/* ───────────────────── ORBIT RING ───────────────────── */
function OrbitRing({ radius, duration, items, reverse }: { radius: number; duration: number; items: typeof TECHS; reverse?: boolean }) {
  const { T } = useT();
  return (
    <div style={{ position: "absolute", width: `${radius * 2}px`, height: `${radius * 2}px`, borderRadius: "50%", border: `1px solid ${T.border}`, top: "50%", left: "50%", transform: "translate(-50%, -50%)", pointerEvents: "none", transition: "border-color 0.5s ease" }}>
      {items.map((tech, i) => (
        <div key={tech.name} style={{ position: "absolute", top: "50%", left: "50%", width: 0, height: 0, animation: `orbit ${duration}s linear infinite ${reverse ? "reverse" : "normal"}`, animationDelay: `${-(duration / items.length) * i}s`, "--orbit-radius": `${radius}px` } as React.CSSProperties}>
          <div style={{ position: "absolute", transform: "translate(-50%, -50%)", width: "36px", height: "36px", borderRadius: "10px", background: `${T.card}dd`, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", backdropFilter: "blur(8px)", boxShadow: `0 2px 12px ${T.shadow}`, transition: "all 0.5s ease" }}>
            {tech.icon}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ───────────────────── LANDING PAGE ───────────────────── */
function LandingPage({ onEnter }: { onEnter: () => void }) {
  const [exiting, setExiting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [ripple, setRipple] = useState(false);
  const { T } = useT();

  const typedText = useTypewriter(["Automating the ordinary", "Building cool stuff", "Python · Lua · JavaScript", "Self-taught dev"], 80, 50, 2200);

  useEffect(() => { const t = setTimeout(() => setMounted(true), 100); return () => clearTimeout(t); }, []);

  const handleEnter = useCallback(() => {
    if (exiting) return;
    setRipple(true);
    setTimeout(() => setExiting(true), 300);
    setTimeout(onEnter, 900);
  }, [exiting, onEnter]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Enter") handleEnter(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleEnter]);

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: T.bg, zIndex: 100, animation: exiting ? "landing-exit 0.6s ease-in forwards" : undefined, overflow: "hidden", transition: "background 0.5s ease" }}>
      <GridBackground />
      <Particles />

      {/* Top left */}
      <div style={{ position: "absolute", top: "20px", left: "24px", zIndex: 10, opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(-10px)", transition: "all 0.6s ease 0.2s" }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: T.muted, letterSpacing: "0.2em", textTransform: "uppercase" }}>Portfolio / 2026</span>
      </div>

      {/* Top right */}
      <div style={{ position: "absolute", top: "20px", right: "24px", zIndex: 10 }}>
        <ThemeToggle />
      </div>

      {/* Main content */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "clamp(2rem, 6vw, 5rem)", maxWidth: "1100px", width: "100%", padding: "0 24px", position: "relative", zIndex: 2, flexWrap: "wrap" }}>

        {/* Left text */}
        <div style={{ flex: "1 1 360px", minWidth: "280px", display: "flex", flexDirection: "column" }}>
          {/* Status badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "20px", border: `1px solid ${T.border}`, background: `${T.card}88`, backdropFilter: "blur(10px)", width: "fit-content", marginBottom: "1.5rem", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)", transition: "all 0.6s ease 0.3s" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e88" }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: T.muted }}>Available for projects</span>
          </div>

          {/* Name */}
          <h1 data-gradient-text="" style={{ fontFamily: "'Sora', sans-serif", fontSize: "clamp(3rem, 8vw, 5.5rem)", fontWeight: 800, lineHeight: 0.95, background: `linear-gradient(135deg, ${T.rosa}, ${T.gold}, ${T.rosa})`, backgroundSize: "200% auto", animation: "shimmer 4s linear infinite", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0) scale(1)" : "translateY(30px) scale(0.95)", transition: "opacity 0.7s cubic-bezier(0.16,1,0.3,1) 0.4s, transform 0.7s cubic-bezier(0.16,1,0.3,1) 0.4s, filter 0.7s cubic-bezier(0.16,1,0.3,1) 0.4s", filter: mounted ? "blur(0)" : "blur(8px)", letterSpacing: "-0.02em" }}>
            AFPL
          </h1>

          {/* Subtitle */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "1rem", marginBottom: "1rem", opacity: mounted ? 1 : 0, transform: mounted ? "translateX(0)" : "translateX(-20px)", transition: "all 0.6s ease 0.6s" }}>
            <div style={{ width: "40px", height: "2px", background: `linear-gradient(90deg, ${T.rosa}, transparent)`, borderRadius: "1px" }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", color: T.muted, letterSpacing: "0.15em", textTransform: "uppercase" }}>Developer & Creator</span>
          </div>

          {/* Typewriter */}
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "clamp(0.85rem, 1.5vw, 1rem)", color: T.text, minHeight: "1.6em", marginBottom: "2rem", opacity: mounted ? 1 : 0, transition: "opacity 0.6s ease 0.8s" }}>
            <span>{typedText}</span>
            <span style={{ display: "inline-block", width: "2px", height: "1em", background: T.rosa, marginLeft: "2px", verticalAlign: "text-bottom", animation: "typewriter-cursor 0.8s step-end infinite" }} />
          </div>

          {/* CTA */}
          <div style={{ position: "relative", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)", transition: "all 0.6s ease 1s" }}>
            {ripple && <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "200px", height: "200px", borderRadius: "50%", border: `2px solid ${T.rosa}`, animation: "ripple 0.8s ease-out forwards", pointerEvents: "none" }} />}
            <button
              onClick={handleEnter}
              style={{ padding: "14px 40px", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem", fontWeight: 600, color: "#fff", background: `linear-gradient(135deg, ${T.rosa}, ${T.rosa}cc)`, border: "none", borderRadius: "14px", cursor: "pointer", transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)", letterSpacing: "0.08em", boxShadow: `0 4px 20px ${T.rosa}33` }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px) scale(1.04)"; e.currentTarget.style.boxShadow = `0 8px 30px ${T.rosa}55`; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0) scale(1)"; e.currentTarget.style.boxShadow = `0 4px 20px ${T.rosa}33`; }}
            >
              Explore Portfolio →
            </button>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: `${T.muted}88`, marginTop: "12px" }}>
              or press <kbd style={{ padding: "2px 6px", borderRadius: "4px", border: `1px solid ${T.border}`, background: `${T.card}88`, fontSize: "0.65rem" }}>Enter</kbd>
            </p>
          </div>
        </div>

        {/* Right orbit */}
        <div style={{ flex: "0 1 420px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", minHeight: "400px", opacity: mounted ? 1 : 0, transform: mounted ? "scale(1)" : "scale(0.85)", transition: "all 0.8s cubic-bezier(0.16,1,0.3,1) 0.5s", filter: mounted ? "blur(0)" : "blur(10px)" }}>
          <OrbitRing radius={180} duration={30} items={TECHS.slice(0, 4)} />
          <OrbitRing radius={120} duration={22} items={TECHS.slice(4)} reverse />
          <div style={{ position: "absolute", width: "230px", height: "230px", borderRadius: "50%", border: `2px solid ${T.rosa}22`, animation: "glow-ring 4s ease-in-out infinite", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
          <div style={{ position: "relative", zIndex: 5, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "absolute", width: "200px", height: "200px", borderRadius: "50%", background: `radial-gradient(circle, ${T.rosa}30 0%, transparent 70%)`, filter: "blur(15px)", animation: "glow-ring 4s ease-in-out infinite" }} />
            <div style={{ width: "clamp(160px, 24vw, 210px)", height: "clamp(160px, 24vw, 210px)", borderRadius: "50%", overflow: "hidden", border: `3px solid ${T.rosa}66`, boxShadow: `0 0 30px ${T.rosa}33, 0 0 60px ${T.rosa}15, inset 0 0 20px ${T.rosa}11`, position: "relative" }}>
              <img src={IMGS.marinLanding} alt="Marin Kitagawa" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", pointerEvents: "none" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom hint */}
      <div style={{ position: "absolute", bottom: "24px", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", opacity: mounted ? 0.5 : 0, transition: "opacity 0.6s ease 1.4s", zIndex: 10 }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem", color: T.muted, letterSpacing: "0.2em", textTransform: "uppercase" }}>Click to enter</span>
        <div style={{ width: "1px", height: "20px", background: `linear-gradient(to bottom, ${T.rosa}88, transparent)` }} />
      </div>
    </div>
  );
}

/* ───────────────────── NAVBAR ───────────────────── */
const NAV_ITEMS = [
  { label: "Início", id: "home" },
  { label: "Sobre", id: "about" },
  { label: "Projetos", id: "projects" },
  { label: "Tecnologias", id: "tech" },
  { label: "Contato", id: "contact" },
];

function Navbar() {
  const { T } = useT();
  const [active, setActive] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      for (const item of [...NAV_ITEMS].reverse()) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top <= 120) { setActive(item.id); break; }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, padding: scrolled ? "10px 16px" : "14px 16px", background: scrolled ? T.navBg : "transparent", backdropFilter: scrolled ? "blur(16px)" : "none", borderBottom: scrolled ? `1px solid ${T.border}` : "1px solid transparent", transition: "padding 0.3s ease, background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease", boxShadow: scrolled ? `0 2px 12px ${T.shadow}` : "none" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Logo */}
        <a href="#home" data-gradient-text="" style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: "1.3rem", background: `linear-gradient(90deg, ${T.rosa}, ${T.gold})`, textDecoration: "none", flexShrink: 0 }}>AFPL</a>

        {/* Desktop links */}
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {NAV_ITEMS.map((item) => (
              <a key={item.id} href={`#${item.id}`} onClick={() => setActive(item.id)}
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8rem", fontWeight: 500, padding: "6px 14px", borderRadius: "8px", color: active === item.id ? T.rosa : T.muted, background: active === item.id ? `${T.rosa}15` : "transparent", textDecoration: "none", transition: "all 0.3s ease", letterSpacing: "0.05em" }}
                onMouseEnter={(e) => { if (active !== item.id) { e.currentTarget.style.color = T.text; e.currentTarget.style.background = `${T.rosa}10`; } }}
                onMouseLeave={(e) => { if (active !== item.id) { e.currentTarget.style.color = T.muted; e.currentTarget.style.background = "transparent"; } }}
              >{item.label}</a>
            ))}
            <div style={{ marginLeft: "8px" }}><ThemeToggle /></div>
          </div>
        )}

        {/* Mobile: theme toggle + hamburger */}
        {isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ThemeToggle size={32} />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              style={{ width: "32px", height: "32px", borderRadius: "8px", background: T.card, border: `1px solid ${T.border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px", cursor: "pointer", padding: "6px" }}
            >
              <div style={{ width: "14px", height: "2px", background: T.muted, borderRadius: "1px", transition: "all 0.3s ease", transform: menuOpen ? "rotate(45deg) translateY(3px)" : "none" }} />
              <div style={{ width: "14px", height: "2px", background: T.muted, borderRadius: "1px", transition: "all 0.3s ease", opacity: menuOpen ? 0 : 1 }} />
              <div style={{ width: "14px", height: "2px", background: T.muted, borderRadius: "1px", transition: "all 0.3s ease", transform: menuOpen ? "rotate(-45deg) translateY(-3px)" : "none" }} />
            </button>
          </div>
        )}
      </div>

      {/* Mobile dropdown */}
      {isMobile && (
        <div id="mobile-menu" style={{
          maxHeight: menuOpen ? "300px" : "0px",
          overflow: "hidden",
          visibility: menuOpen ? "visible" : "hidden",
          pointerEvents: menuOpen ? "auto" : "none",
          transition: "max-height 0.3s ease, opacity 0.3s ease, visibility 0.3s ease",
          opacity: menuOpen ? 1 : 0,
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", paddingTop: "12px" }}>
            {NAV_ITEMS.map((item) => (
              <a key={item.id} href={`#${item.id}`}
                onClick={() => { setActive(item.id); setMenuOpen(false); }}
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem", fontWeight: 500, padding: "10px 12px", borderRadius: "10px", color: active === item.id ? T.rosa : T.muted, background: active === item.id ? `${T.rosa}15` : "transparent", textDecoration: "none", transition: "all 0.2s ease" }}
              >{item.label}</a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

/* ───────────────────── HELPERS ───────────────────── */
function Section({ id, children, style }: { id: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return <section id={id} style={{ maxWidth: "1100px", margin: "0 auto", padding: "80px 24px", ...style }}>{children}</section>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  const { T } = useT();
  const { ref, visible } = useInView();
  return (
    <div ref={ref} style={{ marginBottom: "3rem", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: "all 0.6s ease" }}>
      <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 700, color: T.text }}>{children}</h2>
      <div style={{ width: "60px", height: "3px", background: `linear-gradient(90deg, ${T.rosa}, ${T.gold})`, borderRadius: "2px", marginTop: "10px" }} />
    </div>
  );
}

function AnimatedCard({ children, delay = 0, style: s }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const { T, theme } = useT();
  const { ref, visible } = useInView(0.1);
  const [hovered, setHovered] = useState(false);
  const isLight = theme === "light";
  return (
    <div ref={ref} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        background: T.card, border: `1px solid ${hovered ? T.rosa + "66" : T.border}`, borderRadius: "14px", padding: "20px",
        transition: "opacity 0.3s ease, transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, background 0.3s ease", opacity: visible ? 1 : 0, transform: visible ? (hovered ? "translateY(-4px)" : "translateY(0)") : "translateY(20px)", transitionDelay: `${delay}s`,
        boxShadow: hovered ? (isLight ? `0 8px 30px ${T.shadow}, 0 0 0 1px ${T.rosa}22` : `0 8px 30px ${T.rosa}15`) : (isLight ? `0 1px 4px ${T.shadow}` : "none"),
        ...s,
      }}
    >{children}</div>
  );
}

/* ───────────────────── ANIMATED DIVIDER ───────────────────── */
function Divider({ flip }: { flip?: boolean }) {
  const { T } = useT();
  return (
    <div style={{ position: "relative", height: "80px", overflow: "hidden", pointerEvents: "none" }}>
      {/* Flowing dashed line */}
      <svg width="100%" height="2" style={{ position: "absolute", top: "50%", left: 0 }}>
        <line x1="0" y1="1" x2="100%" y2="1" stroke={`${T.rosa}22`} strokeWidth="1" strokeDasharray="8 6" style={{ animation: "dash-flow 1.5s linear infinite" }} />
      </svg>
      {/* Center dot */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "6px", height: "6px", borderRadius: "50%", background: T.rosa, boxShadow: `0 0 12px ${T.rosa}55`, opacity: 0.6 }} />
      {/* Side glows */}
      <div style={{ position: "absolute", top: "50%", left: flip ? "15%" : "85%", transform: "translateY(-50%)", width: "100px", height: "100px", borderRadius: "50%", background: `radial-gradient(circle, ${T.rosa}08 0%, transparent 70%)`, animation: "breathe 6s ease-in-out infinite" }} />
    </div>
  );
}

/* ───────────────────── SECTION GLOW BACKGROUND ───────────────────── */
function SectionGlow({ color, side }: { color: string; side: "left" | "right" }) {
  return (
    <div style={{ position: "absolute", top: "20%", [side]: "-10%", width: "clamp(200px, 40vw, 400px)", height: "clamp(200px, 40vw, 400px)", borderRadius: "50%", background: `radial-gradient(circle, ${color}06 0%, transparent 70%)`, pointerEvents: "none", animation: "breathe 8s ease-in-out infinite", zIndex: 0 }} />
  );
}

/* ───────────────────── HERO ───────────────────── */
function HeroSection() {
  const { T, theme } = useT();
  const heroImg = theme === "dark" ? IMGS.marinHeroDark : IMGS.marinHeroLight;

  return (
    <Section id="home" style={{ paddingTop: "120px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "3rem", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 400px", minWidth: "280px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1rem" }}>
            <img src={IMGS.marinAvatar} alt="Avatar" style={{ width: "48px", height: "48px", borderRadius: "50%", border: `2px solid ${T.rosa}` }} />
            <div>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", color: T.muted }}>
                <span style={{ animation: "wave-hand 2.5s infinite", display: "inline-block", transformOrigin: "70% 70%" }}>👋</span> Oi, eu sou
              </p>
              <p style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: T.text }}>AFPL</p>
            </div>
          </div>

          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800, lineHeight: 1.15, marginBottom: "1rem" }}>
            <span style={{ color: T.text }}>Curioso por</span><br />
            <span data-gradient-text="" style={{ background: `linear-gradient(90deg, ${T.rosa}, ${T.gold})`, display: "inline-block" }}>criação e tecnologia.</span>
          </h1>

          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "1rem", color: T.muted, lineHeight: 1.7, maxWidth: "480px", marginBottom: "1.5rem" }}>
            Gosto de explorar programação, testar ideias e aprender fazendo. Este espaço é meu cantinho na internet — sem pressão de parecer uma empresa, só coisas que acho legais.
          </p>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <a href="#projects"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 22px", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem", fontWeight: 600, color: "#fff", background: T.rosa, borderRadius: "10px", textDecoration: "none", transition: "all 0.3s ease", boxShadow: `0 2px 10px ${T.rosa}33` }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 6px 20px ${T.rosa}44`; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 2px 10px ${T.rosa}33`; }}
            >Ver meus projetos ↓</a>
            <a href={GITHUB} target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 22px", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem", fontWeight: 600, color: T.text, background: "transparent", border: `1px solid ${T.border}`, borderRadius: "10px", textDecoration: "none", transition: "all 0.3s ease" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.rosa; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "translateY(0)"; }}
            >Meu GitHub ↗</a>
          </div>
        </div>

        {/* Right — image in styled frame */}
        <div style={{ flex: "0 1 380px", display: "flex", justifyContent: "center" }}>
          <div style={{ position: "relative", width: "100%", maxWidth: "340px", borderRadius: "24px", overflow: "hidden", border: `1px solid ${T.border}`, background: `linear-gradient(180deg, ${T.card} 0%, ${T.bg} 100%)`, boxShadow: `0 8px 40px ${T.rosa}15, 0 0 80px ${T.rosa}08`, transition: "all 0.5s ease" }}>
            <div style={{ height: "4px", background: `linear-gradient(90deg, ${T.rosa}, ${T.gold}, ${T.rosa})`, backgroundSize: "200% auto", animation: "shimmer 3s linear infinite" }} />
            <div style={{ position: "relative" }}>
              <img src={heroImg} alt="Marin Kitagawa" style={{ width: "100%", display: "block", pointerEvents: "none" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "40%", background: `linear-gradient(to top, ${T.bg} 0%, ${T.bg}cc 25%, transparent 100%)`, pointerEvents: "none", transition: "background 0.5s ease" }} />
              <div style={{ position: "absolute", bottom: "16px", left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: "8px", padding: "6px 16px", borderRadius: "12px", background: `${T.card}cc`, backdropFilter: "blur(10px)", border: `1px solid ${T.border}` }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: T.rosa, boxShadow: `0 0 6px ${T.rosa}` }} />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: T.muted, whiteSpace: "nowrap" }}>Marin Kitagawa ✿</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ───────────────────── QUOTE BANNER ───────────────────── */
function QuoteBanner() {
  const { T, theme } = useT();
  const { ref, visible } = useInView(0.2);
  const isLight = theme === "light";
  return (
    <div ref={ref} style={{ padding: "clamp(4rem, 10vw, 7rem) 24px", textAlign: "center", position: "relative", overflow: "hidden", background: isLight ? `linear-gradient(180deg, transparent, ${T.rosa}04, transparent)` : `linear-gradient(180deg, transparent, ${T.rosa}08, transparent)` }}>
      {/* Big decorative quotes */}
      <span style={{ position: "absolute", top: "5%", left: "6%", fontSize: "clamp(5rem, 15vw, 12rem)", fontFamily: "'Sora', sans-serif", fontWeight: 800, color: `${T.rosa}06`, lineHeight: 1, pointerEvents: "none", userSelect: "none", animation: "breathe 10s ease-in-out infinite" }}>"</span>
      <span style={{ position: "absolute", bottom: "0%", right: "6%", fontSize: "clamp(5rem, 15vw, 12rem)", fontFamily: "'Sora', sans-serif", fontWeight: 800, color: `${T.gold}05`, lineHeight: 1, pointerEvents: "none", userSelect: "none", transform: "rotate(180deg)", animation: "breathe 10s ease-in-out 3s infinite" }}>"</span>

      {/* Ambient blob */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "500px", height: "500px", borderRadius: "50%", background: `radial-gradient(circle, ${T.rosa}05 0%, transparent 60%)`, animation: "breathe 8s ease-in-out infinite", pointerEvents: "none" }} />

      <div style={{ maxWidth: "700px", margin: "0 auto", position: "relative", zIndex: 1, opacity: visible ? 1 : 0, transform: visible ? "translateY(0) scale(1)" : "translateY(30px) scale(0.97)", transition: "all 1s cubic-bezier(0.16,1,0.3,1)" }}>
        <p style={{ fontFamily: "'Sora', sans-serif", fontSize: "clamp(1.4rem, 3.5vw, 2.2rem)", fontWeight: 700, color: T.text, lineHeight: 1.5, marginBottom: "1.2rem", letterSpacing: "-0.01em" }}>
          Não precisa ser um grande projeto —{" "}
          <span data-gradient-text="" style={{ background: `linear-gradient(90deg, ${T.rosa}, ${T.gold})`, display: "inline" }}>curiosidade também cria coisas legais.</span>
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
          <div style={{ width: "24px", height: "1px", background: `${T.rosa}44` }} />
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", color: T.muted, letterSpacing: "0.1em" }}>AFPL · portfólio pessoal</p>
          <div style={{ width: "24px", height: "1px", background: `${T.rosa}44` }} />
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── JOURNEY TIMELINE ───────────────────── */
const JOURNEY = [
  { year: "2022", title: "First Lines of Code", desc: "Started learning Python from scratch. Built my first scripts and automations.", icon: "🐍", color: "#3776AB" },
  { year: "2023", title: "Discovered Lua", desc: "Dove into Lua scripting for Roblox and game development. Fell in love with the simplicity.", icon: "🌙", color: "#000080" },
  { year: "2024", title: "3D & Blender", desc: "Started creating 3D models and renders. Found a new way to express creativity.", icon: "🎨", color: "#F5792A" },
  { year: "2025", title: "Web Development", desc: "Jumped into React, Node.js, and modern web tooling. Built this portfolio from the ground up.", icon: "🌐", color: "#61dafb" },
  { year: "2026", title: "What's Next?", desc: "Working on ambitious projects. The best is yet to come.", icon: "🚀", color: "#e8788a" },
];

function JourneySection() {
  const { T, theme } = useT();
  const isLight = theme === "light";
  return (
    <Section id="journey" style={{ paddingBottom: "40px", position: "relative", overflow: "hidden" }}>
      <SectionGlow color="#61dafb" side="right" />
      <SectionTitle>My Journey</SectionTitle>
      <div style={{ position: "relative", maxWidth: "600px", margin: "0 auto" }}>
        {/* Vertical line */}
        <div style={{ position: "absolute", left: "20px", top: "8px", bottom: "8px", width: "2px", background: `linear-gradient(to bottom, ${T.rosa}44, ${T.gold}44, ${T.rosa}44)`, borderRadius: "1px" }} />

        {JOURNEY.map((item, i) => (
          <JourneyItem key={item.year} item={item} index={i} T={T} isLight={isLight} />
        ))}
      </div>
    </Section>
  );
}

function JourneyItem({ item, index, T, isLight }: { item: typeof JOURNEY[number]; index: number; T: Colors; isLight: boolean }) {
  const { ref, visible } = useInView(0.1);
  const [hovered, setHovered] = useState(false);
  const isLast = index === JOURNEY.length - 1;

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", gap: "20px", alignItems: "flex-start", marginBottom: isLast ? "0" : "2rem",
        opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(-20px)",
        transition: `all 0.5s ease ${index * 0.12}s`,
      }}
    >
      {/* Dot on timeline */}
      <div style={{ flexShrink: 0, width: "42px", display: "flex", justifyContent: "center", position: "relative", zIndex: 2 }}>
        <div style={{
          width: "42px", height: "42px", borderRadius: "50%",
          background: hovered ? `${item.color}22` : T.card,
          border: `2px solid ${hovered ? item.color : T.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.1rem", transition: "all 0.3s ease",
          boxShadow: hovered ? `0 0 20px ${item.color}33` : (isLight ? `0 1px 4px ${T.shadow}` : "none"),
        }}>
          {item.icon}
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1, background: T.card, border: `1px solid ${hovered ? item.color + "44" : T.border}`, borderRadius: "14px", padding: "16px 20px",
        transition: "all 0.3s ease", transform: hovered ? "translateX(4px)" : "translateX(0)",
        boxShadow: hovered ? (isLight ? `0 6px 20px ${T.shadow}` : `0 6px 20px ${item.color}15`) : (isLight ? `0 1px 4px ${T.shadow}` : "none"),
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: item.color, fontWeight: 600, padding: "2px 8px", borderRadius: "6px", background: `${item.color}15`, border: `1px solid ${item.color}22` }}>{item.year}</span>
          <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: "0.95rem", color: T.text }}>{item.title}</span>
        </div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: T.muted, lineHeight: 1.6 }}>{item.desc}</p>
        {isLast && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e88" }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: "#22c55e" }}>in progress</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────────────────── TECH MARQUEE ───────────────────── */
function TechMarquee() {
  const { T } = useT();
  const items = [...TECHS, ...TECHS];
  return (
    <div style={{ overflow: "hidden", borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, padding: "16px 0", background: `${T.card}80`, transition: "all 0.5s ease" }}>
      <div style={{ display: "flex", width: "max-content", animation: "marquee 25s linear infinite" }}>
        {items.map((t, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0 28px", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem", color: T.muted, whiteSpace: "nowrap" }}>
            <span style={{ fontSize: "1.2rem" }}>{t.icon}</span>{t.name}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────── ABOUT ───────────────────── */
function AboutSection() {
  const { T } = useT();
  return (
    <Section id="about" style={{ position: "relative", overflow: "hidden" }}>
      <SectionGlow color={T.rosa} side="left" />
      <SectionTitle>Um pouco sobre mim</SectionTitle>
      <AnimatedCard delay={0} style={{ padding: "2rem", marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: "0 0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <img src={IMGS.marinPeace} alt="Marin peace" style={{ width: "clamp(100px, 15vw, 140px)", borderRadius: "16px", filter: `drop-shadow(0 0 20px ${T.rosa}33)`, animation: "floatSlow 6s ease-in-out infinite" }} />
            <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 12px", borderRadius: "12px", background: `${T.rosa}15`, border: `1px solid ${T.rosa}33` }}>
              <span style={{ fontSize: "0.7rem" }}>🇧🇷</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: T.rosa }}>Brazil</span>
            </div>
          </div>
          <div style={{ flex: "1 1 300px" }}>
            <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.4rem", fontWeight: 700, color: T.text, marginBottom: "1rem", lineHeight: 1.3 }}>
              Aprendendo no meu ritmo, <span data-gradient-text="" style={{ background: `linear-gradient(90deg, ${T.rosa}, ${T.gold})`, display: "inline-block" }}>criando por curiosidade.</span>
            </h3>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "1rem", color: T.muted, lineHeight: 1.85, marginBottom: "1rem" }}>
              Já explorei linguagens como <strong style={{ color: T.rosa }}>Python</strong>, <strong style={{ color: T.gold }}>Lua</strong> e JavaScript. Nem tudo virou um grande projeto — e tudo bem: experimentar também faz parte de aprender.
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "1rem", color: T.muted, lineHeight: 1.85, marginBottom: "1rem" }}>
              No momento estou sem um projeto específico. Quando surgir uma ideia divertida, ela aparece por aqui. Por enquanto, este portfólio já é um laboratório para brincar com código, visual e interações.
            </p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {["Curiosidade", "Programação", "Web", "Experimentos"].map((tag) => (
                <span key={tag} style={{ padding: "4px 10px", borderRadius: "8px", background: `${T.rosa}12`, border: `1px solid ${T.rosa}22`, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: T.rosa }}>{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </AnimatedCard>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: "1.2rem", color: T.text, display: "flex", alignItems: "center", gap: "8px" }}><span style={{ fontSize: "1.3rem" }}>⚡</span> O que me interessa</h3>
          {WHAT_I_DO.map((item, i) => (
            <AnimatedCard key={i} delay={i * 0.1} style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: `${T.rosa}12`, border: `1px solid ${T.rosa}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 }}>{item.icon}</div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: "0.95rem", color: T.text }}>{item.title}</p>
                  <p style={{ fontSize: "0.8rem", color: T.muted, lineHeight: 1.5, marginTop: "2px" }}>{item.desc}</p>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: "1.2rem", color: T.text, display: "flex", alignItems: "center", gap: "8px" }}><span style={{ fontSize: "1.3rem" }}>🛠️</span> Ferramentas que já explorei</h3>
          {WHAT_I_USE.map((item, i) => (
            <AnimatedCard key={i} delay={i * 0.1} style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: `${T.gold}12`, border: `1px solid ${T.gold}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 }}>{item.icon}</div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: "0.95rem", color: T.text }}>{item.title}</p>
                  <p style={{ fontSize: "0.8rem", color: T.muted, lineHeight: 1.5, marginTop: "2px" }}>{item.desc}</p>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ───────────────────── TECH SECTION ───────────────────── */
function TechSection() {
  const { T } = useT();
  return (
    <Section id="tech" style={{ position: "relative", overflow: "hidden" }}>
      <SectionGlow color={T.gold} side="right" />
      <SectionTitle>Tecnologias que já explorei</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "1rem" }}>
        {TECHS.map((tech, i) => <TechCard key={tech.name} tech={tech} delay={i * 0.08} />)}
      </div>
    </Section>
  );
}

function TechCard({ tech, delay }: { tech: (typeof TECHS)[number]; delay: number }) {
  const { T, theme } = useT();
  const { ref, visible } = useInView(0.1);
  const [hovered, setHovered] = useState(false);
  const isLight = theme === "light";
  return (
    <div ref={ref} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: T.card, border: `1px solid ${hovered ? tech.color + "66" : T.border}`, borderRadius: "14px", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", cursor: "default", transition: "all 0.3s ease", opacity: visible ? 1 : 0, transform: visible ? (hovered ? "translateY(-6px) scale(1.03)" : "translateY(0) scale(1)") : "translateY(20px)", transitionDelay: `${delay}s`, boxShadow: hovered ? (isLight ? `0 8px 25px ${T.shadow}, 0 0 0 1px ${tech.color}22` : `0 8px 25px ${tech.color}25`) : (isLight ? `0 1px 4px ${T.shadow}` : "none") }}>
      <span style={{ fontSize: "2rem" }}>{tech.icon}</span>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8rem", fontWeight: 600, color: hovered ? tech.color : T.text, transition: "color 0.3s ease" }}>{tech.name}</span>
    </div>
  );
}

function StatCard({ label, value, icon, delay }: { label: string; value: string; icon: string; delay: number }) {
  const { T, theme } = useT();
  const { ref, visible } = useInView(0.1);
  const isLight = theme === "light";
  return (
    <div ref={ref} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: "14px", padding: "20px", textAlign: "center", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: "all 0.5s ease", transitionDelay: `${delay}s`, boxShadow: isLight ? `0 1px 4px ${T.shadow}` : "none" }}>
      <span style={{ fontSize: "1.5rem" }}>{icon}</span>
      <p style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.5rem", fontWeight: 700, color: T.rosa, marginTop: "6px", animation: visible ? "count-up 0.8s ease" : undefined }}>{value}</p>
      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", color: T.muted, marginTop: "4px" }}>{label}</p>
    </div>
  );
}

/* ───────────────────── CURRENTLY INTO ───────────────────── */
const INTERESTS = [
  { label: "Watching", value: "Sono Bisque Doll", emoji: "📺", sub: "anime" },
  { label: "Listening", value: "Lofi / Phonk", emoji: "🎧", sub: "LOVELI LORI · Anavitória · Brevis" },
  { label: "Exploring", value: "Web & criatividade", emoji: "🧪", sub: "sem pressa, só por diversão" },
];

function CurrentlyInto() {
  const { T, theme } = useT();
  const { ref, visible } = useInView(0.1);
  const isLight = theme === "light";

  return (
    <Section id="vibes" style={{ paddingTop: "40px" }}>
      <SectionTitle>Coisas que curto</SectionTitle>
      <div ref={ref} style={{ display: "flex", gap: "1rem", overflowX: "auto", paddingBottom: "8px", scrollSnapType: "x mandatory" }}>
        {INTERESTS.map((item, i) => (
          <CurrentlyCard key={item.label} item={item} index={i} visible={visible} T={T} isLight={isLight} />
        ))}
      </div>
    </Section>
  );
}

function CurrentlyCard({ item, index, visible, T, isLight }: { item: typeof INTERESTS[number]; index: number; visible: boolean; T: Colors; isLight: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: "0 0 200px", scrollSnapAlign: "start",
        background: T.card, border: `1px solid ${hovered ? T.rosa + "44" : T.border}`, borderRadius: "16px",
        padding: "20px 18px", display: "flex", flexDirection: "column", gap: "10px",
        transition: `all 0.3s ease`,
        opacity: visible ? 1 : 0,
        transform: visible ? (hovered ? "translateY(-4px)" : "translateY(0)") : "translateY(20px)",
        transitionDelay: `${index * 0.08}s`,
        boxShadow: hovered ? (isLight ? `0 8px 25px ${T.shadow}` : `0 8px 25px ${T.rosa}12`) : (isLight ? `0 1px 4px ${T.shadow}` : "none"),
      }}
    >
      <span style={{ fontSize: "1.8rem", display: "inline-block", animation: `icon-bob ${2 + index * 0.3}s ease-in-out infinite`, animationDelay: `${index * 0.2}s` }}>{item.emoji}</span>
      <div>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>{item.label}</p>
        <p style={{ fontFamily: "'Sora', sans-serif", fontSize: "0.95rem", fontWeight: 600, color: T.text }}>{item.value}</p>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: T.muted, marginTop: "4px" }}>{item.sub}</p>
      </div>
    </div>
  );
}

/* ───────────────────── SETUP / DAILY DRIVER ───────────────────── */
function SetupSection() {
  const { T, theme } = useT();
  const { ref, visible } = useInView(0.1);
  const isLight = theme === "light";

  const setup = [
    { icon: "💻", label: "Editor", value: "VS Code", detail: "+ Vim motions" },
    { icon: "🎨", label: "Design", value: "Blender", detail: "3D & renders" },
    { icon: "🦁", label: "Browser", value: "Brave", detail: "privacy + speed" },
    { icon: "🖥️", label: "OS", value: "Windows", detail: "11" },
    { icon: "⌨️", label: "Terminal", value: "PowerShell", detail: "+ Oh My Posh" },
    { icon: "🎵", label: "Music", value: "Lofi", detail: "always on" },
  ];

  return (
    <Section id="setup" style={{ paddingTop: "40px", paddingBottom: "40px" }}>
      <SectionTitle>My Setup</SectionTitle>
      <div ref={ref} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: "1rem" }}>
        {setup.map((item, i) => (
          <SetupCard key={item.label} item={item} index={i} visible={visible} T={T} isLight={isLight} />
        ))}
      </div>
    </Section>
  );
}

function SetupCard({ item, index, visible, T, isLight }: { item: { icon: string; label: string; value: string; detail: string }; index: number; visible: boolean; T: Colors; isLight: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: T.card, border: `1px solid ${hovered ? T.gold + "44" : T.border}`, borderRadius: "14px",
        padding: "18px 16px", display: "flex", alignItems: "flex-start", gap: "12px",
        opacity: visible ? 1 : 0, transform: visible ? (hovered ? "translateY(-3px)" : "translateY(0)") : "translateY(15px)",
        transition: "all 0.3s ease", transitionDelay: `${index * 0.06}s`,
        boxShadow: hovered ? (isLight ? `0 6px 20px ${T.shadow}` : `0 6px 20px ${T.gold}12`) : (isLight ? `0 1px 4px ${T.shadow}` : "none"),
      }}
    >
      <span style={{ fontSize: "1.4rem", flexShrink: 0, display: "inline-block", animation: `icon-bob ${2.5 + index * 0.2}s ease-in-out infinite`, animationDelay: `${index * 0.15}s` }}>{item.icon}</span>
      <div>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em" }}>{item.label}</p>
        <p style={{ fontFamily: "'Sora', sans-serif", fontSize: "0.9rem", fontWeight: 600, color: T.text, marginTop: "2px" }}>{item.value}</p>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem", color: T.muted, marginTop: "2px" }}>{item.detail}</p>
      </div>
    </div>
  );
}

/* ───────────────────── GITHUB SECTION ───────────────────── */
interface GitHubRepository {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  fork: boolean;
  archived: boolean;
}

function isGitHubRepository(value: unknown): value is GitHubRepository {
  if (typeof value !== "object" || value === null) return false;
  const repo = value as Record<string, unknown>;
  return typeof repo.id === "number"
    && typeof repo.name === "string"
    && (typeof repo.description === "string" || repo.description === null)
    && typeof repo.html_url === "string"
    && (typeof repo.language === "string" || repo.language === null)
    && typeof repo.stargazers_count === "number"
    && typeof repo.forks_count === "number"
    && typeof repo.updated_at === "string"
    && typeof repo.fork === "boolean"
    && typeof repo.archived === "boolean";
}

function ProjectsSection() {
  const { T, theme } = useT();
  const { ref, visible } = useInView(0.05);
  const [repositories, setRepositories] = useState<GitHubRepository[] | null>(null);
  const [hasError, setHasError] = useState(false);
  const isLight = theme === "light";

  useEffect(() => {
    const controller = new AbortController();

    async function loadRepositories() {
      try {
        const response = await fetch(
          "https://api.github.com/users/afporiginal/repos?type=owner&sort=updated&per_page=100",
          { signal: controller.signal, headers: { Accept: "application/vnd.github+json" } },
        );
        if (!response.ok) throw new Error(`GitHub returned ${response.status}`);

        const payload: unknown = await response.json();
        if (!Array.isArray(payload) || !payload.every(isGitHubRepository)) {
          throw new Error("Unexpected GitHub repository response");
        }

        setRepositories(payload.filter((repo) => !repo.fork && !repo.archived).slice(0, 6));
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.error("Could not load GitHub repositories.", error);
        setHasError(true);
      }
    }

    void loadRepositories();
    return () => controller.abort();
  }, []);

  const visibleRepositories = repositories ?? [];

  return (
    <Section id="projects">
      <SectionTitle>Projetos & experimentos</SectionTitle>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "1rem", color: T.muted, lineHeight: 1.7, maxWidth: "620px", margin: "-1.5rem 0 2rem" }}>
        Uma vitrine viva dos meus repositórios públicos. Ainda sem um projeto principal? Sem problema — aqui entram os experimentos também.
      </p>
      <div
        ref={ref}
        aria-live="polite"
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: "1rem" }}
      >
        {repositories === null && !hasError && (
          <p style={{ color: T.muted, gridColumn: "1 / -1", padding: "1.5rem 0" }}>Buscando os projetos mais recentes…</p>
        )}
        {hasError && (
          <div style={{ color: T.muted, gridColumn: "1 / -1", padding: "1.5rem 0" }}>
            Não consegui carregar os repositórios agora. Você ainda pode visitar meu perfil no GitHub.
          </div>
        )}
        {repositories !== null && visibleRepositories.length === 0 && (
          <div style={{ color: T.muted, gridColumn: "1 / -1", padding: "1.5rem 0" }}>
            Ainda não há repositórios próprios públicos para mostrar. Quando pintar um experimento novo, ele aparece aqui.
          </div>
        )}
        {visibleRepositories.map((repo, index) => (
          <a
            key={repo.id}
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              flexDirection: "column",
              minHeight: "210px",
              padding: "1.25rem",
              borderRadius: "16px",
              border: `1px solid ${T.border}`,
              background: `linear-gradient(145deg, ${T.card}, ${T.bgAlt})`,
              color: T.text,
              textDecoration: "none",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(18px)",
              transition: `opacity 0.5s ease ${index * 0.08}s, transform 0.5s ease ${index * 0.08}s, border-color 0.2s ease`,
              boxShadow: isLight ? `0 4px 18px ${T.shadow}` : "none",
            }}
            onMouseEnter={(event) => { event.currentTarget.style.borderColor = `${T.rosa}88`; }}
            onMouseLeave={(event) => { event.currentTarget.style.borderColor = T.border; }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "1rem" }}>
              <span style={{ fontSize: "1.3rem" }}>📦</span>
              <span style={{ color: T.rosa, fontSize: "0.8rem" }}>Abrir no GitHub ↗</span>
            </div>
            <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.05rem", marginBottom: "0.5rem", overflowWrap: "anywhere" }}>{repo.name}</h3>
            <p style={{ fontFamily: "'Inter', sans-serif", color: T.muted, fontSize: "0.85rem", lineHeight: 1.6, flex: 1 }}>
              {repo.description || "Um experimento sem descrição — abra o repositório para ver os detalhes."}
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", marginTop: "1rem", color: T.muted, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem" }}>
              <span>{repo.language || "Sem linguagem definida"}</span>
              <span aria-label={`${repo.stargazers_count} estrelas e ${repo.forks_count} forks`}>
                ★ {repo.stargazers_count} · Forks {repo.forks_count}
              </span>
            </div>
          </a>
        ))}
      </div>
      <a
        href={GITHUB}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: "inline-flex", marginTop: "1.5rem", color: T.rosa, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem", textDecoration: "none" }}
      >
        Ver todos os repositórios ↗
      </a>
    </Section>
  );
}

function GitHubSection() {
  const { T, theme } = useT();
  const { ref, visible } = useInView(0.05);
  const [hovered, setHovered] = useState(false);
  const isLight = theme === "light";

  return (
    <Section id="github">
      <SectionTitle>GitHub</SectionTitle>
      <div ref={ref} style={{ position: "relative", background: T.card, border: `1px solid ${T.border}`, borderRadius: "20px", overflow: "hidden", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transition: "all 0.7s ease", boxShadow: isLight ? `0 4px 20px ${T.shadow}` : "none" }}>
        <div style={{ height: "140px", background: isLight ? `linear-gradient(135deg, ${T.rosa}18, ${T.gold}15, ${T.rosa}0a)` : `linear-gradient(135deg, ${T.rosa}33, ${T.gold}22, ${T.rosa}11)`, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle at 20% 50%, ${T.rosa}22 0%, transparent 50%), radial-gradient(circle at 80% 50%, ${T.gold}22 0%, transparent 50%)` }} />
          {["</>", "{}", "//", "git", "→"].map((sym, i) => (
            <span key={i} style={{ position: "absolute", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: `${T.rosa}44`, top: `${15 + Math.sin(i * 1.8) * 30}%`, left: `${10 + i * 18}%`, animation: `floatSlow ${4 + i}s ease-in-out infinite`, animationDelay: `${i * 0.5}s` }}>{sym}</span>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "-50px", position: "relative", zIndex: 2 }}>
          <div style={{ width: "100px", height: "100px", borderRadius: "50%", border: `4px solid ${T.card}`, overflow: "hidden", boxShadow: `0 0 30px ${T.rosa}33` }}>
            <img src={IMGS.marinAvatar} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: "1.5rem", color: T.text, marginTop: "12px" }}>afporiginal</h3>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8rem", color: T.muted, marginTop: "4px" }}>Developer & Creator from Brazil 🇧🇷</p>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: "clamp(1.5rem, 5vw, 3rem)", padding: "1.5rem 1rem", marginTop: "1rem", borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
          {[{ label: "Repositories", value: "3", icon: "📁" }, { label: "Favorite", value: "Python", icon: "🐍" }, { label: "Focus", value: "Learning", icon: "🎯" }].map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <span style={{ fontSize: "1.2rem" }}>{s.icon}</span>
              <p style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: T.rosa, marginTop: "4px" }}>{s.value}</p>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: T.muted, marginTop: "2px" }}>{s.label}</p>
            </div>
          ))}
        </div>
        <div style={{ padding: "1.5rem 2rem 2rem" }}>
          {/* Working on projects message */}
          <div style={{ textAlign: "center", padding: "2rem 1rem", margin: "0 auto 1.5rem", maxWidth: "480px" }}>
            <span style={{ fontSize: "2.5rem", display: "block", marginBottom: "1rem" }}>🔨</span>
            <p style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.1rem", fontWeight: 600, color: T.text, marginBottom: "0.8rem" }}>
              Working on something big.
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9rem", color: T.muted, lineHeight: 1.7 }}>
              I'm currently building some ambitious projects behind the scenes. Can't share them just yet — but they'll be worth the wait. <strong style={{ color: T.rosa }}>Stay tuned.</strong> ⚡
            </p>
          </div>
          <div style={{ textAlign: "center" }}>
            <a href={GITHUB} target="_blank" rel="noopener noreferrer" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
              style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "14px 32px", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem", fontWeight: 600, color: hovered ? "#fff" : T.text, background: hovered ? T.rosa : "transparent", border: `2px solid ${T.rosa}`, borderRadius: "14px", textDecoration: "none", transition: "all 0.3s ease", transform: hovered ? "translateY(-2px)" : "translateY(0)", boxShadow: hovered ? `0 8px 25px ${T.rosa}44` : "none" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
              View GitHub Profile ↗
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ───────────────────── KONAMI CODE EASTER EGG 🌸 ───────────────────── */
const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];

function KonamiEasterEgg() {
  const { T } = useT();
  const [triggered, setTriggered] = useState(false);
  const [petals, setPetals] = useState<{ id: number; left: number; size: number; duration: number; delay: number; rot: number }[]>([]);
  const seqRef = useRef<string[]>([]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      seqRef.current.push(e.key.length === 1 ? e.key.toLowerCase() : e.key);
      if (seqRef.current.length > KONAMI.length) seqRef.current.shift();
      if (seqRef.current.join(",") === KONAMI.join(",")) {
        setTriggered(true);
        setPetals(Array.from({ length: 50 }, (_, i) => ({
          id: i, left: Math.random() * 100, size: Math.random() * 14 + 8,
          duration: Math.random() * 4 + 4, delay: Math.random() * 3, rot: Math.random() * 360,
        })));
        setTimeout(() => setTriggered(false), 8000);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!triggered) return null;

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 200, overflow: "hidden" }}>
      {/* Secret message */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", animation: "fadeInUp 0.6s ease", zIndex: 201 }}>
        <p style={{ fontFamily: "'Sora', sans-serif", fontSize: "2rem", fontWeight: 800, color: T.rosa, textShadow: `0 0 30px ${T.rosa}66` }}>🌸 Secret Found! 🌸</p>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8rem", color: T.muted, marginTop: "8px" }}>You know the Konami Code... nice.</p>
      </div>
      {/* Falling petals */}
      {petals.map((p) => (
        <div key={p.id} style={{
          position: "absolute", top: "-20px", left: `${p.left}%`,
          fontSize: `${p.size}px`, opacity: 0.8,
          animation: `petal-fall ${p.duration}s ${p.delay}s ease-in forwards`,
          transform: `rotate(${p.rot}deg)`,
        }}>🌸</div>
      ))}
    </div>
  );
}

/* ───────────────────── CURSOR GLOW ───────────────────── */
function CursorGlow() {
  const { T } = useT();
  const glowRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -200, y: -200 });
  const raf = useRef(0);

  useEffect(() => {
    const move = (e: MouseEvent) => { pos.current = { x: e.clientX, y: e.clientY }; };
    const tick = () => {
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${pos.current.x - 200}px, ${pos.current.y - 200}px)`;
      }
      raf.current = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", move);
    raf.current = requestAnimationFrame(tick);
    return () => { window.removeEventListener("mousemove", move); cancelAnimationFrame(raf.current); };
  }, []);

  return (
    <div ref={glowRef} style={{ position: "fixed", top: 0, left: 0, width: "400px", height: "400px", borderRadius: "50%", background: `radial-gradient(circle, ${T.rosa}0a 0%, transparent 70%)`, pointerEvents: "none", zIndex: 1, willChange: "transform", transition: "background 0.5s ease" }} />
  );
}

/* ───────────────────── SCROLL PROGRESS BAR ───────────────────── */
function ScrollProgress() {
  const { T } = useT();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? (window.scrollY / h) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "3px", zIndex: 60, background: "transparent" }}>
      <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg, ${T.rosa}, ${T.gold})`, borderRadius: "0 2px 2px 0", transition: "width 0.1s linear", boxShadow: `0 0 8px ${T.rosa}55` }} />
    </div>
  );
}

/* ───────────────────── INTERACTIVE TERMINAL ───────────────────── */
const TERMINAL_COMMANDS: Record<string, string[]> = {
  help: [
    "Comandos disponíveis:",
    "",
    "  about     — Quem é AFPL?",
    "  skills    — Tecnologias que já explorei",
    "  socials   — Onde me encontrar",
    "  projects  — Projetos e experimentos",
    "  quote     — Uma frase aleatória",
    "  clear     — Limpar o terminal",
    "  exit      — Fechar o terminal",
  ],
  about: [
    "┌─ Sobre AFPL ─────────────────────────┐",
    "│                                       │",
    "│  Uma pessoa curiosa do Brasil 🇧🇷       │",
    "│  Gosto de programação, web e ideias   │",
    "│  criativas feitas por diversão.      │",
    "│                                       │",
    "│  Sem projeto atual — só explorando   │",
    "│  e aprendendo no meu próprio ritmo.  │",
    "│                                       │",
    "└───────────────────────────────────────┘",
  ],
  skills: [
    "⚡ Linguagens: Python • Lua • JavaScript",
    "🌐 Web: React • Node.js • Vite",
    "🎨 Criatividade: Blender",
    "📦 Ferramentas: Git • VS Code • GitHub",
  ],
  socials: [
    "🐙 GitHub:    github.com/afporiginal",
    "💬 Discord:   afploriginal",
  ],
  projects: [
    "🧪 Nenhum projeto grande em andamento agora.",
    "",
    "   Este portfólio já é um experimento.",
    "   Veja a seção de projetos para explorar os repositórios.",
  ],
};

const QUOTES = [
  '"Any fool can write code that a computer can understand. Good programmers write code that humans can understand." — Martin Fowler',
  '"First, solve the problem. Then, write the code." — John Johnson',
  '"Code is like humor. When you have to explain it, it\'s bad." — Cory House',
  '"It works on my machine. ¯\\_(ツ)_/¯"',
  '"There are only two hard things in CS: cache invalidation, naming things, and off-by-one errors."',
  '"console.log(\'hello world\') — Every dev, day 1"',
];

function Terminal() {
  const { T, theme } = useT();
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<{ text: string; type: "input" | "output" | "error" }[]>([
    { text: "Bem-vindo ao terminal de brincadeira do AFPL", type: "output" },
    { text: 'Digite "help" para ver os comandos.', type: "output" },
    { text: "", type: "output" },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isLight = theme === "light";

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [lines]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 100); }, [open]);

  const run = (cmd: string) => {
    const c = cmd.trim().toLowerCase();
    const newLines = [...lines, { text: `$ ${cmd}`, type: "input" as const }];

    if (c === "clear") { setLines([{ text: "Terminal limpo.", type: "output" }]); return; }
    if (c === "exit") { setOpen(false); return; }
    if (c === "quote") {
      const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
      setLines([...newLines, { text: "", type: "output" }, { text: q, type: "output" }, { text: "", type: "output" }]);
      return;
    }
    const result = TERMINAL_COMMANDS[c];
    if (result) {
      setLines([...newLines, { text: "", type: "output" }, ...result.map((t) => ({ text: t, type: "output" as const })), { text: "", type: "output" }]);
    } else {
      setLines([...newLines, { text: `Comando não encontrado: ${c}. Digite "help" para ver as opções.`, type: "error" }]);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && input.trim()) {
      run(input);
      setHistory((h) => [input, ...h]);
      setHistIdx(-1);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0) {
        const ni = Math.min(histIdx + 1, history.length - 1);
        setHistIdx(ni);
        setInput(history[ni]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx > 0) { setHistIdx(histIdx - 1); setInput(history[histIdx - 1]); }
      else { setHistIdx(-1); setInput(""); }
    }
  };

  return (
    <>
      {/* FAB button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed", bottom: "24px", right: "24px", zIndex: 55,
          width: "48px", height: "48px", borderRadius: "14px",
          background: `linear-gradient(135deg, ${T.rosa}, ${T.rosa}cc)`,
          border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 4px 20px ${T.rosa}44`,
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          fontSize: "1.3rem",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.1)"; e.currentTarget.style.boxShadow = `0 6px 25px ${T.rosa}66`; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = `0 4px 20px ${T.rosa}44`; }}
        aria-label={open ? "Fechar terminal" : "Abrir terminal de brincadeira"}
        title="Terminal de brincadeira"
      >
        {open ? "✕" : ">_"}
      </button>

      {/* Terminal panel */}
      {open && (
        <div
          style={{
            position: "fixed", bottom: "84px", right: "24px", zIndex: 55,
            width: "min(460px, calc(100vw - 48px))", height: "min(380px, 55vh)",
            borderRadius: "16px", overflow: "hidden",
            border: `1px solid ${T.border}`,
            background: isLight ? "#1e1b2e" : T.card,
            boxShadow: `0 12px 50px ${T.shadow}, 0 0 0 1px ${T.border}`,
            display: "flex", flexDirection: "column",
            animation: "fadeInUp 0.3s ease",
          }}
        >
          {/* Title bar */}
          <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid #2a2640", background: isLight ? "#16132a" : "#0e0e16", flexShrink: 0 }}>
            <div style={{ display: "flex", gap: "6px" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ff5f57", cursor: "pointer" }} onClick={() => setOpen(false)} />
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#febc2e" }} />
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#28c840" }} />
            </div>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: "#8b82a0", marginLeft: "8px" }}>afpl@portfolio ~ </span>
          </div>

          {/* Output */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", lineHeight: 1.7 }}>
            {lines.map((l, i) => (
              <div key={i} style={{ color: l.type === "input" ? "#e8788a" : l.type === "error" ? "#ef4444" : "#c4bcda", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {l.text}
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div style={{ padding: "8px 14px", borderTop: "1px solid #2a2640", display: "flex", alignItems: "center", gap: "8px", flexShrink: 0, background: isLight ? "#16132a" : "#0e0e16" }}>
            <span style={{ color: "#e8788a", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", flexShrink: 0 }}>$</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="digite um comando..."
              aria-label="Comando do terminal"
              style={{
                flex: 1, background: "transparent", border: "none", outline: "none",
                color: "#e2e8f0", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem",
                caretColor: "#e8788a",
              }}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        </div>
      )}
    </>
  );
}

/* ───────────────────── FUN FACTS ───────────────────── */
const FACTS = [
  { front: "🎌", back: "Anime enjoyer — Sono Bisque Doll is peak", color: "#e8788a" },
  { front: "🕐", back: "I code better at 3AM than 3PM", color: "#f5c542" },
  { front: "🧠", back: "Self-taught — YouTube + docs + pain", color: "#61dafb" },
  { front: "🎮", back: "Started making Discord bots — none worked, but I learned a lot", color: "#22c55e" },
  { front: "🔥", back: "Once spent 12h debugging a missing semicolon", color: "#F05032" },
  { front: "🌍", back: "Dream: build something millions use", color: "#F5792A" },
];

function FunFacts() {
  const { T, theme } = useT();
  const isLight = theme === "light";
  return (
    <Section id="facts" style={{ paddingTop: "40px", paddingBottom: "40px" }}>
      <SectionTitle>Fun Facts</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "1rem" }}>
        {FACTS.map((fact, i) => <FactCard key={i} fact={fact} delay={i * 0.08} T={T} isLight={isLight} />)}
      </div>
    </Section>
  );
}

function FactCard({ fact, delay, T, isLight }: { fact: typeof FACTS[number]; delay: number; T: Colors; isLight: boolean }) {
  const { ref, visible } = useInView(0.1);
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      ref={ref}
      onClick={() => setFlipped(!flipped)}
      style={{
        perspective: "600px", cursor: "pointer", height: "140px",
        opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`,
      }}
    >
      <div style={{
        position: "relative", width: "100%", height: "100%",
        transformStyle: "preserve-3d",
        transition: "transform 0.6s cubic-bezier(0.16,1,0.3,1)",
        transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
      }}>
        {/* Front */}
        <div style={{
          position: "absolute", inset: 0, backfaceVisibility: "hidden",
          background: T.card, border: `1px solid ${T.border}`, borderRadius: "16px",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px",
          boxShadow: isLight ? `0 1px 4px ${T.shadow}` : "none",
        }}>
          <span style={{ fontSize: "2.5rem", display: "inline-block", animation: "icon-bob 3s ease-in-out infinite" }}>{fact.front}</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6", color: T.muted }}>click me</span>
        </div>
        {/* Back */}
        <div style={{
          position: "absolute", inset: 0, backfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
          background: `linear-gradient(135deg, ${fact.color}15, ${T.card})`,
          border: `1px solid ${fact.color}33`, borderRadius: "16px",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "16px", textAlign: "center",
          boxShadow: `0 4px 15px ${fact.color}15`,
        }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: T.text, lineHeight: 1.5 }}>{fact.back}</p>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── CONTACT CTA ───────────────────── */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOFI_NOTES: number[] = [], LOFI_MELODY: number[] = [];
function _DEAD_CODE_START() {
  const { T, theme } = useT();
  const [isPlaying, setIsPlaying] = useState(true);
  const [bpm, setBpm] = useState(65); // Slower, dreamier
  const [synthType, setSynthType] = useState<OscillatorType>("sine"); // Soft sine for lofi
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const timerRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isLight = theme === "light";
  const autoStarted = useRef(false);

  // Step sequencer: 8 steps, 3 tracks (Kick, Snare, Hihat) - lofi pattern
  const [seq, setSeq] = useState({
    kick: [true, false, false, false, false, false, true, false],
    snare: [false, false, false, true, false, false, false, false],
    hat: [false, false, true, false, false, false, true, false],
  });
  const currentStep = useRef(0);

  // Init AudioContext on interaction
  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioCtxRef.current.createAnalyser();
      analyserRef.current.fftSize = 64;
      analyserRef.current.connect(audioCtxRef.current.destination);
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  };

  // Sound synthesis — whisper-quiet lofi
  const playKick = (ctx: AudioContext, dest: AudioNode) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(dest);

    osc.frequency.setValueAtTime(55, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(25, ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.55);
  };

  const playSnare = (ctx: AudioContext, dest: AudioNode) => {
    const bufferSize = ctx.sampleRate * 0.1;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 2000;
    filter.Q.value = 0.3;

    const gain = ctx.createGain();
    noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    noiseNode.start(ctx.currentTime);
  };

  const playHihat = (ctx: AudioContext, dest: AudioNode) => {
    const bufferSize = ctx.sampleRate * 0.03;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 9000;

    const gain = ctx.createGain();
    noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

    noiseNode.start(ctx.currentTime);
  };

  // Lofi melody — very soft, long decay, muffled
  const playMelody = (ctx: AudioContext, dest: AudioNode, freq: number) => {
    const osc1 = ctx.createOscillator();
    osc1.type = synthType;
    osc1.frequency.setValueAtTime(freq, ctx.currentTime);

    // Detuned layer
    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(freq * 1.002, ctx.currentTime);

    // Heavy lowpass — muffled like through a wall
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(500 + Math.random() * 300, ctx.currentTime);
    filter.Q.value = 1;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc1.start(ctx.currentTime);
    osc2.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 1.6);
    osc2.stop(ctx.currentTime + 1.6);
  };

  // Manual synth pad trigger
  const triggerNote = (freq: number) => {
    initAudio();
    const ctx = audioCtxRef.current;
    const dest = analyserRef.current;
    if (!ctx || !dest) return;
    playMelody(ctx, dest, freq);
  };

  // Auto-start on first user interaction anywhere
  useEffect(() => {
    if (autoStarted.current) return;
    const start = () => {
      autoStarted.current = true;
      initAudio();
      document.removeEventListener("click", start);
      document.removeEventListener("keydown", start);
    };
    document.addEventListener("click", start, { once: true });
    document.addEventListener("keydown", start, { once: true });
    return () => { document.removeEventListener("click", start); document.removeEventListener("keydown", start); };
  }, []);

  // Main sequencer loop — 8 steps with melody
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    const interval = (60 / bpm / 2) * 1000; // 8th notes
    timerRef.current = window.setInterval(() => {
      const ctx = audioCtxRef.current;
      const dest = analyserRef.current;
      if (!ctx || !dest) return;

      const step = currentStep.current;
      if (seq.kick[step]) playKick(ctx, dest);
      if (seq.snare[step]) playSnare(ctx, dest);
      if (seq.hat[step]) playHihat(ctx, dest);

      // Play melody note
      const melIdx = LOFI_MELODY[step];
      if (melIdx >= 0 && melIdx < LOFI_NOTES.length) {
        playMelody(ctx, dest, LOFI_NOTES[melIdx]);
      }

      currentStep.current = (step + 1) % 8;
    }, interval);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, bpm, seq, synthType]);

  // Audio visualizer loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasCtx = canvas.getContext("2d");
    if (!canvasCtx) return;

    let animFrame: number;
    const renderFrame = () => {
      animFrame = requestAnimationFrame(renderFrame);
      const width = canvas.width;
      const height = canvas.height;

      // Clear with translucency for motion trail
      canvasCtx.fillStyle = isLight ? "rgba(250, 248, 245, 0.25)" : "rgba(10, 10, 18, 0.25)";
      canvasCtx.fillRect(0, 0, width, height);

      const analyser = analyserRef.current;
      if (!analyser || !isPlaying) {
        // Draw idle sine wave
        canvasCtx.beginPath();
        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = T.rosa;
        for (let i = 0; i < width; i++) {
          const y = height / 2 + Math.sin(i * 0.05 + Date.now() * 0.01) * 6;
          if (i === 0) canvasCtx.moveTo(i, y);
          else canvasCtx.lineTo(i, y);
        }
        canvasCtx.stroke();
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      // Draw reactive neon equalizer bars
      const barWidth = (width / bufferLength) * 1.5;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const percent = dataArray[i] / 255;
        const barHeight = percent * height * 0.8;

        // Custom neon gradient
        const grad = canvasCtx.createLinearGradient(0, height, 0, height - barHeight);
        grad.addColorStop(0, T.rosa);
        grad.addColorStop(1, T.gold);

        canvasCtx.fillStyle = grad;
        canvasCtx.fillRect(x, height - barHeight, barWidth - 2, barHeight);

        x += barWidth;
      }
    };
    renderFrame();
    return () => cancelAnimationFrame(animFrame);
  }, [T, isPlaying, isLight]);

  const toggleSequencer = () => {
    initAudio();
    setIsPlaying(!isPlaying);
  };

  const toggleStep = (track: "kick" | "snare" | "hat", idx: number) => {
    setSeq((prev) => ({
      ...prev,
      [track]: prev[track].map((val, i) => (i === idx ? !val : val)),
    }));
  };

  // Key frequencies (C minor pentatonic — lofi range)
  const KEYS = [
    { label: "C3", freq: 130.81 },
    { label: "Eb3", freq: 155.56 },
    { label: "F3", freq: 174.61 },
    { label: "G3", freq: 196.00 },
    { label: "Bb3", freq: 233.08 },
    { label: "C4", freq: 261.63 },
  ];

  return (
    <Section id="soundboard">
      <SectionTitle>Sinth & Beatmaker (Phonk/Lofi)</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
        {/* Controller & Sequencer */}
        <AnimatedCard>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h4 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, color: T.text }}>Beatmaker v1.0</h4>
              <button
                onClick={toggleSequencer}
                style={{
                  padding: "8px 20px", borderRadius: "10px", border: "none", cursor: "pointer",
                  background: isPlaying ? T.rosa : `linear-gradient(135deg, ${T.gold}, ${T.gold}bb)`,
                  color: "#000", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "0.8rem", transition: "all 0.3s ease",
                  boxShadow: `0 0 15px ${isPlaying ? T.rosa : T.gold}44`,
                }}
              >
                {isPlaying ? "⏸ STOP" : "▶ PLAY LOFI"}
              </button>
            </div>

            {/* Step grids */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {Object.entries(seq).map(([track, steps]) => (
                <div key={track} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", width: "45px", color: T.muted, textTransform: "uppercase" }}>{track}</span>
                  <div style={{ display: "flex", gap: "6px", flex: 1 }}>
                    {steps.map((active, idx) => (
                      <button
                        key={idx}
                        onClick={() => toggleStep(track as any, idx)}
                        style={{
                          flex: 1, height: "30px", borderRadius: "8px", border: `1px solid ${active ? T.rosa : T.border}`,
                          background: active ? T.rosa : "transparent",
                          cursor: "pointer", transition: "all 0.2s ease",
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* BPM & Synth Type controls */}
            <div style={{ display: "flex", justifyContent: "space-between", gap: "20px" }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: T.muted, marginBottom: "4px" }}>BPM: {bpm}</p>
                <input
                  type="range" min="60" max="180" value={bpm}
                  onChange={(e) => setBpm(parseInt(e.target.value))}
                  style={{ width: "100%", accentColor: T.rosa }}
                />
              </div>
              <div>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: T.muted, marginBottom: "4px" }}>SYNTH WAF</p>
                <div style={{ display: "flex", gap: "4px" }}>
                  {(["sine", "triangle", "sawtooth"] as OscillatorType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setSynthType(t)}
                      style={{
                        padding: "4px 8px", borderRadius: "6px", border: `1px solid ${synthType === t ? T.rosa : T.border}`,
                        background: synthType === t ? `${T.rosa}15` : "transparent",
                        color: synthType === t ? T.rosa : T.muted,
                        fontSize: "0.6rem", fontFamily: "'JetBrains Mono', monospace", cursor: "pointer",
                      }}
                    >
                      {t === "sine" ? "SIN" : t === "triangle" ? "TRI" : "SAW"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </AnimatedCard>

        {/* Synth Keys & Visualizer */}
        <AnimatedCard>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", height: "100%" }}>
            {/* Visualizer canvas */}
            <div style={{ background: isLight ? "#f0ebe4" : "#08080f", border: `1px solid ${T.border}`, borderRadius: "14px", overflow: "hidden", height: "100px", position: "relative" }}>
              <canvas ref={canvasRef} width="350" height="100" style={{ width: "100%", height: "100%" }} />
              <span style={{ position: "absolute", top: "8px", right: "12px", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.55rem", color: T.muted, letterSpacing: "0.15em" }}>OS.OSCILLOSCOPE</span>
            </div>

            {/* Synthesizer pads */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: T.muted }}>SYNTH PADS (TAP TO VIBE)</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                {KEYS.map((k) => (
                  <button
                    key={k.label}
                    onClick={() => triggerNote(k.freq)}
                    style={{
                      padding: "16px 0", borderRadius: "10px", border: `1px solid ${T.border}`,
                      background: T.card, color: T.text, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "0.75rem", cursor: "pointer", transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.rosa; e.currentTarget.style.background = `${T.rosa}0a`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.card; }}
                  >
                    {k.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </AnimatedCard>
      </div>
    </Section>
  );
}

/* ───────────────────── CONTACT CTA ───────────────────── */
function ContactSection() {
  const { T, theme } = useT();
  const { ref, visible } = useInView(0.1);
  const isLight = theme === "light";

  return (
    <Section id="contact">
      <div
        ref={ref}
        style={{
          position: "relative", borderRadius: "24px", overflow: "hidden",
          background: isLight ? `linear-gradient(135deg, ${T.rosa}10, ${T.gold}08, ${T.rosa}05)` : `linear-gradient(135deg, ${T.rosa}18, ${T.gold}10, ${T.rosa}08)`,
          border: `1px solid ${T.border}`, padding: "clamp(2.5rem, 6vw, 4rem)",
          opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transition: "all 0.7s ease",
          boxShadow: isLight ? `0 4px 20px ${T.shadow}` : "none",
        }}
      >
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "200px", height: "200px", borderRadius: "50%", border: `1px solid ${T.rosa}15`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-60px", left: "-30px", width: "250px", height: "250px", borderRadius: "50%", border: `1px solid ${T.gold}10`, pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
          <span style={{ fontSize: "2.5rem", display: "block", marginBottom: "1rem" }}>💬</span>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: "clamp(1.5rem, 3.5vw, 2.2rem)", fontWeight: 700, color: T.text, marginBottom: "0.8rem" }}>
            Bora trocar uma ideia?
          </h2>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "1rem", color: T.muted, lineHeight: 1.7, maxWidth: "450px", margin: "0 auto 2rem" }}>
            Este portfólio é só um espaço pessoal. Se quiser conversar sobre código, ideias ou qualquer coisa interessante, me encontra por aqui.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <a href={GITHUB} target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 28px", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem", fontWeight: 600, color: "#fff", background: T.rosa, borderRadius: "12px", textDecoration: "none", transition: "all 0.3s ease", boxShadow: `0 4px 15px ${T.rosa}33` }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 6px 25px ${T.rosa}55`; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 4px 15px ${T.rosa}33`; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              Meu GitHub
            </a>
            <a href="https://discord.com/users/afploriginal" target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 28px", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem", fontWeight: 600, color: T.text, background: "transparent", border: `1px solid ${T.border}`, borderRadius: "12px", textDecoration: "none", transition: "all 0.3s ease" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.rosa; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              💬 Meu Discord
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ───────────────────── FOOTER ───────────────────── */
function Footer() {
  const { T } = useT();
  return (
    <footer style={{ borderTop: `1px solid ${T.border}`, padding: "40px 24px", textAlign: "center", transition: "border-color 0.5s ease" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
        <a href="#home" data-gradient-text="" style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: "1.5rem", background: `linear-gradient(90deg, ${T.rosa}, ${T.gold})`, textDecoration: "none" }}>AFPL</a>
        <div style={{ display: "flex", gap: "16px" }}>
          {[{ label: "GitHub", href: GITHUB }, { label: "Discord", href: DISCORD }].map((link) => (
            <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8rem", color: T.muted, textDecoration: "none", transition: "color 0.3s ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = T.rosa)} onMouseLeave={(e) => (e.currentTarget.style.color = T.muted)}
            >{link.label}</a>
          ))}
        </div>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: T.muted }}>© {new Date().getFullYear()} AFPL — feito com curiosidade e ☕</p>
      </div>
    </footer>
  );
}

/* ───────────────────── APP ───────────────────── */
export default function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedTheme = localStorage.getItem("afpl-theme");
        if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
      } catch (error) {
        console.warn("Could not read the saved theme preference.", error);
      }
    }
    return "dark";
  });
  const T = THEMES[theme];

  const toggle = useCallback(() => {
    setTheme((p) => {
      const nextTheme = p === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("afpl-theme", nextTheme);
      } catch (error) {
        console.warn("Could not save the theme preference.", error);
      }
      return nextTheme;
    });
  }, []);

  useEffect(() => {
    document.body.style.background = T.bg;
    document.body.style.color = T.text;
    document.body.style.transition = "background 0.5s ease";

    const s = document.getElementById("dyn-scroll") || document.createElement("style");
    s.id = "dyn-scroll";
    s.textContent = `
      ::-webkit-scrollbar-track{background:${T.bg};transition:background 0.5s ease}
      ::-webkit-scrollbar-thumb{background:${T.rosa}44}
      ::-webkit-scrollbar-thumb:hover{background:${T.rosa}88}
      body::before {
        content: " ";
        display: block;
        position: fixed;
        top: 0; left: 0; bottom: 0; right: 0;
        background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.15) 50%);
        background-size: 100% 4px;
        z-index: 999;
        pointer-events: none;
        opacity: 0.15;
      }
    `;
    if (!document.getElementById("dyn-scroll")) document.head.appendChild(s);
  }, [T]);

  return (
    <ThemeCtx.Provider value={{ theme, T, toggle }}>
        <div style={{ background: T.bg, minHeight: "100vh", transition: "background 0.5s ease", animation: "fadeIn 0.5s ease", position: "relative" }}>
          {/* CRT overlay */}
          <div className="crt-overlay" />
          <Scene3DCanvas isDark={theme === "dark"} />
          <CursorGlow />
          <ScrollProgress />
          <KonamiEasterEgg />
          <Particles />
          <Navbar />
          <HeroSection />
          <QuoteBanner />
          <TechMarquee />
          <Divider />
          <AboutSection />
          <Divider flip />
          <ProjectsSection />
          <Divider flip />
          <TechSection />
          <ContactSection />
          <Footer />
          <Terminal />
          <ScrollToTopRewind T={T} theme={theme} />
        </div>
    </ThemeCtx.Provider>
  );
}
