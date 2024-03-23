import { JSDOM } from 'jsdom'
import { DateTime } from 'luxon'

import type { VenueEvent } from '../types'

const venue = 'Bill Graham Civic Auditorium'

export async function fetchBillGrahamCivicEvents(): Promise<VenueEvent[]> {
	const res = await fetch('https://billgrahamcivic.com/event-listing/')
	if (res.status !== 200) throw new Error(`Status code ${res.status}: ${await res.text()}`)

	const text = await res.text()
	const dom = new JSDOM(text)

	const events: VenueEvent[] = []

	for (const entry of dom.window.document.querySelectorAll('#event-list .detail-information')) {
		const thumbnailUrl = entry.querySelector('img.wp-post-image')?.attributes.getNamedItem('src')?.value
		const tour = entry.querySelector('.topline')?.textContent?.trim() || null
		const artist = entry.querySelector('.show-title')?.textContent?.trim()
		const opener = entry.querySelector('.support')?.textContent?.trim().replace(/^with\s/i, '') || null
		const url = entry.querySelector('.event-data a:not([itemprop=url])')?.attributes.getNamedItem('href')?.value
		const showTimeStr = entry.querySelector('.date-show[itemprop=startDate]')?.attributes.getNamedItem('content')?.value

		if (!thumbnailUrl) throw new Error('Missing thumbnail url')
		if (!url) throw new Error('Missing url')
		if (!artist) throw new Error('Missing artist, perhaps format changed')
		if (!showTimeStr) throw new Error('Missing show time')

		const showTime = DateTime.fromFormat(
			showTimeStr,
			'LLLL d, yyyy h:mm a',
			{ zone: 'America/Los_Angeles' }
		).toJSDate()

		events.push({ venue, thumbnailUrl, url, artist, opener, tour, showTime })
	}

	return events
}
