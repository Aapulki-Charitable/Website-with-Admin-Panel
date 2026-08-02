export const metadata = {
  title: 'आपुलकी चॅरिटेबल ट्रस्ट',
};

export default function RootLayout({ children }) {
  return (
    <html lang="mr">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Noto+Serif+Devanagari:wght@700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
        />
      </head>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
