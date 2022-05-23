const express = require('express')
const app = express();
require('dotenv').config();
const jwt = require('jsonwebtoken');

const cors = require('cors');
app.use(cors())
app.use(express.json())


const port = process.env.PORT || 5000


app.get('/', (req, res) => {
    res.send('Alhamdulillah, it is working manufacture e')
})

app.listen(port, () => {
    console.log('listen hosce')
})



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dj2im.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect();
        const toolsCollection = client.db("manufacturer").collection("tools");

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


        app.post('/service', async (req, res) => {

            const newService = req.body;
            const result = await serviceCollection.insertOne(newService);
            res.send({ result: "sucess" })
            console.log(`A document was inserted with the _id: ${result.insertedId}`);

        })

        // delete a user
        app.delete('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await serviceCollection.deleteOne(query);
            res.send(result);
        })
    }
    finally {

    }
}



run().catch(console.dir);
