'use client';

import { useEffect, useState } from 'react';
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <header className="flex justify-between items-center px-4 py-3 border-b border-border bg-background">
        <h1 className="text-lg font-semibold">Lifting Diary Course</h1>
        <div className="flex gap-4 items-center">
          <div className="w-10 h-10" />
        </div>
      </header>
    );
  }

  return (
    <header className="flex justify-between items-center px-4 py-3 border-b border-border bg-background">
      <h1 className="text-lg font-semibold">Lifting Diary Course</h1>
      <div className="flex gap-4 items-center">
        <ThemeToggle />
        <div className="flex gap-4">
          <Show when="signed-out">
            <SignInButton mode="modal" />
            <SignUpButton mode="modal" />
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </div>
    </header>
  );
}
