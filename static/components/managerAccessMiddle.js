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
            <div v-for="product in category.products" :key="product.id" class="product-item-manager">
              <div class="product-box">
                <h4>{{ product.product_name }}</h4>
                <p class="product-rate">Rate: Rs. {{ product.rate_per_unit }}/{{product.product_unit}} </p>
                <p class="product-quantity">Quantity Available: {{ product.product_quantity }} {{product.product_unit}} </p>
                <p class="product-manufactured-date">Manufactured Date: {{ product.manufactured_date }}</p>
                <p class="product-expiry-date">Expiry Date: {{ product.expiry_date }}</p>

                <div class="product-buttons">
                  <button @click="openProductUpdateModal(product)" class="btn btn-primary">Update</button>
                  <button @click="openProductdeleteModal(product)" class="btn btn-danger">Delete</button>
                </div>
              
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
          <button style="flex-basis: 48%;width:90px" class="btn btn-primary" type="submit">Submit request</button>
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
          <p style="color:red">Are you sure you want to submit delete request this category??</p><p style="color:red">All the products accociated with this category will be deleted!!</p>
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


    <div v-if="gotProduct" class="update-form-container">
      <form v-if="!productUpdateDetails.successMessage" @submit.prevent="updateProductName" class="update-form">
        <h3 class="text-center text-info mb-3">Product Details - {{gotProduct.product_name}}</h3>
        <div class="form-group">
          <label for="newProductName">Product Name:</label>
          <input v-model="productUpdateDetails.newProductName" id="newProductName" placeholder="Enter product name" class="form-control mb-2"  />
        </div>

        <div class="form-group">
          <label for="newProductUnit">Product Unit:</label>
          <select v-model="productUpdateDetails.newProductUnit" id="newProductUnit" class="form-select mb-2" >
            <option v-for="unit in units" :key="unit">{{ unit }}</option>
          </select>
                  
        </div>
        <div class="form-group">
          <label for="newProductRate">Unit Cost:</label>
          <input v-model="productUpdateDetails.newProductRate" type="number" id="newProductRate" placeholder="Enter rate per unit" class="form-control mb-2"  />
        </div>

        <div class="form-group">
          <label for="newProductQuantity">Quantity Available:</label>
          <input v-model="productUpdateDetails.newProductQuantity" type="number" id="newProductQuantity" placeholder="Enter product quantity" class="form-control mb-2"  />
        </div>

        <div class="form-group">
          <label for="newProductManufacturedDate">Manufactured Date:</label>
          <input v-model="productUpdateDetails.newProductManufacturedDate" type="date" id="newProductManufacturedDate" class="form-control mb-2"  />
        </div>

        <div class="form-group">
          <label for="newProductExpiryDate">Expiry Date:</label>
          <input v-model="productUpdateDetails.newProductExpiryDate" type="date" id="newProductExpiryDate" class="form-control mb-2"  />
        </div>

        <div class="form-group">
          <label for="selectedCategory">Select Category:</label>
          <select v-model="productUpdateDetails.selectedCategory" id="selectedCategory" class="form-select mb-2" >
            <option v-for="category in categories" :key="category.id">{{ category.category_name }}</option>
          </select>
        </div>

        <div class="d-flex justify-content-between mb-3">
          <button class="btn btn-primary" type="submit">Save</button>
          <button class="btn btn-secondary" @click="cancelUpdatingProduct">Cancel</button>
        </div>

        <div v-if="productUpdateDetails.error" class="alert alert-danger mt-3" role="alert" v-text="productUpdateDetails.error" style="text-align:center">
        </div>
      </form>

      <div v-if="productUpdateDetails.successMessage" class="alert alert-success mt-3" role="alert" style="text-align:center;font-size:18px" v-text="productUpdateDetails.successMessage">
      </div>    
    </div>

    <div v-if="deleteProduct" class="update-form-container">
      <div v-if="!productDeleteSuccessMessage" class="update-form">
        <h3 style="text-align:center">{{ deleteProduct.product_name }}</h3>
        <div class="form-group">
          <p style="color:red">Are you sure, you want to delete this Product??</p>
        </div>
        <div class="mb-2 d-flex justify-content-between" style="margin-top:5px">
          <button style="flex-basis: 48%;width:90px" class="btn btn-danger" @click="confirmDeleteProduct">Confirm</button>
          <button style="flex-basis: 48%" class="btn btn-secondary" @click="cancelDeleteProduct">Cancel</button>
        </div>
        <div v-if="productDeleteError" class="alert alert-danger mt-3" role="alert" v-text="productDeleteError" style="text-align:center">
        </div>
      </div>

      <div v-if="productDeleteSuccessMessage" class="alert alert-success mt-3" role="alert" style="text-align:center" v-text="productDeleteSuccessMessage">
      </div>
    </div>
    
    </div>`,
  data(){
    return{
        units: ["Rs/kg", "Rs/gram", "Rs/packet", "Rs/Litre", "Rs/piece", "Rs/dozen"],
        categories: [],
        updatingCategory: null,
        deletingCategory:null,
        newCategoryName: null,
        successMessage:null,
        error:null,
        gotProduct:null,
        productUpdateDetails:{
          newProductName: null,
          newProductUnit: "Rs/kg",
          newProductRate:null,
          newProductQuantity: null,
          newProductManufacturedDate: null,
          newProductExpiryDate: null,
          selectedCategory: null,
          successMessage: null,
          error:null
        },
        deleteProduct:null,
        productDeleteSuccessMessage:null,
        productDeleteError:null
    }
  },
  mounted() {
    this.fetchDisplayData();
    
    eventHandler.$on('productCreated',()=>{
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
          eventHandler.$emit('categoriesForProductCreation',this.categories);
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
          const res = await fetch('/manager-category',{
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
            this.newCategoryName = null;
            this.successMessage = data.message
            this.fetchDisplayData();
            setTimeout(()=>{
              this.updatingCategory = null;
              
              this.successMessage = null
            },3000)
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
          const res = await fetch('/manager-category',{
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
            },3000)
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
      openProductUpdateModal(product){
        this.resetUpdateForm()
        this.gotProduct = product
      },
      async updateProductName(){
        try{
          const res = await fetch('/manager-product',{
            method:'PUT',
            headers:{
              'Authentication-Token':localStorage.getItem('auth-token'),
              'Content-Type':'Application/json'
            },
            body:JSON.stringify({
              productID : this.gotProduct.id,
              new_name : this.productUpdateDetails.newProductName,
              new_unit : this.productUpdateDetails.newProductUnit,
              new_rate : this.productUpdateDetails.newProductRate,
              new_quantity : this.productUpdateDetails.newProductQuantity,
              new_manufactured_date : this.productUpdateDetails.newProductManufacturedDate,
              new_expiry_date : this.productUpdateDetails.newProductExpiryDate,
              new_category_name : this.productUpdateDetails.selectedCategory
            })
          })

          const data = await res.json()
          if (res.ok){
            this.resetUpdateForm()
            this.productUpdateDetails.successMessage = data.message
            this.fetchDisplayData()
            setTimeout(()=>{
              this.gotProduct = null
              this.productUpdateDetails.successMessage = null
            },3000)
          }else{
            this.resetUpdateForm()
            this.productUpdateDetails.error = data.error
          }
        }catch(error){
          console.log("Unexpected Error",error);
        }
      },
      cancelUpdatingProduct(){
        this.resetUpdateForm()
        this.gotProduct = null
      },
      resetUpdateForm(){
        this.productUpdateDetails.newProductName = null
        this.productUpdateDetails.newProductUnit = "Rs/kg"
        this.productUpdateDetails.newProductRate = null
        this.productUpdateDetails.newProductQuantity = null
        this.productUpdateDetails.newProductManufacturedDate = null
        this.productUpdateDetails.newProductExpiryDate = null
        this.productUpdateDetails.selectedCategory = null
        this.productUpdateDetails.successMessage = null
        this.productUpdateDetails.error = null
      },
      openProductdeleteModal(product){
        this.productDeleteError = null
        this.deleteProduct = product
      },
      async confirmDeleteProduct(){
        try{
          const res = await fetch('/manager-product',{
            method:'DELETE',
            headers:{
              'Authentication-Token':localStorage.getItem('auth-token'),
              'Content-Type':'Application/json'
            },
            body:JSON.stringify({
              deleteID:this.deleteProduct.id
            })
          })
          const data = await res.json()
          if (res.ok){
            this.productDeleteSuccessMessage=data.message
            this.fetchDisplayData()
            setTimeout(()=>{
              this.deleteProduct = null
              this.productDeleteSuccessMessage = null
            },3000)
          }else{
            this.productDeleteError= data.error
          }
        }catch(error){
          console.log("There is been an unexpcted error",error);
        }
      },
      cancelDeleteProduct(){
        this.deleteProduct = null
      }
  }
}