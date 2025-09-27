import './globals.css';
import { QueryClientProviderWrapper } from '@/components/QueryClientProviderWrapper';
import Header from '@/components/Header';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryClientProviderWrapper>
          <Header />
          <main>{children}</main>
        </QueryClientProviderWrapper>
      </body>
    </html>
  );
}