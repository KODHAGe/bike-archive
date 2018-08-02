// Firebase
const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp()
const db = admin.firestore()

// Other
const graphql = require('graphql.js')


var graph = graphql("https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql", {
    asJSON: true
})

// Allstations() gets the status of all bike stations in the network and stores that timestamped in firestore
exports.allStations = functions.https.onRequest((request, response) => {

    let allStations = graph(`query {
        bikeRentalStations {
            stationId
            name
            bikesAvailable
            spacesAvailable
            lat
            lon
            allowDropoff
            realtime
            networks
            state
        }
    }`)

    allStations().then((stations) => {
        let timestamp = new Date().toISOString()
        let timestampedStationStats = {
            'timestamp' : timestamp
        }
        timestampedStationStats['stations'] = stations
        db.collection('stations').add(timestampedStationStats)
        response.send("Success!")
        return timestampedStationStats
    }).catch((error) => {
        response.send("Error " + error + " :(")
        return error
    })
});
