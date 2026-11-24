import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ibnu Qayyim",
  description: "Personal business card of Ibnu Qayyim.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={cormorant.className}>{children}</body>
    </html>
  );
}
