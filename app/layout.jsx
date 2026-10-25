import "./globals.css";

export const metadata = {
  title: "সঠিক হয়েছে?",
  description: "একটা ভোট",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <body className="min-h-screen bg-[radial-gradient(circle_at_top,#1e1b4b,#0b0b14_70%)] text-white">
        {children}
      </body>
    </html>
  );
}