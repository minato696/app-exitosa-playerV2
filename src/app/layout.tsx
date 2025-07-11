// src/app/layout.tsx - Versión final limpia
import { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Radio Exitosa',
  description: 'Reproductor de radio en vivo',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        {/* Preload de fuentes y recursos críticos */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}