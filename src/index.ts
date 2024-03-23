import express from 'express'
import { fetchAllEvents } from './aggregate'


let events = await fetchAllEvents()
setInterval(async () => {
	console.log('Fetching new events')
	events = await fetchAllEvents()
}, 6 * 60 * 60 * 1000) // Every 6 hours


const app = express()

app.set('view engine', 'ejs')
app.set('views', 'src/templates')

app.use(express.static('src/static'))

app.get('/', async (req, res) => {
	res.render('index', { events })
})

const port = Number(process.env.PORT) || 3000
app.listen(port, () => console.log(`Listening on http://localhost:${port}`))