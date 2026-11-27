// <img> with a fallback so a broken online link never leaves an empty box.
export default function SafeImage({ src, alt, className = "", style }) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      loading="lazy"
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = "https://picsum.photos/seed/olive-wear/700/900";
      }}
    />
  );
}
