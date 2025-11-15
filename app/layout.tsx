import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Learn Your Way",
  description: "Re‑imagining textbooks for every learner",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Sans font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Google+Sans:400,500,700" />
        {/* Global styles */}
        <link rel="stylesheet" href="/global_styles.css" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
