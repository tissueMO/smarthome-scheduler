import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        <link rel='icon' href='/favicon.ico' />
        <link
          href='https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100;300;400;500;600;700&display=swap'
          rel='stylesheet'
        />
      </Head>
      <body className='app'>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
