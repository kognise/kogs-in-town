import { JSDOM } from 'jsdom'
import { DateTime } from 'luxon'

import type { VenueEvent } from '../types'

function extractEvents(html: string, venue: string, timeZone: string): VenueEvent[] {
	const events: VenueEvent[] = []
	
	const dom = new JSDOM(html)
	for (const entry of dom.window.document.querySelectorAll('.entry')) {
		const thumbnailUrl = entry.querySelector('.thumb img')?.attributes.getNamedItem('src')?.value
		const tour = entry.querySelector('.accentColor + h5')?.textContent?.trim() || null
		const artist = entry.querySelector('.carousel_item_title_small')?.textContent?.trim()
		const url = entry.querySelector('h3 a')?.attributes.getNamedItem('href')?.value
		const opener = entry.querySelector('.carousel_item_title_small + h4')?.textContent?.trim().replace(/^with\s+/i, '') || null
		const showDateStr = entry.querySelector('.date')?.textContent?.trim()
		const showTimeStr = entry.querySelector('.time')?.textContent?.trim().replace(/^show\s+/i, '')
		
		if (!thumbnailUrl) throw new Error('Missing thumbnail url')
		if (!url) throw new Error('Missing url')
		if (!artist) throw new Error('Missing artist')
		if (!showDateStr) throw new Error('Missing show date')
		if (!showTimeStr) throw new Error('Missing show time')

		const showTime = DateTime.fromFormat(
			`${showDateStr} ${showTimeStr}`,
			'EEE, LLL d, yyyy h:mm a',
			{ zone: timeZone }
		).toJSDate()

		events.push({ venue, thumbnailUrl, url, artist, opener, tour, showTime })
	}

	return events
}

export async function fetchAxsEvents(baseUrl: string, venue: string, timeZone: string): Promise<VenueEvent[]> {
	const htmls = await Promise.all([
		fetch(`${baseUrl}/events/`).then(res => res.text()),
		fetch(`${baseUrl}/events/events_ajax/20`).then(res => res.json()),
	])
	return htmls.flatMap(html => extractEvents(html, venue, timeZone))
}
