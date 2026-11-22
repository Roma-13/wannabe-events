import React, { useMemo } from 'react';
import QRCode from 'qrcode';

/**
 * Renders the Georgian Lari symbol (₾) in Noto Sans Georgian Bold
 * because ArchyEDT-Bold does not include U+20BE in its cmap table.
 */
export const Gel: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span className={`gel-sign ${className}`} aria-label="ლარი">
    ₾
  </span>
);

/**
 * Builds the canonical ticket verification URL encoded inside QR codes
 * so scanning opens the digital pass automatically in the browser.
 */
export function buildTicketUrl(orderCode: string): string {
  const envBase = import.meta.env.VITE_PUBLIC_APP_URL?.trim().replace(/\/+$/, '');
  let base = envBase || 'http://localhost:5175';

  if (typeof window !== 'undefined' && window.location?.origin) {
    const { hostname, origin } = window.location;
    const isLocal =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '[::1]';
    base = isLocal && envBase ? envBase : origin;
  }

  return `${base}/?ticket=${encodeURIComponent(orderCode.trim())}`;
}

/**
 * Deterministic minimalist SVG barcode for physical concert ticket stubs.
 */
export const BarcodeSvg: React.FC<{ seed: string; className?: string }> = ({
  seed,
  className = 'w-full h-9',
}) => {
  const bars: { x: number; w: number }[] = [];
  let cursor = 0;
  for (let i = 0; i < 36; i++) {
    const code = seed.charCodeAt(i % seed.length) + i * 17;
    const width = (code % 3) + 1;
    const gap = ((code >> 2) % 2) + 1;
    if (cursor + width <= 120) {
      bars.push({ x: cursor, w: width });
    }
    cursor += width + gap;
    if (cursor >= 120) break;
  }

  return (
    <svg
      viewBox="0 0 120 28"
      className={className}
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      {bars.map((bar, idx) => (
        <rect
          key={idx}
          x={bar.x}
          y={0}
          width={bar.w}
          height={28}
          fill="currentColor"
        />
      ))}
    </svg>
  );
};

/**
 * Real ISO-18004 scannable SVG QR Code encoding the live ticket URL (/?ticket=...).
 */
export const QrCodeSvg: React.FC<{ value: string; className?: string }> = ({
  value,
  className = 'w-28 h-28',
}) => {
  const { totalSize, pathData } = useMemo(() => {
    const qr = QRCode.create(value || 'WANNABE-EVENTS', {
      errorCorrectionLevel: 'M',
    });
    const modules = qr.modules;
    const size = modules.size;
    const margin = 4;
    const parts: string[] = [];

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (modules.get(r, c)) {
          parts.push(`M${c + margin},${r + margin}h1v1h-1z`);
        }
      }
    }

    return {
      totalSize: size + margin * 2,
      pathData: parts.join(''),
    };
  }, [value]);

  return (
    <svg
      viewBox={`0 0 ${totalSize} ${totalSize}`}
      className={className}
      shapeRendering="crispEdges"
      role="img"
      aria-label={`სკანირებადი QR კოდი ${value}`}
    >
      <rect width={totalSize} height={totalSize} fill="#FFFFFF" />
      <path d={pathData} fill="#130409" />
    </svg>
  );
};
