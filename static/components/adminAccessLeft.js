import eventHandler from "./eventHandler.js";

export default{
  template:`
  <div>
    <div v-if="!creatingCategory && !successMessage" style="margin-left: 30px; margin-top: 30px">
      <button class="btn btn-success" @click="startCreatingCategory">Create Category</button>
    </div>
    <div v-if="creatingCategory && !successMessage">
      <form @submit.prevent="saveCategory">
        <div class="d-flex flex-column align-items-center" style="margin-left: 10px; margin-right: 10px; margin-top: 30px">
          <input v-model="newCategoryName" placeholder="Enter category name" class="form-control mb-2" required/>
          <div class="mb-3 d-flex justify-content-between">
            <button style="flex-basis: 48%;width:90px" class="btn btn-primary" type="submit">Save</button>
            <button style="flex-basis: 48%" class="btn btn-secondary" @click="cancelCreatingCategory">Cancel</button>
          </div>
        </div>
      </form>
    </div>
    <div v-if="successMessage" class="alert alert-success mt-3" role="alert" style="text-align:center" v-text="successMessage">
    </div>
    <div v-if="error" class="alert alert-danger mt-3" role="alert" v-text="error" style="text-align:center">
    </div>
  </div>`,
  data() {
    return {
      creatingCategory: false,
      newCategoryName: "",
      successMessage:null,
      error:null,
    };
  },
  methods: {
    startCreatingCategory() {
      this.creatingCategory = true;
    },
    async saveCategory() {
      const res = await fetch('/admin-category',{
          method:'POST',
          headers:{
            'Authentication-Token': localStorage.getItem('auth-token'),
            'Content-Type':'Application/json'  
          },
          body:JSON.stringify({
            category_name:this.newCategoryName
          })
      })
      const data = await res.json()
      if (res.ok){
        this.error = null
        this.successMessage = data.message

        eventHandler.$emit('categoryCreated');

        setTimeout(()=>{
          this.creatingCategory = false
          this.newCategoryName = ""
          this.successMessage = null
        },2000) 
      }
      else{
        this.error = data.error
        this.newCategoryName = ""
      }
    },
    cancelCreatingCategory() {
      this.creatingCategory = false;
      this.newCategoryName = "";
      this.successMessage = null
      this.error = null
    
    },
  },
};


