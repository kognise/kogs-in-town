if (!process.env.SPOTIFY_COOKIE_BASE64) throw new Error('Missing SPOTIFY_COOKIE_BASE64 environment variable')
const spotifyCookie = Buffer.from(process.env.SPOTIFY_COOKIE_BASE64, 'base64').toString()

export const commonHeaders = {
	'accept': 'application/json',
	'accept-language': 'en',
	'app-platform': 'WebPlayer',
	'Referer': 'https://open.spotify.com/concerts',
	'cookie': spotifyCookie
}

export interface AccessTokenResponse {
	accessToken: string
	accessTokenExpirationTimestampMs: number
	clientId: string
	isAnonymous: boolean
}

export async function fetchAccessToken(): Promise<AccessTokenResponse> {
	const url = 'https://open.spotify.com/get_access_token?reason=transport&productType=web-player'

	const res = await fetch(url, { headers: commonHeaders })
	if (res.status !== 200) throw new Error(`Status code ${res.status}: ${await res.text()}`)

	const json = await res.json()
	if (!json.accessToken) throw new Error('Did not receive a Spotify access token')
	return json as AccessTokenResponse
}

export interface ClientTokenResponse {
	response_type: 'RESPONSE_GRANTED_TOKEN_RESPONSE'
	granted_token: {
		expires_after_seconds: number
		refresh_after_seconds: number
		token: string
		domains: { domain: string }[]
	}
}

// Turns out you don't actually need to pass client tokens, so I'll just let this dead code
// sit as a public reference implementation.
export async function fetchClientToken(clientId: string): Promise<ClientTokenResponse> {
	const body = {
		client_data: {
			client_version: '1.2.35.4.ge2cadca7',
			client_id: clientId,
			js_sdk_data: {
				device_brand: 'Apple',
				device_model: 'unknown',
				os: 'macos',
				os_version: 'unknown',
				device_id: 'unknown',
				device_type: 'computer'
			}
		}
	}

	const res = await fetch('https://clienttoken.spotify.com/v1/clienttoken', {
		method: 'POST',
		headers: {
			...commonHeaders,
			'content-type': 'application/json'
		},
		body: JSON.stringify(body)
	})
	if (res.status !== 200) throw new Error(`Status code ${res.status}: ${await res.text()}`)

	const json = await res.json()
	if (json.response_type !== 'RESPONSE_GRANTED_TOKEN_RESPONSE') {
		throw new Error(`Response type was ${json.response_type}, expected RESPONSE_GRANTED_TOKEN_RESPONSE`)
	}
	return json as ClientTokenResponse
}