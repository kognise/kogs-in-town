export interface VenueEvent {
	venue: string
	artist: string
	opener: string | null
	tour: string | null
	showTime: Date
	isOnlyDateKnown?: boolean
	thumbnailUrl: string | null
	url: string
}