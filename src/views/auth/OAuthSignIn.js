import PropTypes from 'prop-types'
import Google from 'mdi-material-ui/Google'

import { signIn } from 'next-auth/react'

/**
 * Component that renders all OAuth sign in buttons.
 */
const OAuthSignIn = ({ providers }) => {
    return (
        <div>
            <button
                onClick={() =>
                    signIn(providers['google'].id, { callbackUrl: `${window.location.origin}/`, redirect: false })
                }
            >
                <Google sx={{ color: '#db4437' }} />
            </button>
        </div>
    )
}

OAuthSignIn.propTypes = {
    providers: PropTypes.object.isRequired,
}

export default OAuthSignIn
