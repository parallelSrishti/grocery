import eventHandler from "./eventHandler.js";

export default{
  template:`
  <div>
    <div v-if="!creatingProduct && !successMessage" class="text-center mt-3">
      <button class="btn btn-primary" @click="startCreatingProduct">Create Product</button>
    </div>

    <div v-if="creatingProduct && !successMessage" class="product-form-container">
      <h3 class="text-center text-info mb-3">Product Details</h3>
      <form @submit.prevent="saveProduct">
        <div class="form-group">
          <label for="newProductName">Product Name:</label>
          <input v-model="newProductName" id="newProductName" placeholder="Enter product name" class="form-control mb-2" required />
        </div>

        <div class="form-group">
          <label for="newProductUnit">Product Unit:</label>
          <select v-model="newProductUnit" id="newProductUnit" class="form-select mb-2" required>
            <option v-for="unit in units" :key="unit">{{ unit }}</option>
          </select>
        </div>

        <div class="form-group">
          <label for="newProductRate">Unit Cost:</label>
          <input v-model="newProductRate" type="number" id="newProductRate" placeholder="Enter rate per unit" class="form-control mb-2" required />
        </div>

        <div class="form-group">
          <label for="newProductQuantity">Quantity Available:</label>
          <input v-model="newProductQuantity" type="number" id="newProductQuantity" placeholder="Enter product quantity" class="form-control mb-2" required />
        </div>

        <div class="form-group">
          <label for="newProductManufacturedDate">Manufactured Date:</label>
          <input v-model="newProductManufacturedDate" type="date" id="newProductManufacturedDate" class="form-control mb-2" required />
        </div>

        <div class="form-group">
          <label for="newProductExpiryDate">Expiry Date:</label>
          <input v-model="newProductExpiryDate" type="date" id="newProductExpiryDate" class="form-control mb-2" required />
        </div>

        <div class="form-group">
          <label for="selectedCategory">Select Category:</label>
          <select v-model="selectedCategory" id="selectedCategory" class="form-select mb-2" required>
            <option v-for="category in categories" :key="category.id">{{ category.category_name }}</option>
          </select>
        </div>

        <div class="d-flex justify-content-between mb-3">
          <button class="btn btn-primary" type="submit">Save</button>
          <button class="btn btn-secondary" @click="cancelAddingProduct">Cancel</button>
        </div>
      </form>
    </div>
    <div v-if="successMessage" class="alert alert-success mt-3" role="alert" style="text-align:center" v-text="successMessage">
    </div>
    <div v-if="error" class="alert alert-danger mt-3" role="alert" v-text="error" style="text-align:center">
    </div>
  </div>`,
  mounted(){
    eventHandler.$on('categoriesForProductCreation', (categories) => {
        this.categories = categories;
      });
  },
  data() {
    return {
      units: ["Rs/kg", "Rs/gram", "Rs/packet", "Rs/Litre", "Rs/piece", "Rs/dozen"],
      creatingProduct: false,
      categories: [],
      newProductName: null,
      newProductUnit: "Rs/kg",
      newProductRate:null,
      newProductQuantity: null,
      newProductManufacturedDate: null,
      newProductExpiryDate: null,
      selectedCategory: null,
      successMessage: null,
      error:null
    };
  },
  methods: {
    startCreatingProduct() {
      this.creatingProduct = !this.creatingProduct;
    },
    async saveProduct() {
       
      if (
        !this.newProductName.trim() ||
        !this.newProductUnit ||
        !this.newProductRate ||
        !this.newProductQuantity ||
        !this.newProductManufacturedDate ||
        !this.newProductExpiryDate ||
        !this.selectedCategory
      ) {
        this.error = "Please fill in all required fields.";
        return;
      }
      try{
        const res = await fetch('/manager-product',{
            method:'POST',
            headers:{
                'Authentication-Token':localStorage.getItem('auth-token'),
                'Content-Type':'Application/json'
            },
            body:JSON.stringify({
                product_name: this.newProductName,
                product_unit: this.newProductUnit,
                product_rate_per_unit: this.newProductRate,
                product_quantity: this.newProductQuantity,
                product_manufactured_date: this.newProductManufacturedDate,
                product_expiry_date: this.newProductExpiryDate,
                product_category_name: this.selectedCategory,
            })
        })
        const data = await res.json()
        if (res.ok){
            this.error = null
            this.successMessage = data.message

            eventHandler.$emit('productCreated');

            setTimeout(()=>{
            this.creatingProduct=!this.creatingProduct
            this.resetProductForm()
            this.successMessage = null
            },2000) 
        }else{
            this.error = data.error
            this.resetProductForm()
        }
      }catch(error){
        console.log("unexpected error",error);
      }

    },
    cancelAddingProduct() {
        this.creatingProduct=!this.creatingProduct
        this.error = null
        this.resetProductForm();
    },
    resetProductForm() {
      this.newProductName = null;
      this.newProductUnit = "Rs/kg";
      this.newProductRate = null;
      this.newProductQuantity = null;
      this.newProductManufacturedDate = null;
      this.newProductExpiryDate = null;
      this.selectedCategory = null;
    },
  },
};




