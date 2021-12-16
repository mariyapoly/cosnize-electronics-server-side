const express = require('express');
const app = express();
var cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const fileUpload = require('express-fileupload');

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pgqwc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



async function run() {

    try {
        await client.connect();

        const database = client.db("cosinazieElectornics");
        const cameraCollection = database.collection("cameraProducts");
        const tvCollection = database.collection("tvProducts");
        const allProductsCollection = database.collection("allProducts");
        const cartProductsCollection = database.collection("cartProducts");
        const wishListProductCollection = database.collection("wishListProducts");
        const reviewCollection = database.collection("userReview");

        // get camera Product
        app.get('/cameraProduct', async (req, res) => {
            const result = await cameraCollection.find({}).toArray();
            res.send(result)
        })
         // get tv Product
        app.get('/tvProduct', async (req, res) => {
            const result = await tvCollection.find({}).toArray();
            res.send(result)
        })
         // get All Product
        app.get('/allProduct', async (req, res) => {
            const result = await allProductsCollection.find({}).toArray();
            res.send(result)
        })
         // get all Product by Id
        app.get('/allProduct/:id', async (req, res) => {
            const id = req?.params?.id;
            const query = { _id: ObjectId(id) };
            const result = await allProductsCollection.findOne(query);
            res.send(result)
        })
         // uplaod data cart Product
        app.post('/cartProduct', async (req, res) => {
            const cursor = req.body;
            const result = await cartProductsCollection.insertOne(cursor);
            res.send(result)
        })
        
        // get cart Product by email
        app.get('/cartProduct/:email', async (req, res) => {
            const email = req?.params?.email;
            const query = { email: email }
            const result = await cartProductsCollection.find(query).toArray();
            res.send(result)
        })
        // get cart Product by id
        app.delete('/cartProduct/:id', async (req, res) => {
            const id = req?.params?.id;
            const query = { _id: ObjectId(id) }
            const result = await cartProductsCollection.deleteOne(query);
            res.send(result)
        })
        // uplaod data wishList Product
        app.post('/wishListProduct', async (req, res) => {
            const cursor = req.body;
            const result = await wishListProductCollection.insertOne(cursor);
            console.log(result);
            res.send(result)
        })
        // get wishList Product by email
        app.get('/wishListProduct/:email', async (req, res) => {
            const email = req?.params?.email;
            const query = { email: email }
            const result = await wishListProductCollection.find(query).toArray();
            res.send(result)
        })
         // get cart Product by id
        app.delete('/wishListProduct/:id', async (req, res) => {
            const id = req?.params?.id;
            const query = { _id: ObjectId(id) }
            const result = await wishListProductCollection.deleteOne(query);
            res.send(result)
        })
         // get all  Review data
        app.get('/allReview', async (req, res) => {
            const result = await reviewCollection.find({}).toArray();
            res.send(result)
        })
         // upload review data
        app.post('/addReview', async (req, res) => {
            const name = req.body.name;
            const des = req.body.des;
            const pic = req.files.img;
            const picData = pic.data;
            const encodedPic = picData.toString('base64');
            const images = Buffer.from(encodedPic, 'base64');
            const client = {
                name,
                des,
                images
            };
            const result = await reviewCollection.insertOne(client);

            res.json(result);

        })






    } finally {
        // await client.close();
    }


}
run().catch(console.dir);







app.get('/', (req, res) => {
    res.send('cosnize server running')
})

app.listen(port, () => {
    console.log(`cosnize server running port`, port)
})