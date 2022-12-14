import { SessionProvider } from 'next-auth/react'
import { unstable_getServerSession } from 'next-auth/next'
import { nextAuthOptions } from './api/auth/[...nextauth]'
import Head from 'next/head'
import 'react-perfect-scrollbar/dist/css/styles.css'
import '../../styles/globals.css'

const App = ({ Component, pageProps: { session, ...pageProps } }) => (
    <SessionProvider session={session}>
        <Component {...pageProps}>
            <Head>
                <title>Repro</title>
                <meta name='viewport' content='initial-scale=1, width=device-width' />
            </Head>
        </Component>
    </SessionProvider>
)

export default App

export async function getServerSideProps({ req, res }) {
    return {
        props: {
            session: await unstable_getServerSession(req, res, nextAuthOptions(req, res)),
        },
    }
}
