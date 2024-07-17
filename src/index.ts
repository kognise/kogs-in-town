import express from 'express'
import { fetchAllEvents } from './aggregate'
import { VenueEvent } from './types'


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
	res.render('index', { events })
})

const port = Number(process.env.PORT) || 3000
app.listen(port, '0.0.0.0', () => console.log(`Listening on http://localhost:${port}`))