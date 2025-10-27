// src/app/layout.jsx (server)
import "./globals.css";
import ClientLayout from "./components/clientLayout";

export const metadata = { title: "BoutiqAI " };

export default async function RootLayout({ children }) {

  return (
    <html lang="en">
      <body className="bg-[#121530] min-h-screen antialiased">
        {/* ClientLayout will wrap the children so SessionProvider covers them */}
        <ClientLayout>
          {/* main: make it scrollable and add top padding for mobile fixed header */}
          <main className="flex-1 sm:p-6 pt-16 md:pt-6 overflow-y-auto">
            {children}
          </main>
        </ClientLayout>
      </body>
    </html>
  );
}

