import type { SVGProps } from "react";

/**
 * Small 24px-grid stroke icons (Lucide shapes) used by the canvas chrome in
 * place of emoji. Size comes from the caller's className / width+height.
 */
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 14, strokeWidth = 2, children, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  );
}

export const PlayIcon = ({ size = 12, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden {...p}>
    <path d="M7 4.5v15l12.5-7.5z" />
  </svg>
);

export const RerunIcon = (p: IconProps) => (
  <Svg size={13} {...p}>
    <path d="M3 12a9 9 0 1 0 2.64-6.36L3 8" />
    <path d="M3 3v5h5" />
  </Svg>
);

export const CaretIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 6l6 6-6 6" />
  </Svg>
);

export const CheckIcon = (p: IconProps) => (
  <Svg size={12} strokeWidth={2.4} {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Svg>
);

export const UploadIcon = (p: IconProps) => (
  <Svg size={16} strokeWidth={1.8} {...p}>
    <path d="M12 15V4M7 9l5-5 5 5M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
  </Svg>
);

export const AlertIcon = (p: IconProps) => (
  <Svg size={12} {...p}>
    <path d="M10.3 4.2 2.5 18a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0z" />
    <path d="M12 9v4M12 17h.01" />
  </Svg>
);

export const MoreIcon = (p: IconProps) => (
  <Svg size={16} strokeWidth={2.4} {...p}>
    <path d="M5 12h.01M12 12h.01M19 12h.01" />
  </Svg>
);

export const HistoryIcon = (p: IconProps) => (
  <Svg size={13} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Svg>
);

export const SettingsIcon = (p: IconProps) => (
  <Svg size={13} {...p}>
    <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" />
    <circle cx="16" cy="6" r="2" />
    <circle cx="10" cy="12" r="2" />
    <circle cx="18" cy="18" r="2" />
  </Svg>
);

export const CloseIcon = (p: IconProps) => (
  <Svg size={12} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);

export const TrashIcon = (p: IconProps) => (
  <Svg size={13} {...p}>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
  </Svg>
);

export const PlusIcon = (p: IconProps) => (
  <Svg size={13} {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const FileIcon = (p: IconProps) => (
  <Svg size={14} strokeWidth={1.8} {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
  </Svg>
);

export const UsersIcon = (p: IconProps) => (
  <Svg size={13} {...p}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4-6" />
  </Svg>
);

export const BoltIcon = (p: IconProps) => (
  <Svg size={12} {...p}>
    <path d="M13 3 5 13.5h6L10 21l8-10.5h-6z" />
  </Svg>
);

export const LogoutIcon = (p: IconProps) => (
  <Svg size={13} {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </Svg>
);

export const ChevronDownIcon = (p: IconProps) => (
  <Svg size={12} {...p}>
    <path d="M6 9l6 6 6-6" />
  </Svg>
);

export const ChevronLeftIcon = (p: IconProps) => (
  <Svg size={14} {...p}>
    <path d="M15 6l-6 6 6 6" />
  </Svg>
);

export const ListIcon = (p: IconProps) => (
  <Svg size={14} {...p}>
    <path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01" />
  </Svg>
);

export const NoteIcon = (p: IconProps) => (
  <Svg size={14} {...p}>
    <path d="M5 3h14v12l-6 6H5z" />
    <path d="M13 21v-6h6" />
  </Svg>
);

export const TagIcon = (p: IconProps) => (
  <Svg size={14} {...p}>
    <path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z" />
    <path d="M7.5 7.5h.01" />
  </Svg>
);

export const SquareIcon = (p: IconProps) => (
  <Svg size={12} {...p}>
    <rect x="4" y="6" width="16" height="12" rx="2" strokeDasharray="3 2.5" />
  </Svg>
);

export function Spinner({ size = 12 }: { size?: number }) {
  return (
    <Svg size={size} className="animate-spin">
      <path d="M21 12a9 9 0 1 1-6.2-8.56" />
    </Svg>
  );
}

export const SunIcon = (p: IconProps) => (
  <Svg size={14} {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Svg>
);

export const MoonIcon = (p: IconProps) => (
  <Svg size={14} {...p}>
    <path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11z" />
  </Svg>
);

export const MonitorIcon = (p: IconProps) => (
  <Svg size={14} {...p}>
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <path d="M8 20h8M12 16v4" />
  </Svg>
);
