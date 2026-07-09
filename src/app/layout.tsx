import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Voicenote AI — speak · summarise · remember",
  description:
    "Voicenote AI automatically records your conversations, generates intelligent AI summaries with action items, and lets you query any past recording with natural language. Built with Flutter & Gemini API.",
  keywords: [
    "voice notes",
    "AI transcription",
    "meeting summarizer",
    "Gemini AI",
    "Flutter app",
    "voice recorder",
    "AI meeting notes",
    "semantic search",
    "action items",
  ],
  openGraph: {
    title: "Voicenote AI — speak · summarise · remember",
    description:
      "Automatically transcribe, summarize, and query your meetings. Powered by Gemini AI.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
