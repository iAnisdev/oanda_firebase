import Vue from "vue"

Vue.filter('roundUpToTwo', function (roundDecimalTwo) {
    if (!roundDecimalTwo) return ''
    // return (roundDecimalTwo.toFixed(2));
    return parseFloat(roundDecimalTwo).toFixed(2);
  })
Vue.filter('timesOneHundred', function(value) {
    return (value * 100);
})

Vue.filter('absValue', function(value) {
    
    return Math.abs(value);
})