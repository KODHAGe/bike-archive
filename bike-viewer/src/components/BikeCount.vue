<template>
  <div class="howmanybikes">
     <p>{{nr}}/2550 of Helsinki city bikes are currently available.xd</p>
     <p>{{str}}</p>
  </div>
</template>

<script>
export default {
    name: 'BikeCount',
    props: {
        nr: '',
        avg: ''
    },
    mounted () {
        let avg = Math.floor(this.avg)
        let nr = this.nr
        let str
        if (avg > this.nr) {
            let diff = Math.floor(avg - nr)
            let pctg = (avg/nr * 100 - 100).toFixed(2)
            str = 'Which is ' + diff + ' (' + pctg + '%)' + ' less than the average of ' + avg + '.'
            this.str = str
        } else if (avg < this.nr) {
            let diff = Math.floor(nr - avg)
            let pctg = (nr/avg * 100 - 100).toFixed(2)
            str = 'Which is ' + diff + '(' + pctg + '%)' + ' more than the average of ' + avg + '.'
            this.str = str
        } else {
            str = 'Which is exactly the same more than the average of ' + avg + '. Rare!'
        }
    },
    data: () => {
        return {
            str: ''
        }
    }

}
</script>

<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
p {
  color: black;
  font-size: 1rem;
  text-shadow: -0.5px -0.5px #ff00ff;
}
</style>
