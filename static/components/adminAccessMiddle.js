import eventHandler from "./eventHandler.js";

export default{
  template:`
  <div>
    <div class="row mt-3">
      <div v-for="category in categories" :key="category.id">
        <div class="card mb-3">
          <div class="card-header" style="background-color: #f0f0f0;">
            <div class="category-heading">
              <h3 class="category-name">
                {{ category.category_name }}
              </h3>
              <span class="category-buttons">
                <button @click="startUpdatingCategoryName(category)" class="btn btn-primary" style="font-size: 14px;">Update Name</button>
                <button @click="startDeletingCategoryName(category)" class="btn btn-danger" style="font-size: 14px;">Delete Section</button>
              </span>
            </div>
          </div>

          <div class="product-list" v-if="category.products.length > 0">
            <div v-for="product in category.products" :key="product.id" class="product-item">
              <div class="product-box" >
                <h4>{{ product.product_name }}</h4>
                <p class="product-rate">Rate: Rs. {{ product.rate_per_unit }}/{{product.product_unit}} </p>
                <p class="product-quantity">Quantity Available: {{ product.product_quantity }} {{product.product_unit}} </p>
                <p class="product-manufactured-date">Manufactured Date: {{ product.manufactured_date }}</p>
                <p class="product-expiry-date">Expiry Date: {{ product.expiry_date }}</p>
              </div>
            </div>
          </div>

          <div v-else>
            <p class="no-products-message">No products available in this category.</p>
          </div>
        </div>
      </div>
    </div>


    <div v-if="updatingCategory" class="update-form-container">
      <form @submit.prevent="updateCategoryName" class="update-form">
        <h3 style="text-align:center">{{ updatingCategory.category_name }}</h3>
        <div class="form-group">
          <label for="newCategoryName">New Category Name:</label>
          <input v-model="newCategoryName" type="text" class="form-control" id="newCategoryName" required/>
        </div>
        <div class="mb-2 d-flex justify-content-between" style="margin-top:5px">
          <button style="flex-basis: 48%;width:90px" class="btn btn-primary" type="submit">Save</button>
          <button style="flex-basis: 48%" class="btn btn-secondary" @click="cancelUpdate">Cancel</button>
        </div>
        <div v-if="successMessage" class="alert alert-success mt-3" role="alert" style="text-align:center" v-text="successMessage">
        </div>
        <div v-if="error" class="alert alert-danger mt-3" role="alert" v-text="error" style="text-align:center">
        </div>
      </form>
    </div>
    
    <div v-if="deletingCategory" class="update-form-container">
      <div class="update-form">
        <h3 style="text-align:center">{{ deletingCategory.category_name }}</h3>
        <div class="form-group">
          <p style="color:red">Are you sure you want delete this category??</p><p style="color:red">All the products accociated with this category will be deleted!!</p>
        </div>
        <div class="mb-2 d-flex justify-content-between" style="margin-top:5px">
          <button style="flex-basis: 48%;width:90px" class="btn btn-danger" @click="deleteCategory">Delete</button>
          <button style="flex-basis: 48%" class="btn btn-secondary" @click="cancelDelete">Cancel</button>
        </div>
        <div v-if="successMessage" class="alert alert-success mt-3" role="alert" style="text-align:center" v-text="successMessage">
        </div>
        <div v-if="error" class="alert alert-danger mt-3" role="alert" v-text="error" style="text-align:center">
        </div>
      </div>
    </div>
  </div>`,
  data() {
    return {
      categories: [],
      updatingCategory: null,
      deletingCategory:null,
      newCategoryName: null,
      successMessage:null,
      error:null
    };
  },
  mounted() {
    this.fetchDisplayData();

    eventHandler.$on('categoryCreated',()=>{
      this.fetchDisplayData();
    })
    eventHandler.$on("searchQueryInitiated",(categories)=>{
      this.categories = categories
    })
  },
  methods: {
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
          this.categories = data.categories;
        } else {
          console.log('There was an unexpected error', data.error);
        }
      } catch (error) {
        console.error('Error while fetching data', error);
      }
    },
    startUpdatingCategoryName(category) {
      this.updatingCategory = category
      this.error = null
      this.successMessage = null
    },
    async updateCategoryName() {
      try{
        const res = await fetch('/admin-category',{
          method:'PUT',
          headers:{
            'Authentication-Token':localStorage.getItem('auth-token'),
            'Content-Type':'Application/json'
          },
          body:JSON.stringify({
            categoryID:this.updatingCategory.id,
            new_name:this.newCategoryName
          })
        })
        const data = await res.json()
        if (res.ok){
          this.error = null
          this.successMessage = data.message
          this.fetchDisplayData();
          setTimeout(()=>{
            this.updatingCategory = null;
            this.newCategoryName = null;
            this.successMessage = null
          },2000)
        }else{
          this.error=data.error
          this.newCategoryName = null;
        } 
      }catch(error){
        console.error('Error while fetching data', error);
      }
    },
    cancelUpdate() {
      this.updatingCategory = null;
      this.newCategoryName = null;
    },
    startDeletingCategoryName(category){
      this.deletingCategory=category
      this.error = null
      this.successMessage = null
    },
    async deleteCategory(){
      try{
        const res = await fetch('/admin-category',{
          method:'Delete',
          headers:{
            'Authentication-Token':localStorage.getItem('auth-token'),
            'Content-Type':'Application/json'
          },
          body:JSON.stringify({
            categoryID:this.deletingCategory.id,
          })
        })
        const data = await res.json()
        if (res.ok){
          this.error = null
          this.successMessage = data.message
          this.fetchDisplayData();
          setTimeout(()=>{
            this.deletingCategory = null;
            this.successMessage = null
          },2000)
        }else{
          this.error=data.error
          this.newCategoryName = null;
        } 
      }catch(error){
        console.error('Error while fetching data', error);
      }
    },
    cancelDelete(){
      this.deletingCategory=null
    },
    beforeDestroy(){
      eventHandler.$off('categoryCreated');
    }
  }
};

