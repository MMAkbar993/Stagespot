"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { Fab } from "@/components/ui/Fab";
import { AiSearchSheet } from "@/components/ui/AiSearchSheet";

type Tab = "home" | "explore";

function AvatarButton() {
  return (
    <Link
      href="/profile/edit"
      aria-label="Your profile"
      className="h-8 w-8 shrink-0 rounded-full border-2 border-surface bg-linear-to-br from-[#D9C3A0] to-accent shadow-[0_0_0_1px_var(--color-line)]"
    />
  );
}

function DesktopNav({ activeTab }: { activeTab?: Tab }) {
  const links: { tab: Tab; href: string; label: string }[] = [
    { tab: "home", href: "/home", label: "Home" },
    { tab: "explore", href: "/explore", label: "Explore" },
  ];
  return (
    <header className="sticky top-0 z-20 hidden border-b border-line bg-canvas/95 backdrop-blur sm:block">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Logo />
        <nav className="flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.tab}
              href={link.href}
              className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
                activeTab === link.tab
                  ? "text-accent-ink"
                  : "text-ink-2 hover:text-ink"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <AvatarButton />
      </div>
    </header>
  );
}

function MobileTopBar({
  title,
  back,
  action,
}: {
  title?: string;
  back?: boolean;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 sm:hidden">
      {back ? (
        <Link href=".." className="text-lg text-ink" aria-label="Back">
          &#8592;
        </Link>
      ) : (
        <span className="text-xl font-semibold text-ink">{title}</span>
      )}
      {action ? (
        <Link href={action.href} className="text-xs font-semibold text-accent-ink">
          {action.label}
        </Link>
      ) : back ? (
        <span className="text-sm font-semibold text-ink">{title}</span>
      ) : (
        <AvatarButton />
      )}
      {back && <span className="w-8" />}
    </div>
  );
}

function TabBar({ activeTab }: { activeTab: Tab }) {
  const items: { tab: Tab; href: string; label: string }[] = [
    { tab: "home", href: "/home", label: "Home" },
    { tab: "explore", href: "/explore", label: "Explore" },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-line bg-canvas/95 pb-3.5 pt-2.5 backdrop-blur sm:hidden">
      {items.map((item) => {
        const active = item.tab === activeTab;
        return (
          <Link
            key={item.tab}
            href={item.href}
            className={`flex-1 text-center ${active ? "text-accent" : "text-ink-3"}`}
          >
            <span className="mb-0.5 block text-lg">
              {item.tab === "home" ? "●" : "▢"}
            </span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({
  children,
  title,
  back,
  action,
  activeTab,
  showFab,
}: {
  children: React.ReactNode;
  title?: string;
  back?: boolean;
  action?: { label: string; href: string };
  activeTab?: Tab;
  showFab?: boolean;
}) {
  const [aiOpen, setAiOpen] = useState(false);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <DesktopNav activeTab={activeTab} />
      <MobileTopBar title={title} back={back} action={action} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 sm:px-6 sm:pb-12 sm:pt-6">
        {children}
      </main>
      {activeTab && <TabBar activeTab={activeTab} />}
      {showFab && (
        <>
          <Fab onClick={() => setAiOpen(true)} />
          <AiSearchSheet open={aiOpen} onClose={() => setAiOpen(false)} />
        </>
      )}
    </div>
  );
}
