export default {
    data() {
      return {
        containerStyle: {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        },
        formStyle: {
          maxWidth: '500px', 
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
        credentials:{
          username:null,
          email:null,
          password:null,
          confirmPassword:null
        },
        error:null,
      }
    },
    methods:{
      async register(){
        const res = await fetch('/user-register',{
            method:'POST',
            headers:{
                'Content-Type':'application/json',
            },
            body:JSON.stringify(this.credentials),
        })
        const data = await res.json()
        if (res.ok){
          this.$router.push({path:'/login'})
        } else {
            this.error = data.message
        }
      }
    },
    template: `
      <div :style="containerStyle" style="margin-top:-30px">
        <div :style="formStyle" class="signup-form p-4">
          <h2 class="mb-4" style="text-align:center;color:green">Create an Account</h2>
          <form @submit.prevent="register">
            <div class="mb-3">
              <label for="username" class="form-label">Username</label>
              <input type="text" v-model="credentials.username" id="username" class="form-control" placeholder="Enter your username" required/>
            </div>
            <div class="mb-3">
              <label for="email" class="form-label">Email</label>
              <input type="email" v-model="credentials.email" id="email" class="form-control" placeholder="Enter your email" required/>
            </div>
            <div class="mb-3">
              <label for="password" class="form-label">Password</label>
              <input type="password" v-model="credentials.password"id="password" class="form-control" placeholder="Enter your password" required/>
            </div>
            <div class="mb-3">
              <label for="confirmPassword" class="form-label">Confirm Password</label>
              <input type="password" v-model="credentials.confirmPassword" id="confirmPassword" class="form-control" placeholder="Confirm your password" required/>
            </div>
            <button type="submit" :style="buttonStyle" class="btn btn-primary btn-block">Sign Up</button>
          </form>
          <div v-if="error" style="text-align:center" class="alert alert-danger mt-3" role="alert">
            {{error}}
          </div>
          <p class="mt-3">
            Already have an account? <router-link to="/login">Login here</router-link>
          </p>
          <p class="mt-3">
            Want to Sign Up as manager? <router-link to="/manager-register">Manager Sign Up</router-link>
          </p>
        </div>
      </div>
    `,

  };
  