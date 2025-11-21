import type { AppProps } from 'next/app';
import React from 'react';
import '@/styles/globals.css';
import Providers from '@/providers';
import Footer from '@/components/Footer';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Providers>
      <Component {...pageProps} />
      <Footer />
    </Providers>
  );
}
