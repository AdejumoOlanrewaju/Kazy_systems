"use client";
import { useEffect } from "react";

// Shown when a page crashes in the browser, instead of Next's blank
// "This page couldn't load" screen.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page crashed:", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong on our side</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        This page hit a problem. Try again, or chat with us on WhatsApp and we&apos;ll sort you out.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          Try again
        </button>
        <a href="/" className="rounded-md border px-4 py-2 text-sm font-medium">
          Go home
        </a>
      </div>
    </main>
  );
}