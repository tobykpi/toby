"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState, type SyntheticEvent } from "react";

type WebsitePreviewCardProps = {
  imgSrc: string;
  siteUrl: string;
};

const FALLBACK_WIDTH = 1440;
const FALLBACK_HEIGHT = 2600;
const MIN_SCROLL_DURATION = 4;
const MAX_SCROLL_DURATION = 16;
const PIXELS_PER_SECOND = 140;

export function WebsitePreviewCard({
  imgSrc,
  siteUrl,
}: WebsitePreviewCardProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [travelY, setTravelY] = useState(0);
  const [duration, setDuration] = useState(8);
  const [naturalSize, setNaturalSize] = useState({
    width: FALLBACK_WIDTH,
    height: FALLBACK_HEIGHT,
  });

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const measure = () => {
      const viewportWidth = viewport.clientWidth;
      const viewportHeight = viewport.clientHeight;

      if (!viewportWidth || !viewportHeight) return;

      const renderedImageHeight =
        viewportWidth * (naturalSize.height / naturalSize.width);
      const overflow = Math.max(renderedImageHeight - viewportHeight, 0);

      setTravelY(overflow);

      if (overflow === 0) {
        setDuration(0.6);
        return;
      }

      const nextDuration = Math.min(
        Math.max(overflow / PIXELS_PER_SECOND, MIN_SCROLL_DURATION),
        MAX_SCROLL_DURATION,
      );

      setDuration(nextDuration);
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(viewport);

    return () => observer.disconnect();
  }, [naturalSize]);

  const handleImageLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = event.currentTarget;

    if (!naturalWidth || !naturalHeight) return;

    setNaturalSize({
      width: naturalWidth,
      height: naturalHeight,
    });
  };

  let hostname = siteUrl;

  try {
    hostname = new URL(siteUrl).hostname.replace(/^www\./, "");
  } catch {
    hostname = siteUrl;
  }

  return (
    <motion.a
      href={siteUrl}
      target="_blank"
      rel="noreferrer"
      className="group block w-full"
      onHoverStart={() => setIsActive(true)}
      onHoverEnd={() => setIsActive(false)}
      onFocus={() => setIsActive(true)}
      onBlur={() => setIsActive(false)}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 180, damping: 20 }}
    >
      <div className="relative rounded-[12px] bg-slate-950/90 p-[1px] shadow-[0_32px_90px_rgba(15,23,42,0.18)]">
        <div className="absolute inset-0 rounded-[12px] bg-gradient-to-br from-cyan-400/25 via-sky-400/5 to-fuchsia-500/20 opacity-70 blur-xl transition-opacity duration-500 group-hover:opacity-100" />

        <div className="relative overflow-hidden rounded-[11px] bg-white">
          <div className="flex h-12 items-center gap-2 border-b border-slate-200/80 bg-slate-100/90 px-4">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />

            <div className="ml-3 truncate rounded-full bg-white px-3 py-1 text-[11px] font-medium text-slate-500 ring-1 ring-slate-200/80">
              {hostname}
            </div>
          </div>

          <div
            ref={viewportRef}
            className="relative aspect-[16/10] overflow-hidden bg-slate-950"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-black/15 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-black/20 to-transparent" />

            <motion.img
              src={imgSrc}
              alt={`${hostname} website preview`}
              className="block w-full max-w-none select-none"
              draggable={false}
              onLoad={handleImageLoad}
              animate={{ y: isActive ? -travelY : 0 }}
              transition={{
                duration,
                ease: travelY > 0 ? "easeInOut" : "easeOut",
              }}
            />
          </div>
        </div>
      </div>
    </motion.a>
  );
}

export default WebsitePreviewCard;
