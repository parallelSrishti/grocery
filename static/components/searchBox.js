import eventHandler from "./eventHandler.js";

export default{
    components:{
        eventHandler
    },
    template:`
    <div>
        <div class="search-box">
            
            <input
                @input="searchFilter"
                type="text"
                v-model="searchQuery"
                placeholder="Search..."
                class="search-input"
                />

            <div>
                <select id="selectedItems"  v-model="displayType" class="form-select  fa fa-search" >
                    <option v-for="searchMethod in searchMethods">{{ searchMethod }}</option>
                </select> 
            </div>
        </div>
    </div>`,
    data(){
        return{
            searchQuery:null,
            searchMethods:["Cateogry","Product","Price"],
            displayType:"Cateogry",
            categories:[]
        }
    },
    methods:{
        search(){
            eventHandler.$emit("searchQueryInitiated",this.categories)
        },
        async searchFilter(){
            try{
                const res = await fetch ("/display",{
                    method:'POST',
                    headers:{
                        'Authentication-Token': localStorage.getItem('auth-token'),
                        'Content-Type':'Application/json'
                    },
                    body:JSON.stringify({
                        displayType:this.displayType,
                        searchQuery:this.searchQuery
                    })
                })
                const data = await res.json()
                if (res.ok){
                    this.categories = data.categories
                    this.search()
                }else{
                    console.log('There was an unexpected error', data.error);
                }
            }catch(error){
                console.error('Error while fetching data', error);
            }
        },
    }
}