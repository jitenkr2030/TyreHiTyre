'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Smartphone } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export function PWAInstallPrompt() {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [isVisible, setIsVisible] = useState(false);
  
  // Check if user previously dismissed
  const checkIfDismissed = () => {
    const dismissedTime = localStorage.getItem('pwa-install-dismissed');
    if (dismissedTime) {
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      return parseInt(dismissedTime) > sevenDaysAgo;
    }
    return false;
  };

  const isInitiallyDismissed = checkIfDismissed();
  const [dismissed, setDismissed] = useState(isInitiallyDismissed);

  useEffect(() => {
    // Show install prompt after 3 seconds if installable and not dismissed
    if (isInstallable && !isInstalled && !dismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled, dismissed]);

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setDismissed(true);
    // Store dismissal in localStorage for 7 days
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (!isVisible || !isInstallable || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
        
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-red-600" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Install Tyre Hi Tyre App
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              Get the full app experience with offline access and faster performance.
            </p>
            
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={handleInstall}
                className="bg-red-600 hover:bg-red-700 text-white text-xs h-8 px-3"
              >
                <Download className="w-3 h-3 mr-1" />
                Install
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDismiss}
                className="text-xs h-8 px-3"
              >
                Not now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}