import searchBox from "./searchBox.js"
import eventHandler from "./eventHandler.js";

export default{
    components:{
        searchBox,
        eventHandler
    },
    template:`
        <nav class="navbar navbar-expand-lg navbar-dark" style="background-color:#388E3C;padding:15px;font-size: 18px;">
            <div class="container-fluid">
                <router-link to="/" class="navbar-brand" v-if="!is_valid">Grocery Store</router-link>
                    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>

                    <router-link to="/admin-home" class="navbar-brand" v-if="is_valid && admin">{{username}} Dashboard </router-link>
                    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>

                    <router-link to="/manager-home" class="navbar-brand" v-if="is_valid && manager">{{username}} Dashboard </router-link>
                    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>

                    <router-link to="/user-home" class="navbar-brand" v-if="is_valid && customer">{{username}} Dashboard </router-link>
                    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>

                    <search-box v-if="is_valid && !searchBoxShow" style="margin-right:40px"/>

                    <div class="collapse navbar-collapse" id="navbarNav" >
                        <ul class="navbar-nav ml-auto" style="margin-left:auto">
                            <li v-if="is_valid && (customer)" class="nav-item">
                                <router-link to="/userCart" class="nav-link">Cart</router-link>
                            </li>
                            <li v-if="!is_valid" class="nav-item">
                                <router-link to="/login" class="nav-link">Login</router-link>
                            </li>
                            <li v-if="is_valid && manager && !loading" class="nav-item">
                                <button @click="export_csv" class="nav-link">Export csv</button>
                            </li>
                            <li v-if="is_valid && manager && loading" class="nav-item">
                                <button class="nav-link">Exporting....</button>
                            </li>
                            <li v-if="!is_valid" class="nav-item">
                                <router-link to="/register" class="nav-link">Signup</router-link>
                            </li>
                            <li v-if="is_valid" class="nav-item">
                                <button @click="logout" class="nav-link">Logout</button>
                            </li>
                        </ul>
                    </div>
            </div>
        </nav>`,
    data(){
        return{
            is_valid: localStorage.getItem('auth-token'),
            role:localStorage.getItem('role'),
            username:localStorage.getItem('username'),
            loading:false,
            searchBoxShow:false
        }
    },
    computed:{
        admin(){
            return this.role === 'admin'
        },
        manager(){
            return this.role === 'manager'
        },
        customer(){
            return this.role === 'user'
        },
    },
    methods:{
        logout(){
            localStorage.removeItem('auth-token'),
            localStorage.removeItem('role'),
            localStorage.removeItem('username'),
            this.$router.push('/login'),
            window.location.reload(true)
        },
        async export_csv(){
            try{
                const res = await fetch('/export-csv',{
                    method:'GET',
                    headers:{
                        'Authentication-Token':localStorage.getItem("auth-token")
                    }
                })
                const data = await res.json()
                if (res.ok){
                    const taskID = data.taskID
                    this.loading=!this.loading
                    this.download_csv(taskID)  
                }
            }catch(error){
                console.log("there is been an unexpected error",error);
            }
        },
        async download_csv(taskID){
            try{
                const interval = setInterval(async ()=>{
                    const report = await fetch(`/download-csv/${taskID}`,{
                        method:'GET',
                        headers:{
                            'Authentication-Token':localStorage.getItem("auth-token")
                        }
                    })
                    if (report.ok){
                        window.location.href = `/download-csv/${taskID}`
                        this.loading=!this.loading
                        clearInterval(interval)
                        
                    }
                },10000)
            }catch(error){
                console.log("there is been an unexpected error",error);
            }
        }
    },
    mounted(){
        eventHandler.$on('cartPage',()=>{
            console.log('clicked');
            this.searchBoxShow = !this.searchBoxShow
          })
    }
    
}