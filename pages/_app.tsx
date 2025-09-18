import type { AppProps } from "next/app";
import OramaxCnnLoader from "../components/OramaxCnnLoader";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <OramaxCnnLoader />
      <Component {...pageProps} />
    </>
  );
}
