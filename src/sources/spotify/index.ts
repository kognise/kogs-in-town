import type { VenueEvent } from '../../types'
import { commonHeaders } from './auth-core'
import { getValidAccessToken } from './auth-util'

async function pathfinderQuery(operationName: string, queryHash: string, variables: Record<string, any>): Promise<any> {
	const accessToken = await getValidAccessToken()

	const params = new URLSearchParams()
	params.set('operationName', operationName)
	params.set('variables', JSON.stringify(variables))
	params.set('extensions', JSON.stringify({
		persistedQuery: {
			version: 1,
			sha256Hash: queryHash
		}
	}))

	const url = 'https://api-partner.spotify.com/pathfinder/v1/query?' + params.toString()

	const res = await fetch(url, {
		headers: {
			...commonHeaders,
			'authorization': `Bearer ${accessToken}`
		}
	})
	if (res.status !== 200) throw new Error(`Status code ${res.status}: ${await res.text()}`)

	return await res.json()
}

async function fetchSpotifyEventUrl(uri: `spotify:concert:${string}`): Promise<string> {
	const json = await pathfinderQuery(
		'concert',
		'dce8702b279096ce9218ea6ea9351535728a53807c2e8e5b48527e216a664227',
		{ uri }
	)

	return json.data.concert.offers.items[0]?.url ?? `https://open.spotify.com/concert/${uri.split(':').at(-1)}`
}

export async function fetchSpotifyEvents(): Promise<VenueEvent[]> {
	console.log('Fetching all Spotify events')

	const json = await pathfinderQuery(
		'concertFeed',
		'2c9fb8f35175a8a3f0bd4cbe9de95c3298228db153577f0492e54251c2f813bb',
		{
			geoHash: '9q8yyk8ytpxr',
			geonameId: '5391959',
			dateRange: null,
			paginationKey: null
		}
	)

	const concerts = json.data.liveEventsFeed.sections
		.flatMap((section: any) => {
			if (section.__typename === 'LiveEventSection') {
				return section.concerts
			} else if (section.__typename === 'AllEvents') {
				return section.sections.flatMap((section: any) => section.concerts)
			} else {
				throw new Error(`Unknown section type: ${section.__typename}`)
			}
		})
		.flatMap((concert: any) => {
			if (concert.__typename === 'ConcertV2ResponseWrapper') {
				return concert.data
			} else if (concert.__typename === 'ConcertGroup') {
				return concert.concerts.flatMap((concert: any) => concert.data)
			} else {
				throw new Error(`Unknown concert type: ${concert.__typename}`)
			}
		})

	const events: VenueEvent[] = []

	let i = 0
	for (const concert of concerts) {
		const artistNames = concert.artists.items.map((artist: any) => artist.data.profile.name)

		console.log(`(Event ${++i}/${concerts.length}: ${artistNames.join(', ')})`)

		events.push({
			venue: concert.location.name,
			artist: artistNames[0],
			opener: artistNames.length <= 1 ? null : artistNames.slice(1).join(', '),
			tour: concert.title === artistNames.join(', ') || concert.title.length > 50 ? null : concert.title,
			showTime: new Date(concert.startDateIsoString),
			thumbnailUrl: concert.artists.items[0].data.visuals.avatarImage?.sources[0].url ?? null,
			url: await fetchSpotifyEventUrl(concert.uri)
		})
	}

	return events
}
