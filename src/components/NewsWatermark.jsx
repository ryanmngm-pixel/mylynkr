
import "./NewsWatermark.css";

export default function NewsWatermark({
  src,
  alt = "",
  className = "",
}) {
  if (!src) return null;

  return (
    <div className={`mylynkr-watermarked-image ${className}`}>
      <img
        className="mylynkr-watermarked-image-photo"
        src={src}
        alt={alt}
        loading="lazy"
      />

      <img
        className="mylynkr-watermarked-image-logo"
        src="/images/mylynkr-logo.png"
        alt=""
        aria-hidden="true"
      />
    </div>
  );
}
