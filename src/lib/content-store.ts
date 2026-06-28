import { supabase } from "@/integrations/supabase/client";

export type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image_url: string;
  popup: string;
  status: "draft" | "published";
  created_at: string;
  updated_at: string;
};

export type Project = {
  id: string;
  title: string;
  description: string;
  tech: string;
  full_text: string;
  link: string;
  live: string;
  image_url: string;
  bg: string;
  sort_order: number;
};

export type Skill = { title: string; value: number; detail: string };

export type HomeContent = {
  title: string;
  subtitle: string;
  description: string;
  badge: string;
};

export type AboutContent = {
  heading: string;
  portrait: string;
  bio: string[];
  skills: Skill[];
};

export const DEFAULT_HOME: HomeContent = {
  title: "Hi, I'm Becky Biranu",
  subtitle: "Creative Developer & Video Editor",
  description: "I build responsive, functional web applications using modern technologies.",
  badge: "● Available for work — 2026",
};

export const DEFAULT_ABOUT: AboutContent = {
  heading: "A developer obsessed with detail.",
  portrait: "",
  bio: [],
  skills: [],
};

export async function fetchPublishedPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });
  if (error) {
    console.error(error);
    return [];
  }
  return (data ?? []) as BlogPost[];
}

export async function fetchAllPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error(error);
    return [];
  }
  return (data ?? []) as BlogPost[];
}

export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) {
    console.error(error);
    return [];
  }
  return (data ?? []) as Project[];
}

export async function fetchSiteContent<T>(key: string, fallback: T): Promise<T> {
  const { data, error } = await supabase
    .from("site_content")
    .select("data")
    .eq("key", key)
    .maybeSingle();
  if (error || !data) return fallback;
  return data.data as T;
}

// File → data URL (base64) for image uploads
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

// Simple admin auth — uses sessionStorage; password verified server-side once
const AUTH_KEY = "becky_admin_pw_v2";

export const adminAuth = {
  setPassword(pw: string) {
    sessionStorage.setItem(AUTH_KEY, pw);
  },
  getPassword(): string | null {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(AUTH_KEY);
  },
  isAuthed(): boolean {
    return !!adminAuth.getPassword();
  },
  logout() {
    sessionStorage.removeItem(AUTH_KEY);
  },
};
