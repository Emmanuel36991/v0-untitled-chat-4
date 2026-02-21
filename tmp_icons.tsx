import { useId } from "react";

export function WinRateIcon({ size = 64, className = "" }: { size?: number; className?: string }) {
    const uid = useId();
    const id = (name: string) => `wr-${name}-${uid}`;

    const cx = 30;
    const cy = 32;

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id={id("ring")} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#D1D5DB" />
                    <stop offset="100%" stopColor="#9CA3AF" />
                </linearGradient>
                <linearGradient id={id("dart")} x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0%" stopColor="#E5E7EB" />
                    <stop offset="100%" stopColor="#9CA3AF" />
                </linearGradient>
                <filter id={id("sh")} x="-12%" y="-8%" width="130%" height="130%">
                    <feDropShadow dx="0.8" dy="1.5" stdDeviation="1.2" floodColor="#000" floodOpacity="0.3" />
                </filter>
            </defs>

            <g filter={`url(#${id("sh")})`}>
                <circle cx={cx} cy={cy} r="25" stroke="#4B5563" strokeWidth="3" fill="none" />
                <circle cx={cx} cy={cy} r="16.5" stroke={`url(#${id("ring")})`} strokeWidth="3" fill="none" />
                <circle cx={cx} cy={cy} r="8" stroke="#9CA3AF" strokeWidth="3" fill="none" />

                <circle cx={cx} cy={cy} r="3" fill="#D1D5DB" />

                <line x1={cx + 2} y1={cy - 2} x2="56" y2="8" stroke={`url(#${id("dart")})`} strokeWidth="3.5" strokeLinecap="round" />

                <polygon points={`${cx},${cy} ${cx + 5},${cy - 7} ${cx + 7},${cy - 4}`} fill="#F3F4F6" />

                <polygon points="53,11 60,4 56,7" fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="0.5" />
                <polygon points="53,11 61,10 57,7" fill="#9CA3AF" stroke="#6B7280" strokeWidth="0.5" />
                <polygon points="54,10 60,5 60,10" fill="#B0B7C0" stroke="#9CA3AF" strokeWidth="0.4" />

                <circle cx={cx} cy={cy} r="1.8" fill="#F9FAFB" />
            </g>
        </svg>
    );
}

export function WinIcon({ size = 64, className = "" }: { size?: number; className?: string }) {
    const uid = useId();
    const id = (name: string) => `win-${name}-${uid}`;

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id={id("arrow")} x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#22C55E" />
                    <stop offset="100%" stopColor="#86EFAC" />
                </linearGradient>
                <linearGradient id={id("arrowEdge")} x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#15803D" />
                    <stop offset="100%" stopColor="#16A34A" />
                </linearGradient>

                <filter id={id("sh")} x="-12%" y="-8%" width="130%" height="130%">
                    <feDropShadow dx="0.8" dy="1.5" stdDeviation="1.2" floodColor="#000" floodOpacity="0.3" />
                </filter>
            </defs>

            <g filter={`url(#${id("sh")})`}>
                <polygon
                    points="32,4 50,26 41,26 41,58 23,58 23,26 14,26"
                    fill={`url(#${id("arrowEdge")})`}
                    transform="translate(1.4, 1.8)"
                />

                <polygon
                    points="32,4 50,26 41,26 41,58 23,58 23,26 14,26"
                    fill={`url(#${id("arrow")})`}
                />

                <polygon
                    points="32,7 45,23 39,23 32,7 25,23 19,23"
                    fill="white"
                    fillOpacity="0.22"
                />

                <rect
                    x="25" y="27"
                    width="14" height="3"
                    rx="1" fill="white" fillOpacity="0.15"
                />
            </g>
        </svg>
    );
}

export function TradeIcon({ size = 64, className = "" }: { size?: number; className?: string }) {
    const uid = useId();
    const id = (name: string) => `tr-${name}-${uid}`;

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id={id("folder")} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6B7280" />
                    <stop offset="100%" stopColor="#374151" />
                </linearGradient>
                <linearGradient id={id("folderFront")} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4B5563" />
                    <stop offset="100%" stopColor="#1F2937" />
                </linearGradient>
                <linearGradient id={id("paper")} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F9FAFB" />
                    <stop offset="100%" stopColor="#E5E7EB" />
                </linearGradient>
                <filter id={id("sh")} x="-8%" y="-4%" width="120%" height="116%">
                    <feDropShadow dx="0.6" dy="1.2" stdDeviation="1" floodColor="#000" floodOpacity="0.35" />
                </filter>
            </defs>

            <g filter={`url(#${id("sh")})`}>

                {/* ===== BACK OF FOLDER ===== */}
                <rect x="6" y="22" width="52" height="38" rx="3" fill={`url(#${id("folder")})`} stroke="#1F2937" strokeWidth="0.8" />

                {/* ===== FOLDER TAB (top-left) ===== */}
                <path
                    d="M6,25 L6,20 Q6,17 9,17 L22,17 Q24,17 25,19 L27,22 L6,22 Z"
                    fill={`url(#${id("folder")})`}
                    stroke="#1F2937"
                    strokeWidth="0.8"
                />

                {/* ===== DOCUMENTS PEEKING OUT ===== */}

                {/* Doc 1 — left, tallest peek: rising trend line */}
                <rect x="11" y="8" width="14" height="30" rx="1.5" fill={`url(#${id("paper")})`} stroke="#D1D5DB" strokeWidth="0.5" />
                <polyline
                    points="14,24 17,20 20,22 22,14"
                    fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                />
                <circle cx="22" cy="14" r="2" fill="#374151" />
                <path d="M22,11 L24,14 L20,14 Z" fill="#6B7280" />

                {/* Doc 2 — center, medium peek: candlesticks */}
                <rect x="26" y="11" width="14" height="27" rx="1.5" fill={`url(#${id("paper")})`} stroke="#D1D5DB" strokeWidth="0.5" />
                <line x1="30" y1="15" x2="30" y2="27" stroke="#9CA3AF" strokeWidth="0.8" />
                <rect x="28.2" y="17" width="3.6" height="7" rx="0.8" fill="#374151" />
                <line x1="35" y1="14" x2="35" y2="26" stroke="#9CA3AF" strokeWidth="0.8" />
                <rect x="33.2" y="16" width="3.6" height="6" rx="0.8" fill="#6B7280" />

                {/* Doc 3 — right, shortest peek: bar chart */}
                <rect x="41" y="14" width="14" height="24" rx="1.5" fill={`url(#${id("paper")})`} stroke="#D1D5DB" strokeWidth="0.5" />
                <rect x="43.5" y="22" width="3" height="8" rx="0.6" fill="#374151" />
                <rect x="47.5" y="18" width="3" height="12" rx="0.6" fill="#6B7280" />
                <rect x="51.5" y="20" width="3" height="10" rx="0.6" fill="#4B5563" />

                {/* ===== FRONT OF FOLDER ===== */}
                <rect x="6" y="34" width="52" height="26" rx="3" fill={`url(#${id("folderFront")})`} stroke="#1F2937" strokeWidth="0.8" />
                <rect x="8" y="36" width="48" height="1.5" rx="0.75" fill="white" fillOpacity="0.08" />

            </g>
        </svg>
    );
}

export function StorageIcon({ size = 64, className = "" }: { size?: number; className?: string }) {
    const uid = useId();
    const id = (name: string) => `st-${name}-${uid}`;

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id={id("body")} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#4B5563" />
                    <stop offset="35%" stopColor="#6B7280" />
                    <stop offset="65%" stopColor="#6B7280" />
                    <stop offset="100%" stopColor="#374151" />
                </linearGradient>
                <linearGradient id={id("top")} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9CA3AF" />
                    <stop offset="100%" stopColor="#6B7280" />
                </linearGradient>
                <linearGradient id={id("disc")} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#808993" />
                    <stop offset="100%" stopColor="#555e6b" />
                </linearGradient>
                <linearGradient id={id("sheen")} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="white" stopOpacity="0" />
                    <stop offset="25%" stopColor="white" stopOpacity="0.14" />
                    <stop offset="45%" stopColor="white" stopOpacity="0" />
                </linearGradient>
                <filter id={id("sh")} x="-15%" y="-8%" width="135%" height="130%">
                    <feDropShadow dx="0.5" dy="1.2" stdDeviation="1" floodColor="#000" floodOpacity="0.35" />
                </filter>
            </defs>

            <g filter={`url(#${id("sh")})`}>
                <path
                    d="M17,12 L17,51 A16,5.5 0 0,0 49,51 L49,12"
                    fill="#111827"
                />

                <path
                    d="M16,12 L16,50 A16,5.5 0 0,0 48,50 L48,12"
                    fill={`url(#${id("body")})`}
                />

                <ellipse cx="32" cy="50" rx="16" ry="5.5" fill="#374151" stroke="#1F2937" strokeWidth="0.5" />

                <ellipse cx="32" cy="39" rx="16" ry="4.5" fill="#1F2937" fillOpacity="0.25" />
                <ellipse cx="32" cy="38" rx="16" ry="5" fill={`url(#${id("disc")})`} />
                <ellipse cx="32" cy="38" rx="16" ry="5" fill="none" stroke="#374151" strokeWidth="0.7" />
                <ellipse cx="32" cy="37.5" rx="10" ry="2.8" fill="none" stroke="#9CA3AF" strokeWidth="0.35" strokeOpacity="0.4" />

                <ellipse cx="32" cy="26" rx="16" ry="4.5" fill="#1F2937" fillOpacity="0.25" />
                <ellipse cx="32" cy="25" rx="16" ry="5" fill={`url(#${id("disc")})`} />
                <ellipse cx="32" cy="25" rx="16" ry="5" fill="none" stroke="#374151" strokeWidth="0.7" />
                <ellipse cx="32" cy="24.5" rx="10" ry="2.8" fill="none" stroke="#9CA3AF" strokeWidth="0.35" strokeOpacity="0.4" />

                <ellipse cx="32" cy="12" rx="16" ry="5.5" fill={`url(#${id("top")})`} />
                <ellipse cx="32" cy="12" rx="16" ry="5.5" fill="none" stroke="#374151" strokeWidth="0.8" />
                <ellipse cx="32" cy="12" rx="10.5" ry="3.5" fill="none" stroke="#4B5563" strokeWidth="0.8" />
                <ellipse cx="32" cy="11.5" rx="5.5" ry="1.8" fill="none" stroke="#D1D5DB" strokeWidth="0.4" strokeOpacity="0.4" />

                <path
                    d="M17,12 L17,50 A16,5.5 0 0,0 24,54 L24,17 A16,5.5 0 0,1 17,12 Z"
                    fill={`url(#${id("sheen")})`}
                />

                <path
                    d="M16,12 L16,50 A16,5.5 0 0,0 48,50 L48,12"
                    fill="none"
                    stroke="#1F2937"
                    strokeWidth="1.1"
                />
                <ellipse cx="32" cy="12" rx="16" ry="5.5" fill="none" stroke="#1F2937" strokeWidth="1" />
            </g>
        </svg>
    );
}

export function RRRatioIcon({ size = 64, className = "" }: { size?: number; className?: string }) {
    const uid = useId();
    const id = (name: string) => `rr-${name}-${uid}`;

    const barW = 18;
    const gap = 10;
    const totalW = barW * 2 + gap;
    const startX = (64 - totalW) / 2;

    const riskX = startX;
    const rewardX = startX + barW + gap;

    const barBottom = 58;
    const riskH = 18;
    const rewardH = 36;

    const riskY = barBottom - riskH;
    const rewardY = barBottom - rewardH;

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id={id("risk")} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C87A7A" />
                    <stop offset="100%" stopColor="#8B4547" />
                </linearGradient>
                <linearGradient id={id("riskEdge")} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7A3335" />
                    <stop offset="100%" stopColor="#5C2425" />
                </linearGradient>

                <linearGradient id={id("reward")} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6EE7B7" />
                    <stop offset="100%" stopColor="#34D399" />
                </linearGradient>
                <linearGradient id={id("rewardEdge")} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#27A87A" />
                    <stop offset="100%" stopColor="#1A7A56" />
                </linearGradient>

                <filter id={id("sh")} x="-12%" y="-8%" width="130%" height="130%">
                    <feDropShadow dx="0.8" dy="1.5" stdDeviation="1.2" floodColor="#000" floodOpacity="0.3" />
                </filter>
            </defs>

            <g filter={`url(#${id("sh")})`}>
                <rect x={riskX + 2} y={riskY + 2} width={barW} height={riskH} rx="3" fill={`url(#${id("riskEdge")})`} />
                <rect x={riskX} y={riskY} width={barW} height={riskH} rx="3" fill={`url(#${id("risk")})`} />
                <rect x={riskX + 2.5} y={riskY + 2} width={barW - 5} height="3" rx="1.2" fill="white" fillOpacity="0.2" />

                <rect x={rewardX + 2} y={rewardY + 2} width={barW} height={rewardH} rx="3" fill={`url(#${id("rewardEdge")})`} />
                <rect x={rewardX} y={rewardY} width={barW} height={rewardH} rx="3" fill={`url(#${id("reward")})`} />
                <rect x={rewardX + 2.5} y={rewardY + 2} width={barW - 5} height="3.5" rx="1.2" fill="white" fillOpacity="0.22" />

                <text x={riskX + barW / 2} y={riskY + riskH / 2 + 3.5} textAnchor="middle" fontSize="10" fill="#2D0E0F" fontFamily="system-ui, sans-serif" opacity="0.65">1</text>
                <text x={rewardX + barW / 2} y={rewardY + rewardH / 2 + 4} textAnchor="middle" fontSize="12" fill="#0A3D2A" fontFamily="system-ui, sans-serif" opacity="0.65">2</text>
                <text x="32" y="14" textAnchor="middle" fontSize="10" fill="#9CA3AF" fontFamily="system-ui, sans-serif">R:R</text>
            </g>
        </svg>
    );
}

export function ProfitFactorIcon({ size = 64, className = "" }: { size?: number; className?: string }) {
    const uid = useId();
    const id = (name: string) => `pf-${name}-${uid}`;

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id={id("pan")} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D1D5DB" />
                    <stop offset="100%" stopColor="#9CA3AF" />
                </linearGradient>
                <filter id={id("sh")} x="-12%" y="-8%" width="130%" height="130%">
                    <feDropShadow dx="0.8" dy="1.5" stdDeviation="1.2" floodColor="#000" floodOpacity="0.3" />
                </filter>
            </defs>

            <g filter={`url(#${id("sh")})`}>
                <rect x="30" y="10" width="4" height="42" rx="1.5" fill="#6B7280" />

                <path d="M22,52 L42,52 L40,49 L24,49 Z" fill="#9CA3AF" />
                <rect x="24" y="49" width="16" height="3" rx="1.2" fill="#6B7280" />

                <polygon points="32,8 27.5,14 36.5,14" fill="#D1D5DB" />

                <line x1="6" y1="20" x2="58" y2="13" stroke="#D1D5DB" strokeWidth="3.2" strokeLinecap="round" />

                <line x1="9" y1="20.5" x2="9" y2="30" stroke="#9CA3AF" strokeWidth="1.8" />
                <line x1="22" y1="18" x2="22" y2="28" stroke="#9CA3AF" strokeWidth="1.8" />

                <path d="M4,30 C4,30 6,37 15.5,37 C25,37 27,30 27,30 Z" fill={`url(#${id("pan")})`} stroke="#9CA3AF" strokeWidth="0.7" />
                <ellipse cx="15.5" cy="30" rx="11.5" ry="2.2" fill="#D1D5DB" />

                <ellipse cx="15.5" cy="28.5" rx="6" ry="1.8" fill="#9CA3AF" />
                <ellipse cx="15.5" cy="27" rx="6" ry="1.8" fill="#B0B7C0" />
                <ellipse cx="15.5" cy="25.5" rx="6" ry="1.8" fill="#D1D5DB" />

                <line x1="42" y1="12" x2="42" y2="21" stroke="#9CA3AF" strokeWidth="1.8" />
                <line x1="55" y1="13.5" x2="55" y2="23" stroke="#9CA3AF" strokeWidth="1.8" />

                <path d="M37,23 C37,23 39,29 48.5,29 C58,29 60,23 60,23 Z" fill="#4B5563" stroke="#6B7280" strokeWidth="0.7" />
                <ellipse cx="48.5" cy="23" rx="11.5" ry="2.2" fill="#6B7280" />

                <ellipse cx="48.5" cy="22" rx="4.5" ry="1.4" fill="#4B5563" stroke="#6B7280" strokeWidth="0.5" />
            </g>
        </svg>
    );
}

export function PnLIcon({ size = 64, className = "" }: { size?: number; className?: string }) {
    const uid = useId();
    const id = (name: string) => `pnl-${name}-${uid}`;

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id={id("up")} x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#22C55E" />
                    <stop offset="100%" stopColor="#86EFAC" />
                </linearGradient>
                <linearGradient id={id("down")} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FCA5A5" />
                    <stop offset="100%" stopColor="#EF4444" />
                </linearGradient>
                <filter id={id("sh")} x="-12%" y="-8%" width="130%" height="130%">
                    <feDropShadow dx="0.8" dy="1.5" stdDeviation="1.2" floodColor="#000" floodOpacity="0.3" />
                </filter>
            </defs>

            <g filter={`url(#${id("sh")})`}>
                {/* Baseline */}
                <line x1="4" y1="38" x2="60" y2="38" stroke="#6B7280" strokeWidth="1.2" strokeLinecap="round" />

                {/* Profit bars (above baseline) */}
                <rect x="6" y="10" width="11" height="28" rx="2" fill={`url(#${id("up")})`} />
                <rect x="20" y="20" width="11" height="18" rx="2" fill={`url(#${id("up")})`} />

                {/* Loss bars (below baseline) */}
                <rect x="34" y="38" width="11" height="10" rx="2" fill={`url(#${id("down")})`} />
                <rect x="48" y="38" width="11" height="18" rx="2" fill={`url(#${id("down")})`} />

                {/* Bar top highlights */}
                <rect x="8" y="11.5" width="7" height="2.5" rx="1" fill="white" fillOpacity="0.2" />
                <rect x="22" y="21.5" width="7" height="2.5" rx="1" fill="white" fillOpacity="0.2" />
            </g>
        </svg>
    );
}

export function PlaybookOutlineIcon({ size = 64, className = "" }: { size?: number; className?: string }) {
    const uid = useId();
    const id = (name: string) => `pbo-${name}-${uid}`;

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id={id("ring")} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E5E7EB" />
                    <stop offset="40%" stopColor="#9CA3AF" />
                    <stop offset="80%" stopColor="#D1D5DB" />
                    <stop offset="100%" stopColor="#6B7280" />
                </linearGradient>
                <linearGradient id={id("coverFill")} x1="16" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#4B5563" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#1F2937" stopOpacity="0.18" />
                </linearGradient>
                <linearGradient id={id("labelFill")} x1="25" y1="16" x2="51" y2="34" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#F9FAFB" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#D1D5DB" stopOpacity="0.1" />
                </linearGradient>
            </defs>

            {/* ===== WIRE RINGS — back half (behind the cover) ===== */}
            {[11, 19, 27, 35, 43, 51].map((cy) => (
                <path
                    key={`rb-${cy}`}
                    d={`M18 ${cy - 3} 
              C18 ${cy - 3} 8 ${cy - 3} 8 ${cy} 
              C8 ${cy + 3} 18 ${cy + 3} 18 ${cy + 3}`}
                    fill="none"
                    stroke="#6B7280"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                />
            ))}

            {/* ===== MAIN COVER ===== */}
            <rect
                x="16" y="4" width="40" height="56" rx="4"
                fill={`url(#${id("coverFill")})`}
            />
            <rect
                x="16" y="4" width="40" height="56" rx="4"
                fill="none"
                stroke="#D1D5DB"
                strokeWidth="2.4"
            />

            {/* Spine line */}
            <line
                x1="22" y1="6" x2="22" y2="58"
                stroke="#9CA3AF"
                strokeWidth="1.8"
                strokeLinecap="round"
            />

            {/* ===== LABEL PLATE ===== */}
            <rect
                x="25" y="16" width="26" height="18" rx="3"
                fill={`url(#${id("labelFill")})`}
            />
            <rect
                x="25" y="16" width="26" height="18" rx="3"
                fill="none"
                stroke="#D1D5DB"
                strokeWidth="1.8"
            />

            {/* ===== "PLAYBOOK" TEXT ===== */}
            <text
                x="38"
                y="24"
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily="'Georgia', 'Times New Roman', serif"
                fontSize="5.2"
                fontWeight="bold"
                letterSpacing="1.2"
                fill="#111827"
                stroke="#111827"
                strokeWidth="0.3"
            >
                PLAY
            </text>
            <text
                x="38"
                y="29.5"
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily="'Georgia', 'Times New Roman', serif"
                fontSize="5.2"
                fontWeight="bold"
                letterSpacing="1.2"
                fill="#111827"
                stroke="#111827"
                strokeWidth="0.3"
            >
                BOOK
            </text>

            {/* Decorative lines in label */}
            <line x1="28" y1="20.5" x2="48" y2="20.5" stroke="#9CA3AF" strokeWidth="0.8" />
            <line x1="28" y1="32.5" x2="48" y2="32.5" stroke="#9CA3AF" strokeWidth="0.8" />

            {/* ===== WIRE RINGS — front half (over the cover) ===== */}
            {[11, 19, 27, 35, 43, 51].map((cy) => (
                <path
                    key={`rf-${cy}`}
                    d={`M18 ${cy - 3}
              C18 ${cy - 5.5} 13 ${cy - 5.5} 13 ${cy}
              C13 ${cy + 5.5} 18 ${cy + 5.5} 18 ${cy + 3}`}
                    fill="none"
                    stroke={`url(#${id("ring")})`}
                    strokeWidth="2.4"
                    strokeLinecap="round"
                />
            ))}

            {/* ===== RING HOLES ===== */}
            {[11, 19, 27, 35, 43, 51].map((cy) => (
                <g key={`hole-${cy}`}>
                    <circle cx="18" cy={cy - 3} r="1.4" fill="#6B7280" stroke="#9CA3AF" strokeWidth="0.6" />
                    <circle cx="18" cy={cy + 3} r="1.4" fill="#6B7280" stroke="#9CA3AF" strokeWidth="0.6" />
                </g>
            ))}
        </svg>
    );
}

export function PlaybookIcon({ size = 64, className = "" }: { size?: number; className?: string }) {
    const uid = useId();
    const id = (name: string) => `pb-${name}-${uid}`;

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                {/* Cover gradient */}
                <linearGradient id={id("cover")} x1="16" y1="4" x2="58" y2="60" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#4B5563" />
                    <stop offset="100%" stopColor="#1F2937" />
                </linearGradient>

                {/* Spine darkening */}
                <linearGradient id={id("spine")} x1="16" y1="32" x2="24" y2="32" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#111827" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#111827" stopOpacity="0" />
                </linearGradient>

                {/* Cover sheen */}
                <radialGradient id={id("sheen")} cx="0.35" cy="0.3" r="0.65" fx="0.3" fy="0.25">
                    <stop offset="0%" stopColor="white" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                </radialGradient>

                {/* Label gradient */}
                <linearGradient id={id("label")} x1="26" y1="18" x2="52" y2="32" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#F9FAFB" />
                    <stop offset="100%" stopColor="#D1D5DB" />
                </linearGradient>

                {/* Ring gradient */}
                <linearGradient id={id("ring")} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D1D5DB" />
                    <stop offset="35%" stopColor="#9CA3AF" />
                    <stop offset="70%" stopColor="#E5E7EB" />
                    <stop offset="100%" stopColor="#6B7280" />
                </linearGradient>

                {/* Drop shadow */}
                <filter id={id("shadow")} x="-12%" y="-8%" width="135%" height="130%">
                    <feDropShadow dx="0.8" dy="1.5" stdDeviation="1.2" floodColor="#000" floodOpacity="0.35" />
                </filter>

                {/* Clip for spine darkening */}
                <clipPath id={id("coverClip")}>
                    <rect x="16" y="4" width="40" height="56" rx="4" />
                </clipPath>
            </defs>

            <g filter={`url(#${id("shadow")})`}>

                {/* ===== WIRE RINGS — back half (behind the cover) ===== */}
                {[11, 19, 27, 35, 43, 51].map((cy) => (
                    <path
                        key={`rb-${cy}`}
                        d={`M18 ${cy - 3} 
                C18 ${cy - 3} 8 ${cy - 3} 8 ${cy} 
                C8 ${cy + 3} 18 ${cy + 3} 18 ${cy + 3}`}
                        fill="none"
                        stroke="#6B7280"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                ))}

                {/* ===== MAIN COVER (single unified shape) ===== */}
                <rect x="16" y="4" width="40" height="56" rx="4" fill={`url(#${id("cover")})`} />

                {/* Cover outline */}
                <rect x="16" y="4" width="40" height="56" rx="4" fill="none" stroke="#111827" strokeWidth="1" />

                {/* Spine darkening overlay */}
                <rect x="16" y="4" width="8" height="56" fill={`url(#${id("spine")})`} clipPath={`url(#${id("coverClip")})`} />

                {/* Spine edge line */}
                <line x1="22" y1="6" x2="22" y2="58" stroke="white" strokeWidth="0.4" strokeOpacity="0.08" />

                {/* ===== COVER SHEEN ===== */}
                <rect x="16" y="4" width="40" height="56" rx="4" fill={`url(#${id("sheen")})`} />

                {/* Left edge curved highlight */}
                <path
                    d="M20 58 C17 45 17 20 20 6"
                    fill="none"
                    stroke="white"
                    strokeWidth="0.8"
                    strokeOpacity="0.07"
                />

                {/* ===== LABEL PLATE ===== */}
                <rect x="25" y="16" width="26" height="18" rx="3" fill={`url(#${id("label")})`} />
                <rect x="25" y="16" width="26" height="18" rx="3" fill="none" stroke="#9CA3AF" strokeWidth="0.5" />
                {/* Label inner highlight */}
                <rect x="27" y="17.5" width="22" height="1.5" rx="0.75" fill="white" fillOpacity="0.6" />

                {/* ===== "PLAYBOOK" TEXT ===== */}
                {/* Shadow/deboss layer */}
                <text
                    x="38"
                    y="24.5"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontFamily="'Georgia', 'Times New Roman', serif"
                    fontSize="5.2"
                    fontWeight="bold"
                    letterSpacing="1.2"
                    fill="#6B7280"
                    fillOpacity="0.5"
                >
                    PLAY
                </text>
                <text
                    x="38"
                    y="30"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontFamily="'Georgia', 'Times New Roman', serif"
                    fontSize="5.2"
                    fontWeight="bold"
                    letterSpacing="1.2"
                    fill="#6B7280"
                    fillOpacity="0.5"
                >
                    BOOK
                </text>
                {/* Main text layer */}
                <text
                    x="38"
                    y="24"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontFamily="'Georgia', 'Times New Roman', serif"
                    fontSize="5.2"
                    fontWeight="bold"
                    letterSpacing="1.2"
                    fill="#374151"
                >
                    PLAY
                </text>
                <text
                    x="38"
                    y="29.5"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontFamily="'Georgia', 'Times New Roman', serif"
                    fontSize="5.2"
                    fontWeight="bold"
                    letterSpacing="1.2"
                    fill="#374151"
                >
                    BOOK
                </text>
                {/* Subtle decorative lines around text */}
                <line x1="28" y1="20.5" x2="48" y2="20.5" stroke="#9CA3AF" strokeWidth="0.4" strokeOpacity="0.5" />
                <line x1="28" y1="32.5" x2="48" y2="32.5" stroke="#9CA3AF" strokeWidth="0.4" strokeOpacity="0.5" />

                {/* ===== WIRE RINGS — front half (over the cover) ===== */}
                {[11, 19, 27, 35, 43, 51].map((cy) => (
                    <g key={`rf-${cy}`}>
                        {/* Ring front arc — comes out from cover holes */}
                        <path
                            d={`M18 ${cy - 3}
                  C18 ${cy - 5.5} 13 ${cy - 5.5} 13 ${cy}
                  C13 ${cy + 5.5} 18 ${cy + 5.5} 18 ${cy + 3}`}
                            fill="none"
                            stroke={`url(#${id("ring")})`}
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                        {/* Ring highlight */}
                        <path
                            d={`M17.5 ${cy - 2.5}
                  C17.5 ${cy - 4.5} 14 ${cy - 4.5} 14 ${cy - 1}`}
                            fill="none"
                            stroke="white"
                            strokeWidth="0.8"
                            strokeLinecap="round"
                            strokeOpacity="0.55"
                        />
                    </g>
                ))}

                {/* ===== RING HOLES IN COVER ===== */}
                {[11, 19, 27, 35, 43, 51].map((cy) => (
                    <g key={`hole-${cy}`}>
                        <circle cx="18" cy={cy - 3} r="1.2" fill="#111827" fillOpacity="0.4" />
                        <circle cx="18" cy={cy + 3} r="1.2" fill="#111827" fillOpacity="0.4" />
                    </g>
                ))}

            </g>
        </svg>
    );
}

export function LossIcon({ size = 64, className = "" }: { size?: number; className?: string }) {
    const uid = useId();
    const id = (name: string) => `loss-${name}-${uid}`;

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id={id("arrow")} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FCA5A5" />
                    <stop offset="100%" stopColor="#EF4444" />
                </linearGradient>
                <linearGradient id={id("arrowEdge")} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#B91C1C" />
                    <stop offset="100%" stopColor="#7F1D1D" />
                </linearGradient>

                <filter id={id("sh")} x="-12%" y="-8%" width="130%" height="130%">
                    <feDropShadow dx="0.8" dy="1.5" stdDeviation="1.2" floodColor="#000" floodOpacity="0.3" />
                </filter>
            </defs>

            <g filter={`url(#${id("sh")})`}>
                <polygon
                    points="32,60 50,38 41,38 41,6 23,6 23,38 14,38"
                    fill={`url(#${id("arrowEdge")})`}
                    transform="translate(1.4, 1.8)"
                />

                <polygon
                    points="32,60 50,38 41,38 41,6 23,6 23,38 14,38"
                    fill={`url(#${id("arrow")})`}
                />

                <rect
                    x="25" y="7.5"
                    width="14" height="3"
                    rx="1" fill="white" fillOpacity="0.22"
                />

                <polygon
                    points="32,56 19,40 25,40 32,56 39,40 45,40"
                    fill="white"
                    fillOpacity="0.1"
                />
            </g>
        </svg>
    );
}

export function EquityCurveIcon({ size = 64, className = "" }: { size?: number; className?: string }) {
    const uid = useId();
    const id = (name: string) => `ec-${name}-${uid}`;

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id={id("line")} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#9CA3AF" />
                    <stop offset="100%" stopColor="#E5E7EB" />
                </linearGradient>
                <linearGradient id={id("fill")} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9CA3AF" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#9CA3AF" stopOpacity="0.02" />
                </linearGradient>
                <filter id={id("sh")} x="-12%" y="-8%" width="130%" height="130%">
                    <feDropShadow dx="0.8" dy="1.5" stdDeviation="1.2" floodColor="#000" floodOpacity="0.3" />
                </filter>
                <filter id={id("glow")}>
                    <feGaussianBlur stdDeviation="1" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            <g filter={`url(#${id("sh")})`}>
                <line x1="8" y1="12" x2="58" y2="12" stroke="#4B5563" strokeWidth="0.5" strokeOpacity="0.5" />
                <line x1="8" y1="22" x2="58" y2="22" stroke="#4B5563" strokeWidth="0.5" strokeOpacity="0.5" />
                <line x1="8" y1="32" x2="58" y2="32" stroke="#4B5563" strokeWidth="0.5" strokeOpacity="0.5" />
                <line x1="8" y1="42" x2="58" y2="42" stroke="#4B5563" strokeWidth="0.5" strokeOpacity="0.5" />
                <line x1="8" y1="52" x2="58" y2="52" stroke="#4B5563" strokeWidth="0.5" strokeOpacity="0.5" />

                <line x1="8" y1="6" x2="8" y2="56" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="8" y1="56" x2="60" y2="56" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" />

                <path
                    d="M8,50 C12,48 15,46 18,43 C21,40 22,42 25,39 C28,36 30,32 33,28 C36,24 37,26 40,22 C43,18 45,19 48,15 C51,11 54,10 58,7 L58,56 L8,56 Z"
                    fill={`url(#${id("fill")})`}
                />

                <path
                    d="M8,50 C12,48 15,46 18,43 C21,40 22,42 25,39 C28,36 30,32 33,28 C36,24 37,26 40,22 C43,18 45,19 48,15 C51,11 54,10 58,7"
                    stroke={`url(#${id("line")})`}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    filter={`url(#${id("glow")})`}
                />

                <circle cx="58" cy="7" r="2.8" fill="#D1D5DB" />
                <circle cx="58" cy="7" r="1.3" fill="#F9FAFB" />
            </g>
        </svg>
    );
}

export function BreakevenIcon({ size = 64, className = "" }: { size?: number; className?: string }) {
    const uid = useId();
    const id = (name: string) => `be-${name}-${uid}`;

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id={id("arrow")} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#9CA3AF" />
                    <stop offset="100%" stopColor="#D1D5DB" />
                </linearGradient>
                <linearGradient id={id("arrowEdge")} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#4B5563" />
                    <stop offset="100%" stopColor="#6B7280" />
                </linearGradient>

                <filter id={id("sh")} x="-8%" y="-12%" width="130%" height="130%">
                    <feDropShadow dx="0.8" dy="1.5" stdDeviation="1.2" floodColor="#000" floodOpacity="0.3" />
                </filter>
            </defs>

            <g filter={`url(#${id("sh")})`}>
                <polygon
                    points="58,32 40,14 40,23 6,23 6,41 40,41 40,50"
                    fill={`url(#${id("arrowEdge")})`}
                    transform="translate(1.4, 1.8)"
                />

                <polygon
                    points="58,32 40,14 40,23 6,23 6,41 40,41 40,50"
                    fill={`url(#${id("arrow")})`}
                />

                <rect
                    x="8" y="24.5"
                    width="30" height="3"
                    rx="1" fill="white" fillOpacity="0.18"
                />

                <polygon
                    points="55,32 42,17 42,24 55,32"
                    fill="white"
                    fillOpacity="0.15"
                />
            </g>
        </svg>
    );
}

export function AvgReturnIcon({ size = 64, className = "" }: { size?: number; className?: string }) {
    const uid = useId();
    const id = (name: string) => `ar-${name}-${uid}`;

    const cx = 32, cy = 32, r = 25;
    const toRad = (d: number) => (d * Math.PI) / 180;

    const startAng = -55;
    const endAng = -135;

    const sx = cx + r * Math.cos(toRad(startAng));
    const sy = cy + r * Math.sin(toRad(startAng));
    const ex = cx + r * Math.cos(toRad(endAng));
    const ey = cy + r * Math.sin(toRad(endAng));

    const ea = toRad(endAng);
    const tdx = -Math.sin(ea);
    const tdy = Math.cos(ea);

    const tipLen = 9;
    const wingBack = 6;
    const wingSpread = 6.5;
    const notchBack = 2.5;

    const tipX = ex + tdx * tipLen;
    const tipY = ey + tdy * tipLen;

    const bx = ex - tdx * wingBack;
    const by = ey - tdy * wingBack;

    const w1x = bx + tdy * wingSpread;
    const w1y = by - tdx * wingSpread;
    const w2x = bx - tdy * wingSpread;
    const w2y = by + tdx * wingSpread;

    const nx = ex - tdx * notchBack;
    const ny = ey - tdy * notchBack;

    const f = (n: number) => n.toFixed(1);

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id={id("coin")} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D1D5DB" />
                    <stop offset="100%" stopColor="#9CA3AF" />
                </linearGradient>
                <linearGradient id={id("arrow")} x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0%" stopColor="#9CA3AF" />
                    <stop offset="100%" stopColor="#E5E7EB" />
                </linearGradient>
                <filter id={id("sh")} x="-12%" y="-8%" width="130%" height="130%">
                    <feDropShadow dx="0.8" dy="1.5" stdDeviation="1.2" floodColor="#000" floodOpacity="0.3" />
                </filter>
            </defs>

            <g filter={`url(#${id("sh")})`}>
                <ellipse cx="32" cy="34" rx="13" ry="13" fill="#4B5563" />
                <ellipse cx="32" cy="32" rx="13" ry="13" fill={`url(#${id("coin")})`} />
                <ellipse cx="32" cy="32" rx="10" ry="10" fill="none" stroke="#6B7280" strokeWidth="1.5" />
                <text
                    x="32" y="37"
                    textAnchor="middle"
                    fontFamily="Georgia, serif"
                    fontSize="17"
                    fill="#4B5563"
                >
                    $
                </text>

                <path
                    d={`M${f(sx)},${f(sy)} A${r},${r} 0 1,1 ${f(ex)},${f(ey)}`}
                    fill="none"
                    stroke={`url(#${id("arrow")})`}
                    strokeWidth="5.5"
                    strokeLinecap="round"
                />

                <polygon
                    points={`${f(tipX)},${f(tipY)} ${f(w1x)},${f(w1y)} ${f(nx)},${f(ny)} ${f(w2x)},${f(w2y)}`}
                    fill="#E5E7EB"
                    stroke="#D1D5DB"
                    strokeWidth="0.6"
                    strokeLinejoin="round"
                />
            </g>
        </svg>
    );
}
