"use client";

import { useRef, useState, useTransition } from "react";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { uploadChocolateImageAction } from "@/lib/admin/actions";
import { cn } from "cn";

type PrimaryProps = {
  name: string;
  value: string;
  onChange: (url: string) => void;
  slugHint?: string;
  error?: string;
  required?: boolean;
};

type GalleryProps = {
  name: string;
  value: string[];
  onChange: (urls: string[]) => void;
  slugHint?: string;
  error?: string;
};

function isPreviewable(url: string): boolean {
  return Boolean(url) && (url.startsWith("/") || url.startsWith("http"));
}

function DropZone({
  disabled,
  onFiles,
  label,
  hint,
}: {
  disabled?: boolean;
  onFiles: (files: FileList | File[]) => void;
  label: string;
  hint: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      onClick={() => inputRef.current?.click()}
      onDragEnter={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        if (disabled) return;
        if (event.dataTransfer.files?.length) {
          onFiles(event.dataTransfer.files);
        }
      }}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-8 text-center transition",
        dragging
          ? "border-brass bg-brass/10"
          : "border-border bg-bg-base/40 hover:border-brass/50",
        disabled && "pointer-events-none opacity-60"
      )}
    >
      <Upload className="size-5 text-brass" aria-hidden />
      <p className="text-sm text-text-on-dark">{label}</p>
      <p className="text-xs text-text-muted">{hint}</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="sr-only"
        disabled={disabled}
        onChange={(event) => {
          if (event.target.files?.length) onFiles(event.target.files);
          event.target.value = "";
        }}
      />
    </div>
  );
}

export function PrimaryImageField({
  name,
  value,
  onChange,
  slugHint,
  error,
  required,
}: PrimaryProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function upload(files: FileList | File[]) {
    const file = Array.from(files)[0];
    if (!file) return;
    setMessage(null);
    const body = new FormData();
    body.set("file", file);
    if (slugHint) body.set("slugHint", slugHint);

    startTransition(async () => {
      const result = await uploadChocolateImageAction(body);
      if (!result.ok || !result.url) {
        setMessage(result.message ?? "Upload failed.");
        return;
      }
      onChange(result.url);
      setMessage(null);
    });
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={value} required={required} />
      {isPreviewable(value) ? (
        <div className="flex flex-wrap items-start gap-4">
          <div className="relative aspect-[4/3] w-44 overflow-hidden rounded-lg border border-border bg-bg-base">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Primary product"
              className="size-full object-cover"
            />
          </div>
          <div className="flex flex-col gap-2">
            <p className="max-w-xs truncate text-xs text-text-muted" title={value}>
              {value}
            </p>
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-bg-base px-3 py-1.5 text-xs text-text-on-dark hover:border-brass/60">
                <ImagePlus className="size-3.5" aria-hidden />
                Replace
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  className="sr-only"
                  disabled={pending}
                  onChange={(event) => {
                    if (event.target.files?.length) upload(event.target.files);
                    event.target.value = "";
                  }}
                />
              </label>
              <button
                type="button"
                disabled={pending}
                onClick={() => onChange("")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-red-300 hover:border-red-400/50"
              >
                <Trash2 className="size-3.5" aria-hidden />
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <DropZone
          disabled={pending}
          onFiles={upload}
          label="Drop primary image here, or click to browse"
          hint="JPEG, PNG, WebP, GIF, or AVIF · up to 5MB"
        />
      )}
      {pending ? (
        <p className="inline-flex items-center gap-2 text-xs text-brass">
          <Loader2 className="size-3.5 animate-spin" aria-hidden />
          Uploading…
        </p>
      ) : null}
      {message ? (
        <p className="text-xs text-red-400" role="alert">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="text-xs text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function GalleryImageField({
  name,
  value,
  onChange,
  slugHint,
  error,
}: GalleryProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function upload(files: FileList | File[]) {
    const list = Array.from(files);
    if (!list.length) return;
    setMessage(null);

    startTransition(async () => {
      const next = [...value];
      for (const file of list) {
        const body = new FormData();
        body.set("file", file);
        if (slugHint) body.set("slugHint", slugHint);
        const result = await uploadChocolateImageAction(body);
        if (!result.ok || !result.url) {
          setMessage(result.message ?? "Upload failed.");
          break;
        }
        next.push(result.url);
      }
      onChange(next);
    });
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={value.join("\n")} />
      {value.length > 0 ? (
        <ul className="flex flex-wrap gap-3">
          {value.map((url, index) => (
            <li
              key={`${url}-${index}`}
              className="relative w-28 overflow-hidden rounded-lg border border-border bg-bg-base"
            >
              <div className="relative aspect-square">
                {isPreviewable(url) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={url}
                    alt={`Gallery ${index + 1}`}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center p-2 text-[10px] text-text-muted">
                    {url || "Empty"}
                  </div>
                )}
              </div>
              <button
                type="button"
                disabled={pending}
                onClick={() => onChange(value.filter((_, i) => i !== index))}
                className="absolute right-1 top-1 rounded-md bg-bg-base/80 p-1 text-red-300 backdrop-blur hover:bg-bg-base"
                aria-label={`Remove gallery image ${index + 1}`}
              >
                <Trash2 className="size-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <DropZone
        disabled={pending}
        onFiles={upload}
        label="Add gallery images"
        hint="Drop multiple files · JPEG, PNG, WebP, GIF, or AVIF · up to 5MB each"
      />
      {pending ? (
        <p className="inline-flex items-center gap-2 text-xs text-brass">
          <Loader2 className="size-3.5 animate-spin" aria-hidden />
          Uploading…
        </p>
      ) : null}
      {message ? (
        <p className="text-xs text-red-400" role="alert">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="text-xs text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
