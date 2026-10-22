"use client";

export default function ProjectImage({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  return (
    <img
      className="project-image"
      src={src}
      alt={alt}
      onError={(event) => {
        event.currentTarget.hidden = true;
      }}
    />
  );
}
