import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL?.trim().toLowerCase() ?? "";

export interface ContentCard {
  icon: string;
  title: string;
  description: string;
  detail: string;
}

export interface ProjectOverride {
  title: string;
  description: string;
  url: string;
  language: string;
  cta: string;
  showStats: boolean;
}

export interface SiteContent {
  brandName: string;
  navHome: string;
  navAbout: string;
  navProjects: string;
  navContact: string;
  heroEyebrow: string;
  heroName: string;
  heroTitleLead: string;
  heroTitleHighlight: string;
  heroDescription: string;
  heroPrimaryLabel: string;
  heroSecondaryLabel: string;
  heroAvatarUrl: string;
  heroDarkImageUrl: string;
  heroLightImageUrl: string;
  heroImageAlt: string;
  heroImageCaption: string;
  quoteLead: string;
  quoteHighlight: string;
  quoteSignature: string;
  aboutSectionTitle: string;
  aboutImageUrl: string;
  aboutImageAlt: string;
  aboutCountry: string;
  aboutTitleLead: string;
  aboutTitleHighlight: string;
  aboutParagraphOne: string;
  aboutParagraphTwo: string;
  aboutTags: string[];
  aboutInterestsTitle: string;
  aboutToolsTitle: string;
  aboutCardOpenHint: string;
  aboutCardCloseHint: string;
  aboutInterests: ContentCard[];
  aboutTools: ContentCard[];
  projectsTitle: string;
  projectsDescription: string;
  projectsLoadingMessage: string;
  projectsErrorMessage: string;
  projectsEmptyMessage: string;
  projectCardCta: string;
  projectsAllCta: string;
  githubUrl: string;
  projectsLimit: number;
  projectOverrides: Record<string, ProjectOverride>;
  contactTitle: string;
  contactDescription: string;
  githubButtonLabel: string;
  discordButtonLabel: string;
  discordUrl: string;
  footerText: string;
  easterEggTitle: string;
  easterEggMessage: string;
  showQuote: boolean;
  showAbout: boolean;
  showProjects: boolean;
  showContact: boolean;
}

export const DEFAULT_CONTENT: SiteContent = {
  brandName: "AFPL",
  navHome: "Início",
  navAbout: "Sobre",
  navProjects: "Projetos",
  navContact: "Contato",
  heroEyebrow: "Oi, eu sou",
  heroName: "AFPL",
  heroTitleLead: "Curiosidade em forma de",
  heroTitleHighlight: "código e criação.",
  heroDescription: "Sou um desenvolvedor autodidata do Brasil. Comecei explorando Python e Lua; hoje também crio para a web e experimento com projetos visuais. Gosto de entender como as coisas funcionam e transformar ideias em algo que dá para testar.",
  heroPrimaryLabel: "Explorar projetos ↓",
  heroSecondaryLabel: "Meu GitHub ↗",
  heroAvatarUrl: "https://images.weserv.nl/?url=https://raw.githubusercontent.com/afporiginal/afporiginal/main/images/%F0%9D%96%AC%F0%9D%96%BA%F0%9D%97%8B%F0%9D%97%82%F0%9D%97%87%20%F0%9D%96%AA%F0%9D%97%82%F0%9D%97%8D%F0%9D%96%BA%F0%9D%97%80%F0%9D%96%BA%F0%9D%97%90%F0%9D%96%BA%20%E2%9C%BF.webp&w=200&h=200&fit=cover&mask=circle&output=png",
  heroDarkImageUrl: "https://github.com/afporiginal/afporiginal/blob/main/images/38_Sem_Titulo_20260508142505.png?raw=true",
  heroLightImageUrl: "https://github.com/afporiginal/afporiginal/blob/main/images/37_Sem_Titulo_20260508142825.png?raw=true",
  heroImageAlt: "Ilustração de Marin Kitagawa",
  heroImageCaption: "Meu cantinho criativo ✿",
  quoteLead: "Uma ideia não precisa nascer pronta —",
  quoteHighlight: "experimentar já é parte da criação.",
  quoteSignature: "AFPL · laboratório pessoal",
  aboutSectionTitle: "O que me move",
  aboutImageUrl: "https://raw.githubusercontent.com/afporiginal/afporiginal/main/images/Kitagawa_Marin-removebg-preview.png",
  aboutImageAlt: "Ilustração decorativa do portfólio",
  aboutCountry: "Brasil",
  aboutTitleLead: "Aprender fazendo,",
  aboutTitleHighlight: "com curiosidade e propósito.",
  aboutParagraphOne: "Sou um criador autodidata que gosta de entender o caminho inteiro: imaginar uma solução, montar um protótipo, encontrar o que não funciona e tentar de novo. Já explorei Python, Lua, JavaScript e ferramentas visuais como Blender.",
  aboutParagraphTwo: "Este portfólio é meu espaço de experimentação. Aqui quero reunir projetos, ideias em andamento e aprendizados práticos — não só mostrar o resultado final, mas também deixar visível a evolução de cada tentativa.",
  aboutTags: ["Aprender fazendo", "Pequenos protótipos", "Código + criatividade", "Brasil"],
  aboutInterestsTitle: "O que gosto de explorar",
  aboutToolsTitle: "Meu kit de criação",
  aboutCardOpenHint: "Toque para ver um exemplo ↗",
  aboutCardCloseHint: "Toque para voltar ↑",
  aboutInterests: [
    { icon: "🧩", title: "Resolver problemas", description: "Entender a causa antes de escolher uma solução.", detail: "Quebro ideias grandes em passos pequenos, testo hipóteses e aprendo com o que dá errado." },
    { icon: "⚙️", title: "Automatizar tarefas", description: "Scripts para tirar trabalho repetitivo do caminho.", detail: "Python me ajuda a experimentar automações e a pensar em processos mais simples." },
    { icon: "🌐", title: "Criar para a web", description: "Interfaces claras, rápidas e gostosas de explorar.", detail: "Gosto de combinar React e JavaScript com detalhes visuais que dão personalidade sem atrapalhar o uso." },
    { icon: "🎨", title: "Misturar código e visual", description: "A parte criativa também faz parte de programar.", detail: "Experimento com Blender, composição e pequenas interações para transformar ideias em experiências." },
  ],
  aboutTools: [
    { icon: "💻", title: "VS Code", description: "Meu espaço para escrever, testar e depurar código.", detail: "Organizo os projetos, exploro extensões e acompanho cada mudança por aqui." },
    { icon: "📦", title: "Git e GitHub", description: "Histórico, organização e publicação dos projetos.", detail: "Versionar ajuda a experimentar com tranquilidade e entender como cada projeto evolui." },
    { icon: "🐍", title: "Python e JavaScript", description: "Duas linguagens para automatizar e construir na web.", detail: "Uso cada uma para explorar problemas diferentes, de scripts a interfaces interativas." },
    { icon: "🎨", title: "Blender", description: "Um espaço para modelar e explorar ideias em 3D.", detail: "Gosto de experimentar formas, materiais e composições visuais." },
  ],
  projectsTitle: "Projetos & experimentos",
  projectsDescription: "Uma seleção do que venho construindo e testando. Cada repositório mostra um pedaço do processo: ideias, tentativas e coisas que aprendi pelo caminho.",
  projectsLoadingMessage: "Carregando os projetos…",
  projectsErrorMessage: "O GitHub não respondeu agora. Você ainda pode visitar meu perfil para ver os repositórios.",
  projectsEmptyMessage: "Ainda não há projetos públicos nesta vitrine. Confira meu perfil para ver os repositórios disponíveis.",
  projectCardCta: "Abrir projeto ↗",
  projectsAllCta: "Ver todos os projetos no GitHub ↗",
  githubUrl: "https://github.com/afporiginal",
  projectsLimit: 6,
  projectOverrides: {},
  contactTitle: "Bora trocar uma ideia?",
  contactDescription: "Curte criar coisas, aprender na prática ou conversar sobre uma ideia? Me encontra no GitHub ou no Discord. Gosto de trocar referências, dúvidas e projetos em andamento.",
  githubButtonLabel: "Meu GitHub",
  discordButtonLabel: "Meu Discord",
  discordUrl: "https://discord.com/users/afploriginal",
  footerText: "Feito com curiosidade, café e muitas tentativas.",
  easterEggTitle: "Segredo encontrado!",
  easterEggMessage: "Você descobriu o código especial. Boa!",
  showQuote: true,
  showAbout: true,
  showProjects: true,
  showContact: true,
};

export type SiteContentKey = keyof SiteContent;
export type TextContentKey = {
  [Key in keyof SiteContent]: SiteContent[Key] extends string ? Key : never
}[keyof SiteContent];
export type ContentSection = "Início" | "Frase" | "Sobre" | "Projetos" | "Contato" | "Rodapé";
export const CONTENT_SECTIONS: ContentSection[] = ["Início", "Frase", "Sobre", "Projetos", "Contato", "Rodapé"];

export const CONTENT_FIELDS: { key: TextContentKey; section: ContentSection; label: string; multiline?: boolean; inputType?: "url" }[] = [
  { section: "Início", key: "brandName", label: "Nome do site" },
  { section: "Início", key: "navHome", label: "Menu: início" },
  { section: "Início", key: "navAbout", label: "Menu: sobre" },
  { section: "Início", key: "navProjects", label: "Menu: projetos" },
  { section: "Início", key: "navContact", label: "Menu: contato" },
  { section: "Início", key: "heroEyebrow", label: "Texto acima do nome" },
  { section: "Início", key: "heroName", label: "Nome de destaque" },
  { section: "Início", key: "heroTitleLead", label: "Título: primeira linha" },
  { section: "Início", key: "heroTitleHighlight", label: "Título: trecho destacado" },
  { section: "Início", key: "heroDescription", label: "Apresentação", multiline: true },
  { section: "Início", key: "heroPrimaryLabel", label: "Botão de projetos" },
  { section: "Início", key: "heroSecondaryLabel", label: "Botão do GitHub" },
  { section: "Início", key: "heroAvatarUrl", label: "URL do avatar", inputType: "url" },
  { section: "Início", key: "heroDarkImageUrl", label: "Imagem (tema escuro)", inputType: "url" },
  { section: "Início", key: "heroLightImageUrl", label: "Imagem (tema claro)", inputType: "url" },
  { section: "Início", key: "heroImageAlt", label: "Descrição da imagem", multiline: true },
  { section: "Início", key: "heroImageCaption", label: "Legenda da imagem" },
  { section: "Frase", key: "quoteLead", label: "Frase: começo", multiline: true },
  { section: "Frase", key: "quoteHighlight", label: "Frase: trecho destacado", multiline: true },
  { section: "Frase", key: "quoteSignature", label: "Assinatura da frase" },
  { section: "Sobre", key: "aboutSectionTitle", label: "Título da seção" },
  { section: "Sobre", key: "aboutImageUrl", label: "URL da imagem", inputType: "url" },
  { section: "Sobre", key: "aboutImageAlt", label: "Descrição da imagem" },
  { section: "Sobre", key: "aboutCountry", label: "País / localização" },
  { section: "Sobre", key: "aboutTitleLead", label: "Chamada: começo" },
  { section: "Sobre", key: "aboutTitleHighlight", label: "Chamada: trecho destacado" },
  { section: "Sobre", key: "aboutParagraphOne", label: "Primeiro parágrafo", multiline: true },
  { section: "Sobre", key: "aboutParagraphTwo", label: "Segundo parágrafo", multiline: true },
  { section: "Sobre", key: "aboutInterestsTitle", label: "Título: interesses" },
  { section: "Sobre", key: "aboutToolsTitle", label: "Título: ferramentas" },
  { section: "Sobre", key: "aboutCardOpenHint", label: "Dica: abrir card" },
  { section: "Sobre", key: "aboutCardCloseHint", label: "Dica: fechar card" },
  { section: "Projetos", key: "projectsTitle", label: "Título da seção" },
  { section: "Projetos", key: "projectsDescription", label: "Apresentação", multiline: true },
  { section: "Projetos", key: "projectsLoadingMessage", label: "Mensagem de carregamento" },
  { section: "Projetos", key: "projectsErrorMessage", label: "Mensagem de erro", multiline: true },
  { section: "Projetos", key: "projectsEmptyMessage", label: "Mensagem sem projetos", multiline: true },
  { section: "Projetos", key: "projectCardCta", label: "Botão de cada projeto" },
  { section: "Projetos", key: "projectsAllCta", label: "Botão de todos os projetos" },
  { section: "Projetos", key: "githubUrl", label: "URL do perfil GitHub", inputType: "url" },
  { section: "Contato", key: "contactTitle", label: "Título" },
  { section: "Contato", key: "contactDescription", label: "Apresentação", multiline: true },
  { section: "Contato", key: "githubButtonLabel", label: "Botão do GitHub" },
  { section: "Contato", key: "discordButtonLabel", label: "Botão do Discord" },
  { section: "Contato", key: "discordUrl", label: "URL do Discord", inputType: "url" },
  { section: "Rodapé", key: "footerText", label: "Texto do rodapé" },
  { section: "Rodapé", key: "easterEggTitle", label: "Título da surpresa" },
  { section: "Rodapé", key: "easterEggMessage", label: "Texto da surpresa" },
];

function isContentCard(value: unknown): value is ContentCard {
  if (typeof value !== "object" || value === null) return false;
  const card = value as Record<string, unknown>;
  return ["icon", "title", "description", "detail"].every((key) => typeof card[key] === "string");
}

export function normalizeSiteContent(value: unknown): Partial<SiteContent> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return {};
  const record = value as Record<string, unknown>;
  const normalized: Record<string, unknown> = {};

  for (const [key, fallback] of Object.entries(DEFAULT_CONTENT)) {
    const candidate = record[key];
    if (typeof fallback === "string" && typeof candidate === "string") normalized[key] = candidate.slice(0, 10000);
    else if (typeof fallback === "boolean" && typeof candidate === "boolean") normalized[key] = candidate;
    else if (typeof fallback === "number" && typeof candidate === "number" && Number.isFinite(candidate)) normalized[key] = Math.max(1, Math.min(30, Math.round(candidate)));
    else if ((key === "aboutTags") && Array.isArray(candidate)) {
      normalized[key] = candidate.filter((item): item is string => typeof item === "string").slice(0, 12);
    } else if ((key === "aboutInterests" || key === "aboutTools") && Array.isArray(candidate)) {
        normalized[key] = candidate.filter(isContentCard).slice(0, 12).map((card) => ({
          icon: card.icon.slice(0, 12),
          title: card.title.slice(0, 160),
          description: card.description.slice(0, 1000),
          detail: card.detail.slice(0, 1500),
        }));
    } else if (key === "projectOverrides" && typeof candidate === "object" && candidate !== null && !Array.isArray(candidate)) {
      normalized[key] = Object.fromEntries(Object.entries(candidate).slice(0, 100).map(([id, item]) => {
        const override = item as Record<string, unknown>;
        return [id, {
          title: typeof override.title === "string" ? override.title.slice(0, 200) : "",
          description: typeof override.description === "string" ? override.description.slice(0, 2000) : "",
          url: typeof override.url === "string" ? override.url.slice(0, 1000) : "",
          language: typeof override.language === "string" ? override.language.slice(0, 100) : "",
          cta: typeof override.cta === "string" ? override.cta.slice(0, 100) : "",
          showStats: override.showStats !== false,
        } satisfies ProjectOverride];
      }));
    }
  }
  return normalized as Partial<SiteContent>;
}

export interface GitHubRepository {
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

export async function fetchGitHubRepositories(signal?: AbortSignal) {
  const response = await fetch(
    "https://api.github.com/users/afporiginal/repos?type=owner&sort=updated&per_page=100",
    { signal, headers: { Accept: "application/vnd.github+json" } },
  );
  if (!response.ok) throw new Error(`GitHub returned ${response.status}`);

  const payload: unknown = await response.json();
  if (!Array.isArray(payload) || !payload.every(isGitHubRepository)) {
    throw new Error("Unexpected GitHub repository response");
  }

  return payload.filter((repo) => !repo.fork && !repo.archived);
}

export async function readPublicContent(): Promise<Partial<SiteContent>> {
  if (!supabase) return {};

    const { data: config, error: configError } = await supabase
      .from("site_config")
      .select("content")
      .eq("id", "portfolio")
      .maybeSingle();
    if (!configError && config?.content) return normalizeSiteContent(config.content);

    const { data: legacyRows, error: legacyError } = await supabase.from("site_content").select("key, value");
    if (legacyError) {
      if (configError) throw configError;
      throw legacyError;
  }

    const legacyContent = Object.fromEntries((legacyRows ?? [])
      .filter((row) => typeof row.key === "string" && typeof row.value === "string")
      .map((row) => [row.key, row.value]));
    return normalizeSiteContent(legacyContent);
}

export async function readHiddenProjectIds(): Promise<Set<number>> {
  if (!supabase) return new Set();

  const { data, error } = await supabase.from("hidden_projects").select("repo_id");
  if (error) throw error;
  return new Set((data ?? []).map((row) => Number(row.repo_id)).filter(Number.isFinite));
}

export async function saveSiteContent(content: SiteContent) {
  if (!supabase) throw new Error("Supabase não está configurado.");

    const { error } = await supabase.from("site_config").upsert({
      id: "portfolio",
      content,
    updated_at: new Date().toISOString(),
    }, { onConflict: "id" });
  if (error) throw error;
}

export async function setProjectHidden(repo: GitHubRepository, hidden: boolean) {
  if (!supabase) throw new Error("Supabase não está configurado.");

  const result = hidden
    ? await supabase.from("hidden_projects").upsert({ repo_id: repo.id, repo_name: repo.name }, { onConflict: "repo_id" })
    : await supabase.from("hidden_projects").delete().eq("repo_id", repo.id);
  if (result.error) throw result.error;
}

export function safeExternalUrl(value: string, fallback = "#") {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : fallback;
  } catch {
    return fallback;
  }
}