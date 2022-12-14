import { getProviders, useSession } from 'next-auth/react'
import { OAuthSignIn } from 'src/views/auth'

const LoginPage = ({ providers }) => {
    const { status } = useSession()

    if (status === 'authenticated') {
        return <div> You are logged in!</div>
    }

    return (
        <div>
            {'Login via OAuth -> Google'}
            <OAuthSignIn providers={providers} />
        </div>
    )
}
export default LoginPage

export async function getServerSideProps(context) {
    const providers = await getProviders()
    return {
        props: { providers },
    }
}
