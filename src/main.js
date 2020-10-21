import Vue from "vue";
import App from "./views/App.vue";
import router from "./router";
import 'firebase/storage'
import 'firebase/analytics'
import { auth } from './firebase'

window.axios = require('axios');
window.axios.defaults.headers.common['Authorization'] = 'Bearer 61ba9ba8af1ed253d951796fe20ba168-92824f8db004b2087cf89e393dfcb57e'; 
window.oanda_endpoint = 'https://api-fxpractice.oanda.com/v3';

Vue.config.productionTip = false;


let app;

auth.onAuthStateChanged(()=> {
  if(!app) {
    app = new Vue({
      router,
      render: h => h(App)
    }).$mount("#app");
  }
})

