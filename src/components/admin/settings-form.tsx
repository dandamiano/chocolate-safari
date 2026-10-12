"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { saveSettingsAction, type ActionState } from "@/lib/admin/actions";
import type { SiteSettings } from "@/lib/schemas";
import {
  adminInputClass,
  adminTextareaClass,
  Field,
} from "@/components/admin/field";

const initial: ActionState = { ok: false };

function pretty(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction, pending] = useActionState(
    saveSettingsAction,
    initial
  );

  return (
    <form action={formAction} className="space-y-10">
      <section className="space-y-4">
        <h2 className="font-display text-xl text-brass">Hero</h2>
        <Field label="Site name">
          <input
            name="siteName"
            required
            defaultValue={settings.siteName}
            className={adminInputClass}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Headline · discover">
            <input
              name="heroDiscover"
              required
              defaultValue={settings.heroHeadline.discover}
              className={adminInputClass}
            />
          </Field>
          <Field label="Headline · taste">
            <input
              name="heroTaste"
              required
              defaultValue={settings.heroHeadline.taste}
              className={adminInputClass}
            />
          </Field>
          <Field label="Headline · remember">
            <input
              name="heroRemember"
              required
              defaultValue={settings.heroHeadline.remember}
              className={adminInputClass}
            />
          </Field>
        </div>
        <Field label="Hero subcopy">
          <textarea
            name="heroSubcopy"
            required
            defaultValue={settings.heroSubcopy}
            className={adminTextareaClass}
          />
        </Field>
        <Field label="Hero image path">
          <input
            name="heroImage"
            required
            defaultValue={settings.heroImage}
            className={adminInputClass}
          />
        </Field>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl text-brass">Stats & nav</h2>
        <Field
          label="Stats (JSON array)"
          hint='[{ "label", "value", "icon" }, …]'
        >
          <textarea
            name="statsJson"
            required
            rows={8}
            defaultValue={pretty(settings.stats)}
            className={`${adminTextareaClass} font-mono text-xs`}
          />
        </Field>
        <Field
          label="Nav links (JSON array)"
          hint='[{ "label", "href" }, …]'
        >
          <textarea
            name="navLinksJson"
            required
            rows={8}
            defaultValue={pretty(settings.navLinks)}
            className={`${adminTextareaClass} font-mono text-xs`}
          />
        </Field>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl text-brass">Value props & upcoming</h2>
        <Field label="Value props (JSON array)">
          <textarea
            name="valuePropsJson"
            required
            rows={10}
            defaultValue={pretty(settings.valueProps)}
            className={`${adminTextareaClass} font-mono text-xs`}
          />
        </Field>
        <Field label="Upcoming features (JSON array)">
          <textarea
            name="upcomingFeaturesJson"
            required
            rows={12}
            defaultValue={pretty(settings.upcomingFeatures)}
            className={`${adminTextareaClass} font-mono text-xs`}
          />
        </Field>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl text-brass">Footer</h2>
        <Field label="Footer about">
          <textarea
            name="footerAbout"
            required
            defaultValue={settings.footerAbout}
            className={adminTextareaClass}
          />
        </Field>
        <Field label="Footer columns (JSON array)">
          <textarea
            name="footerColumnsJson"
            required
            rows={14}
            defaultValue={pretty(settings.footerColumns)}
            className={`${adminTextareaClass} font-mono text-xs`}
          />
        </Field>
        <Field label="Social links (JSON array)">
          <textarea
            name="socialLinksJson"
            required
            rows={6}
            defaultValue={pretty(settings.socialLinks)}
            className={`${adminTextareaClass} font-mono text-xs`}
          />
        </Field>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl text-brass">Sommelier</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <input
              name="sommelierName"
              required
              defaultValue={settings.sommelier.name}
              className={adminInputClass}
            />
          </Field>
          <Field label="Title">
            <input
              name="sommelierTitle"
              required
              defaultValue={settings.sommelier.title}
              className={adminInputClass}
            />
          </Field>
        </div>
        <Field label="Portrait path">
          <input
            name="sommelierPortrait"
            required
            defaultValue={settings.sommelier.portrait}
            className={adminInputClass}
          />
        </Field>
        <Field label="Intro">
          <textarea
            name="sommelierIntro"
            required
            defaultValue={settings.sommelier.intro}
            className={adminTextareaClass}
          />
        </Field>
        <Field label="Default tags" hint="Comma or newline separated">
          <textarea
            name="sommelierDefaultTags"
            defaultValue={settings.sommelier.defaultTags.join(", ")}
            className={adminTextareaClass}
          />
        </Field>
        <Field label="Starter prompts" hint="One per line">
          <textarea
            name="sommelierStarterPrompts"
            defaultValue={settings.sommelier.starterPrompts.join("\n")}
            className={adminTextareaClass}
          />
        </Field>
        <Field label="Chat preview · user">
          <textarea
            name="sommelierChatUser"
            required
            defaultValue={settings.sommelier.chatPreview.user}
            className={adminTextareaClass}
          />
        </Field>
        <Field label="Chat preview · AI">
          <textarea
            name="sommelierChatAi"
            required
            defaultValue={settings.sommelier.chatPreview.ai}
            className={adminTextareaClass}
          />
        </Field>
        <Field label="Canned replies (JSON array)">
          <textarea
            name="cannedRepliesJson"
            required
            rows={12}
            defaultValue={pretty(settings.sommelier.cannedReplies)}
            className={`${adminTextareaClass} font-mono text-xs`}
          />
        </Field>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl text-brass">Tasting log</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title">
            <input
              name="tastingLogTitle"
              required
              defaultValue={settings.tastingLog.title}
              className={adminInputClass}
            />
          </Field>
          <Field label="Count label">
            <input
              name="tastingLogCountLabel"
              required
              defaultValue={settings.tastingLog.countLabel}
              className={adminInputClass}
            />
          </Field>
        </div>
        <Field label="Avatar path">
          <input
            name="tastingLogAvatar"
            required
            defaultValue={settings.tastingLog.avatar}
            className={adminInputClass}
          />
        </Field>
      </section>

      {state.message ? (
        <p
          className={`text-sm ${state.ok ? "text-brass" : "text-red-400"}`}
          role="status"
        >
          {state.message}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save settings"}
      </Button>
    </form>
  );
}
