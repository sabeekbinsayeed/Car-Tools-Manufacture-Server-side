const express = require('express')
const app = express();
require('dotenv').config();
const jwt = require('jsonwebtoken');

const cors = require('cors');
app.use(cors())
app.use(express.json())

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const port = process.env.PORT || 5000


app.get('/', (req, res) => {
    res.send('Alhamdulillah, it is working manufacture e')
})

app.listen(port, () => {
    console.log('listen hosce successfully')
})



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dj2im.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'UnAuthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        req.decoded = decoded;// karon amara niche email ta pathaisilam jwt token er time e 
        next();
    });
}


async function run() {
    try {
        await client.connect();
        const toolsCollection = client.db("manufacturer").collection("tools");
        const purchaseCollection = client.db("manufacturer").collection("purchase");
        const paymentCollection = client.db("manufacturer").collection("payment");
        const reviewCollection = client.db("manufacturer").collection("review");
        const userCollection = client.db("manufacturer").collection("user");
        const profileCollection = client.db("manufacturer").collection("profileCollection");
        const verifyAdmin = async (req, res, next) => {
            const requester = req.decoded.email;
            const requesterAccount = await userCollection.findOne({ email: requester });
            console.log('admin e dhukse')
            if (requesterAccount.role === 'admin') {
                next();
            }
            else {
                res.status(403).send({ message: 'forbidden' });
                console.log('admin e error hosce')
            }
        }
        app.get('/tools', async (req, res) => {
            const query = {};
            const cursor = toolsCollection.find(query);
            const tools = await cursor.toArray();
            res.send(tools);
        });


        app.get('/tools/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const tool = await toolsCollection.findOne(query);
            res.send(tool);
        });

        app.post('/tools', async (req, res) => {

            const newtool = req.body;
            const result = await toolsCollection.insertOne(newtool);
            res.send({ result: "sucess" })
            console.log(`A document was inserted again with the _id: ${result.insertedId}`);

        })


        // app.delete('/tool/:_id', async (req, res) => {
        //     const _id = req.params._id;
        //     const filter = { _id: _id };
        //     const result = await toolsCollection.deleteOne(filter);
        //     res.send(result);
        // })
        app.delete('/tool/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await toolsCollection.deleteOne(query);
            res.send(result);
        })
        app.post('/profile', async (req, res) => {

            const newuser = req.body;
            const result = await profileCollection.insertOne(newuser);
            res.send({ result: "sucess" })
            console.log(`A document was inserted with the _id: ${result.insertedId}`);

        })
        app.patch('/profile/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const payment = req.body;
            const filter = { _id: ObjectId(id) };
            const updatedDoc = {
                $set: {
                    location: payment.location,
                    phone: payment.phone,
                    education: payment.education
                }
            }

            // const result = await paymentCollection.insertOne(payment);
            const updatedResult = await profileCollection.updateOne(filter, updatedDoc);
            res.send(updatedResult);
        })

        app.get('/profile', async (req, res) => {
            console.log(req.query.email)
            // const authorization = req.headers.authorization;
            // console.log(authorization)

            const email = req.query.email;
            console.log(email, 'profile')
            const query = { email: email };
            const profile = await profileCollection.find(query).toArray();
            res.send(profile);



        })


        app.post('/purchase/', async (req, res) => {

            const newPurchase = req.body;
            const result = await purchaseCollection.insertOne(newPurchase);
            res.send({ result: "sucess" })
            console.log(`A document was inserted with the _id: ${result.insertedId}`);

        })

        app.get('/purchase/', async (req, res) => {
            const email = req.params.email;
            const query = {};
            const order = await purchaseCollection.findOne(query);
            res.send(order);
        })

        app.delete('/purchase/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const result = await purchaseCollection.deleteOne(filter);
            res.send(result);
        })

        app.get('/order', async (req, res) => {
            console.log(req.query.email)
            // const authorization = req.headers.authorization;
            // console.log(authorization)

            const email = req.query.email;
            const query = { email: email };
            const purchases = await purchaseCollection.find(query).toArray();
            return res.send(purchases);
            // const query = { email: email };
            // const purchases = await purchaseCollection.find(query).toArray();
            // return res.send(purchases);

            // const decodedEmail = req.decoded.email;
            // if (email === decodedEmail) {
            //     const query = { email: email };
            //     const purchases = await purchaseCollection.find(query).toArray();
            //     return res.send(purchases);
            // }
            // else {
            //     return res.status(403).send({ message: 'forbidden access' });
            // }


        })

        //review
        app.get('/review', async (req, res) => {
            const query = {};
            const cursor = reviewCollection.find(query);
            const review = await cursor.toArray();
            res.send(review);
        });

        app.post('/review', async (req, res) => {

            const newReview = req.body;
            const result = await reviewCollection.insertOne(newReview);
            res.send({ result: "sucess" })
            // console.log(`A document was inserted with the _id: ${result.insertedId}`);

        })

        // delete a user
        app.delete('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await serviceCollection.deleteOne(query);
            res.send(result);
        })

        app.get('/purchase/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const purchase = await purchaseCollection.findOne(query);
            res.send(purchase);
        })


        app.patch('/purchase/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const payment = req.body;
            const filter = { _id: ObjectId(id) };
            const updatedDoc = {
                $set: {
                    paid: true,
                    transactionId: payment.transactionId
                }
            }

            const result = await paymentCollection.insertOne(payment);
            const updatedResult = await purchaseCollection.updateOne(filter, updatedDoc);
            res.send(updatedResult);
        })


        app.post('/create-payment-intent', async (req, res) => {
            const purchase = req.body;

            const price = purchase.pricePrice;

            const amount = price * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'usd',
                payment_method_types: ['card']
            });
            res.send({ clientSecret: paymentIntent.client_secret })

        });


        // app.get('/user', async (req, res) => {

        //     const users = await userCollection.find().toArray();
        //     console.log('problem ki', users)
        //     res.send(users);
        // });

        app.get('/user', async (req, res) => {
            const query = {};
            const cursor = userCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        // app.patch('/user/:id', verifyJWT, async (req, res) => {
        //     const id = req.params.id;
        //     const user = req.body;
        //     const filter = { _id: ObjectId(id) };
        //     const updatedDoc = {
        //         $set: {
        //             education: user.education,
        //             location: user.location,
        //             phone: user.phone,
        //             linkedin: user.linkedin,

        //             transactionId: payment.transactionId
        //         }
        //     }

        //     //const result = await userCollection.insertOne(user);
        //     const updatedResult = await userCollection.updateOne(filter, updatedDoc);
        //     res.send(updatedResult);
        // })


        app.put('/user/admin/:email', verifyJWT, verifyAdmin, async (req, res) => {
            const email = req.params.email;
            console.log('dhukse')
            const filter = { email: email };
            const updateDoc = {
                $set: { role: 'admin' },
            };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result);
        })


        app.put('/user/:email', async (req, res) => {
            console.log('eikhane dhukse user /email')
            const email = req.params.email;
            const user = req.body;
            console.log(user, 'user')
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);

            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            // // const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ result, token });
        })

        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const user = await userCollection.findOne({ email: email });
            const isAdmin = user.role === 'admin';
            res.send({ admin: isAdmin })
        })

    }
    finally {

    }
}



run().catch(console.dir);
