import { fetchAxsEvents } from './sources/axs'
import { fetchBillGrahamCivicEvents } from './sources/bill-graham-civic'
import { fetchSpotifyEvents } from './sources/spotify'
import type { VenueEvent } from './types'

export async function fetchAllEvents(): Promise<VenueEvent[]> {
	const allVenues = await Promise.all([
		// Yeah yeah I know I could probably just pull both from axs.com but whatever.
		fetchAxsEvents('https://www.theregencyballroom.com', 'The Regency Ballroom', 'America/Los_Angeles'),
		fetchAxsEvents('https://www.thewarfieldtheatre.com', 'The Warfield', 'America/Los_Angeles'),
		fetchBillGrahamCivicEvents(),
		fetchSpotifyEvents()
	])
	const orderedEvents = allVenues.flat().sort((a, b) => a.showTime.getTime() - b.showTime.getTime())

	// Deduplicate events
	for (let i = 1; i < orderedEvents.length; i++) {
		const [prev, current] = [orderedEvents[i - 1], orderedEvents[i]]
		if (prev.venue === current.venue && prev.artist === current.artist && prev.showTime.getTime() === current.showTime.getTime()) {
			orderedEvents.splice(i, 1)
			i--
		}
	}

	return orderedEvents
}