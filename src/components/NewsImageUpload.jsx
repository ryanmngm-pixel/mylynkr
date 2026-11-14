
import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";

const BASE_URL = (
  import.meta.env.VITE_SUPABASE_URL || ""
).replace(/\/$/, "");

const ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "";

const ALLOWED = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export default function NewsImageUpload({
  value,
  onChange,
  accessToken,
  logoUrl = "/images/mylynkr-logo.png",
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function upload(file) {
    if (!file) return;

    setError("");

    if (!ALLOWED.includes(file.type)) {
      setError("Use a JPG, PNG, or WebP image.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Images must be smaller than 10 MB.");
      return;
    }

    if (!accessToken) {
      setError("Please sign in again before uploading.");
      return;
    }

    if (!BASE_URL || !ANON_KEY) {
      setError("Supabase is not configured.");
      return;
    }

    setUploading(true);

    try {
      const extension = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
      }[file.type];

      const filename = `${crypto.randomUUID()}.${extension}`;
      const objectPath = `articles/${filename}`;

      const response = await fetch(
        `${BASE_URL}/storage/v1/object/news-images/${objectPath}`,
        {
          method: "POST",
          headers: {
            apikey: ANON_KEY,
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": file.type,
            "x-upsert": "false",
          },
          body: file,
        }
      );

      if (!response.ok) {
        const details = await response.json().catch(() => ({}));

        throw new Error(
          details.message ||
          details.error ||
          "Image upload failed."
        );
      }

      const publicUrl =
        `${BASE_URL}/storage/v1/object/public/news-images/${objectPath}`;

      onChange(publicUrl);
    } catch (err) {
      setError(err.message || "Upload failed.");
    } finally {
      setUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div className="news-image-uploader">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: "none" }}
        onChange={(event) =>
          upload(event.target.files?.[0])
        }
      />

      {value ? (
        <div className="news-image-preview">
          <img
            className="news-image-photo"
            src={value}
            alt="Article cover preview"
          />

          <img
            className="news-image-watermark"
            src={logoUrl}
            alt=""
            aria-hidden="true"
          />

          <button
            type="button"
            className="news-image-remove"
            onClick={() => onChange("")}
            aria-label="Remove image from article"
          >
            <X size={17} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="news-image-upload-button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 size={24} />
          ) : (
            <ImagePlus size={26} />
          )}

          <strong>
            {uploading
              ? "Uploading image..."
              : "Upload an image"}
          </strong>

          <span>
            JPG, PNG or WebP · Maximum 10 MB
          </span>
        </button>
      )}

      {value && (
        <button
          type="button"
          className="news-image-change"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Uploading..." : "Change image"}
        </button>
      )}

      {error && (
        <p className="news-image-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
