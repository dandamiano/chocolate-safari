import Image from "next/image";
import Link from "next/link";
import {
  Candy,
  Compass,
  Globe2,
  Infinity as InfinityIcon,
  Sparkles,
  Star,
} from "lucide-react";
import type { SiteSettings } from "@/lib/schemas";

const statIcons = {
  candy: Candy,
  globe: Globe2,
  star: Star,
  infinity: InfinityIcon,
} as const;

export function Hero({ settings }: { settings: SiteSettings }) {
  return (
    <section className="relative isolate -mt-16 min-h-[min(100vh,880px)] overflow-hidden pt-16">
      <Image
        src={settings.heroImage}
        alt="Dark chocolate squares beside a vintage brass compass"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-bg-base/55 via-bg-base/45 to-bg-base/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-bg-base/85 via-transparent to-bg-base/25" />

      <div className="relative mx-auto flex min-h-[min(100vh,880px)] max-w-7xl flex-col justify-center px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h1 className="animate-hero-rise font-display text-[clamp(2.75rem,7vw,4.5rem)] leading-[1.05] tracking-tight text-text-on-dark">
            {settings.heroHeadline.discover} {settings.heroHeadline.taste}
            <br />
            <span className="text-brass">{settings.heroHeadline.remember}</span>
          </h1>
          <p className="animate-hero-rise-delay mt-5 max-w-xl text-base leading-relaxed text-text-muted sm:text-lg">
            {settings.heroSubcopy}
          </p>

          <div className="animate-hero-rise-delay-2 mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/explore"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brass px-5 text-sm font-semibold text-bg-base transition hover:bg-brass-hover"
            >
              <Compass className="size-4" />
              Explore Chocolates
            </Link>
            <Link
              href="#sommelier"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-brass px-5 text-sm font-semibold text-brass transition hover:bg-brass/10"
            >
              <Sparkles className="size-4" />
              Talk to AI Sommelier
            </Link>
          </div>

          <dl className="animate-hero-rise-delay-2 mt-12 grid grid-cols-2 gap-5 sm:grid-cols-4">
            {settings.stats.map((stat) => {
              const Icon =
                statIcons[stat.icon as keyof typeof statIcons] ?? Candy;
              return (
                <div key={stat.label} className="flex items-start gap-2.5">
                  <Icon className="mt-0.5 size-4 shrink-0 text-brass" />
                  <div>
                    <dt className="sr-only">{stat.label}</dt>
                    <dd className="text-sm leading-snug">
                      <span className="block font-semibold text-text-on-dark">
                        {stat.value}
                      </span>
                      <span className="block text-[12px] font-normal text-text-muted">
                        {stat.label}
                      </span>
                    </dd>
                  </div>
                </div>
              );
            })}
          </dl>
        </div>
      </div>
    </section>
  );
}
