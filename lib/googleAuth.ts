import { clearGoogleTokens, loadGoogleTokens, saveGoogleTokens } from '@/storage/googleAuth'
import * as AuthSession from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'

WebBrowser.maybeCompleteAuthSession();

export const GOOGLE_SCOPES = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/photoslibrary.readonly',
]

export const discovery = {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
}

const CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!

export function useGoogleAuthRequest() {
    const redirectUri = AuthSession.makeRedirectUri({ scheme: 'ourapp' })

    const [request, response, promptAsync] = AuthSession.useAuthRequest(
        {
            clientId: CLIENT_ID,
            scopes: GOOGLE_SCOPES,
            redirectUri,
            responseType: AuthSession.ResponseType.Code,
            usePKCE: true,
            extraParams: {
                access_type: 'offline',
                prompt: 'consent'
            }
        }, discovery)

    return { request, response, promptAsync, redirectUri }
}

export async function exchangeCode(
    code: string,
    codeVerifier: string,
    redirectUri: string
) {
    const result = await AuthSession.exchangeCodeAsync(
        {
            clientId: CLIENT_ID,
            code,
            redirectUri,
            extraParams: { code_verifier: codeVerifier }
        },
        discovery
    )

    await saveGoogleTokens({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken!,
        expiretAt: Date.now() + (result.expiresIn ?? 3600) * 1000
    })

    return result
}

export async function getValidAccessToken(): Promise<string | null>{
    const tokens = await loadGoogleTokens()
    if (!tokens) return null

    if (Date.now() < tokens.expiretAt - 60_000) {
        return tokens.accessToken
    }
    
    try {
        const refreshed = await AuthSession.refreshAsync({
            clientId: CLIENT_ID, refreshToken: tokens.refreshToken
        }, discovery)
        
        const newTokens = {
            accessToken: refreshed.accessToken,
            refreshToken: refreshed.refreshToken ?? tokens.refreshToken,
            expiretAt: Date.now() + (refreshed.expiresIn ?? 3600) * 1000
        }

        await saveGoogleTokens(newTokens)
        return newTokens.accessToken
    } catch {
        return null
    }
}

export async function disconnectGoogle() {
    await clearGoogleTokens()
}