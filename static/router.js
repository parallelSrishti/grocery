import welcomePage from './components/welcomePage.js'
import login from './components/login.js'
import register from './components/register.js'
import registerManager from './components/registerManager.js'
import adminHome from './components/adminHome.js'
import managerHome from './components/managerHome.js'
import userHome from './components/userHome.js'
import userCart from './components/userCart.js'


const routes = [
    { path: '/', component: welcomePage, name: 'welcomePage'},
    { path: '/login', component: login, name: 'login'},
    { path: '/register', component: register, name: 'register'},
    { path: '/manager-register', component: registerManager, name: 'registerManager'},
    { path: '/admin-home', component: adminHome, name: 'adminHome'},
    { path: '/manager-home', component: managerHome, name: 'managerHome'},
    { path: '/user-home', component: userHome, name: 'userHome'},   
    { path: '/userCart', component: userCart, name: 'userCart'}
]


export default new VueRouter({
    routes,
})