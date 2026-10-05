const express = require("express")
const mysql2 = require("mysql2/promise")

const app = express()
const port = 3000


app.use(express.json())

let db

let getDbConnection = async () => {
    if (db) {
        console.log("db already exist")
        return db
    }

    db = await mysql2.createPool({
        host: "localhost",
        port: 3306,
        user: "root",
        database: "store",
        password: "",
        waitForConnections: true,
        connectionLimit: 10
    })

    return db
}

getDbConnection()


// /--------------products----------/
// =========================

app.post("/products", async (req, res, next) => {

    let db = await getDbConnection()

    let { ProductName, Price, StockQuantity, SupplierID} = req.body

    let [result] = await db.execute(`INSERT INTO Products (ProductName, Price, StockQuantity, SupplierID) VALUES (?, ?, ?, ?)`,
        [ProductName, Price, StockQuantity, SupplierID]
    )
    res.json({
        message: "Product created successfully",
        ProductID: result.insertId
    })
})



// =========================

app.get("/products", async (req, res) => {

    let db = await getDbConnection()

    let [data] = await db.execute( `SELECT * FROM Products`)

    res.json(data)
})



// =========================

app.get("/products/:id", async (req, res) => {

    let db = await getDbConnection()

    let [data] = await db.execute(`SELECT * FROM Products WHERE ProductID = ?`,
        [req.params.id]
    )
    res.json(data)
})



// =========================

app.put("/products/:id", async (req, res) => {

    let db = await getDbConnection()

    let { ProductName, Price, StockQuantity, SupplierID } = req.body

    await db.execute(
        `UPDATE Products 
        SET ProductName = ?, 
            Price = ?, 
            StockQuantity = ?, 
            SupplierID = ?
        WHERE ProductID = ?`,
        [ProductName, Price, StockQuantity, SupplierID, req.params.id]
    )

    res.json({
        message: "Product updated successfully"
    })
})



// =========================

app.delete("/products/:id", async (req, res, next) => {

    let db = await getDbConnection()

    await db.execute(`DELETE FROM Products WHERE ProductID = ?`,
        [req.params.id]
    )

    res.json({
        message: "Product deleted successfully"
    })
})





// /---------------Suppliers--------------/


app.post("/suppliers", async (req, res,next) => {
    let db = await getDbConnection()

    let { SupplierName, ContactNumber } = req.body

    let [result] = await db.execute(
        `INSERT INTO Suppliers (SupplierName, ContactNumber) VALUES (?, ?)`,
        [SupplierName, ContactNumber])

    res.json({
        message: "Supplier created successfully",
        SupplierID: result.insertId
    })
})



//=================
app.get("/suppliers", async (req, res) => {
    let db = await getDbConnection()
    let [data] = await db.execute(`SELECT * FROM Suppliers`)

    res.json(data)
})




//==================
app.put("/suppliers/:id", async (req, res) => {
    let db = await getDbConnection()

    let { SupplierName, ContactNumber } = req.body

    await db.execute(
        `UPDATE Suppliers 
        SET SupplierName = ?, 
            ContactNumber = ?
        WHERE SupplierID = ?`,
        [SupplierName, ContactNumber, req.params.id]
    )

    res.json({
        message: "Supplier updated successfully"
    })
})




//===================
app.delete("/suppliers/:id", async (req, res) => {
    let db = await getDbConnection()
    await db.execute(`DELETE FROM Suppliers WHERE SupplierID = ?`,
        [req.params.id]
    )
    res.json({
        message: "Supplier deleted successfully"
    })
})





// /----------------sales-----------------/


app.post("/sales", async (req, res) => {
    let db =  await getDbConnection()
    let { ProductID, QuantitySold, SaleDate } = req.body

    let [result] = await db.execute(`INSERT INTO Sales (ProductID, QuantitySold, SaleDate) values (?, ?, ?)`,
        [ProductID, QuantitySold, SaleDate]
    )

    res.json({
        message: "Sale recorded successfully",
        SaleID: result.insertId
    })
})



//======================
app.get("/sales", async (req, res) => {
    let db = await getDbConnection()
    let [data] = await db.execute(`SELECT * FROM Sales`)
    res.json(data)
})


//=========================
app.get("/sales/product/:id", async (req, res) => {
    let db = await getDbConnection()
    let [data] = await db.execute(`SELECT * FROM Sales WHERE ProductID = ?`,
        [req.params.id]
    )

    res.json(data)
})








/////-----------------------part3-5-----------------------/////
// 1-
app.post("/add-category", async (req, res) => {
    let db = await getDbConnection()

    await db.execute(
        "ALTER TABLE Products ADD Category VARCHAR(100)"
    )

    res.send("Category column added successfully")
})


// 2-
app.delete("/remove-category", async (req, res) => {

    let db = await getDbConnection()

    await db.execute(
        "ALTER TABLE Products DROP COLUMN Category"
    )

    res.send("Category column removed successfully")
})


// 3-
app.put("/change-contact-number", async (req, res) => {

    let db = await getDbConnection()

    await db.execute(
        "ALTER TABLE Suppliers MODIFY ContactNumber VARCHAR(15)"
    )

    res.send("ContactNumber changed successfully")
})


// 4-
app.put("/product-name-not-null", async (req, res) => {

    let db = await getDbConnection()

    await db.execute(
        "ALTER TABLE Products MODIFY ProductName VARCHAR(255) NOT NULL"
    )

    res.send("ProductName is now NOT NULL")
})


// 7-
app.put("/products/bread/price", async (req, res) => {

    let db = await getDbConnection()

    await db.execute(
        `UPDATE Products
        SET Price = 25.00
        WHERE ProductName = 'Bread'`
    )

    res.json({
        message: "Bread price updated successfully"
    })
})


// 8- 
app.delete("/products/eggs", async (req, res) => {
    let db = await getDbConnection()

    await db.execute(
        `DELETE FROM Products WHERE ProductName = ?`,
        ["Eggs"]
    )

    res.json({
        message: "Eggs deleted successfully"
    })
})


// 9- 
app.get("/reports/total-sold", async (req, res) => {
    let db = await getDbConnection()

    let [data] = await db.execute(`
        SELECT 
            Products.ProductName,
            SUM(Sales.QuantitySold) AS TotalQuantitySold
        FROM Sales
        JOIN Products 
        ON Sales.ProductID = Products.ProductID
        GROUP BY Products.ProductID, Products.ProductName
    `)

    res.json(data)
})


// 10-
app.get("/reports/highest-stock", async (req, res) => {
    let db = await getDbConnection()

    let [data] = await db.execute(`
        SELECT ProductName, StockQuantity
        FROM Products
        WHERE StockQuantity = (
            SELECT MAX(StockQuantity)
            FROM Products
        )
    `)

    res.json(data)
})


// 11-
app.get("/reports/suppliers-starting-f", async (req, res) => {
    let db = await getDbConnection()

    let [data] = await db.execute(`
        SELECT *
        FROM Suppliers
        WHERE SupplierName LIKE 'F%'
    `)

    res.json(data)
})


// 12-
app.get("/reports/never-sold", async (req, res) => {
    let db = await getDbConnection()

    let [data] = await db.execute(`
        SELECT Products.*
        FROM Products
        LEFT JOIN Sales
        ON Products.ProductID = Sales.ProductID
        WHERE Sales.ProductID IS NULL
    `)

    res.json(data)
})


// 13-
app.get("/reports/sales-details", async (req, res) => {
    let db = await getDbConnection()

    let [data] = await db.execute(`
        SELECT 
            Products.ProductName,
            Sales.QuantitySold,
            Sales.SaleDate
        FROM Sales
        JOIN Products
        ON Sales.ProductID = Products.ProductID
    `)

    res.json(data)
})



// =========================

app.listen(port, () => {
    console.log("server is running on port " + port)
})