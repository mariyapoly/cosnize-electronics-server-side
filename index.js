const express = require('express');
const app = express();
var cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const fileUpload = require('express-fileupload');
const stripe = require("stripe")(process.env.STRYPE_SECRET);


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
        const userCollection = database.collection("users");


        // saved user info
        app.post('/user', async (req, res) => {
            const cursor = req.body;
            const result = await userCollection.insertOne(cursor);
            res.send(result)
        })
        // get saved user info
        app.get('/makeAdmin/:email', async (req, res) => {
            const email = req?.params?.email;
            const query = { email: email };
            const result = await userCollection.findOne(query);
            res.send(result)
        })
        // add admin role
        app.put('/addAdmin/:email', async (req, res) => {
            const email = req?.params?.email;
            const query = { email: email }
            if (query) {
                const updateDoc = {
                    $set: {
                        role: `admin`
                    },
                };
                const result = await userCollection.updateOne(query, updateDoc);
                res.send(result)
            }
        })
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
        // get All Product
        app.post('/allProduct', async (req, res) => {
            const cursor = req.body;
            const result = await allProductsCollection.insertOne(cursor);
            res.send(result)
        })
        // get all Product by Id
        app.get('/allProduct/:id', async (req, res) => {
            const id = req?.params?.id;
            const query = { _id: ObjectId(id) };
            const result = await allProductsCollection.findOne(query);
            res.send(result)
        })
        // get camera Product by Id
        app.get('/cameraProduct/:id', async (req, res) => {
            const id = req?.params?.id;
            const query = { _id: ObjectId(id) };
            const result = await cameraCollection.findOne(query);
            res.send(result)
        })
        // delete one Product by Id
        app.delete('/allProduct/:id', async (req, res) => {
            const id = req?.params?.id;
            const query = { _id: ObjectId(id) };
            const result = await allProductsCollection.deleteOne(query);
            res.send(result)
        })
        // uplaod data cart Product
        app.post('/cartProduct', async (req, res) => {
            const cursor = req.body;
            const result = await cartProductsCollection.insertOne(cursor);
            res.send(result)
        })
        // get cart  all Product 
        app.get('/cartProduct', async (req, res) => {
            const result = await cartProductsCollection.find({}).toArray();
            res.send(result)
        })
        // get cart Product by email
        app.get('/cartProduct/:email', async (req, res) => {
            const email = req?.params?.email;
            const query = { email: email }
            const result = await cartProductsCollection.find(query).toArray();
            res.send(result)
        })
        // update cart Product by email
        app.put('/cartProduct/:email', async (req, res) => {
            const email = req?.params?.email;
            const payment = req.body;
            const filter = { email: email }
            const updateDoc = {
                $set: {
                    payment: payment
                },
            };
            const result = await cartProductsCollection.updateMany(filter, updateDoc);
            res.send(result)
        })
        // get cart Product by id
        app.delete('/cartProduct/:id', async (req, res) => {
            const id = req?.params?.id;
            const query = { _id: ObjectId(id) }
            const result = await cartProductsCollection.deleteOne(query);
            res.send(result)
        })
        // update status cart Product by id
        app.put('/statusProduct/:id', async (req, res) => {
            const id = req?.params?.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: 'update'
                },
            };
            const result = await cartProductsCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        })
        // uplaod data wishList Product
        app.post('/wishListProduct', async (req, res) => {
            const cursor = req.body;
            const result = await wishListProductCollection.insertOne(cursor);
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
        // upload review data and image base64
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

        // payment
        app.post("/create-payment-intent", async (req, res) => {
            const paymentInfo = req.body;
            const amount = paymentInfo.price * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: "usd",
                payment_method_types: ['card'],
            });

            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        });




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