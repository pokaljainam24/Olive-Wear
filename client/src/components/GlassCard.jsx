// Reusable dark glass surface. Pass className / children.
export default function GlassCard({ children, className = "", ...rest }) {
  return (
    <div className={`glass ${className}`} {...rest}>
      {children}
    </div>
  );
}
