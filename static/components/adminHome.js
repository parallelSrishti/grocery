import adminAccessLeft from "./adminAccessLeft.js"
import adminAccessMiddle from "./adminAccessMiddle.js"
import adminAccessRight from "./adminAccessRight.js"


export default{
    components:{
        adminAccessLeft,
        adminAccessMiddle,
        adminAccessRight
    },
    template:`
        <div class="home-container">
            <div class="left-part">
                <admin-access-left/>
            </div>
            <div class="middle-part">
                <admin-access-middle/>
            </div>
            <div class="right-part">
                <admin-access-right/>
            </div> 
        </div>`,
}