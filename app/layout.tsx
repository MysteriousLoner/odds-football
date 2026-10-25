import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Terrace — Premier League 反波胆",
  description: "The other side of the score. Explore Premier League reverse correct-score markets with play credits.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
