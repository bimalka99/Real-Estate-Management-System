"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Star, Trash2, Upload, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { uploadPropertyImage, deletePropertyImage, setCoverImage, ApiError } from "@/lib/api";
import type { PropertyImageDto } from "@/lib/types";

export default function ImageManager({
  propertyId,
  initialImages,
}: {
  propertyId: string;
  initialImages: PropertyImageDto[];
}) {
  const { accessToken } = useAuth();
  const [images, setImages] = useState<PropertyImageDto[]>(initialImages);
  const [isUploading, setIsUploading] = useState(false);
  const [busyImageId, setBusyImageId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFilesSelected(files: FileList | null) {
    if (!files || files.length === 0 || !accessToken) return;

    setIsUploading(true);
    setError(null);

    for (const file of Array.from(files)) {
      try {
        const image = await uploadPropertyImage(accessToken, propertyId, file);
        setImages((prev) => [...prev, image]);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : `Couldn't upload "${file.name}".`);
      }
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSetCover(imageId: string) {
    if (!accessToken) return;
    setBusyImageId(imageId);
    try {
      await setCoverImage(accessToken, propertyId, imageId);
      setImages((prev) => prev.map((img) => ({ ...img, isCover: img.id === imageId })));
    } catch {
      setError("Couldn't update the cover photo.");
    } finally {
      setBusyImageId(null);
    }
  }

  async function handleDelete(imageId: string) {
    if (!accessToken) return;
    setBusyImageId(imageId);
    try {
      await deletePropertyImage(accessToken, propertyId, imageId);
      setImages((prev) => {
        const remaining = prev.filter((img) => img.id !== imageId);
        // Mirror the backend's auto-promotion of the next image to cover.
        const removed = prev.find((img) => img.id === imageId);
        if (removed?.isCover && remaining.length > 0 && !remaining.some((img) => img.isCover)) {
          remaining[0] = { ...remaining[0], isCover: true };
        }
        return remaining;
      });
    } catch {
      setError("Couldn't delete that image.");
    } finally {
      setBusyImageId(null);
    }
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-muted">Photos</p>

      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {images.map((image) => (
            <div key={image.id} className="group relative aspect-square overflow-hidden border border-border">
              <Image src={image.url} alt="" fill sizes="200px" className="object-cover" />

              {image.isCover && (
                <div className="absolute left-2 top-2 bg-accent px-2 py-0.5 text-[0.6rem] uppercase tracking-wide text-accent-foreground">
                  Cover
                </div>
              )}

              <div className="absolute inset-0 flex items-end justify-end gap-1.5 bg-gradient-to-t from-black/60 via-transparent to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                {!image.isCover && (
                  <button
                    type="button"
                    onClick={() => handleSetCover(image.id)}
                    disabled={busyImageId === image.id}
                    aria-label="Set as cover photo"
                    className="flex h-7 w-7 items-center justify-center bg-white/90 text-foreground hover:bg-white disabled:opacity-50"
                  >
                    <Star size={14} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(image.id)}
                  disabled={busyImageId === image.id}
                  aria-label="Delete image"
                  className="flex h-7 w-7 items-center justify-center bg-white/90 text-red-600 hover:bg-white disabled:opacity-50"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 border border-dashed border-border py-6 text-sm text-muted transition-colors hover:border-accent hover:text-accent">
        {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
        {isUploading ? "Uploading..." : "Click to upload photos (JPEG, PNG, WEBP, GIF — up to 8MB each)"}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          disabled={isUploading}
          onChange={(e) => handleFilesSelected(e.target.files)}
          className="hidden"
        />
      </label>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
