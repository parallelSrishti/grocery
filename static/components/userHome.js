import eventHandler from "./eventHandler.js";

export default{
    components:{
        eventHandler
    },
    template:`
    <div style="margin:20px">
    <div class="row mt-3">
      <div v-for="category in categories" :key="category.id">
        <div class="card mb-3">
          <div class="card-header" style="background-color: #f0f0f0;">
            <div class="category-heading">
              <h3 class="category-name">{{ category.category_name }}</h3>
            </div>
          </div>

          <div class="product-list" style="margin:10px">
            <div v-for="product in category.products" :key="product.id" class="product-item">
              <div class="product-box">
                <h4>{{ product.product_name }}</h4>
                <p class="product-rate">Rate: Rs. {{ product.rate_per_unit }}/{{ product.product_unit }} </p>
                <p class="product-quantity">Quantity Available: {{ product.product_quantity }} {{ product.product_unit }} </p>
                <p class="product-manufactured-date">Manufactured Date: {{ product.manufactured_date }}</p>
                <p class="product-expiry-date">Expiry Date: {{ product.expiry_date }}</p>
                <button @click="openAddingToCart(product)" class="btn btn-success">Buy</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="productSelectedToBuy" class="update-form-container">
        <form @submit.prevent="addToCart" class="update-form">
          <div class="form-group">
            <h4 style="text-align:center">{{ productSelectedToBuy.product_name }}</h4>
            <p class="product-rate">Rate: Rs.{{ productSelectedToBuy.rate_per_unit }}/{{ productSelectedToBuy.product_unit }} </p>
            <p class="product-quantity">Quantity Available: {{ productSelectedToBuy.product_quantity }} {{ productSelectedToBuy.product_unit }} </p>
            <label for="requiredQuantity">Quantity Required:</label>
            <input v-model="requiredQuantity" type="number" class="form-control" id="requiredQuantity" min="0" required />
          </div>
          <div class="mb-2 d-flex justify-content-between" style="margin-top:5px">
            <button style="flex-basis: 48%; width:90px" class="btn btn-primary" type="submit">Add to Cart</button>
            <button style="flex-basis: 48%" class="btn btn-secondary" @click="closeAddingToCart">Cancel</button>
          </div>
          <div v-if="successMessage" class="alert alert-success mt-3" role="alert" style="text-align:center" v-text="successMessage"></div>
          <div v-if="error" class="mt-3" role="alert" v-text="error" style="text-align:center;color:red;font-size:20px"></div>
        </form>
      </div>
    </div>
  </div>`,
    data(){
        return{
            categories:[],
            productSelectedToBuy:null,
            requiredQuantity:null,
            successMessage:null,
            error:null
        }
    },
    mounted() {
        this.fetchDisplayData()
        eventHandler.$on("searchQueryInitiated",(categories)=>{
            this.categories = categories.filter(category => category.products.length > 0);
        })
      },
    
    methods:{
        async fetchDisplayData() {
            try {
              const res = await fetch('/display', {
                method: 'GET',
                headers: {
                  'Authentication-Token': localStorage.getItem('auth-token'),
                }
              });
              const data = await res.json();
      
              if (res.ok) {
                this.categories = data.categories.filter(category => category.products.length > 0);
              }else {
                console.log('There was an unexpected error', data.error);
              }
            } catch (error) {
              console.error('Error while fetching data', error);
            }
          },
          openAddingToCart(product){
            this.productSelectedToBuy = product
          },
          async addToCart(){
            try {
                const res = await fetch('/add-to-cart', {
                  method: 'POST',
                  headers: {
                    'Authentication-Token': localStorage.getItem('auth-token'),
                    'Content-Type':'Application/json'
                  },
                  body:JSON.stringify({
                    requiredQuantity:this.requiredQuantity,
                    productID:this.productSelectedToBuy.id,
                  })
                });
                const data = await res.json();
        
                if (res.ok) {
                    this.successMessage=data.successMessage
                    this.error=null
                    this.requiredQuantity=null
                    this.closeAddingToCart()
                } else {
                    this.requiredQuantity=null
                    this.successMessage=null
                    this.error=data.error
                }
              } catch (error) {
                console.error('Error while fetching data', error);
              }
          },
          closeAddingToCart(){
            this.productSelectedToBuy = null
          }
    }
}