'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, RefreshCw, Wifi, WifiOff } from "lucide-react";

export default function OfflinePage() {
  const retryConnection = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <WifiOff className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              You're Offline
            </CardTitle>
            <CardDescription className="text-gray-600">
              No internet connection detected
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <h3 className="font-semibold text-blue-900 mb-1">
                    Offline Mode Available
                  </h3>
                  <p className="text-sm text-blue-700">
                    Some features may be limited until you reconnect to the internet. 
                    You can still browse cached content and use basic functionality.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">What you can do offline:</h3>
              <ul className="text-sm text-gray-600 space-y-2 text-left">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>View previously loaded pages</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Browse cached tyre inventory</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Access saved data and settings</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Actions will sync when online</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={retryConnection}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                size="lg"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Reconnecting
              </Button>
              
              <Button 
                onClick={() => window.history.back()}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Go Back
              </Button>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Tyre Hi Tyre will automatically reconnect when internet is available.
                Your offline actions will be synced automatically.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-600">
            <Wifi className="w-4 h-4" />
            <span>Connection Status: Offline</span>
          </div>
        </div>
      </div>
    </div>
  );
}