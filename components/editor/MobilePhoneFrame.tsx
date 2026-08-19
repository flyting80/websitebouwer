"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode, type WheelEvent } from "react";
import { cn } from "@/lib/utils";

export const MOBILE_VIEWPORT_WIDTH = 390;
export const MOBILE_VIEWPORT_HEIGHT = 760;

function ExternalScrollTrack({
  contentHeight,
  onScroll,
  trackRef,
  className,
}: {
  contentHeight: number;
  onScroll: () => void;
  trackRef: React.RefObject<HTMLDivElement | null>;
  className?: string;
}) {
  return (
    <div
      ref={trackRef}
      className={cn("overflow-y-auto overflow-x-hidden shrink-0 ml-1.5", className)}
      style={{ height: MOBILE_VIEWPORT_HEIGHT, width: 12 }}
      onScroll={onScroll}
      aria-label="Scroll pagina-inhoud"
    >
      <div style={{ height: contentHeight, width: 1 }} aria-hidden />
    </div>
  );
}

function PhoneViewport({
  children,
  contentRef,
  scrollTop,
  onWheel,
  onClick,
}: {
  children: ReactNode;
  contentRef: React.RefObject<HTMLDivElement | null>;
  scrollTop: number;
  onWheel: (e: WheelEvent<HTMLDivElement>) => void;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}) {
  return (
    <div
      className="relative overflow-hidden bg-white shrink-0 @container"
      style={{ width: MOBILE_VIEWPORT_WIDTH, height: MOBILE_VIEWPORT_HEIGHT, containerType: "inline-size" }}
      onWheel={onWheel}
      onClick={onClick}
    >
      <div
        ref={contentRef}
        className="absolute left-0 top-0 w-full will-change-transform"
        style={{ transform: `translateY(-${scrollTop}px)` }}
      >
        {children}
      </div>
    </div>
  );
}

function useExternalScroll() {
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(MOBILE_VIEWPORT_HEIGHT);
  const [scrollTop, setScrollTop] = useState(0);

  const onTrackScroll = useCallback(() => {
    const track = scrollTrackRef.current;
    if (!track) return;
    setScrollTop(track.scrollTop);
  }, []);

  const onViewportWheel = useCallback((e: WheelEvent<HTMLDivElement>) => {
    const track = scrollTrackRef.current;
    if (!track) return;
    e.preventDefault();
    track.scrollTop += e.deltaY;
  }, []);

  return {
    contentRef,
    scrollTrackRef,
    contentHeight,
    setContentHeight,
    scrollTop,
    setScrollTop,
    onTrackScroll,
    onViewportWheel,
  };
}

interface Props {
  children: ReactNode;
  className?: string;
  variant?: "editor" | "preview";
  onViewportClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export function MobilePhoneFrame({
  children,
  className,
  variant = "editor",
  onViewportClick,
}: Props) {
  const {
    contentRef,
    scrollTrackRef,
    contentHeight,
    setContentHeight,
    scrollTop,
    onTrackScroll,
    onViewportWheel,
  } = useExternalScroll();

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const measure = () => {
      setContentHeight(Math.max(el.scrollHeight, MOBILE_VIEWPORT_HEIGHT));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [children, contentRef, setContentHeight]);

  const viewport = (
    <PhoneViewport
      contentRef={contentRef}
      scrollTop={scrollTop}
      onWheel={onViewportWheel}
      onClick={onViewportClick}
    >
      {children}
    </PhoneViewport>
  );

  if (variant === "preview") {
    return (
      <div className={cn("flex items-start shrink-0", className)}>
        <div className="bg-stone-900 rounded-[2.2rem] p-3 shadow-2xl shrink-0">
          <div className="bg-stone-800 rounded-full w-20 h-1.5 mx-auto mb-2" />
          <div className="rounded-[1.4rem] overflow-hidden">{viewport}</div>
        </div>
        <ExternalScrollTrack
          contentHeight={contentHeight}
          onScroll={onTrackScroll}
          trackRef={scrollTrackRef}
          className="mt-3"
        />
      </div>
    );
  }

  return (
    <div className={cn("flex items-start shrink-0", className)}>
      <div
        className="border-[10px] border-stone-800 rounded-[2rem] shadow-2xl bg-stone-800 shrink-0"
        style={{ width: MOBILE_VIEWPORT_WIDTH + 20 }}
      >
        <div className="rounded-[1.35rem] overflow-hidden">{viewport}</div>
      </div>
      <ExternalScrollTrack
        contentHeight={contentHeight}
        onScroll={onTrackScroll}
        trackRef={scrollTrackRef}
        className="mt-[10px]"
      />
    </div>
  );
}

interface IframeProps {
  src: string;
  className?: string;
}

export function MobilePhoneIframePreview({ src, className }: IframeProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const {
    scrollTrackRef,
    contentHeight,
    setContentHeight,
    scrollTop,
    setScrollTop,
    onTrackScroll,
    onViewportWheel,
  } = useExternalScroll();

  const measureIframe = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    try {
      const doc = iframe.contentDocument;
      if (!doc) return;
      const height = Math.max(
        doc.documentElement.scrollHeight,
        doc.body?.scrollHeight ?? 0,
        MOBILE_VIEWPORT_HEIGHT
      );
      setContentHeight(height);
    } catch {
      setContentHeight(MOBILE_VIEWPORT_HEIGHT);
    }
  }, [setContentHeight]);

  useEffect(() => {
    setScrollTop(0);
    if (scrollTrackRef.current) scrollTrackRef.current.scrollTop = 0;
    setContentHeight(MOBILE_VIEWPORT_HEIGHT);
  }, [src, scrollTrackRef, setContentHeight, setScrollTop]);

  return (
    <div className={cn("flex items-start shrink-0", className)}>
      <div className="bg-stone-900 rounded-[2.2rem] p-3 shadow-2xl shrink-0">
        <div className="bg-stone-800 rounded-full w-20 h-1.5 mx-auto mb-2" />
        <div
          className="relative overflow-hidden bg-white shrink-0 rounded-[1.4rem]"
          style={{ width: MOBILE_VIEWPORT_WIDTH, height: MOBILE_VIEWPORT_HEIGHT }}
          onWheel={onViewportWheel}
        >
          <iframe
            ref={iframeRef}
            title="Mobiele preview"
            src={src}
            className="absolute left-0 top-0 border-0 block"
            scrolling="no"
            style={{
              width: MOBILE_VIEWPORT_WIDTH,
              height: contentHeight,
              transform: `translateY(-${scrollTop}px)`,
            }}
            onLoad={measureIframe}
          />
        </div>
      </div>
      <ExternalScrollTrack
        contentHeight={contentHeight}
        onScroll={onTrackScroll}
        trackRef={scrollTrackRef}
        className="mt-3"
      />
    </div>
  );
}
