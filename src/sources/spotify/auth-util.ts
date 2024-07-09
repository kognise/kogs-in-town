import { type AccessTokenResponse, fetchAccessToken } from './auth-core'

const tokenGracePeriodMs = 10000 // 10 seconds

let _cachedAccessToken: AccessTokenResponse | null = null
export async function getValidAccessToken(): Promise<string> {
	if (!_cachedAccessToken || (Date.now() - tokenGracePeriodMs) > _cachedAccessToken.accessTokenExpirationTimestampMs) {
		console.log('Generating a new Spotify access token')
		const start = Date.now()
		_cachedAccessToken = await fetchAccessToken()
		const elapsed = Date.now() - start
		console.log(`Done (${elapsed}ms)`)
	}
	return _cachedAccessToken.accessToken
}