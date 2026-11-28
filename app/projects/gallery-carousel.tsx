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
  const last = images.length - 1;

  const goTo = (index: number) => {
    const el = track.current;
    if (el) el.scrollTo({ left: Math.min(Math.max(index, 0), last) * el.clientWidth });
  };
  // Read the live position, not state, so fast repeat clicks during the scroll still advance.
  const step = (delta: number) => {
    const el = track.current;
    if (el) goTo(Math.round(el.scrollLeft / el.clientWidth) + delta);
  };

  return (
    <div className="gallery-carousel">
      <div className="gallery-viewport">
        <ul
          ref={track}
          className="gallery"
          tabIndex={0}
          aria-label="Gallery"
          onScroll={(event) => {
            const el = event.currentTarget;
            setActive(Math.round(el.scrollLeft / el.clientWidth));
          }}
        >
          {images.map((item) => (
            <li key={item.id}>
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
            {/* aria-disabled, not disabled: a disabled button drops keyboard focus to <body>. */}
            <button
              type="button"
              className="gallery-arrow prev"
              aria-label="Previous image"
              aria-disabled={active === 0}
              onClick={() => step(-1)}
            >
              ‹
            </button>
            <button
              type="button"
              className="gallery-arrow next"
              aria-label="Next image"
              aria-disabled={active === last}
              onClick={() => step(1)}
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
              aria-label={`Show image ${index + 1} of ${images.length}`}
              aria-current={index === active}
              onClick={() => goTo(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
