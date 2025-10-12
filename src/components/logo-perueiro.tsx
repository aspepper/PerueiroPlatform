export default function LogoPerueiro({ className = "h-28 w-28" }: { className?: string }) {
  return (
    <svg viewBox="0 0 180 220" className={className} aria-label="Perueiro logo">
      <path d="M90 0C40.294 0 0 40.294 0 90c0 49.706 67.5 92.5 90 130 22.5-37.5 90-80.294 90-130C180 40.294 139.706 0 90 0z" fill="#FFD54F" />
      <circle cx="112" cy="62" r="38" fill="#0B1020" />
      <circle cx="87" cy="40" r="6" fill="#00D2D3" />
      <path d="M70 56h34c16 0 28 12 28 28s-12 28-28 28H70z" fill="#00D2D3" />
    </svg>
  );
}
