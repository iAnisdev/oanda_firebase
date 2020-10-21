<template>
    <div>
        <div class="container-fluid">
            <div class="row">
                <div class="col-md-4">
                </div>
                <div class="col-md-4 log-container">
                    <form @submit.prevent="pressed">
                        <div class="form-group">
                            <input type="email" class="form-control" id="exampleInputEmail1" v-model="email"  placeholder="Email"/>
                        </div>
                        <div class="form-group">
                            <input type="password" class="form-control" id="exampleInputPassword1" v-model="password" placeholder="Password" />
                        </div>
                        <button type="submit" class="btn btn-primary">
                            Submit
                        </button>
                    </form>
                </div>
                <div class="col-md-4">
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import * as firebase from "firebase/app";
import "firebase/auth";
    export default {
        data() {
            return {
                email: '',
                password: '',
                error: ''
            }
        },
        methods: {
            async pressed() {
                try {
                  const val = await firebase.auth().signInWithEmailAndPassword(this.email, this.password)
                  console.log(val)
                  this.$router.replace({name: "dashboard"}) 
                }catch(err) {
                    alert(err);
                }
            }
        }
        
    }
</script>
<style>
    .log-container {
        text-align: center;
        margin-top: 200px;
        
    }
    .log-container input, .log-container button {
        width: 60%;
        margin:auto;
    }

</style>
