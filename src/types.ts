export interface VenueEvent {
	venue: string
	artist: string
	opener: string | null
	tour: string | null
	showTime: Date
	thumbnailUrl: string
	url: string
}