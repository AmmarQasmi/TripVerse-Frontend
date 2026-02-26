export function TravelBotIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Globe/World */}
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      
      {/* Latitude lines */}
      <path
        d="M3 12h18M12 3c-2.5 3-2.5 6-2.5 9s0 6 2.5 9M12 3c2.5 3 2.5 6 2.5 9s0 6-2.5 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      
      {/* Airplane */}
      <g transform="translate(14, 4)">
        <path
          d="M5 2L2 5l1.5 1L6 4.5L7.5 6L6 7.5l1.5 1.5L10 6L8.5 4.5L7 6L5.5 4.5L7 3L5 2z"
          fill="currentColor"
        />
      </g>
    </svg>
  )
}
