import router from "./router.js"
import navbar from "./components/navbar.js"

router.beforeEach((to, from, next) => {
    const allowedRoutes = ['welcomePage', 'login', 'register', 'registerManager'];
  
    if (!localStorage.getItem('auth-token') && !allowedRoutes.includes(to.name)) {
      next({ name: 'login' });
    } else {
      next();
    }
  })

new Vue({
    el:'#app',
    template:`
        <div>
            <navbar :key="has_changed"/>
            <router-view />
        </div>`,
    router,
    components:{
        navbar,
    },
    data:{
        has_changed:true,
    },
    watch:{
        $route(to,from){
            this.has_changed=!this.has_changed
        }
    }
})