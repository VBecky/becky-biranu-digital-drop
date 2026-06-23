// Client-side blog store backed by localStorage.
// Images are stored as base64 data URLs so they persist without external storage.

export type BlogPost = {
  id: string;
  title: string;
  content: string; // rich text / HTML
  excerpt: string;
  image: string; // data URL or http URL
  popup?: string; // optional popup message
  status: "draft" | "published";
  createdAt: number;
  updatedAt: number;
};

const KEY = "becky_blog_posts_v1";

function read(): BlogPost[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as BlogPost[];
  } catch {
    return [];
  }
}

function write(posts: BlogPost[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(posts));
  window.dispatchEvent(new Event("blog:updated"));
}

export const blogStore = {
  all(): BlogPost[] {
    return read().sort((a, b) => b.createdAt - a.createdAt);
  },
  published(): BlogPost[] {
    return blogStore.all().filter((p) => p.status === "published");
  },
  get(id: string): BlogPost | undefined {
    return read().find((p) => p.id === id);
  },
  upsert(post: BlogPost) {
    const posts = read();
    const idx = posts.findIndex((p) => p.id === post.id);
    if (idx >= 0) posts[idx] = post;
    else posts.push(post);
    write(posts);
  },
  remove(id: string) {
    write(read().filter((p) => p.id !== id));
  },
};

export function newId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

// --- Auth ---
const AUTH_KEY = "becky_admin_auth_v1";
const USERNAME = "becky";
const PASSWORD = "Becky@32123";

export const adminAuth = {
  login(u: string, p: string): boolean {
    if (u === USERNAME && p === PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, "1");
      return true;
    }
    return false;
  },
  logout() {
    sessionStorage.removeItem(AUTH_KEY);
  },
  isAuthed(): boolean {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(AUTH_KEY) === "1";
  },
};
