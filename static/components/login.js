export default {
    template: `
        <div :style="containerStyle" style="margin-top:-30px">
            <div :style="formStyle" class="login-form p-4">
                <h2 class="mb-4">Login to Your Account</h2>
                <form @submit.prevent="login">
                    <div class="mb-3">
                        <label for="username" class="form-label">Email:</label>
                        <input type="email" v-model="credentials.email" id="email" class="form-control" placeholder="sample@email.com" required  />
                    </div>
                    <div class="mb-3">
                        <label for="password" class="form-label">Password:</label>
                        <input type="password" v-model="credentials.password" id="password" class="form-control" placeholder="Enter your password" required/>
                    </div>
                    <button type="submit" :style="buttonStyle" class="btn btn-primary btn-block">Login</button>
                </form>
                <div v-if="error" style="text-align:center" class="alert alert-danger mt-3" role="alert">
                    {{error}}
                </div>
                <p class="mt-3">
                    Don't have an account? <router-link to="/register">Click here to Sign Up</router-link>
                </p>
            </div>
        </div>`,
    mounted(){
        if (localStorage.getItem("auth-token")){
            if(localStorage.getItem("role") === 'admin'){
                this.$router.push({path:'/admin-home'})
            }
            else if(localStorage.getItem("role") === 'manager'){
                this.$router.push({path:'/manager-home'})
            }
            else if(localStorage.getItem("role") === 'user'){
                this.$router.push({path:'/user-home'})
            }
            else if(localStorage.getItem("role") === 'suoeruser'){
                this.$router.push({path:'/superuser-home'})
            }
        }
    },
    data(){
        return {
            credentials:{
                email:null,
                password:null
            },
            error:null,

            containerStyle: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
              },
              formStyle: {
                maxWidth: '400px', 
                width: '100%',
                borderRadius: '8px',
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                backgroundColor: '#ffffff',
              },
              buttonStyle: {
                backgroundColor: '#388E3C',
                borderColor: '#388E3C',
              },
              buttonHoverStyle: {
                backgroundColor: '#2d7031',
                borderColor: '#2d7031',
              },
        }
    },
    methods:{
        async login(){
            const res = await fetch('/user-login',{
                method:'POST',
                headers:{
                    'Content-Type':'application/json',
                },
                body:JSON.stringify(this.credentials),
            })
            const data = await res.json()
            if (res.ok){
                localStorage.setItem('auth-token',data.token)
                localStorage.setItem('role',data.role)
                localStorage.setItem('username',data.username)
                localStorage.setItem('email',data.email)

                if(localStorage.getItem("role") === 'admin'){
                    this.$router.push({path:'/admin-home'})
                }
                else if(localStorage.getItem("role") === 'manager'){
                    this.$router.push({path:'/manager-home'})
                }
                else if(localStorage.getItem("role") === 'user'){
                    this.$router.push({path:'/user-home'})
                }
                else if(localStorage.getItem("role") === 'suoeruser'){
                    this.$router.push({path:'/superuser-home'})
                }
                this.credentials.email=null
                this.credentials.password=null
            } else {
                this.error = data.message
                this.credentials.email=null
                this.credentials.password=null
            }
        }
    }

  };
  