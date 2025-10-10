import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./critical.css"; // 导入关键CSS
import ClientRootLayout from "@/layout/ClientRootLayout";
import InlineStyles from "@/layout/common/InlineStyles";
import ClientLoadingIndicator from "@/layout/common/ClientLoadingIndicator";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "科虎数据管理系统 - 企业级数据管理平台",
  description: "专业的企业级数据管理系统，提供数据采集、存储、处理、分析和可视化的全生命周期管理。支持多数据源接入、实时数据处理、智能数据分析、数据质量监控和数据安全管控，助力企业实现数据驱动的业务决策。",
  applicationName: "科虎数据管理系统",
  authors: [{ name: "科虎数据管理系统团队" }],
  keywords: ["数据管理", "数据分析", "数据可视化", "数据质量", "数据安全", "数据治理", "商业智能", "大数据"],
  creator: "科虎数据管理系统",
  publisher: "科虎数据管理系统",
  formatDetection: {
    telephone: false,
  },
  metadataBase: new URL("https://link-tiger.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "科虎数据管理系统 - 企业级数据管理平台",
    description: "专业的企业级数据管理系统，提供数据采集、存储、处理、分析和可视化的全生命周期管理。支持多数据源接入、实时数据处理、智能数据分析、数据质量监控和数据安全管控，助力企业实现数据驱动的业务决策。",
    url: "https://link-tiger.com",
    siteName: "科虎数据管理系统",
    locale: "zh_CN",
    type: "website",
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 800,
        alt: '科虎数据管理系统'
      }
    ]
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        {/* 预加载关键CSS */}
        <link 
          rel="preload" 
          href="/reset.min.css" 
          as="style" 
          crossOrigin="anonymous" 
        />
        {/* 立即加载Ant Design样式 */}
        <link
          rel="stylesheet"
          href="/reset.min.css"
          crossOrigin="anonymous"
        />
        {/* 直接设置 favicon */}
        <link rel="icon" href="/logo.png" />
        <link rel="shortcut icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        {/* 内联关键CSS */}
        <InlineStyles />
      </head>
      <body className={inter.className}>
        {/* 添加初始加载指示器 */}
        <div id="initial-loader" className="loading-container">
          <div style={{ textAlign: 'center' }}>
            <div className="ant-spin ant-spin-lg ant-spin-spinning">
              <span className="ant-spin-dot ant-spin-dot-spin">
                <i className="ant-spin-dot-item"></i>
                <i className="ant-spin-dot-item"></i>
                <i className="ant-spin-dot-item"></i>
                <i className="ant-spin-dot-item"></i>
              </span>
            </div>
            <div style={{ marginTop: '16px', fontSize: '16px', color: 'rgba(0, 0, 0, 0.65)' }}>
              科虎数据管理系统加载中...
            </div>
          </div>
        </div>
        <ClientRootLayout>{children}</ClientRootLayout>
        <ClientLoadingIndicator />
      </body>
    </html>
  );
}
