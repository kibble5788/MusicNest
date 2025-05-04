import { MusicProvider } from "@/context/music-context";
import { AuthProvider } from "@/context/auth-context";
import "./globals.css";

// 全局音频元素
const GlobalAudio = () => {
  return <audio id="global-audio" style={{ display: "none" }} />;
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <head>
        <meta
          name="viewport"
          content="initial-scale=1, width=device-width, viewport-fit=cover"
        />

        <style></style>
      </head>
      <body className={"latin"}>
        <AuthProvider>
          <MusicProvider>
            {children}
            {/* <GlobalAudio /> */}
          </MusicProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
