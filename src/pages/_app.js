import { SessionProvider } from "next-auth/react";

const App = ({ Component, pageProps }) => (
  <SessionProvider>
    <Component {...pageProps} />
  </SessionProvider>
);

export default App;
