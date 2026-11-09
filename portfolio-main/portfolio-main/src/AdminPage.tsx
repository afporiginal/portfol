import { useEffect, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  ADMIN_EMAIL,
  CONTENT_FIELDS,
  CONTENT_SECTIONS,
  DEFAULT_CONTENT,
  fetchGitHubRepositories,
  normalizeSiteContent,
  readHiddenProjectIds,
  readPublicContent,
  safeExternalUrl,
  saveSiteContent,
  setProjectHidden,
  supabase,
  type ContentCard,
  type ContentSection,
  type GitHubRepository,
  type ProjectOverride,
  type SiteContent,
  type TextContentKey,
} from "./cms";

const INK = "#211b25";
const MUTED = "#716a75";
const LINE = "#e5dde5";
const PINK = "#b44c70";
const BLUE = "#31879a";

const pageStyle = {
  minHeight: "100vh",
  padding: "32px 20px 72px",
  background: "#f8f6f7",
  color: INK,
  fontFamily: "'Inter', sans-serif",
} as const;

const surfaceStyle = {
  background: "#fff",
  border: `1px solid ${LINE}`,
  borderRadius: "10px",
} as const;

const fieldStyle = {
  width: "100%",
  marginTop: "6px",
  border: "1px solid #d8d0d9",
  borderRadius: "7px",
  background: "#fff",
  color: INK,
  padding: "10px 11px",
  font: "inherit",
  lineHeight: 1.55,
  resize: "vertical" as const,
};

function Field({ label, value, onChange, multiline = false, type = "text", maxLength }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  type?: "text" | "url";
  maxLength?: number;
}) {
  const controlStyle = { ...fieldStyle, display: "block" };
  return (
    <label style={{ display: "block", color: "#413944", fontSize: "0.84rem", fontWeight: 600 }}>
      {label}
      {multiline ? (
        <textarea rows={3} value={value} maxLength={maxLength} onChange={(event) => onChange(event.target.value)} style={controlStyle} />
      ) : (
        <input type={type} value={value} maxLength={maxLength} onChange={(event) => onChange(event.target.value)} style={controlStyle} />
      )}
    </label>
  );
}

function ContentCardEditor({ title, cards, onChange }: {
  title: string;
  cards: ContentCard[];
  onChange: (cards: ContentCard[]) => void;
}) {
  function updateCard(index: number, key: keyof ContentCard, value: string) {
    onChange(cards.map((card, cardIndex) => cardIndex === index ? { ...card, [key]: value } : card));
  }

  return (
    <section style={{ marginTop: "22px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
        <h3 style={{ margin: 0, fontFamily: "'Sora', sans-serif", fontSize: "1rem" }}>{title}</h3>
        <button type="button" disabled={cards.length >= 12} onClick={() => onChange([...cards, { icon: "✨", title: "Novo item", description: "Resumo curto", detail: "Conte um exemplo ou detalhe." }])} style={smallButtonStyle}>
          + Adicionar
        </button>
      </div>
      <div style={{ display: "grid", gap: "10px" }}>
        {cards.map((card, index) => (
          <fieldset key={`${card.title}-${index}`} style={{ display: "grid", gridTemplateColumns: "minmax(70px, 100px) minmax(0, 1fr) auto", gap: "10px", padding: "14px", border: `1px solid ${LINE}`, borderRadius: "8px", minWidth: 0 }}>
            <legend style={{ padding: "0 6px", color: MUTED, fontSize: "0.74rem" }}>Item {index + 1}</legend>
            <Field label="Ícone" value={card.icon} maxLength={12} onChange={(value) => updateCard(index, "icon", value)} />
            <Field label="Título" value={card.title} maxLength={160} onChange={(value) => updateCard(index, "title", value)} />
            <button type="button" aria-label={`Remover ${card.title}`} title="Remover item" onClick={() => onChange(cards.filter((_, cardIndex) => cardIndex !== index))} style={{ alignSelf: "end", border: "1px solid #e8c7d1", borderRadius: "7px", background: "#fff8fa", color: "#9d3e60", padding: "9px 11px", cursor: "pointer" }}>Remover</button>
            <div style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: "10px" }}>
              <Field label="Resumo visível" value={card.description} multiline maxLength={1000} onChange={(value) => updateCard(index, "description", value)} />
              <Field label="Detalhe revelado ao clicar" value={card.detail} multiline maxLength={1500} onChange={(value) => updateCard(index, "detail", value)} />
            </div>
          </fieldset>
        ))}
      </div>
    </section>
  );
}

const smallButtonStyle = {
  border: `1px solid ${LINE}`,
  borderRadius: "7px",
  background: "#fff",
  color: INK,
  padding: "8px 11px",
  font: "inherit",
  fontSize: "0.8rem",
  fontWeight: 600,
  cursor: "pointer",
} as const;

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState<ContentSection>("Início");
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState("");
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [hiddenIds, setHiddenIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [busyProjectIds, setBusyProjectIds] = useState<Set<number>>(new Set());
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const authorized = Boolean(session?.user.email && ADMIN_EMAIL && session.user.email.toLowerCase() === ADMIN_EMAIL);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let active = true;
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) setErrorMessage("Não consegui verificar a sessão. Tente entrar novamente.");
      setSession(data.session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session || !ADMIN_EMAIL || session.user.email?.toLowerCase() === ADMIN_EMAIL) return;
    setErrorMessage("Esta conta não tem acesso ao painel.");
    void supabase?.auth.signOut();
  }, [session]);

  useEffect(() => {
    if (!authorized) return;

    let active = true;
    setLoading(true);
    setErrorMessage("");
    void Promise.all([readPublicContent(), readHiddenProjectIds(), fetchGitHubRepositories()])
      .then(([savedContent, hidden, repos]) => {
        if (!active) return;
        setContent({ ...DEFAULT_CONTENT, ...normalizeSiteContent(savedContent) });
        setHiddenIds(hidden);
        setRepositories(repos);
      })
      .catch((error: unknown) => {
        if (!active) return;
        console.error("Could not load admin data.", error);
        setErrorMessage("Não consegui carregar os dados. Confira as tabelas do Supabase e tente recarregar.");
      })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [authorized]);

  function updateText(key: TextContentKey, value: string) {
    setContent((current) => ({ ...current, [key]: value }));
  }

  function updateCardList(key: "aboutInterests" | "aboutTools", cards: ContentCard[]) {
    setContent((current) => ({ ...current, [key]: cards }));
  }

  function updateProject(repo: GitHubRepository, key: keyof ProjectOverride, value: string | boolean) {
    const id = String(repo.id);
    setContent((current) => {
      const currentOverride = current.projectOverrides[id] ?? {
        title: "",
        description: "",
        url: "",
        language: "",
        cta: "",
        showStats: true,
      };
      return {
        ...current,
        projectOverrides: {
          ...current.projectOverrides,
          [id]: { ...currentOverride, [key]: value },
        },
      };
    });
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setLoggingIn(true);
    setErrorMessage("");
    setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setPassword("");
    if (error) setErrorMessage("Não foi possível entrar. Confira o e-mail e a senha da conta autorizada.");
    setLoggingIn(false);
  }

  async function handleSaveContent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setErrorMessage("");
    setMessage("");
    try {
      await saveSiteContent(content);
      setMessage("Alterações salvas. Atualize o site público para conferir.");
    } catch (error) {
      console.error("Could not save site content.", error);
      setErrorMessage("Não consegui salvar. Execute a versão atualizada de supabase/schema.sql no SQL Editor e tente de novo.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleProject(repo: GitHubRepository, hidden: boolean) {
    setBusyProjectIds((current) => new Set(current).add(repo.id));
    setErrorMessage("");
    setMessage("");
    try {
      await setProjectHidden(repo, hidden);
      setHiddenIds((current) => {
        const next = new Set(current);
        if (hidden) next.add(repo.id);
        else next.delete(repo.id);
        return next;
      });
      setMessage(hidden ? `${repo.name} foi ocultado do portfólio.` : `${repo.name} voltou a aparecer no portfólio.`);
    } catch (error) {
      console.error("Could not update project visibility.", error);
      setErrorMessage("Não consegui mudar a visibilidade. Confira sua sessão e as políticas RLS.");
    } finally {
      setBusyProjectIds((current) => {
        const next = new Set(current);
        next.delete(repo.id);
        return next;
      });
    }
  }

  const visibilityKey: Partial<Record<ContentSection, "showQuote" | "showAbout" | "showProjects" | "showContact">> = {
    Frase: "showQuote",
    Sobre: "showAbout",
    Projetos: "showProjects",
    Contato: "showContact",
  };

  return (
    <div style={pageStyle}>
      <main style={{ maxWidth: "1120px", margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", borderBottom: `1px solid ${LINE}`, paddingBottom: "20px", marginBottom: "24px" }}>
          <div>
            <p style={{ margin: 0, color: PINK, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", textTransform: "uppercase" }}>AFPL / painel do site</p>
            <h1 style={{ margin: "5px 0 0", fontFamily: "'Sora', sans-serif", fontSize: "1.7rem" }}>Editar portfólio</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <a href={window.location.pathname} style={{ color: BLUE, fontSize: "0.88rem", textDecoration: "none" }}>Ver site ↗</a>
            {authorized && <button type="button" onClick={() => void supabase?.auth.signOut()} style={smallButtonStyle}>Sair</button>}
          </div>
        </header>

        {errorMessage && <p role="alert" style={{ padding: "12px 14px", border: "1px solid #e7b9c5", borderRadius: "8px", background: "#fff4f7", color: "#8e3452" }}>{errorMessage}</p>}
        {message && <p role="status" style={{ padding: "12px 14px", border: "1px solid #b7d9d3", borderRadius: "8px", background: "#f1faf8", color: "#28685f" }}>{message}</p>}

        {!supabase || !ADMIN_EMAIL ? (
          <section style={{ ...surfaceStyle, maxWidth: "680px", padding: "22px" }}>
            <h2 style={{ marginTop: 0, fontFamily: "'Sora', sans-serif", fontSize: "1.15rem" }}>Configuração pendente</h2>
            <p style={{ color: MUTED, lineHeight: 1.7 }}>Configure VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY e VITE_ADMIN_EMAIL nos secrets do GitHub Actions.</p>
          </section>
        ) : loading ? (
          <p role="status" style={{ color: MUTED }}>Carregando…</p>
        ) : !authorized ? (
          <form onSubmit={handleLogin} style={{ ...surfaceStyle, maxWidth: "420px", padding: "24px" }}>
            <h2 style={{ margin: "0 0 8px", fontFamily: "'Sora', sans-serif", fontSize: "1.2rem" }}>Entrar</h2>
            <p style={{ margin: "0 0 20px", color: MUTED, lineHeight: 1.6 }}>Acesso restrito à conta administradora.</p>
            <div style={{ display: "grid", gap: "14px" }}>
              <Field label="E-mail" type="text" value={email} onChange={setEmail} />
              <label style={{ display: "block", color: "#413944", fontSize: "0.84rem", fontWeight: 600 }}>
                Senha
                <input autoComplete="current-password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} style={{ ...fieldStyle, display: "block" }} />
              </label>
              <button type="submit" disabled={loggingIn} style={{ border: 0, borderRadius: "7px", background: PINK, color: "#fff", padding: "11px 18px", font: "inherit", fontWeight: 700, cursor: "pointer" }}>{loggingIn ? "Entrando…" : "Entrar no painel"}</button>
            </div>
          </form>
        ) : (
          <>
            <div style={{ ...surfaceStyle, padding: "14px", marginBottom: "16px" }}>
              <div role="tablist" aria-label="Seções do site" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(105px, 1fr))", gap: "6px" }}>
                {CONTENT_SECTIONS.map((section) => (
                  <button key={section} type="button" role="tab" aria-selected={activeSection === section} onClick={() => setActiveSection(section)} style={{ border: `1px solid ${activeSection === section ? `${PINK}55` : "transparent"}`, borderRadius: "7px", background: activeSection === section ? `${PINK}10` : "transparent", color: activeSection === section ? PINK : MUTED, padding: "10px 8px", font: "inherit", fontSize: "0.84rem", fontWeight: 700, cursor: "pointer" }}>
                    {section}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSaveContent}>
              <section style={{ ...surfaceStyle, padding: "22px", marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "12px", marginBottom: "18px", flexWrap: "wrap" }}>
                  <div>
                    <h2 style={{ margin: 0, fontFamily: "'Sora', sans-serif", fontSize: "1.2rem" }}>{activeSection}</h2>
                    <p style={{ margin: "5px 0 0", color: MUTED, fontSize: "0.82rem" }}>Edite o conteúdo desta parte do site.</p>
                  </div>
                  <span style={{ color: MUTED, fontSize: "0.78rem" }}>{session?.user.email}</span>
                </div>

                {visibilityKey[activeSection] && (
                  <label style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", marginBottom: "18px", borderRadius: "7px", background: "#f8f6f7", color: INK, fontSize: "0.86rem", cursor: "pointer" }}>
                    <input type="checkbox" checked={content[visibilityKey[activeSection]!]} onChange={(event) => setContent((current) => ({ ...current, [visibilityKey[activeSection]!]: event.target.checked }))} style={{ width: "17px", height: "17px", accentColor: PINK }} />
                    Mostrar esta seção no site
                  </label>
                )}

                {activeSection === "Projetos" && (
                  <label style={{ display: "block", maxWidth: "280px", marginBottom: "18px", color: "#413944", fontSize: "0.84rem", fontWeight: 600 }}>
                    Quantidade de projetos na página
                    <input type="number" min={1} max={30} value={content.projectsLimit} onChange={(event) => setContent((current) => ({ ...current, projectsLimit: Math.max(1, Math.min(30, Number(event.target.value) || 1)) }))} style={{ ...fieldStyle, display: "block" }} />
                  </label>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: "16px" }}>
                  {CONTENT_FIELDS.filter((field) => field.section === activeSection).map((field) => (
                    <div key={field.key}>
                      <Field label={field.label} type={field.inputType === "url" ? "url" : "text"} multiline={field.multiline} value={content[field.key]} onChange={(value) => updateText(field.key, value)} maxLength={field.multiline ? 5000 : 500} />
                      {field.inputType === "url" && content[field.key].startsWith("https://") && (
                        <a href={safeExternalUrl(content[field.key])} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: "5px", color: BLUE, fontSize: "0.76rem" }}>Testar link ↗</a>
                      )}
                    </div>
                  ))}
                </div>

                {activeSection === "Sobre" && (
                  <div style={{ marginTop: "24px", borderTop: `1px solid ${LINE}`, paddingTop: "18px" }}>
                    <h3 style={{ margin: "0 0 10px", fontFamily: "'Sora', sans-serif", fontSize: "1rem" }}>Etiquetas</h3>
                    <div style={{ display: "grid", gap: "8px" }}>
                      {content.aboutTags.map((tag, index) => (
                        <div key={`${tag}-${index}`} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <input aria-label={`Etiqueta ${index + 1}`} maxLength={48} value={tag} onChange={(event) => setContent((current) => ({ ...current, aboutTags: current.aboutTags.map((item, itemIndex) => itemIndex === index ? event.target.value : item) }))} style={{ ...fieldStyle, marginTop: 0 }} />
                          <button type="button" aria-label={`Remover etiqueta ${tag}`} onClick={() => setContent((current) => ({ ...current, aboutTags: current.aboutTags.filter((_, itemIndex) => itemIndex !== index) }))} style={smallButtonStyle}>Remover</button>
                        </div>
                      ))}
                      <button type="button" disabled={content.aboutTags.length >= 12} onClick={() => setContent((current) => ({ ...current, aboutTags: [...current.aboutTags, "Nova etiqueta"] }))} style={{ ...smallButtonStyle, justifySelf: "start" }}>+ Adicionar etiqueta</button>
                    </div>
                    <ContentCardEditor title={content.aboutInterestsTitle} cards={content.aboutInterests} onChange={(cards) => updateCardList("aboutInterests", cards)} />
                    <ContentCardEditor title={content.aboutToolsTitle} cards={content.aboutTools} onChange={(cards) => updateCardList("aboutTools", cards)} />
                  </div>
                )}

                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px", marginTop: "24px", paddingTop: "18px", borderTop: `1px solid ${LINE}` }}>
                  <button disabled={saving} type="submit" style={{ border: 0, borderRadius: "7px", background: saving ? "#9a7a86" : PINK, color: "#fff", padding: "11px 17px", font: "inherit", fontWeight: 700, cursor: saving ? "wait" : "pointer" }}>{saving ? "Salvando…" : "Salvar alterações"}</button>
                  <button type="button" onClick={() => { if (window.confirm("Descartar as alterações não salvas?")) setContent(DEFAULT_CONTENT); }} style={smallButtonStyle}>Restaurar conteúdo inicial</button>
                  <span style={{ color: MUTED, fontSize: "0.78rem" }}>As alterações só aparecem no site depois de salvar.</span>
                </div>
              </section>
            </form>

            {activeSection === "Projetos" && (
              <section style={{ ...surfaceStyle, padding: "22px" }}>
                <h2 style={{ margin: 0, fontFamily: "'Sora', sans-serif", fontSize: "1.15rem" }}>Projetos do GitHub</h2>
                <p style={{ color: MUTED, lineHeight: 1.6, fontSize: "0.84rem" }}>Edite o card e marque se ele aparece no portfólio. Isso não muda a privacidade do repositório no GitHub.</p>
                {repositories.length === 0 ? <p style={{ color: MUTED }}>Nenhum repositório próprio disponível agora.</p> : (
                  <div style={{ display: "grid", gap: "8px" }}>
                    {repositories.map((repo) => {
                      const override = content.projectOverrides[String(repo.id)] ?? {};
                      const hidden = hiddenIds.has(repo.id);
                      return (
                        <details key={repo.id} style={{ border: `1px solid ${LINE}`, borderRadius: "8px", background: "#fff" }}>
                          <summary style={{ display: "flex", alignItems: "center", gap: "10px", padding: "13px", cursor: "pointer" }}>
                            <strong style={{ overflowWrap: "anywhere" }}>{override.title || repo.name}</strong>
                            <span style={{ marginLeft: "auto", color: hidden ? PINK : BLUE, fontSize: "0.76rem", whiteSpace: "nowrap" }}>{busyProjectIds.has(repo.id) ? "Salvando…" : hidden ? "Oculto" : "Visível"}</span>
                          </summary>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: "13px", padding: "4px 14px 16px" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: "8px", gridColumn: "1 / -1", fontSize: "0.84rem", cursor: "pointer" }}>
                              <input type="checkbox" checked={!hidden} disabled={busyProjectIds.has(repo.id)} onChange={(event) => void handleToggleProject(repo, !event.target.checked)} style={{ accentColor: BLUE }} />
                              Mostrar no portfólio
                            </label>
                            <Field label="Título personalizado" value={override.title ?? ""} maxLength={200} onChange={(value) => updateProject(repo, "title", value)} />
                            <Field label="Linguagem / categoria" value={override.language ?? ""} maxLength={100} onChange={(value) => updateProject(repo, "language", value)} />
                            <Field label="Descrição personalizada" value={override.description ?? ""} multiline maxLength={2000} onChange={(value) => updateProject(repo, "description", value)} />
                            <Field label="URL de destino (vazio usa GitHub)" value={override.url ?? ""} type="url" maxLength={1000} onChange={(value) => updateProject(repo, "url", value)} />
                            <Field label="Texto do link" value={override.cta ?? ""} maxLength={100} onChange={(value) => updateProject(repo, "cta", value)} />
                            <label style={{ display: "flex", alignItems: "center", gap: "8px", alignSelf: "end", padding: "10px 0", color: MUTED, fontSize: "0.82rem", cursor: "pointer" }}>
                              <input type="checkbox" checked={override.showStats !== false} onChange={(event) => updateProject(repo, "showStats", event.target.checked)} style={{ accentColor: BLUE }} />
                              Mostrar estrelas e forks
                            </label>
                            <p style={{ gridColumn: "1 / -1", margin: 0, color: MUTED, fontSize: "0.75rem" }}>Original do GitHub: {repo.description || "sem descrição"}</p>
                          </div>
                        </details>
                      );
                    })}
                  </div>
                )}
                <p style={{ marginBottom: 0, color: MUTED, fontSize: "0.78rem" }}>Lembre-se de salvar alterações de texto e cards usando o botão acima. A visibilidade é salva imediatamente.</p>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}