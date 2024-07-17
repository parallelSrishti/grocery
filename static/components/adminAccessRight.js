import eventHandler from "./eventHandler.js";


export default {
    template: `
        <div>
            <div>
                <select id="selectedItems" @change="handleDisplayTypeChange" v-model="displayType" class="form-select" >
                    <option v-for="item in items">{{ item }}</option>
                </select>
            </div>
            <div v-if="displayType === 'Managers Approval Requests'">
                <div v-for="manager in managers" :key="manager.managerId" class="manager-row" style="margin-top:10px">
                    <div class="manager-info">
                        <div class="manager-info-label">Applicant Name:</div>
                        <div class="manager-info-item">{{ manager.manager_name }}</div>
                        <div class="manager-info-label">Applicant Email:</div>
                        <div class="manager-info-item">{{ manager.manager_email }}</div>
                    </div>
                    <div class="manager-actions">
                        <button @click="approveManager(manager.managerId)" class="btn btn-success">Approve</button>
                    </div>
                    <div class="manager-actions">
                        <button @click="rejectManager(manager.managerId)" class="btn btn-danger">Reject</button>
                    </div>
                </div>
                <div v-if="!managers" style="text-align:center;margin-top:30px;color:brown">
                    No requests for new managers.
                </div>
            </div>

            <div v-if="displayType ==='Category Create Requests'" >
                <div v-for="category in categoryCreateRequests" class="manager-row" style="margin-top:10px">
                    <div class="manager-info">
                        <div class="manager-info-label">Category Name:</div>
                        <div class="manager-info-item">{{ category.category_name }}</div>
                    </div>
                    <div class="manager-actions">
                        <button @click="approveCreateCategory(category.categoryId)" class="btn btn-success">Approve</button>
                    </div>
                    <div class="manager-actions">
                        <button @click="rejectCreateCategory(category.categoryId)" class="btn btn-danger">Reject</button>
                    </div>
                </div>
                <div v-if="!categoryCreateRequests" style="text-align:center;margin-top:30px;color:brown">
                    No requests for Create new categories.
                </div>
            </div>

            <div v-if="displayType ==='Category update Requests'" >
                <div v-for="category in categoryUpdateRequests" class="manager-row" style="margin-top:10px">
                    <div class="manager-info">
                        <div class="manager-info-label">Category Name:</div>
                        <div class="manager-info-item">{{ category.category_name }}</div>
                        <div class="manager-info-label">New Name:</div>
                        <div class="manager-info-item">{{ category.category_new_name }}</div>
                    </div>
                    <div class="manager-actions">
                        <button @click="approveUpdateCategory(category)" class="btn btn-success">Update</button>
                    </div>
                    <div class="manager-actions">
                        <button @click="rejectUpdateCategory(category.categoryId)" class="btn btn-danger">Reject</button>
                    </div>
                </div>
                <div v-if="!categoryUpdateRequests" style="text-align:center;margin-top:30px;color:brown">
                    No requests for update categories.
                </div>
            </div>

            <div v-if="displayType ==='Category delete Requests'" >
                <div v-for="category in categoryDeleteRequests" class="manager-row" style="margin-top:10px">
                    <div class="manager-info">
                        <div class="manager-info-label">Category Name:</div>
                        <div style="color:red" class="manager-info-item">{{ category.category_name }}</div>
                    </div>
                    <div class="manager-actions">
                        <button @click="startDeletingCaregory(category)" class="btn btn-danger">Delete</button>
                    </div>
                    <div class="manager-actions">
                        <button @click="rejectDeleteCategory(category.categoryId)" class="btn btn-secondary">Cancel</button>
                    </div>
                </div>
                <div v-if="!categoryDeleteRequests" style="text-align:center;margin-top:30px;color:brown">
                    No requests for delete categories.
                </div>
            </div>

            <div v-if="deletingCategory" class="update-form-container">
                <div class="update-form">
                    <h3 style="text-align:center">{{ deletingCategory.category_name }}</h3>
                    <div class="form-group">
                        <p style="color:red">Are you sure you want delete this category??</p><p style="color:red">All the products accociated with this category will be deleted!!</p>
                    </div>
                    <div class="mb-2 d-flex justify-content-between" style="margin-top:5px">
                        <button style="flex-basis: 48%;width:90px" class="btn btn-danger" @click="approveDeleteCategory(deletingCategory.categoryId)">Delete</button>
                        <button style="flex-basis: 48%" class="btn btn-secondary" @click="cancelDelete">Cancel</button>
                    </div>
                </div>
            </div>
        </div>`,
        data() {
            return {
                managers: null,
                categoryCreateRequests: null,
                categoryUpdateRequests: null,
                categoryDeleteRequests: null,
                items: ['Managers Approval Requests', 'Category Create Requests', 'Category update Requests', 'Category delete Requests'],
                displayType: 'Managers Approval Requests',
                managerMessage: null,
                updateCategoryMessage: null,
                deleteCategoryMessage: null,
                deletingCategory:null
            };
        },
        methods: {
            async handleDisplayTypeChange() {
                switch (this.displayType) {
                    case 'Managers Approval Requests':
                        await this.getManagers();
                        break;
                    case 'Category Create Requests':
                        await this.getCreateRequests();
                        break;
                    case 'Category update Requests':
                        await this.getUpdateRequests();
                        break;
                    case 'Category delete Requests':
                        await this.getDeleteRequests();
                        break;
                }
            },

            async getManagers() {
                try {
                    const res = await fetch('/admin-approval-manager', {
                        method: 'GET',
                        headers: {
                            'Authentication-Token': localStorage.getItem('auth-token'),
                        },
                    });
                    const data = await res.json();
    
                    if (res.ok) {
                        this.managers = data.managers ; 
                        this.managerMessage = data.message;
                    } else {
                        this.error = data.error;
                    }
                } catch (error) {
                    console.error('Error while fetching data', error);
                }
            },
            async approveManager(managerid) {
                await this.approveOrRejectManager('/admin-approval-manager', 'PUT', managerid);
            },
            async rejectManager(managerid) {
                await this.approveOrRejectManager('/admin-approval-manager', 'DELETE', managerid);
            },
            async approveOrRejectManager(endpoint, method, managerid) {
                try {
                    const res = await fetch(endpoint, {
                        method: method,
                        headers: {
                            'Authentication-Token': localStorage.getItem('auth-token'),
                            'Content-Type': 'Application/json',
                        },
                        body: JSON.stringify({
                            managerID: managerid,
                        }),
                    });
    
                    const data = await res.json();
    
                    if (res.ok) {
                        await this.getManagers();
                    } else {
                        console.log('Error', data.error);
                    }
                } catch (error) {
                    console.log('Error while fetching data', error);
                }
            },
            async getCreateRequests() {
                try {
                    const res = await fetch('/create-category-approval', {
                        method: 'GET',
                        headers: {
                            'Authentication-Token': localStorage.getItem('auth-token')
                        }
                    });
                    const data = await res.json();
                    if (res.ok) {
                        this.categoryCreateRequests = data.output;
                        this.createCategoryMessage = null;
                    } else {
                        this.error = data.error;
                    }
                } catch (error) {
                    console.log('There is an unexpected error', error);
                }
            },
            async approveCreateCategory(id) {
                await this.approveOrRejectCategory('/create-category-approval', 'PUT', id);
            },
            async rejectCreateCategory(id) {
                await this.approveOrRejectCategory('/create-category-approval', 'DELETE', id);
            },
            async getUpdateRequests() {
                try {
                    const res = await fetch('/update-category-approval', {
                        method: 'GET',
                        headers: {
                            'Authentication-Token': localStorage.getItem('auth-token')
                        }
                    });
                    const data = await res.json();
                    if (res.ok) {
                        this.categoryUpdateRequests = data.output ;
                        this.updateCategoryMessage = null;
                    } else {
                        this.error = data.error;
                    }
                } catch (error) {
                    console.log('There is an unexpected error', error);
                }
            },
            async approveUpdateCategory(category) {
                await this.approveOrRejectCategory('/update-category-approval', 'PUT', category.categoryId, { new_name: category.category_new_name });
            },
            async rejectUpdateCategory(id) {
                await this.approveOrRejectCategory('/update-category-approval', 'DELETE', id);
            },
            async getDeleteRequests() {
                try {
                    const res = await fetch('/delete-category-approval', {
                        method: 'GET',
                        headers: {
                            'Authentication-Token': localStorage.getItem('auth-token')
                        }
                    });
                    const data = await res.json();
                    if (res.ok) {
                        this.categoryDeleteRequests = data.output;
                        this.deleteCategoryMessage = null;
                    } else {
                        this.error = data.error;
                    }
                } catch (error) {
                    console.log('There is an unexpected error', error);
                }
            },
            async approveDeleteCategory(id) {
                await this.approveOrRejectCategory('/delete-category-approval', 'DELETE', id);
                this.deletingCategory = null
            },
            async rejectDeleteCategory(id) {
                await this.approveOrRejectCategory('/delete-category-approval', 'PUT', id);
            },
            startDeletingCaregory(category){
                this.deletingCategory = category
            },
            cancelDelete(){
                this.deletingCategory = null
            },
            async approveOrRejectCategory(endpoint, method, id, body = {}) {
                try {
                    const res = await fetch(endpoint, {
                        method: method,
                        headers: {
                            'Authentication-Token': localStorage.getItem('auth-token'),
                            'Content-Type': 'Application/json'
                        },
                        body: JSON.stringify({
                            categoryID: id,
                            ...body
                        })
                    });
                    const data = await res.json();
                    if (res.ok) {
                        
                        await this.handleDisplayTypeChange();
                        
                        eventHandler.$emit('categoryCreated');
                    } else {
                        
                        console.error('Error', data.error);
                    }
                } catch (error) {
                    console.log('Error while fetching data', error);
                }
            },
        },
        mounted() {
            this.handleDisplayTypeChange();
        },
};
