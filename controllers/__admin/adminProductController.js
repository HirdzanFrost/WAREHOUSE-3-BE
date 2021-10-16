const { db } = require('../../database')

module.exports = {
    getAllProdAdmin: (req, res) => {
        //make pagination
        const currentPage = parseInt(req.query.page) || 1 //default query page
        const perPage = parseInt(req.query.perPage) || 8 //default query per page
        let totalProd
        let countItems = `select count(*) as totalItemAdmin from product;`
        db.query(countItems, (errCountItem, resCountItem) => {
            if (errCountItem) {
                res.status(400).send(errCountItem)
            }
            totalProd = resCountItem[0]

            let getProd = `select * from product limit ${db.escape((currentPage - 1) * perPage)}, ${db.escape(perPage)}`

            db.query(getProd, (errGetProd, resGetProd) => {
                if (errGetProd) {
                    res.status(400).send(errGetProd)
                }
                let resultProduct = []
                resultProduct.push(resGetProd, { current_page: currentPage }, { per_page: perPage }, totalProd)
                res.status(200).send(resultProduct)
            })
        })
    },

    getProdAdminDetail: (req, res) => {
        let prodAdminDetail = `select *
        from product p1
        inner join categories c1 on p1.id_categories = c1.id_categories
        inner join (select id_product,  sum(stock_op) as TotalStockOperational 
        from stock group by id_product order by TotalStockOperational) s1
        on p1.id_product = s1.id_product
        where p1.id_product = ${req.params.id}
        group by p1.id_product;`
        db.query(prodAdminDetail, (errProdAdminDetail, resProdAdminDetail) => {
            if (errProdAdminDetail) {
                console.log(errProdAdminDetail)
                res.status(400).send(errProdAdminDetail)
            }
            res.status(200).send(resProdAdminDetail)
        })
    },

    editProduct: (req, res) => {
        let editProd = `update product set ? where id_product=${req.params.id};`
        db.query(editProd, req.body, (errEditProd, resEditProd) => {
            if (errEditProd) {
                console.log(errEditProd)
                res.status(400).send(errEditProd)
            }
            let updateProd = `select * from product p1 
            inner join categories c2 
            on p1.id_categories = c2.id_categories
            where p1.id_product = ${req.params.id}
            group by p1.id_product;`

            db.query(updateProd, (errUpdateProd, resUpdateProd) => {
                if (errUpdateProd) {
                    console.log(errUpdateProd)
                    res.send(400).send(errUpdateProd)
                }
                res.status(200).send(resUpdateProd)
            })
        })
    },

    getCategories: (req, res) => {
        let getCate = `select * from categories;`
        db.query(getCate, (errGetCate, resGetCate) => {
            if (errGetCate) {
                console.log(errGetCate)
                res.status(400).send(errGetCate)
            }
            res.status(200).send(resGetCate)
        })
    },

    getProdDetailStockOperational: (req, res) => {
        let getStockOp = `select p1.id_product, w1.id_warehouse, s1.stock_op, p1.product_name, w1.warehouse_name from stock s1
        inner join product p1 on p1.id_product = s1.id_product
        inner join warehouse w1 on s1.id_warehouse = w1.id_warehouse
        where p1.id_product= ${req.params.id};`
        db.query(getStockOp, (errGetStockOp, resGetStockOp) => {
            if (errGetStockOp) {
                console.log(errGetStockOp)
                res.status(400).send(errGetStockOp)
            }
            res.status(200).send(resGetStockOp)
        })
    },

    uploadEditProdDetail: (req, res) => { 
        const id = +req.params.id
        console.log("file", req.file)

        if (!req.file) {
            res.status(400).send('NO FILE UPLOADED')
        }

        let updateProdImg = `update product set productimg = '${req.file.filename}'
        where id_product=${id};`
        db.query(updateProdImg, (errUpdateProdImg, resUpdateProdImg) => {
            if (errUpdateProdImg) {
                console.log(errUpdateProdImg)
                res.status(400).send(errUpdateProdImg)
            }
            // res.status(200).send(resUpdateProdImg)

            let prodImgUpdated = `select * from product p1 
            inner join categories c2 
            on p1.id_categories = c2.id_categories
            where p1.id_product = ${req.params.id}
            group by p1.id_product;`

            db.query(prodImgUpdated, (errProdImgUpdated, resProdImgUpdated) => {
                if (errProdImgUpdated) {
                    console.log(errProdImgUpdated)
                    res.status(400).send(errProdImgUpdated)
                }
                let resultUploadImg = resProdImgUpdated
                resultUploadImg.push({ success: true })
                res.status(200).send(resultUploadImg)
            })
        })
    },

    editStock: (req, res) => { //di edit product admin page
        const { stockOp, idx } = req.body
        let editStockOp = `UPDATE warehouse.stock 
        SET stock_op = ${stockOp} 
        WHERE (id_product = ${req.params.id}) AND (id_warehouse = ${idx});`

        db.query(editStockOp, (errEditStockOp, resEditStockOp) => {
            if (errEditStockOp) {
                console.log(errEditStockOp)
                res.status(400).send(errEditStockOp)
            }
            res.status(200).send(resEditStockOp)
        })
    },

    addProduct: (req, res) => { 
        const {name, category, description, price} = req.body
        console.log(req.body)

        if(!name || !category || !description || !price){
            res.status(400).send("Please input all of data !")
        }

        let addProduct = `insert into product(product_name, id_categories, product_price, productimg, product_description )
        values(${db.escape(name)}, ${db.escape(category)}, ${db.escape(price)}, "pics", ${db.escape(description)});`

        db.query(addProduct, (errAddProduct, resAddProduct)=>{
            if(errAddProduct){
                console.log(errAddProduct)
                res.status(400).send(errAddProduct)
            }
            let getProdIDupdated = `select id_product from product where product_name=${db.escape(name)} and product_price=${db.escape(price)}`
            db.query(getProdIDupdated, (errGetProdID, resGetProdID)=>{
                if(errGetProdID){
                    console.log(errGetProdID)
                    res.status(400).send(errGetProdID)
                }
                res.status(200).send(resGetProdID[0])
            })
        })
    },

    deleteProduct: (req, res)=>{
        const prodName = req.params.name
        let delProd = `delete from product where id_product = ${db.escape(req.params.id)};`
        db.query(delProd,(errDelProd, resDelProd)=>{
            if(errDelProd){
                console.log(errDelProd)
                res.status(400).send(errDelProd)
            }
            const currentPage = parseInt(req.params.page) || 1
            const perPage = parseInt(req.params.perPage) || 8

            let totalProd

            let countItems =`select count(*) as totalItemAdmin from product;`
            db.query(countItems,(errCountItem, resCountItem)=>{
                if(errCountItem){
                    res.status(400).send(errCountItem)
                }
                totalProd=resCountItem[0]

                let getProd= `select * from product limit ${db.escape((currentPage - 1) * perPage)}, ${db.escape(perPage)}`

                db.query(getProd,(errGetProd, resGetProd)=>{
                    if(errGetProd){
                        res.status(400).send(errGetProd)
                    }
                    let resultProduct = []
                    resultProduct.push(resGetProd, {current_page: currentPage}, {per_page: perPage}, totalProd, {message: `${prodName} successfully deleted`})
                    res.status(200).send(resultProduct)
                })
            })
        })
    },

    // addCategories: (req, res) => {
    //     const {cate_name} =req.body
    //     let addCate = `insert into categories(category_name)
    //     values(${db.escape(cate_name)}`

    //     db.query(cate_name,(errAddCate, resAddCate)=>{
    //         if(errAddCate){
    //             console.log(errAddCate)
    //             res.status(400).send(errAddCate)
    //         }
    //         res.status(200).send(resAddCate)
    //     })
    // },

    // editCategories: (req, res)=>{
    //     const{cate_name}= req.body
    //     let updateCate = `update categories set category_name=${db.escape(cate_name)} where id_categories=${req.params.id};`
    //     db.query(updateCate,(errUpdateCate, resUpdateCate)=>{
    //         if(errUpdateCate){
    //             console.log(errUpdateCate)
    //             res.status(400).send(errUpdateCate)
    //         }
    //         res.status(200).send('Category has been edited')
    //     })
    // },

    // deleteCategories: (req, res)=>{
    //     let delCate = `delete from categories where id_categories=${req.params.id};`
    //     db.query(delCate,(errDelCate, resDelCate)=>{
    //         if(errDelCate){
    //             console.log(errDelCate)
    //             res.status(400).send(errDelCate)
    //         }
    //         res.status(200).send(resDelCate)
    //     })
    // },

}