import type { VenueEvent } from '../types'

const venue = 'The Regency Ballroom'

export async function fetchRegencyBallroomEvents(): Promise<VenueEvent[]> {
	const res = await fetch('https://aegwebprod.blob.core.windows.net/json/events/9/events.json')
	if (res.status !== 200) throw new Error(`Status code ${res.status}: ${await res.text()}`)

	const json = await res.json()

	const events: VenueEvent[] = []

  for (const event of json.events) {
    const thumbnailUrl: string | null = Object.values(event.media)
      .map((media: any) => ({
        url: media.file_name,
        distanceFromSquare: Math.abs(1 - media.width / media.height),
        sizeAverage: (media.width + media.height) / 2
      }))
      // Sorted by first distance from square ascending, then size average descending.
      .toSorted((a, b) => a.distanceFromSquare - b.distanceFromSquare || b.sizeAverage - a.sizeAverage)
      .at(0)
      ?.url ?? null
      
    const showTime = new Date(event.doorDateTimeUTC || event.eventDateTimeISO)
    if (!showTime.getTime()) {
      console.warn(`${event.title.headlinersText} at ${venue} has no show time`) 
      continue
    }

    events.push({
      venue,
      artist: event.title.headlinersText,
      opener: event.title.supportingText,
      tour: event.title.tour ?? null,
      showTime: new Date(event.doorDateTimeUTC || event.eventDateTimeISO),
      thumbnailUrl,
      url: event.ticketing.url,
    })
  }

  return events
}
