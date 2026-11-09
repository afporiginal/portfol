import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL?.trim().toLowerCase() ?? "";

export const DEFAULT_CONTENT = {
  heroTitleLead: "Curioso por",
  heroTitleHighlight: "criação e tecnologia.",
  heroDescription: "Gosto de explorar programação, testar ideias e aprender fazendo. Este espaço é meu cantinho na internet — sem pressão de parecer uma empresa, só coisas que acho legais.",
  projectsTitle: "Projetos & experimentos",
  projectsDescription: "Uma vitrine viva dos meus repositórios públicos. Ainda sem um projeto principal? Sem problema — aqui entram os experimentos também.",
  aboutSectionTitle: "Um pouco sobre mim",
  aboutTitleLead: "Aprendendo no meu ritmo,",
  aboutTitleHighlight: "criando por curiosidade.",
  aboutParagraphOne: "Já explorei linguagens como Python, Lua e JavaScript. Nem tudo virou um grande projeto — e tudo bem: experimentar também faz parte de aprender.",
  aboutParagraphTwo: "No momento estou sem um projeto específico. Quando surgir uma ideia divertida, ela aparece por aqui. Por enquanto, este portfólio já é um laboratório para brincar com código, visual e interações.",
};

export type SiteContent = typeof DEFAULT_CONTENT;
export type ContentKey = keyof SiteContent;

export const CONTENT_FIELDS: { key: ContentKey; label: string; multiline?: boolean }[] = [
  { key: "heroTitleLead", label: "Início: título (linha 1)" },
  { key: "heroTitleHighlight", label: "Início: título destacado" },
  { key: "heroDescription", label: "Início: apresentação", multiline: true },
  { key: "projectsTitle", label: "Projetos: título" },
  { key: "projectsDescription", label: "Projetos: apresentação", multiline: true },
  { key: "aboutSectionTitle", label: "Sobre: título da seção" },
  { key: "aboutTitleLead", label: "Sobre: chamada (linha 1)" },
  { key: "aboutTitleHighlight", label: "Sobre: chamada destacada" },
  { key: "aboutParagraphOne", label: "Sobre: primeiro parágrafo", multiline: true },
  { key: "aboutParagraphTwo", label: "Sobre: segundo parágrafo", multiline: true },
];

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

  const { data, error } = await supabase.from("site_content").select("key, value");
  if (error) throw error;

  const content: Partial<SiteContent> = {};
  for (const row of data ?? []) {
    if (typeof row.key === "string" && row.key in DEFAULT_CONTENT && typeof row.value === "string") {
      content[row.key as ContentKey] = row.value;
    }
  }
  return content;
}

export async function readHiddenProjectIds(): Promise<Set<number>> {
  if (!supabase) return new Set();

  const { data, error } = await supabase.from("hidden_projects").select("repo_id");
  if (error) throw error;
  return new Set((data ?? []).map((row) => Number(row.repo_id)).filter(Number.isFinite));
}

export async function saveSiteContent(content: SiteContent) {
  if (!supabase) throw new Error("Supabase não está configurado.");

  const rows = Object.entries(content).map(([key, value]) => ({
    key,
    value,
    updated_at: new Date().toISOString(),
  }));
  const { error } = await supabase.from("site_content").upsert(rows, { onConflict: "key" });
  if (error) throw error;
}

export async function setProjectHidden(repo: GitHubRepository, hidden: boolean) {
  if (!supabase) throw new Error("Supabase não está configurado.");

  const result = hidden
    ? await supabase.from("hidden_projects").upsert({ repo_id: repo.id, repo_name: repo.name }, { onConflict: "repo_id" })
    : await supabase.from("hidden_projects").delete().eq("repo_id", repo.id);
  if (result.error) throw result.error;
}