"use client";

import { Bookmark } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import {
  getBookmarkStateAction,
  toggleBookmarkAction,
} from "@/lib/bookmarks/actions";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "chocolate-safari-bookmarks";

function readLocalBookmarks(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeLocalBookmarks(slugs: string[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
}

export function BookmarkButton({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const [saved, setSaved] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [hint, setHint] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    getBookmarkStateAction().then((state) => {
      if (cancelled) return;
      setSignedIn(state.signedIn);
      if (state.signedIn) {
        setSaved(state.slugs.includes(slug));
      } else {
        setSaved(readLocalBookmarks().includes(slug));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  function toggleLocal() {
    const next = new Set(readLocalBookmarks());
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    writeLocalBookmarks(Array.from(next));
    setSaved(next.has(slug));
  }

  function toggle(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    setHint("");

    if (!signedIn) {
      toggleLocal();
      setHint("Saved on this device — sign in to sync.");
      return;
    }

    startTransition(async () => {
      const result = await toggleBookmarkAction(slug);
      if (result.needsAuth) {
        setSignedIn(false);
        toggleLocal();
        setHint("Saved on this device — sign in to sync.");
        return;
      }
      if (!result.ok) {
        setHint(result.message || "Could not update bookmark.");
        return;
      }
      setSaved(Boolean(result.saved));
    });
  }

  return (
    <span className={cn("relative inline-flex", className)}>
      <button
        type="button"
        aria-label={saved ? "Remove bookmark" : "Bookmark chocolate"}
        aria-pressed={saved}
        disabled={pending}
        onClick={toggle}
        className={cn(
          "inline-flex size-8 items-center justify-center rounded-full border border-border bg-bg-base/60 text-text-muted backdrop-blur transition hover:border-brass hover:text-brass disabled:opacity-60",
          saved && "border-brass text-brass"
        )}
      >
        <Bookmark className={cn("size-3.5", saved && "fill-current")} />
      </button>
      {hint ? (
        <span className="pointer-events-none absolute right-0 top-full z-10 mt-1 w-40 rounded-md border border-border bg-bg-elevated px-2 py-1 text-[10px] leading-snug text-text-muted shadow-lg">
          {hint}{" "}
          <a href="/login?next=/tasting-log" className="text-brass underline">
            Sign in
          </a>
        </span>
      ) : null}
    </span>
  );
}
