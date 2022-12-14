import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import prisma from 'src/lib/utils/PrismaClient'
import confirmPassword from 'src/lib/utils/confirmPassword'
import { v4 } from 'uuid'
import Cookies from 'cookies'
import { decode, encode } from 'next-auth/jwt'

export const nextAuthOptions = (request, response) => {
    const adapter = PrismaAdapter(prisma)
    const providers = [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        CredentialsProvider({
            id: 'credentials',
            name: 'credentials',
            credentials: {
                email: {
                    label: 'Email',
                    type: 'email',
                },
                password: {
                    label: 'Password',
                    type: 'password',
                },
            },
            async authorize(credentials) {
                try {
                    const user = await prisma.user.findUnique({
                        where: {
                            email: credentials.email,
                        },
                    })

                    if (!user) return null
                    const res = await confirmPassword(credentials.password, user.password)
                    if (res === true) {
                        return {
                            id: user.id,
                            username: user.username,
                            email: user.email,
                            image: user.image,
                            role: user.role,
                            disabled: user.disabled,
                        }
                    } else {
                        return null
                    }
                } catch (err) {
                    return null
                }
            },
        }),
    ]
    const events = {
        createUser: async ({ user }) => {
            await prisma.user.update({
                where: {
                    id: user.id,
                },

                // Add Custom User fields at user creation
                data: {
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    disabled: false,
                },
            })
        },
    }
    const callbacks = {
        async signIn({ user, account }) {
            if (user.disabled) return false

            if (account.provider === 'credentials') {
                const sessionExpiry = fromDate(session.maxAge)
                const sessionToken = v4()

                // create a session for the user
                await adapter.createSession({
                    sessionToken: sessionToken,
                    userId: user.id,
                    expires: sessionExpiry,
                })

                const cookies = new Cookies(request, response)
                cookies.set('next-auth.session-token', sessionToken, {
                    expires: sessionExpiry,
                    httpOnly: true,
                    path: '/',
                    sameSite: 'lax',
                })
            }

            return true
        },
        async session({ session, user }) {
            session.user.role = user.role
            session.user.id = user.id
            session.user.username = user.username
            session.user.image = user.image
            session.user.emailVerified = user.emailVerified
            return session
        },
    }
    const session = {
        strategy: 'database',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        updateAge: 24 * 60 * 60, // 24 hours
    }
    const pages = {
        signIn: '/',
    }
    const jwt = {
        async encode({ secret, token, maxAge }) {
            if (
                request.query.nextauth.includes('callback') &&
                request.query.nextauth.includes('credentials') &&
                request.method === 'POST'
            ) {
                const cookies = new Cookies(request, response)
                const cookie = cookies.get('next-auth.session-token')

                if (cookie) return cookie
                return ''
            }

            return encode({ token, secret, maxAge })
        },
        async decode({ secret, token, maxAge }) {
            if (
                request.query.nextauth.includes('callback') &&
                request.query.nextauth.includes('credentials') &&
                request.method === 'POST'
            ) {
                return null
            }

            return decode({ token, secret, maxAge })
        },
    }

    const nextAuthOptions = {
        providers,
        adapter,
        events,
        callbacks,
        session,
        pages,
        jwt,
        debug: true,
    }
    return nextAuthOptions
}

const fromDate = (time, date = Date.now()) => {
    return new Date(date + time * 1000)
}

export default async function auth(req, res) {
    return NextAuth(req, res, nextAuthOptions(req, res))
}
