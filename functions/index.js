// Firebase
const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp()
const db = admin.firestore()
const geojson = require('geojson')
const fs = require('fs')

// Other
const graphql = require('graphql.js')
const Terraformer = require('terraformer')

exports.asGeoJSON = functions.https.onRequest((request, response) => {
    let toGeoJSON = []
    let val = !request.query.val ? 0 : request.query.val
    console.log(val)
    db.collection('stations').orderBy('timestamp', 'asc').startAt(val).limit(1).get().then((snapshot) => {
        snapshot.forEach((document) => {
            let doc = document.data()
            console.log(doc.timestamp)
            let stations = doc.stations.bikeRentalStations
            stations.forEach((station) => {
                let stationObject = {
                    'name' : station.name,
                    'lat' : station.lat,
                    'lon' : station.lon,
                    'bikesAvailable': station.bikesAvailable,
                    'spacesAvailable': station.spacesAvailable,
                    'totalSpaces': station.bikesAvailable + station.spacesAvailable
                }
                toGeoJSON.push(stationObject)
            })
            let geoJSON = geojson.parse(toGeoJSON, {Point: ['lat', 'lon']})
            let polygonGeoJSON = {
                'type': geoJSON.type,
                'features': []
            }
            for(let feature of geoJSON.features) {
                let element = new Terraformer.Primitive(feature)
                let circle = new Terraformer.Circle(element.geometry.coordinates, 32, 32)
                element.point = element.geometry
                element.geometry = circle.geometry
                element.properties = Object.assign(circle.properties, element.properties)
                polygonGeoJSON.features.push(element)
            }

            /* Write to file
            fs.writeFile('processed.geojson', JSON.stringify(polygonGeoJSON), 'utf8', (error) => {
                if(error) {
                    return console.log(error)
                }
                console.log('Saved')
            })
            */
            response.set('Access-Control-Allow-Origin', '*')
            response.send(polygonGeoJSON)
        })
        return snapshot
    }).catch((error) => {
        response.send("Error " + error)
        return error
    })
})

// Allstations() gets the status of all bike stations in the network and stores that timestamped in firestore
exports.allStations = functions.https.onRequest((request, response) => {
    var graph = graphql("https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql", {
        asJSON: true
    })

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
})
