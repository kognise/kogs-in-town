import { JSDOM } from 'jsdom'
import { DateTime } from 'luxon'

import type { VenueEvent } from '../types'

const venue = 'Oracle Park'

export async function fetchOraclePark(): Promise<VenueEvent[]> {
  const res = await fetch('https://www.mlb.com/giants/tickets/events/concerts')
  if (res.status !== 200) throw new Error(`Status code ${res.status}: ${await res.text()}`)

  const text = await res.text()
  const dom = new JSDOM(text)

  const events: VenueEvent[] = []

  for (const entry of dom.window.document.querySelectorAll('.l-grid__content [data-content-id][id]')) {
    const srcset = entry.querySelector('.p-featured-content__media img')?.attributes.getNamedItem('data-srcset')?.value
    const truncatedThumbnailUrl = srcset?.split(',').at(-1)?.trim().split(' ').at(0)
    const thumbnailUrl = truncatedThumbnailUrl ? 'https:' + truncatedThumbnailUrl : null

    const titleParts = entry.querySelector('.p-featured-content__body > a')?.textContent?.split(' | ') ?? []
    const artist = titleParts.slice(0, -1).join(' | ')
    const dateStr = titleParts.at(-1)?.trim() ?? null

    const url = entry.querySelector('.p-featured-content__buttons a')?.attributes.getNamedItem('href')?.value

    if (!artist) throw new Error('Missing artist, perhaps format changed')
    if (!dateStr) throw new Error('Missing show time')
    if (!url) throw new Error('Missing url')

    const showTime = DateTime.fromFormat(
      `${dateStr} 7:00 PM`,
      'cccc, LLLL d h:mm a',
      { zone: 'America/Los_Angeles' }
    ).toJSDate()

    events.push({
      venue,
      thumbnailUrl,
      url,
      artist,
      opener: null,
      tour: null,
      showTime,
      isOnlyDateKnown: true,
    })
  }

  return events
}
