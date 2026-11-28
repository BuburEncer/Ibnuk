"use client";

import { useRef, useState } from "react";

// One image per slide, Instagram-style: swipe on touch (native scroll-snap),
// arrows on desktop, dots show position.
export default function GalleryCarousel({
  projectId,
  images,
}: {
  projectId: number;
  images: { id: number; caption: string }[];
}) {
  const track = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  const go = (index: number) => {
    const el = track.current;
    if (el) el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="gallery-carousel">
      <div className="gallery-viewport">
        <ul
          ref={track}
          className="gallery"
          tabIndex={0}
          aria-label="Gallery, swipe or use the arrows for more images"
          onScroll={(event) => {
            const el = event.currentTarget;
            setActive(Math.round(el.scrollLeft / el.clientWidth));
          }}
        >
          {images.map((item, index) => (
            <li key={item.id} aria-label={`${index + 1} of ${images.length}`}>
              <figure>
                <img
                  src={`/projects/${projectId}/images/${item.id}`}
                  alt={item.caption}
                  loading="lazy"
                />
                <figcaption>{item.caption}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
        {images.length > 1 && (
          <>
            <button
              type="button"
              className="gallery-arrow prev"
              aria-label="Previous image"
              disabled={active === 0}
              onClick={() => go(active - 1)}
            >
              ‹
            </button>
            <button
              type="button"
              className="gallery-arrow next"
              aria-label="Next image"
              disabled={active === images.length - 1}
              onClick={() => go(active + 1)}
            >
              ›
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="gallery-dots">
          {images.map((item, index) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Show image ${index + 1}`}
              aria-current={index === active}
              onClick={() => go(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
