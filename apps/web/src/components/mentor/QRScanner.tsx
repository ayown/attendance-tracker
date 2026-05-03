'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  isProcessing: boolean;
}

export function QRScanner({ onScanSuccess, isProcessing }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean>(true);

  useEffect(() => {
    const scannerId = 'reader';

    try {
      scannerRef.current = new Html5QrcodeScanner(
        scannerId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          supportedScanTypes: [0], // QR_CODE
        },
        false
      );

      scannerRef.current.render(
        (decodedText) => {
          // Pause scanning while processing
          if (!isProcessing) {
            scannerRef.current?.pause(true);
            onScanSuccess(decodedText);
          }
        },
        (errorMessage) => {
          // html5-qrcode calls error callback constantly during scanning, we only care about real errors
          if (errorMessage && !errorMessage.includes('No MultiFormat Readers')) {
            // setError('Ensure your camera is focused on the QR code.');
          }
        }
      );
    } catch (err) {
      console.error('Failed to initialize scanner', err);
      setHasPermission(false);
      setError('Camera access is required. Please check your browser permissions.');
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [onScanSuccess, isProcessing]);

  // Resume scanner after processing is done
  useEffect(() => {
    if (!isProcessing && scannerRef.current && scannerRef.current.getState() === 3) {
      // 3 = PAUSED
      scannerRef.current.resume();
    }
  }, [isProcessing]);

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full max-w-md mx-auto">
      {!hasPermission && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center mb-4">
          <p className="font-semibold">Camera Access Denied</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      <div className="relative w-full rounded-2xl overflow-hidden shadow-xl border border-[#E5E7EB] bg-white">
        <div id="reader" className="w-full"></div>

        {isProcessing && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
            <Loader2 className="w-8 h-8 text-[#FF6B35] animate-spin mb-2" />
            <p className="font-medium text-[#121212]">Processing Code...</p>
          </div>
        )}
      </div>

      <p className="text-sm text-[#6B7280] text-center mt-6">
        Point your camera at the student's attendance QR code
      </p>
    </div>
  );
}
