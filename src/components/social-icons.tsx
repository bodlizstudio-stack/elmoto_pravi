export function WhatsAppIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M20.52 3.48A11.82 11.82 0 0 0 12.06 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.15 1.6 5.95L0 24l6.33-1.66a11.87 11.87 0 0 0 5.73 1.46h.01c6.56 0 11.9-5.34 11.9-11.9 0-3.18-1.24-6.17-3.45-8.42ZM12.07 21.8h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.76.98 1-3.66-.23-.38a9.85 9.85 0 0 1-1.51-5.25c0-5.45 4.44-9.89 9.9-9.89 2.64 0 5.13 1.03 7 2.9a9.83 9.83 0 0 1 2.9 7c0 5.45-4.44 9.89-9.9 9.89Zm5.43-7.41c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35Z" />
    </svg>
  );
}

export function FacebookIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.5-.14-2.75-.14-2.8 0-4.75 1.7-4.75 4.89v2.61H7v4h3v9.5h4V13.5z" />
    </svg>
  );
}

export function InstagramIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id="elmoto-ig-gradient" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#bc1888" />
          <stop offset="30%" stopColor="#cc2366" />
          <stop offset="60%" stopColor="#dc2743" />
          <stop offset="85%" stopColor="#e6683c" />
          <stop offset="100%" stopColor="#f09433" />
        </linearGradient>
      </defs>
      <rect
        x="2.5"
        y="2.5"
        width="19"
        height="19"
        rx="5.5"
        stroke="url(#elmoto-ig-gradient)"
        strokeWidth="2"
      />
      <circle
        cx="12"
        cy="12"
        r="4.2"
        stroke="url(#elmoto-ig-gradient)"
        strokeWidth="2"
      />
      <circle
        cx="17.2"
        cy="6.8"
        r="1.2"
        fill="url(#elmoto-ig-gradient)"
      />
    </svg>
  );
}
