<template>
  <div id="app">
    <div class="container-fluid my-4">
      <div class="row">
        <div class="col-md-8">
          <div v-for="(zone, key) in zones" :key="key">
            <div v-for="(cycle, key) in zone.cycles" :key="key">
              <div class="border mb-4 py-4 px-4">
                <div class="row">
                  <div class="col-md-5 offset-md-1">
                    <h2 class="text-center">
                      <!-- drawdown: {{ cycleComputation('drawdown', cycle.trades) | rounded }} -->
                      Net Gain: {{ cycleComputation(cycle.trades) | rounded }}
                    </h2>
                   </div>
                  <div class="col-md-2 offset-md-4">
                    <button  type="button" class="btn btn-danger"  @click="removeCycle(cycle)" v-if="!cycle.trades.length">delete cycle</button></div>
                  </div>
                <div v-if="cycle.trades.length" class="border mb-4 py-4 px-4">
                  <table class="table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>STATE</th>
                        <th>CURRENCY</th>
                        <th>ACCOUNT</th>
                        <th>POSITION</th>
                        <th>CYCLE</th>
                        <th>PRICE</th>
                        <th>UNITS</th>
                        <th>PROFIT</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr :class="classInstrument(trade)" v-for="(trade, key) in cycle.trades" :key="key">
                        <td>{{ trade.id }}</td>
                        <td>{{ trade.state }}</td>
                        <td>{{ trade.instrument }}</td>
                        <td>{{ trade.account.alias }}</td>
                        <td>{{ longOrShort(trade) }}</td>
                        <td>{{++key}}</td>
                        <td>{{ trade.price }}</td>
                        <td>{{ trade.initialUnits }}</td>
                        <td>
                          {{ trade.state === 'OPEN' ? trade.unrealizedPL : trade.realizedPL | rounded }}
                        </td>
                        <td>
                          <button type="button" @click="removeTrade(cycle.id, trade)">
                          <span aria-hidden="true">&times;</span>
                        </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <form @submit.prevent="createTrade(zone.id, cycle.id, form.accountId, form.tradeId, false)" class="form-inline">
                  <div class="form-group mb-2 mr-3">
                    <label for="account" class="sr-only">Account</label>
                    <select v-model="form.accountId" class="custom-select">
                      <option value="">Select Account</option>
                      <option
                        v-for="account in accounts"
                        :key="account.id"
                        :value="account.id"
                      >
                        {{ account.alias }}
                      </option>
                    </select>
                  </div>
                  <div class="form-group mb-2 mr-3">
                    <label for="trade_id" class="sr-only">Trade ID</label>
                    <input v-model="form.tradeId" class="form-control" type="number" placeholder="Trade ID">
                  </div>
                  <button type="submit" class="btn btn-primary mb-2">
                    Fetch Trade Data
                  </button>
                </form>
              </div>
            </div>
            <button @click="createCycle(zone.id)" class="btn btn-info">
              Add Cycle
            </button>
          </div>
        </div>

        <div class="col-md-4">
          <!-- <h4>Drawdown: {{ total('drawdown') | rounded }}</h4> -->
          <h1 class="text-center">Total Net Gain: {{grosstotals}}</h1>
        </div>
      </div>
    </div>
    <div class="container-fluid"> 
      <div class="row"></div>
        <div class="col-md-12 text-center">
          <button @click="clearData()" type="button" class="btn btn-danger btn-lg">
            Clear Data
          </button>    
        </div>
    </div>
  </div>
</template>

<script>
import * as firebase from './../firebase'; 

export default {
  
  name: "App",
  data () {
    return {
      zones: [],
      accounts: [],
      form: {
        tradeId: null,
        accountId: ""
      },
      position: null,
      interval: null
    }
  },
  
  watch: {
    // zones(newZones) {
    //   localStorage.setItem("zones",JSON.stringify(newZones));
    // }

  },

  filters: {
    rounded (value) {
      return parseFloat(value).toFixed(2);
    }
  },

  computed: {
    totals () {
      if (! this.zones[0]) {
        return [];
      }
      return this.zones[0].cycles.map(cycle => {
        return this.cycleComputation(cycle.trades);
      });
    },

    grosstotals () {
      if (! this.zones[0]) {
        return [];
      }
      return this.zones[0].cycles.map(cycle => {
        return this.totalComputation(cycle.trades);
      }).reduce((a,b) => a + b, 0).toFixed(2);
    },

    openTrades () {
      return this.zones[0].cycles
        .map(cycle => cycle.trades.filter(trade => trade.state === 'OPEN')
        .map(trade => Object.assign(trade, { cycleId: cycle.id })
      )).flat();
    }
  },

  mounted () {
    this.getAccounts();
    this.createZone();
    this.fethcDatafromFirebase()
    setInterval(() => this.fetchOpenTrades(), 2000);
    setInterval(() => this.fethcDatafromFirebase(), 1000);
    
  },

  methods: {
    async updateFirebase(trade) {
      await firebase.tradeCollection.add(trade)
    },
     fethcDatafromFirebase(){
       let _self = this
       Promise.all([this.fetchCyclesFromFirebase() , this.fetchTradesFromFirebase()]).then((resp) =>{
        let cycles = resp[0]
        let trades = resp[1]
         _self.zones[0].cycles = []
         cycles.forEach((cycle) =>{
           _self.zones[0].cycles.push({
             id: cycle.id,
             _id: cycle._id,
             trades: trades.filter(trade => cycle.id == trade.cycleId)
           })
         })
       })
    },

    fetchCyclesFromFirebase(){
      return new Promise((resolve , reject) =>{
        firebase.cycleCollection.get().then(function(cycles) {
          let cycles_array = []
          if (cycles.docs.length > 0) {
            cycles.docs.forEach(function(cycle){
              if(cycle.exists){
                let cycle_info  = cycle.data()
                cycle_info._id = cycle.id
                cycles_array.push(cycle_info)
              }
            })
            resolve(cycles_array)
          } else {
              resolve([]);
          }
        }).catch(function(error) {
           reject(error);
        });
      })
    },
    fetchTradesFromFirebase(){
      return new Promise((resolve , reject) =>{
        firebase.tradeCollection.get().then(function(trades) {
          let trades_array = []
          if (trades.docs.length > 0) {
            trades.docs.forEach(function(record){
              if(record.exists){
                let record_info  = record.data()
                record_info._id = record.id
                trades_array.push(record_info)
              }
            })
            resolve(trades_array)
          } else {
              resolve([]);
          }
        }).catch(function(error) {
           reject(error);
        });
      })
    },
    clearData() {
      const proceed = confirm('Are you sure?');

      if (proceed) {
        firebase.tradeCollection.delete().then(function() {
            console.log("Document successfully deleted!");
        }).catch(function(error) {
            console.error("Error removing document: ", error);
        });
      }
    },
    

    createZone () {
      this.zones.push({
        id: Date.now(),
        cycles: []
      });
    },

    createCycle (id) {
      this.zones = this.zones.map(zone => {
        if (zone.id === id) {
          let cycleid = Date.now()
          firebase.cycleCollection.add({id: cycleid})
          return {...zone, ...zone.cycles.push({
            id: cycleid,
            trades: []
          })}
        }

        return zone;
      });
    },

     createTrade (zoneId, cycleId, accountId, tradeId, toUpdate) {
      this.getTrade(accountId, tradeId).then(trade => {
        let zone = this.zones.find(zone => zone.id === zoneId);
        zone.cycles.map(cycle => {
          if (cycle.id === cycleId) {
            if (toUpdate) {
              return {...cycle, ...cycle.trades.map(t => {
                if (t.id === trade.id) {
                  return Object.assign(t, {
                    unrealizedPL: trade.unrealizedPL,
                    state: trade.state,
                    realizedPL: trade.realizedPL
                  });
                }
                return t;
              })}
            }
            trade.cycleId = cycleId
            this.updateFirebase( Object.assign(trade, {
              account: this.accounts.find(acc => acc.id === accountId)
            }))
            return {...cycle, ...cycle.trades.push(Object.assign(trade, {
              account: this.accounts.find(acc => acc.id === accountId)
            }))}
          }
          return cycle;
        });

        this.zones = this.zones.map(z => {
          if (z.id === zone.id) {
            return zone;
          }

          return zone;
        });

        if (! toUpdate) {
          this.form = {
            accountId: "",
            tradeId: null
          };
        }
      }).catch(() => {
        if (! toUpdate) {
          alert('Trade does not exist');
        }
      });
    },

     removeTrade (cycleId, trade) {
       let _self = this
      const proceed = confirm('Are you sure?');
      if (proceed) {
         firebase.tradeCollection.doc(trade._id).delete().then(function() {
           let position = _self.zones[0].cycles.find(cycle => cycle.id === cycleId).trades.indexOf(trade);
            _self.zones[0].cycles.find(cycle => cycle.id === cycleId).trades.splice(position, 1);
            console.log("trade successfully deleted!");
          }).catch(function(error) {
              console.error("Error removing document: ", error);
          });
      }
    },

    removeCycle(cycle){
       let _self = this
      const proceed = confirm('Are you sure?');
      if (proceed) {
         firebase.cycleCollection.doc(cycle._id).delete().then(function() {
           let position = _self.zones[0].cycles.indexOf(cycle);
            _self.zones[0].cycles.splice(position, 1);
            console.log("cycle successfully deleted!");
          }).catch(function(error) {
              console.error("Error removing document: ", error);
          });
      }
    },
    classInstrument (trade) {
      if (trade.state === 'OPEN') {
        return 'bg-warning';
      }

      if (trade.realizedPL > 0 && trade.state === 'CLOSED') {
        return 'bg-success';
      } else {
        return 'bg-danger';
      }
    },

    getAccounts () {
      window.axios(`${window.oanda_endpoint}/accounts`).then(res => {
        res.data.accounts.forEach(account => {
          window.axios(`${window.oanda_endpoint}/accounts/${account.id}`).then(resp => {
            this.accounts.push(resp.data.account);
          })
        })
      })
    },

    async getTrade (accountId, tradeId) {
      const response = await window.axios(`${window.oanda_endpoint}/accounts/${accountId}/trades/${tradeId}`);
      console.log("response ", response)
      return response.data.trade;
    },

    cycleComputation (trades) {
      if (! trades.length) {
        return 0;
      }
        const ups = trades;
          return ups.map(net => {
            return {
              realized: parseFloat(net.realizedPL),
              unrealized: net.unrealizedPL ? parseFloat(net.unrealizedPL) : 0
            }
          }).reduce((a,b) => a + b.realized + b.unrealized, 0);
    },

    totalComputation (trades) {
      if (! trades.length) {
        return 0;
      }
        const ups = trades;
          return ups.map(net => {
            return {
              realized: parseFloat(net.realizedPL),
            }
          }).reduce((a,b) => a + b.realized, 0);
    },


    fetchOpenTrades () {
      if (! this.openTrades.length) {
        return;
      }

      this.openTrades.forEach(openTrade => {
        this.createTrade(
          this.zones[0].id,
          openTrade.cycleId,
          openTrade.account.id,
          openTrade.id,
          true
        );
      });
    },

    longOrShort (trade) {
      if (trade.takeProfitOrder) {
        if (trade.price < trade.takeProfitOrder.price) {
          return "Long";
        } else {
          return "Short";
        }
      } 
    },
  }
};
</script>

<style>
  @import "https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css";
</style>
