import 'bootstrap/dist/css/bootstrap.min.css';
import Head from 'next/head';
import '../styles/globals.scss';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>我が家のスケジューラー</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
