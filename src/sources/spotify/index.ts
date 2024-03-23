import type { VenueEvent } from '../../types'
import { commonHeaders } from './auth-core'
import { getValidAccessToken } from './auth-util'

export async function fetchSpotifyEvents(): Promise<VenueEvent[]> {
	const accessToken = await getValidAccessToken()

	const params = new URLSearchParams()
	params.set('locale', 'en')
	params.set('source', 'user,popular,online')
	params.set('playlists', 'false')
	params.set('market', 'from_token')

	const url = 'https://spclient.wg.spotify.com/concerts/v3/concerts/view?' + params.toString()

	const res = await fetch(url, {
		headers: {
			...commonHeaders,
			'authorization': `Bearer ${accessToken}`
		}
	})
	if (res.status !== 200) throw new Error(`Status code ${res.status}: ${await res.text()}`)

	const json = await res.json()
	if (json.userLocation !== 'San Francisco') throw new Error('Spotify location is not set to San Francisco')

	const events: VenueEvent[] = []

	for (const event of json.events) {
		for (const { concert, clickThruUrl } of event.concerts) {
			const artistNames = concert.artists.map((artist: any) => artist.name)
			events.push({
				venue: concert.venue,
				artist: artistNames[0],
				opener: artistNames.length <= 1 ? null : artistNames.slice(1).join(', '),
				tour: artistNames.includes(concert.title) || concert.title.length > 50 ? null : concert.title,
				thumbnailUrl: concert.carouselImage,
				showTime: new Date(concert.startDate.date),
				url: clickThruUrl
			})
		}
	}

	return events
}
