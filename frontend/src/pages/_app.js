import 'bootstrap/dist/css/bootstrap.min.css';
import Head from 'next/head';
import '../styles/globals.scss';

// NOTE: すべてのページで使われるベースコンポーネント。ライフサイクルのイベントはクライアントサイドでも実行される。
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
