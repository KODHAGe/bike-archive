<template>
  <div id="app">
      <div id='map'></div>
      <!--<h1>{{count}}</h1><BikeCount :nr="count" :avg="avg"></BikeCount>-->
      <div class="button button-previous" v-on:click="goBack">Go back pls</div>
      <div class="button button-next" v-on:click="goForward">NEE-EXT</div>
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

import mapboxgl from 'mapbox-gl'

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
            avg: '',
            map: {}
        }
    },
    mounted () {
        mapboxgl.accessToken = process.env.VUE_APP_MAPBOX_KEY;
        this.map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/light-v9',
            zoom: 13,
            center: [24.9384, 60.1699],
            pitch: 40,
            bearing: 20
        });
        this.map.on('load', () => {
            let url = 'http://localhost:5001/bike-archive/us-central1/asGeoJSON';
            this.map.addSource('stations', { type: 'geojson', data: url });
            this.map.addLayer({
                "id": "bikestations",
                "type": "fill-extrusion",
                "source": "stations",
                "paint": {
                    'fill-extrusion-color': '#ff00ff',
                    'fill-extrusion-height': ['get', 'bikesAvailable'],
                    'fill-extrusion-opacity': 1
                }
            });
            setTimeout(() => {
                var features = this.map.queryRenderedFeatures({ layers: ['bikestations'] });
                console.log(features);
            }, 5000)
        });
    },
    methods: {
        goBack: function (event) {
            console.log('backowardo!')
        },
        goForward: function(event) {
            let url = 'http://localhost:5001/bike-archive/us-central1/asGeoJSON?val=' + 100;
            let json = fetch(url).then(async (response) => {
                let res = await response.json()
                console.log(res)
                console.log(this.map.getSource('stations'))
                this.map.getSource('stations').setData(res)
            })
        }
    }

}
</script>

<style>
html {
    height: 100%;
    width: 100%;
}
body {
    height: 100%;
    width: 100%;
    margin: 0;
}
#app {
    height: 100%;
    width: 100%;
}

#map {
    position: absolute;
    width: 100%;
    height: 100%;
}

.button {
    position: fixed;
    bottom: 2rem;
}

.button-next {
    right: 2rem;
}

.button-previous {
    left: 2rem;
}
</style>
