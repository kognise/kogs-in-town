import express from 'express'
import { fetchAllEvents } from './aggregate'
import { VenueEvent } from './types'
import { DateTime } from 'luxon'


let allEvents: VenueEvent[] = []

fetchAllEvents().then(events => { allEvents = events })

setInterval(async () => {
	console.log('Fetching new events')
	allEvents = await fetchAllEvents()
}, 6 * 60 * 60 * 1000) // Every 6 hours


const app = express()

app.set('view engine', 'ejs')
app.set('views', 'src/templates')

app.use(express.static('src/static'))

app.get('/', async (req, res) => {
	const events = allEvents
		.filter(event => (event.showTime.getTime() - Date.now()) > 1 * 60 * 60 * 1000) // >1 hour in the future
	
	const todayEvents: VenueEvent[] = []
	const futureEvents: VenueEvent[] = []
	
	const nowDateTime = DateTime.now().setZone('America/Los_Angeles')
	for (const event of events) {
		const eventDateTime = DateTime.fromJSDate(event.showTime).setZone('America/Los_Angeles')
		
		if (eventDateTime.ordinal === nowDateTime.ordinal) {
			todayEvents.push(event)
		} else {
			futureEvents.push(event)
		}
	}

	res.render('index', { todayEvents, futureEvents })
})

const port = Number(process.env.PORT) || 3000
app.listen(port, '0.0.0.0', () => console.log(`Listening on http://localhost:${port}`))