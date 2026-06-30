import { motion } from 'framer-motion';

export default function Card({ children, className = '', variant = 'default', onClick, animated = true }) {
  const variantClasses = {
    default: 'card-surface',
    elevated: 'card-elevated',
    crisis: '',
  };

  const Component = animated ? motion.div : 'div';
  const animProps = animated ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  } : {};

  return (
    <Component
      className={`${variantClasses[variant] || 'card-surface'} ${className}`}
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : {}}
      {...animProps}
    >
      {children}
    </Component>
  );
}
