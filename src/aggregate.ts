import { fetchAxsEvents } from './sources/axs'
import { fetchBillGrahamCivicEvents } from './sources/bill-graham-civic'
import { fetchOraclePark } from './sources/oracle-park'
import { fetchRegencyBallroomEvents } from './sources/regency-ballroom'
import { fetchSpotifyEvents } from './sources/spotify'
import type { VenueEvent } from './types'

export async function fetchAllEvents(): Promise<VenueEvent[]> {
	const allVenues = await Promise.all([
		fetchRegencyBallroomEvents(),
		fetchOraclePark(),
		// Yeah yeah I know I could probably just pull from axs.com but whatever.
		fetchAxsEvents('https://www.thewarfieldtheatre.com', 'The Warfield', 'America/Los_Angeles'),
		fetchBillGrahamCivicEvents(),
		fetchSpotifyEvents()
	])
	const orderedEvents = allVenues.flat().toSorted((a, b) => a.showTime.getTime() - b.showTime.getTime())

	// Deduplicate events
	for (let i = 1; i < orderedEvents.length; i++) {
		const [prev, current] = [orderedEvents[i - 1], orderedEvents[i]]
		if (
			prev.venue === current.venue
				&& prev.showTime.getTime() === current.showTime.getTime()
				&& (prev.artist.includes(current.artist) || current.artist.includes(prev.artist))
		) {
			orderedEvents.splice(i, 1)
			i--
		}
	}

	return orderedEvents
}