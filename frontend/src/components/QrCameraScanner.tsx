import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from './ui/button';
import { Camera, CameraOff } from 'lucide-react';

interface QrCameraScannerProps {
  onScan: (decodedText: string) => void;
  onError?: (message: string) => void;
}

export const QrCameraScanner: React.FC<QrCameraScannerProps> = ({ onScan, onError }) => {
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = 'eventful-qr-scanner';

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {
        // ignore stop errors
      }
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const startScanner = async () => {
    try {
      await stopScanner();
      const scanner = new Html5Qrcode(containerId);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          onScan(decodedText);
          stopScanner();
        },
        () => {},
      );
      setScanning(true);
    } catch (err: any) {
      onError?.(err?.message || 'Could not access camera');
      setScanning(false);
    }
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="space-y-3">
      <div
        id={containerId}
        className="w-full min-h-[240px] rounded-lg overflow-hidden border border-border bg-black/20"
      />
      <Button
        type="button"
        variant="outline"
        className="w-full border-border"
        onClick={scanning ? stopScanner : startScanner}
      >
        {scanning ? (
          <>
            <CameraOff className="h-4 w-4 mr-2" /> Stop Camera
          </>
        ) : (
          <>
            <Camera className="h-4 w-4 mr-2" /> Start Camera Scanner
          </>
        )}
      </Button>
    </div>
  );
};
