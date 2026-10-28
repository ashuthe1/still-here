import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PWA from "@/components/PWA";

const serif = Fraunces({
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
  weight: "variable",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});
const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Still Here", template: "%s · Still Here" },
  description: "Lines about life, hardship, and finding yourself. Curated, attributed, and written to make you feel more capable, not just comforted.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/apple-icon.png" },
  appleWebApp: { capable: true, title: "Still Here", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0f0e0c" },
    { media: "(prefers-color-scheme: light)", color: "#f7f3ec" },
  ],
  viewportFit: "cover",
};

// Runs before paint so the saved theme never flashes.
const themeInit = `(function(){try{var t=localStorage.getItem('sh-theme');if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t;}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning className={`${serif.variable} ${sans.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>
        <div className="wrap">
          <Header />
        </div>
        {children}
        <div className="wrap">
          <Footer />
        </div>
        <PWA />
      </body>
    </html>
  );
}
