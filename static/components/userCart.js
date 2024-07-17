import eventHandler from "./eventHandler.js"

export default{
    components:{
      eventHandler
    },
    template:`
    <div class="cart-container">
    <h2 class="cart-title" style="text-align:center">Your Shopping Cart</h2>

    <div style="margin-top:30%" v-if="cartItems.length === 0" class="empty-cart-message">
      Your cart is empty. Start shopping now!
    </div>

    <div v-else>
      <div v-for="item in cartItems" :key="item.id" class="cart-item">
        <div class="item-details">
          <h4 class="item-name">{{ item.product.product_name }}</h4>
          <p class="item-rate">Price: Rs. {{ item.product.rate_per_unit }} {{ item.product.product_unit }}</p>
          <p class="item-quantity">Quantity: {{ item.Quantity_required }}</p>
        </div>

        

        <div class="item-total">
            <div class="quantity-controls">
                <button @click="decrementQuantity(item)" class="btn">-</button>
        
                <button @click="incrementQuantity(item)" class="btn">+</button>
            </div>
          <p class="total-price">Total: Rs. {{ item.Quantity_required * item.product.rate_per_unit }}</p>
          <button @click="removeFromCart(item.id)" class="btn btn-danger">Remove</button>
        </div>
      </div>

      <div class="cart-summary">
        <h4 class="summary-title">Order Summary</h4>
        <p class="total-items">Total Items: {{ totalItems }}</p>
        <p class="grand-total">Grand Total: Rs. {{ totalAmount }}</p>
        <button @click="checkout" class="btn btn-primary checkout-button">Proceed to Checkout</button>
      </div>
    </div>
  </div>`,
    data() {
      return {
        cartItems: [], 
        error:null,
        success:null
      };
    },

    mounted() {
        this.fetchDisplayData()
        eventHandler.$emit('cartPage')
      },
    beforeDestroy(){
      eventHandler.$off('cartPage')
    },
    methods:{
        async fetchDisplayData() {
            try {
              const res = await fetch('/add-to-cart', {
                method: 'GET',
                headers: {
                  'Authentication-Token': localStorage.getItem('auth-token'),
                }
              });
              const data = await res.json();
      
              if (res.ok) {
                this.cartItems = data.cart
              }else {
                console.log('There was an unexpected error', data.error);
              }
            } catch (error) {
              console.error('Error while fetching data', error);
            }
          },
          async incrementQuantity(item) {
            try{
                const res = await fetch('/add-to-cart',{
                    method:'PUT',
                    headers:{
                        'Authentication-Token':localStorage.getItem('auth-token'),
                        "Content-Type":"Application/json"
                    },
                    body:JSON.stringify({
                        itemID:item.id
                    })
                })
                const data = await res.json()
                if (res.ok){
                    this.fetchDisplayData()
                }else{
                    this.error = data.error
                }
            }catch(error){
                console.error('Error while executing', error);
            }
          },
          async decrementQuantity(item) {
           
            if (item.Quantity_required > 1) {
                try{
                    const res = await fetch('/add-to-cart',{
                        method:'DELETE',
                        headers:{
                            'Authentication-Token':localStorage.getItem('auth-token'),
                            "Content-Type":"Application/json"
                        },
                        body:JSON.stringify({
                            itemID:item.id
                        })
                    })
                    const data = await res.json()
                    if (res.ok){
                        this.fetchDisplayData()
                    }else{
                        this.error = data.error
                    }
                }catch(error){
                    console.error('Error while executing', error);
                }
              
            }
          },
          async removeFromCart(itemId) {
            try{
                const res = await fetch('/buy',{
                    method:'DELETE',
                    headers:{
                        'Authentication-Token':localStorage.getItem('auth-token'),
                        "Content-Type":"Application/json"
                    },
                    body:JSON.stringify({
                        itemID:itemId
                    })
                })
                const data = await res.json()
                if (res.ok){
                    this.fetchDisplayData()
                }else{
                    this.error = data.error
                }
            }catch(error){
                console.error('Error while executing', error);
            }
          },
          async checkout() {
            try{
                const res = await fetch('/buy',{
                    method:'POST',
                    headers:{
                        'Authentication-Token':localStorage.getItem('auth-token'),
                        "Content-Type":"Application/json"
                    },
                })
                const data = await res.json()
                if (res.ok){
                    this.fetchDisplayData()
                }else{
                    this.error = data.error
                }
            }catch(error){
                console.error('Error while executing', error);
            }
          },
    },
    computed: {
        totalItems() {
          return this.cartItems.length
        },
        totalAmount() {
          return this.cartItems.reduce((total, item) => total + item.Quantity_required * item.product.rate_per_unit, 0);
        },
      },
  };
  