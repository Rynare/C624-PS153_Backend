
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const ATLAS_USERNAME = process.env.ATLAS_USERNAME
const ATLAS_PASSWORD = process.env.ATLAS_PASSWORD
const ATLAS_DBNAME = process.env.ATLAS_DBNAME
const uri = `mongodb+srv://${ATLAS_USERNAME}:${ATLAS_PASSWORD}@atlascluster.in29yhr.mongodb.net/?retryWrites=true&w=majority&appName=AtlasCluster`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


const KulineryDB = {
    getConnection() {
        return client.db(ATLAS_DBNAME);
    },

    async getTotalItem(table_name) {
        const database = this.getConnection();
        const collection = database.collection(table_name);
        // collection.
    },

    async insertData({ table_name, data }) {
        return await this.handleOperation(table_name, (collection) => collection.insertOne(data));
    },

    async insertDatas({ table_name, datas, option }) {
        option = option || { ordered: true };
        return await this.handleOperation(table_name, (collection) => collection.insertMany(datas, option));
    },

    async findData({ table_name, filter, options }) {
        return await this.handleOperation(table_name, (collection) => collection.findOne(filter, options));
    },

    async findDatas({ table_name, filter, options }) {
        return await this.handleOperation(table_name, (collection) => collection.find(filter, options).toArray());
    },

    async updateData({ table_name, filter, updateDoc, options }) {
        return await this.handleOperation(table_name, (collection) => collection.updateOne(filter, updateDoc, options));
    },

    async updateDatas({ table_name, filter, updateDoc }) {
        return await this.handleOperation(table_name, (collection) => collection.updateMany(filter, updateDoc));
    },

    async replaceData({ table_name, filter, replacement }) {
        return await this.handleOperation(table_name, (collection) => collection.replaceOne(filter, replacement));
    },

    async deleteData({ table_name, filter }) {
        return await this.handleOperation(table_name, (collection) => collection.deleteOne(filter));
    },

    async deleteDatas({ table_name, filter }) {
        return await this.handleOperation(table_name, (collection) => collection.deleteMany(filter));
    },

    async handleOperation(table_name, operation) {
        const database = this.getConnection();
        const collection = database.collection(table_name);
        return await operation(collection);
    }
};

module.exports = { KulineryDB }
