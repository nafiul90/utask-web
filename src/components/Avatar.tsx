"use client";

import Image from "next/image";
import { useState } from "react";
import { UserRound } from "lucide-react";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9052/api";
const assetHost = apiBase.replace(/\/api$/, "");

const resolveSrc = (path?: string | null) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${assetHost}${path}`;
};

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: number;
}

export const Avatar = ({ src, alt = "Avatar", size = 48 }: AvatarProps) => {
  const [hasError, setHasError] = useState(false);
  const resolved = resolveSrc(src);

  return (
    <div
      className="relative overflow-hidden rounded-full border border-white/15 bg-white/5"
      style={{ width: size, height: size }}
    >
      {!resolved || hasError ? (
        <div className="flex h-full w-full items-center justify-center text-white">
          <UserRound size={size * 0.5} className="text-slate-300" />
        </div>
      ) : (
        <Image
          src={resolved}
          alt={alt}
          fill
          className="object-cover"
          sizes={`${size}px`}
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
};
