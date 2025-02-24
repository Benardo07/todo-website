import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";

import { TRPCReactProvider } from "~/trpc/react";

import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "Todo App",
  description: "Generated by create-t3-app",
  icons: [{ rel: "icon", url: "/todo.png" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <TRPCReactProvider>
          <Toaster position="bottom-center"/>
          {children}
          </TRPCReactProvider>
      </body>
    </html>
  );
}
