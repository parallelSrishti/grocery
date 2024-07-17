import managerAccessLeft from "./managerAccessLeft.js"
import managerAccessMiddle from "./managerAccessMiddle.js"


export default{
    template:`
        <div>
            <div class="home-container">
                <div class="left-part-manager">
                    <manager-access-left/>
                </div>
                <div class="middle-part-manager">
                    <manager-access-middle/>
                </div>
            </div>
        </div>`,
        components:{
            managerAccessLeft,
            managerAccessMiddle,
        }
}