"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { HeartIcon } from "@/components/icons/heart-icon";
import { cn } from "@/lib/utils";
import { toggleLike } from "@/lib/actions/likes";

export function LikeButton({
  productId,
  initiallyLiked,
  className,
}: {
  productId: string;
  initiallyLiked: boolean;
  className?: string;
}) {
  const [liked, setLiked] = useState(initiallyLiked);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick(event: React.MouseEvent) {
    // Las tarjetas envuelven la imagen en un <Link> -- no navegar al hacer
    // clic en el corazón.
    event.preventDefault();
    event.stopPropagation();

    const nextLiked = !liked;
    setLiked(nextLiked);

    startTransition(async () => {
      try {
        const result = await toggleLike(productId);
        setLiked(result.liked);
      } catch {
        // requireUser() redirige a /login si no hay sesión -- eso se
        // resuelve como una navegación, no llega aquí un valor de retorno.
        setLiked(!nextLiked);
        router.push("/login");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={liked}
      aria-label={liked ? "Quitar de favoritos" : "Añadir a favoritos"}
      className={cn(
        "flex size-8 items-center justify-center rounded-full bg-black/70 text-white transition-transform hover:scale-110 disabled:opacity-60",
        className
      )}
    >
      <HeartIcon className={cn("size-4", liked && "fill-current text-red-500")} />
    </button>
  );
}
