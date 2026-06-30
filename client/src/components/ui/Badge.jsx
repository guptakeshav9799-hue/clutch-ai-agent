export default function Badge({ children, variant = 'default', className = '' }) {
  const variantClass = {
    calm: 'badge-calm',
    planning: 'badge-planning',
    active: 'badge-active',
    crunch: 'badge-crunch',
    emergency: 'badge-emergency',
    survival: 'badge-survival',
    purple: 'badge-purple',
    default: 'badge-purple',
  };

  return (
    <span className={`badge ${variantClass[variant] || variantClass.default} ${className}`}>
      {children}
    </span>
  );
}
