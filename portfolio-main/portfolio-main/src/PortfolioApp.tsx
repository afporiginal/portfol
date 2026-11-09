import { useEffect, useState } from "react";
import AdminPage from "./AdminPage";
import "./portfolio.css";
import {
  AKAME_IMAGES,
  DEFAULT_CONTENT,
  fetchGitHubRepositories,
  normalizeSiteContent,
  readHiddenProjectIds,
  readPublicContent,
  safeExternalUrl,
  safeImageUrl,
  type ContentCard,
  type GitHubRepository,
  type ProjectOverride,
  type SiteContent,
} from "./cms";

type Theme = "dark" | "light";
type Page = "home" | "projects" | "about" | "contact";

const PAGE_PATHS: Record<Page, string> = {
  home: "#/",
  projects: "#/projetos",
  about: "#/sobre",
  contact: "#/contato",
};

const NAV_ITEMS: { page: Page; label: (content: SiteContent) => string }[] = [
  { page: "home", label: (content) => content.navHome },
  { page: "projects", label: (content) => content.navProjects },
  { page: "about", label: (content) => content.navAbout },
  { page: "contact", label: (content) => content.navContact },
];

function pageFromHash(hash: string): Page {
  const route = hash.replace(/^#\/?/, "").split("/")[0];
  if (route === "projetos") return "projects";
  if (route === "sobre") return "about";
  if (route === "contato") return "contact";
  return "home";
}

function getStoredTheme(): Theme {
  try {
    const saved = localStorage.getItem("afpl-theme");
    return saved === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

function useRepositories() {
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function load() {
      try {
        const repos = await fetchGitHubRepositories(controller.signal);
        let hidden = new Set<number>();
        try {
          hidden = await readHiddenProjectIds();
        } catch (hiddenError) {
          console.warn("Could not load hidden project IDs.", hiddenError);
        }
        if (active) setRepositories(repos.filter((repo) => !hidden.has(repo.id)));
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") return;
        console.error("Could not load GitHub repositories.", fetchError);
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  return { repositories, loading, error };
}

function projectDetails(repo: GitHubRepository, content: SiteContent) {
  const override: Partial<ProjectOverride> = content.projectOverrides[String(repo.id)] ?? content.projectOverrides[repo.name] ?? {};
  return {
    title: override.title?.trim() || repo.name,
    description: override.description?.trim() || repo.description || "Um projeto em evolução. Abra o repositório para ver o código e os detalhes.",
    url: safeExternalUrl(override.url?.trim() || repo.html_url, repo.html_url),
    language: override.language?.trim() || repo.language || "Projeto pessoal",
    cta: override.cta?.trim() || content.projectCardCta,
    showStats: override.showStats !== false,
  };
}

function ThemeButton({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  const light = theme === "light";
  return (
    <button className="theme-toggle" type="button" onClick={onToggle} aria-label={light ? "Ativar tema escuro" : "Ativar tema claro"} title={light ? "Tema escuro" : "Tema claro"}>
      <span aria-hidden="true">{light ? "☾" : "☼"}</span>
    </button>
  );
}

function SiteHeader({ page, content, theme, onThemeToggle }: { page: Page; content: SiteContent; theme: Theme; onThemeToggle: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="brand" href={PAGE_PATHS.home} onClick={() => setMenuOpen(false)} aria-label={`${content.brandName}, início`}>
          <span className="brand-symbol" aria-hidden="true">A</span>
          <span className="brand-name">{content.brandName}<small>PORTFÓLIO</small></span>
        </a>
        <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? "Fechar" : "Menu"}
        </button>
        <nav id="main-navigation" className={`main-navigation${menuOpen ? " is-open" : ""}`} aria-label="Navegação principal">
          {NAV_ITEMS.map(({ page: target, label }) => {
            if (target === "projects" && !content.showProjects) return null;
            if (target === "about" && !content.showAbout) return null;
            if (target === "contact" && !content.showContact) return null;
            return (
              <a key={target} className={`nav-link${page === target ? " is-active" : ""}`} href={PAGE_PATHS[target]} aria-current={page === target ? "page" : undefined} onClick={() => setMenuOpen(false)}>
                {label(content)}
              </a>
            );
          })}
          <ThemeButton theme={theme} onToggle={onThemeToggle} />
        </nav>
      </div>
    </header>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow"><span className="eyebrow-mark" aria-hidden="true" />{children}</p>;
}

function PageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="page-heading">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
  );
}

function LinkArrow() {
  return <span aria-hidden="true" className="arrow-icon">↗</span>;
}

function ProjectCard({ repo, content, compact = false }: { repo: GitHubRepository; content: SiteContent; compact?: boolean }) {
  const project = projectDetails(repo, content);
  return (
    <a className={`project-card${compact ? " is-compact" : ""}`} href={project.url} target="_blank" rel="noopener noreferrer">
      <span className="project-card-top"><span className="project-kind">REPOSITÓRIO</span><LinkArrow /></span>
      <h3>{project.title}</h3>
      <p>{project.description}</p>
      <span className="project-card-bottom">
        <span className="project-language">{project.language}</span>
        {project.showStats && <span className="project-stats">★ {repo.stargazers_count} <span aria-hidden="true">·</span> {repo.forks_count} forks</span>}
      </span>
    </a>
  );
}

function ProjectGrid({ repositories, content, compact = false }: { repositories: GitHubRepository[]; content: SiteContent; compact?: boolean }) {
  return <div className={`project-grid${compact ? " is-compact" : ""}`}>{repositories.map((repo) => <ProjectCard key={repo.id} repo={repo} content={content} compact={compact} />)}</div>;
}

function HomePage({ content, theme, repositories, loading, error }: { content: SiteContent; theme: Theme; repositories: GitHubRepository[]; loading: boolean; error: boolean }) {
  const heroImage = safeImageUrl(theme === "dark" ? content.heroDarkImageUrl : content.heroLightImageUrl, AKAME_IMAGES.action);
  const featured = repositories.slice(0, 3);

  return (
    <>
      <section className="home-hero page-container">
        <div className="hero-copy">
          <Eyebrow>{content.heroEyebrow} <span className="eyebrow-name">{content.heroName}</span></Eyebrow>
          <h1 className="hero-title">{content.heroTitleLead}<span>{content.heroTitleHighlight}</span></h1>
          <p className="hero-description">{content.heroDescription}</p>
          <div className="hero-actions">
            <a className="button button-primary" href={content.showProjects ? PAGE_PATHS.projects : safeExternalUrl(content.githubUrl)} target={content.showProjects ? undefined : "_blank"} rel={content.showProjects ? undefined : "noopener noreferrer"}>
              {content.heroPrimaryLabel}<LinkArrow />
            </a>
            <a className="button button-secondary" href={safeExternalUrl(content.githubUrl)} target="_blank" rel="noopener noreferrer">{content.heroSecondaryLabel}</a>
          </div>
          <div className="hero-tags" aria-label="Áreas de interesse">
            {content.aboutTags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}
          </div>
        </div>

        <figure className="hero-visual">
          <div className="hero-image-wrap">
            <img src={heroImage} alt={content.heroImageAlt} />
          </div>
          <figcaption><span>{content.heroImageCaption}</span><span className="image-index">01 / 05</span></figcaption>
          <span className="hero-visual-label">AKAME GA KILL! <i>·</i> AKAME</span>
        </figure>
        <div className="hero-footnote"><span>PORTFÓLIO PESSOAL</span><span>DESENVOLVIMENTO · CRIATIVIDADE · EXPERIMENTOS</span></div>
      </section>

      {content.showQuote && (
        <section className="quote-band">
          <div className="page-container quote-inner">
            <span className="quote-mark" aria-hidden="true">“</span>
            <blockquote>{content.quoteLead} <strong>{content.quoteHighlight}</strong></blockquote>
            <p>{content.quoteSignature}</p>
          </div>
        </section>
      )}

      {content.showProjects && (
        <section className="page-container section-block">
          <div className="section-heading-row">
            <PageHeading eyebrow="TRABALHOS SELECIONADOS" title={content.projectsTitle} description={content.projectsDescription} />
            <a className="text-link" href={PAGE_PATHS.projects}>Todos os projetos <LinkArrow /></a>
          </div>
          {loading && <p className="status-message">{content.projectsLoadingMessage}</p>}
          {error && <p className="status-message">{content.projectsErrorMessage}</p>}
          {!loading && !error && featured.length > 0 && <ProjectGrid repositories={featured} content={content} compact />}
          {!loading && !error && featured.length === 0 && <p className="status-message">{content.projectsEmptyMessage}</p>}
        </section>
      )}

      {content.showAbout && (
        <section className="page-container home-about-strip">
          <div><Eyebrow>UM POUCO SOBRE MIM</Eyebrow><h2>{content.aboutTitleLead} <span>{content.aboutTitleHighlight}</span></h2></div>
          <a className="text-link" href={PAGE_PATHS.about}>Conheça meu processo <LinkArrow /></a>
        </section>
      )}
    </>
  );
}

function ProjectsPage({ content, repositories, loading, error }: { content: SiteContent; repositories: GitHubRepository[]; loading: boolean; error: boolean }) {
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState("Todos");
  const languages = ["Todos", ...Array.from(new Set(repositories.map((repo) => repo.language).filter((value): value is string => Boolean(value)))).sort()];
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = repositories.filter((repo) => {
    const project = projectDetails(repo, content);
    const matchesText = `${project.title} ${project.description} ${project.language}`.toLowerCase().includes(normalizedQuery);
    return matchesText && (language === "Todos" || project.language === language);
  }).slice(0, content.projectsLimit);

  return (
    <section className="page-container page-section projects-page">
      <PageHeading eyebrow="PROJETOS" title={content.projectsTitle} description={content.projectsDescription} />
      <div className="project-controls">
        <label className="search-field"><span aria-hidden="true">⌕</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nome ou linguagem" aria-label="Buscar projetos" /></label>
        <div className="filter-list" role="group" aria-label="Filtrar por linguagem">
          {languages.map((item) => <button key={item} type="button" className={`filter-button${language === item ? " is-selected" : ""}`} aria-pressed={language === item} onClick={() => setLanguage(item)}>{item}</button>)}
        </div>
      </div>
      {loading && <p className="status-message">{content.projectsLoadingMessage}</p>}
      {error && <p className="status-message status-error">{content.projectsErrorMessage}</p>}
      {!loading && !error && filtered.length > 0 && <ProjectGrid repositories={filtered} content={content} />}
      {!loading && !error && filtered.length === 0 && <p className="status-message">{query || language !== "Todos" ? "Nenhum projeto corresponde a esse filtro." : content.projectsEmptyMessage}</p>}
      <a className="button button-secondary projects-profile-link" href={safeExternalUrl(content.githubUrl)} target="_blank" rel="noopener noreferrer">{content.projectsAllCta}<LinkArrow /></a>
    </section>
  );
}

function DetailCard({ item, index }: { item: ContentCard; index: number }) {
  return (
    <details className="detail-card">
      <summary><span className="detail-number">{String(index + 1).padStart(2, "0")}</span><span className="detail-icon">{item.icon}</span><span className="detail-title">{item.title}<small>{item.description}</small></span><span className="detail-chevron" aria-hidden="true">+</span></summary>
      <p>{item.detail}</p>
    </details>
  );
}

function AboutPage({ content }: { content: SiteContent }) {
  const profileImage = safeImageUrl(content.aboutImageUrl, AKAME_IMAGES.fullBody);
  return (
    <section className="page-container page-section about-page">
      <PageHeading eyebrow="SOBRE" title={content.aboutSectionTitle} description={`${content.aboutTitleLead} ${content.aboutTitleHighlight}`} />
      <div className="about-intro">
        <figure className="about-portrait"><img src={profileImage} alt={content.aboutImageAlt} /><figcaption><span>{content.aboutCountry}</span><span>02 / 05</span></figcaption></figure>
        <div className="about-copy">
          <h2>{content.aboutTitleLead} <em>{content.aboutTitleHighlight}</em></h2>
          <p>{content.aboutParagraphOne}</p>
          <p>{content.aboutParagraphTwo}</p>
          <div className="hero-tags">{content.aboutTags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        </div>
      </div>
      <div className="about-detail-grid">
        <section><Eyebrow>01 / INTERESSES</Eyebrow><h2>{content.aboutInterestsTitle}</h2><div className="detail-list">{content.aboutInterests.map((item, index) => <DetailCard key={`${item.title}-${index}`} item={item} index={index} />)}</div></section>
        <section><Eyebrow>02 / FERRAMENTAS</Eyebrow><h2>{content.aboutToolsTitle}</h2><div className="detail-list">{content.aboutTools.map((item, index) => <DetailCard key={`${item.title}-${index}`} item={item} index={index} />)}</div></section>
      </div>
    </section>
  );
}

function ContactPage({ content }: { content: SiteContent }) {
  return (
    <section className="page-container page-section contact-page">
      <PageHeading eyebrow="CONTATO" title={content.contactTitle} description={content.contactDescription} />
      <div className="contact-grid">
        <a className="contact-link-card" href={safeExternalUrl(content.githubUrl)} target="_blank" rel="noopener noreferrer"><span className="contact-index">01</span><span><strong>{content.githubButtonLabel}</strong><small>Projetos, código e experimentos</small></span><LinkArrow /></a>
        <a className="contact-link-card" href={safeExternalUrl(content.discordUrl)} target="_blank" rel="noopener noreferrer"><span className="contact-index">02</span><span><strong>{content.discordButtonLabel}</strong><small>Conversas e troca de ideias</small></span><LinkArrow /></a>
      </div>
      <p className="contact-note">Respondo no meu tempo, mas sempre gosto de conhecer ideias novas.</p>
    </section>
  );
}

function SiteFooter({ content }: { content: SiteContent }) {
  return (
    <footer className="site-footer"><div className="page-container footer-inner"><a className="footer-brand" href={PAGE_PATHS.home}>{content.brandName}</a><span>{content.footerText}</span><span>© {new Date().getFullYear()}</span></div></footer>
  );
}

export default function PortfolioApp() {
  const isAdmin = new URLSearchParams(window.location.search).has("admin");
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);
  const [contentReady, setContentReady] = useState(false);
  const [theme, setTheme] = useState<Theme>(getStoredTheme);
  const [page, setPage] = useState<Page>(() => pageFromHash(window.location.hash));
  const { repositories, loading: projectsLoading, error: projectsError } = useRepositories();

  useEffect(() => {
    const onHashChange = () => {
      setPage(pageFromHash(window.location.hash));
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    if (!window.location.hash) window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#/`);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    if (isAdmin) return;
    let active = true;
    void readPublicContent()
      .then((savedContent) => {
        if (active) setContent({ ...DEFAULT_CONTENT, ...normalizeSiteContent(savedContent) });
      })
      .catch((error: unknown) => console.warn("Could not load saved site content; using defaults.", error))
      .finally(() => { if (active) setContentReady(true); });
    return () => { active = false; };
  }, [isAdmin]);

  function toggleTheme() {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      try { localStorage.setItem("afpl-theme", next); } catch { /* Storage can be disabled. */ }
      return next;
    });
  }

  if (isAdmin) return <AdminPage />;
  if (!contentReady) return <div className="boot-screen" role="status">Carregando portfólio…</div>;

  return (
    <div className="portfolio-app" data-theme={theme}>
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <SiteHeader page={page} content={content} theme={theme} onThemeToggle={toggleTheme} />
      <main id="conteudo" className="page-transition" key={page}>
        {page === "home" && <HomePage content={content} theme={theme} repositories={repositories} loading={projectsLoading} error={projectsError} />}
        {page === "projects" && content.showProjects && <ProjectsPage content={content} repositories={repositories} loading={projectsLoading} error={projectsError} />}
        {page === "about" && content.showAbout && <AboutPage content={content} />}
        {page === "contact" && content.showContact && <ContactPage content={content} />}
        {page !== "home" && page !== "projects" && page !== "about" && page !== "contact" && <HomePage content={content} theme={theme} repositories={repositories} loading={projectsLoading} error={projectsError} />}
      </main>
      <SiteFooter content={content} />
    </div>
  );
}