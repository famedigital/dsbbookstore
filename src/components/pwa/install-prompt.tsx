"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { SlideUpBanner } from "@/components/storefront/motion";
import { X } from "lucide-react";

const DISMISS_KEY = "dsb-pwa-install-dismissed";
const DISMISS_DAYS = 14;

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isIos() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // @ts-expect-error iOS standalone
    window.navigator.standalone === true
  );
}

function isDismissed() {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const until = Number(raw);
    return Date.now() < until;
  } catch {
    return false;
  }
}

function dismiss() {
  try {
    localStorage.setItem(
      DISMISS_KEY,
      String(Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000)
    );
  } catch {
    // ignore
  }
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [visible, setVisible] = useState(false);
  const [iosTip, setIosTip] = useState(false);

  useEffect(() => {
    if (isStandalone() || isDismissed()) return;

    let pageViews = 0;
    try {
      pageViews = Number(sessionStorage.getItem("dsb-page-views") || "0") + 1;
      sessionStorage.setItem("dsb-page-views", String(pageViews));
    } catch {
      pageViews = 1;
    }

    const showAfterDelay = window.setTimeout(() => {
      if (isIos()) {
        setIosTip(true);
        setVisible(true);
      } else if (pageViews >= 2) {
        setVisible(true);
      }
    }, 10_000);

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => {
      window.clearTimeout(showAfterDelay);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
    };
  }, []);

  const onInstall = useCallback(async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setVisible(false);
  }, [deferred]);

  const onDismiss = useCallback(() => {
    dismiss();
    setVisible(false);
  }, []);

  if (isStandalone()) return null;

  return (
    <AnimatePresence>
      {visible ? (
        <SlideUpBanner className="fixed inset-x-0 bottom-16 z-50 border-t bg-card/95 p-4 pb-safe shadow-lg backdrop-blur md:bottom-4 md:mx-auto md:max-w-md md:rounded-lg md:border">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">Install DSB Books</p>
              <p className="text-muted-foreground mt-1 text-xs">
                {iosTip
                  ? "Tap Share, then Add to Home Screen for quick shelf checks."
                  : "Install for quick shelf checks and faster browsing."}
              </p>
            </div>
            <button
              type="button"
              onClick={onDismiss}
              className="text-muted-foreground hover:text-foreground shrink-0 rounded p-1"
              aria-label="Dismiss"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="mt-3 flex gap-2">
            {!iosTip && deferred ? (
              <Button size="sm" onClick={onInstall}>
                Install
              </Button>
            ) : null}
            <Button size="sm" variant="outline" onClick={onDismiss}>
              Not now
            </Button>
          </div>
        </SlideUpBanner>
      ) : null}
    </AnimatePresence>
  );
}
