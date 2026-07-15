import React from 'react';
import Header from '../ui/Header';
import Footer from '../ui/Footer';

export default function MainLayout({ children, hideFooter = false }) {
  return (
    <>
      <Header />
      <main id="main-content">{children}</main>
      {!hideFooter && <Footer />}
    </>
  );
}