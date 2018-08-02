<template>
  <div id="app">
    <h1>{{count}}</h1>
    <BikeCount :nr="count" :avg="avg"></BikeCount>
  </div>
</template>

<script>
// Firebase
import firebase from 'firebase/app'
import '@firebase/firestore'
import firebaseConfig from '../firebase-config.js'
firebase.initializeApp(firebaseConfig)

const db = firebase.firestore()
const firebaseSettings = {
    timestampsInSnapshots: true
}
db.settings(firebaseSettings)

// Components
import BikeCount from './components/BikeCount.vue'

export default {
    name: 'app',
    components: {
        BikeCount
    },
    data: () => {
        return {
            count: '',
            avg: ''
        }
    },
    beforeMount () {
        // DB structure change => make stations primary documents, store update events under stations
        let stations = db.collection('stations').orderBy('timestamp', 'desc').get().then((snapshot) => {
            let total = 0
            let avg = 0
            let docs = 0
            snapshot.forEach((document) => {
                let count = 0
                let doc = document.data()
                for (let station of doc.stations.bikeRentalStations) {
                    count = count + parseInt(station.bikesAvailable)
                }
                this.count = count
                total += count
            })
            avg = total/snapshot.docs.length
            this.avg = avg
            let count = 0
            let doc = snapshot.docs[0].data()
            for (let station of doc.stations.bikeRentalStations) {
                count = count + parseInt(station.bikesAvailable)
            }
            this.count = count
        })
    }

}
</script>

<style>
#app {
  font-family: Helvetica, Arial, sans-serif;
  text-align: center;
  color: black;
  margin-top: 6rem;
  font-size: 12rem;
  text-shadow: 4px 4px #ffff00;
}
</style>
