import Head from 'next/head';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/memorial');
  }, []);
  return (
    <Head>
      <meta name="robots" content="noindex, nofollow" />
    </Head>
  );
}
