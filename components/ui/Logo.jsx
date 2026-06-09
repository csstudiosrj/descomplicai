// components/ui/Logo.jsx

export default function Logo({ className = '' }) {
  return (
    <span className={`logo-root ${className}`} aria-label="Descomplicaí" role="img">
      <span className="logo-descomplica">descomplica</span>
      <span className="logo-i">í</span>
    </span>
  );
}