import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Customer from '../components/user/Customer.vue'
import Receive from '../components/goods/Receive.vue'
import Send from '../components/goods/Send.vue'

Vue.use(VueRouter)

export default new VueRouter({
  routes: [{
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        component: Welcome
      },
      {
        path: '/customers',
        component: Customer
      },
      {
        path: '/goodsReceiveList',
        component: Receive
      },
      {
        path: '/goodsSendList',
        component: Send
      }
    ]
  }
  ]
})
