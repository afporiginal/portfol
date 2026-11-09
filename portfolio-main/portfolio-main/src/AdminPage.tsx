import { useEffect, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  ADMIN_EMAIL,
  CONTENT_FIELDS,
  DEFAULT_CONTENT,
  fetchGitHubRepositories,
  readHiddenProjectIds,
  readPublicContent,
  saveSiteContent,
  setProjectHidden,
  supabase,
  type GitHubRepository,
  type SiteContent,
} from "./cms";

const pageStyle = {
  minHeight: "100vh",
  padding: "32px 20px 72px",
  background: "#f4f6f5",
  color: "#182126",
  fontFamily: "'Inter', sans-serif",
} as const;

const fieldStyle = {
  width: "100%",
  border: "1px solid #d5ddda",
  borderRadius: "8px",
  background: "#fff",
  color: "#182126",
  padding: "11px 12px",
  font: "inherit",
  lineHeight: 1.55,
  resize: "vertical" as const,
};

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState("");
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [hiddenIds, setHiddenIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyProjectIds, setBusyProjectIds] = useState<Set<number>>(new Set());
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const authorized = Boolean(
    session?.user.email
      && ADMIN_EMAIL
      && session.user.email.toLowerCase() === ADMIN_EMAIL,
  );

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let active = true;
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) setErrorMessage("Não foi possível verificar a sessão. Tente entrar novamente.");
      setSession(data.session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

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
        setContent({ ...DEFAULT_CONTENT, ...savedContent });
        setHiddenIds(hidden);
        setRepositories(repos);
      })
      .catch((error: unknown) => {
        if (!active) return;
        console.error("Could not load admin data.", error);
        setErrorMessage("Não consegui carregar os dados. Confira a configuração do Supabase e recarregue a página.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [authorized]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setMessage("");
    if (!supabase) return;

    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setPassword("");
    if (error) setErrorMessage("Não foi possível entrar. Confira o e-mail e a senha da conta autorizada.");
  }

  async function handleSaveContent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setErrorMessage("");
    setMessage("");
    try {
      await saveSiteContent(content);
      setMessage("Textos salvos. A página pública já pode ser atualizada.");
    } catch (error) {
      console.error("Could not save site content.", error);
      setErrorMessage("Não consegui salvar. Confira sua sessão e as políticas RLS do Supabase.");
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
      setErrorMessage("Não consegui atualizar esse projeto. Confira sua sessão e tente novamente.");
    } finally {
      setBusyProjectIds((current) => {
        const next = new Set(current);
        next.delete(repo.id);
        return next;
      });
    }
  }

  return (
    <div style={pageStyle}>
      <main style={{ maxWidth: "960px", margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", borderBottom: "1px solid #dce3e0", paddingBottom: "20px", marginBottom: "32px" }}>
          <div>
            <p style={{ margin: 0, color: "#487b75", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", textTransform: "uppercase" }}>AFPL / CMS</p>
            <h1 style={{ margin: "6px 0 0", fontFamily: "'Sora', sans-serif", fontSize: "1.8rem" }}>Administração</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <a href={window.location.pathname} style={{ color: "#426f69", fontSize: "0.9rem", textDecoration: "none" }}>Voltar ao site ↗</a>
            {authorized && (
              <button
                type="button"
                onClick={() => void supabase?.auth.signOut()}
                style={{ border: "1px solid #cbd6d2", borderRadius: "7px", background: "#fff", padding: "9px 12px", color: "#27343a", cursor: "pointer" }}
              >Sair</button>
            )}
          </div>
        </header>

        {errorMessage && <p role="alert" style={{ padding: "12px 14px", border: "1px solid #e8b9b9", borderRadius: "8px", background: "#fff4f3", color: "#8f3434" }}>{errorMessage}</p>}
        {message && <p role="status" style={{ padding: "12px 14px", border: "1px solid #b8d8ca", borderRadius: "8px", background: "#f0faf4", color: "#28634b" }}>{message}</p>}

        {!supabase || !ADMIN_EMAIL ? (
          <section style={{ maxWidth: "620px", padding: "22px", border: "1px solid #dce3e0", borderRadius: "10px", background: "#fff" }}>
            <h2 style={{ marginTop: 0, fontFamily: "'Sora', sans-serif", fontSize: "1.2rem" }}>Configuração pendente</h2>
            <p style={{ color: "#58666a", lineHeight: 1.7 }}>Configure VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY e VITE_ADMIN_EMAIL nos secrets do GitHub Actions e conclua o SQL descrito em SUPABASE_SETUP.md.</p>
          </section>
        ) : loading ? (
          <p role="status" style={{ color: "#58666a" }}>Carregando painel…</p>
        ) : !authorized ? (
          <form onSubmit={handleLogin} style={{ maxWidth: "420px", padding: "24px", border: "1px solid #dce3e0", borderRadius: "10px", background: "#fff" }}>
            <h2 style={{ margin: "0 0 8px", fontFamily: "'Sora', sans-serif", fontSize: "1.2rem" }}>Entrar</h2>
            <p style={{ margin: "0 0 20px", color: "#58666a", lineHeight: 1.6 }}>Acesso restrito à conta administradora.</p>
            <label style={{ display: "block", marginBottom: "14px", fontSize: "0.85rem", fontWeight: 600 }}>
              E-mail
              <input autoComplete="username" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} style={{ ...fieldStyle, display: "block", marginTop: "6px" }} />
            </label>
            <label style={{ display: "block", marginBottom: "18px", fontSize: "0.85rem", fontWeight: 600 }}>
              Senha
              <input autoComplete="current-password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} style={{ ...fieldStyle, display: "block", marginTop: "6px" }} />
            </label>
            <button type="submit" style={{ border: 0, borderRadius: "7px", background: "#245f59", color: "#fff", padding: "11px 18px", font: "inherit", fontWeight: 600, cursor: "pointer" }}>Entrar no painel</button>
          </form>
        ) : (
          <div style={{ display: "grid", gap: "24px" }}>
            <section style={{ padding: "22px", border: "1px solid #dce3e0", borderRadius: "10px", background: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "12px", marginBottom: "18px" }}>
                <h2 style={{ margin: 0, fontFamily: "'Sora', sans-serif", fontSize: "1.2rem" }}>Textos principais</h2>
                <span style={{ color: "#6e7c7d", fontSize: "0.8rem" }}>Conectado como {session?.user.email}</span>
              </div>
              <form onSubmit={handleSaveContent} style={{ display: "grid", gap: "16px" }}>
                {CONTENT_FIELDS.map(({ key, label, multiline }) => (
                  <label key={key} style={{ display: "block", fontSize: "0.85rem", fontWeight: 600 }}>
                    {label}
                    {multiline ? (
                      <textarea rows={3} value={content[key]} onChange={(event) => setContent((current) => ({ ...current, [key]: event.target.value }))} style={{ ...fieldStyle, display: "block", marginTop: "6px" }} />
                    ) : (
                      <input value={content[key]} onChange={(event) => setContent((current) => ({ ...current, [key]: event.target.value }))} style={{ ...fieldStyle, display: "block", marginTop: "6px" }} />
                    )}
                  </label>
                ))}
                <div>
                  <button disabled={saving} type="submit" style={{ border: 0, borderRadius: "7px", background: saving ? "#78928e" : "#245f59", color: "#fff", padding: "11px 18px", font: "inherit", fontWeight: 600, cursor: saving ? "wait" : "pointer" }}>
                    {saving ? "Salvando…" : "Salvar textos"}
                  </button>
                </div>
              </form>
            </section>

            <section style={{ padding: "22px", border: "1px solid #dce3e0", borderRadius: "10px", background: "#fff" }}>
              <div style={{ marginBottom: "16px" }}>
                <h2 style={{ margin: 0, fontFamily: "'Sora', sans-serif", fontSize: "1.2rem" }}>Projetos do GitHub</h2>
                <p style={{ margin: "6px 0 0", color: "#58666a", lineHeight: 1.6 }}>Desmarque “Mostrar no portfólio” para ocultar um projeto. Isso não altera a visibilidade do repositório no GitHub.</p>
              </div>
              {repositories.length === 0 ? (
                <p style={{ color: "#58666a" }}>Nenhum repositório próprio disponível no momento.</p>
              ) : (
                <div style={{ display: "grid", gap: "8px" }}>
                  {repositories.map((repo) => (
                    <label key={repo.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", border: "1px solid #e1e7e4", borderRadius: "7px", cursor: busyProjectIds.has(repo.id) ? "wait" : "pointer" }}>
                      <input
                        type="checkbox"
                        checked={!hiddenIds.has(repo.id)}
                        disabled={busyProjectIds.has(repo.id)}
                        onChange={(event) => void handleToggleProject(repo, !event.target.checked)}
                        style={{ width: "18px", height: "18px", accentColor: "#28766c", flexShrink: 0 }}
                      />
                      <span style={{ minWidth: 0 }}>
                        <strong style={{ display: "block", overflowWrap: "anywhere" }}>{repo.name}</strong>
                        <span style={{ display: "block", marginTop: "3px", color: "#697779", fontSize: "0.82rem", lineHeight: 1.4 }}>{repo.description || "Sem descrição no GitHub"}</span>
                      </span>
                      <span style={{ marginLeft: "auto", color: "#71817f", fontSize: "0.76rem", whiteSpace: "nowrap" }}>{busyProjectIds.has(repo.id) ? "Salvando…" : hiddenIds.has(repo.id) ? "Oculto" : "Visível"}</span>
                    </label>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}