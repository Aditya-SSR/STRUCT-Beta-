import localFont from 'next/font/local';
import { Space_Mono } from 'next/font/google';
import './globals.css';
import StaggeredMenu from '@/components/menu';

const spaceMono = Space_Mono({
  weight: ['400', '700'], 
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
});

const bitcount = localFont({
  src: './fonts/BitcountPropSingle.woff2',
  variable: '--font-bitcount',
  display: 'swap',
});

const monument = localFont({
  src: './fonts/MonumentExtended-Regular.woff2',
  variable: '--font-monument',
  display: 'swap',
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${bitcount.variable} ${monument.variable} ${spaceMono.variable}`}>
<StaggeredMenu />
        {children}
      </body>
    </html>
  );
}
 