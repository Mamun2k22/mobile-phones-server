const express = require('express');
const cors = require('cors');
// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express(); // express start

// middle ware
app.use(cors());
app.use(express.json());


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({
            message: 'unauthorized access'
        })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({
                message: 'unauthorized access'
            })
        }
        req.decoded = decoded;
        next();
    })
};


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ldmt6s4.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run() {
    try {
        const categoryCollection = client.db('phoneResale').collection('categoryname');
        const productsCollection = client.db('phoneResale').collection('products');
        const userCollection = client.db('phoneResale').collection('users');
        const bookingCollection = client.db('phoneResale').collection('bookings');
        const paymentsCollection = client.db('phoneResale').collection('payments');

        //Data loading

        const verifyAdmin = async (req, res, next) => {
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await userCollection.findOne(query);

            if (user?.role !== 'admin') {
                return res.status(403).send({ message: ' forbidden access' })
            }
            next();
        }





        app.get('/products', async (req, res) => {
            const query = {};
            const products = await productsCollection.find(query).toArray();
            res.send(products);
        });

        // product get by email 
        app.get('/myproducts', async (req, res) => {
            let email = req.query.email;
            const query = { email: email };
            const products = await productsCollection.find(query).toArray();
            res.send(products);
        });


        // delete product 
        app.delete('/products/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(filter);
            res.send(result);
        });

        app.get('/categories', async (req, res) => {
            const query = {};
            const category = await categoryCollection.find(query).toArray();
            res.send(category);
        });

        app.get('/category/Products/:name', async (req, res) => {
            const category = req.params.name;
            const categoryName = await productsCollection.find({ categoryname: category }).toArray();
            res.send(categoryName);
        });



        // post user details 
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.send(result);
        });
        //add products 
        app.post('/products', async (req, res) => {
            const user = req.body;
            const result = await productsCollection.insertOne(user);
            res.send(result);
        });

        // get all users 
        app.get('/users', async (req, res) => {
            const query = {}
            const users = await userCollection.find(query).toArray();
            res.send(users);

        });


        app.get('/user', async (req, res) => {
            const email = req.query.email
            const query = { email: email }
            const users = await userCollection.findOne(query);
            res.send(users);
        });



        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking);
            res.send(result);
        });
        // booking Get by email 
        app.get('/bookings', verifyJWT, async (req, res) => {
            let email = req.query.email;
            const query = { email: email };
            const booking = await bookingCollection.find(query).toArray();
            res.send(booking);

        });
        app.get('/paybooking/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await bookingCollection.findOne(filter);
            res.send(result);
        });



    }

    finally {

    }
}
run().catch(console.log);

app.get('/', async (req, res) => {
    res.send('Resale Phone Running Server');
})
app.listen(port, () => console.log(`Buy and Sell & Running ${port}`));