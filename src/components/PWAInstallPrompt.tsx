import { useState, useEffect } from "react";
import { X, Download, Share } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
};

const isInStandaloneMode = () => {
  return window.matchMedia("(display-mode: standalone)").matches || 
         (window.navigator as any).standalone === true;
};

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if already dismissed this session
    const dismissed = sessionStorage.getItem("pwa-install-dismissed");
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Check if already installed (standalone mode)
    if (isInStandaloneMode()) {
      return;
    }

    // iOS detection - show manual instructions
    if (isIOS()) {
      setShowIOSInstructions(true);
      setIsVisible(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    sessionStorage.setItem("pwa-install-dismissed", "true");
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
      <div className="max-w-md mx-auto glass-card rounded-xl p-4 flex items-center gap-3 shadow-lg glow-emerald">
        <img
          src="/icon-192.png"
          alt="Hero"
          className="w-10 h-10 rounded-lg flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Installer Hero</p>
          <p className="text-xs text-muted-foreground">
            {showIOSInstructions 
              ? "Appuyez sur Partager puis 'Sur l'écran d'accueil'"
              : "Accédez à l'app depuis votre écran d'accueil"
            }
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
          {showIOSInstructions ? (
            <div className="h-8 w-8 flex items-center justify-center text-primary">
              <Share className="h-4 w-4" />
            </div>
          ) : (
            <Button
              onClick={handleInstall}
              size="sm"
              className="h-8 gap-1"
            >
              <Download className="h-3.5 w-3.5" />
              Installer
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
