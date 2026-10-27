"use client";
import { useState } from "react";
import { platformKey, platformLabel } from "../../lib/platform";

export function LinkField({
  name,
  label,
  initial = "",
}: {
  name: string;
  label: string;
  initial?: string;
}) {
  const [value, setValue] = useState(initial);
  const key = value.trim() ? platformKey(value.trim()) : null;
  const detected = key ? platformLabel(value.trim()) : null;

  return (
    <label>
      {label}{" "}
      <input
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {detected && <span className="link-hint">Terdeteksi: {detected}</span>}
    </label>
  );
}
