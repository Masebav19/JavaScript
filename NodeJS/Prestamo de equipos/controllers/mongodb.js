const { MongoClient, ObjectId } = require('mongodb')
const dotenv = require('dotenv')

dotenv.config()

exports.write_mongo = async function(data={}){
    const client = new MongoClient(process.env.MONGO_URL)
    try {
        await client.connect();
        const db = client.db(process.env.MONGO_DB_NAME)
        let collection = db.collection(process.env.MONGO_COLLECTION_NAME)
        await collection.insertOne(data)

        collection = db.collection(process.env.MONGO_COLLECTION_DEVICES)
        const filter = {Modelo: data.Modelo};
        const updateDoc = {
            $inc: { "Numero": -1 }
          };
        await collection.updateOne(filter, updateDoc);
        
        return "Dato insertado"
    } catch (error) {
        console.log("Hubo un error al insertar el documento: "+error)
        return "Dato no insertado"
    }
}

exports.read_mongo = async function(email="",model=""){
    const client = new MongoClient(process.env.MONGO_URL)
    try{
        const db = client.db(process.env.MONGO_DB_NAME)
        const collection = db.collection(process.env.MONGO_COLLECTION_NAME)
        const data = await collection.find({email: email, Modelo: model}).toArray();
        return data
    }catch (error){
        console.log("No se pudo leer los datos: "+ error)
        return undefined
    }
}

exports.change_data=async function(id=''){
    const client = new MongoClient(process.env.MONGO_URL)
    try{
        const db = client.db(process.env.MONGO_DB_NAME)
        let collection = db.collection(process.env.MONGO_COLLECTION_NAME)
        let filter = {_id: new ObjectId(id)};
        let updateDoc = {
            $set: {
                Estado_prestamo: 'Devuelto'
            },
          };
        await collection.updateOne(filter, updateDoc);
        const data = await collection.findOne(filter)

        collection = db.collection(process.env.MONGO_COLLECTION_DEVICES)
        filter = {Modelo: data.Modelo};
        updateDoc = {
            $inc: { "Numero": 1 }
          };
        await collection.updateOne(filter, updateDoc);

        return 'Actualizado'
    }catch (error){
        console.log("No se pudo leer los datos: "+ error)
        return 'No actualizado'
    }
}

exports.check_user = async function(user = "",password =""){
    const client = new MongoClient(process.env.MONGO_URL)
    try{
        const db = client.db(process.env.MONGO_DB_NAME)
        const collection = db.collection(process.env.MONGO_COLLETION_USER_NAME)
        const filter = {
            User : user,
            Password: password
        };
        const result = await collection.findOne(filter)
        return [Boolean(result),user]
    }catch (error){
        console.log("No se pudo leer los datos: "+ error)
        return [false,'no_user']
    }
}

exports.read_mongo2 = async function(Estado_prestamo=""){
    const client = new MongoClient(process.env.MONGO_URL)
    try{
        const db = client.db(process.env.MONGO_DB_NAME)
        const collection = db.collection(process.env.MONGO_COLLECTION_NAME)
        if (Estado_prestamo != "Todos"){
            const filter ={
                Estado_prestamo: Estado_prestamo
            };
            const options = {
                sort: { Fecha: -1 },
              };
            const data = await collection.find(filter,options).toArray();
            return data
        }else{
            const filter={
                Nombre: { $ne: "" }
            }
            const options = {
                sort: { Fecha: -1 },
              };
            const data = await collection.find(filter,options).toArray()
            return data
        }
        
    }catch (error){
        console.log("No se pudo leer los datos: "+ error)
        return undefined
    }
}
exports.available_devices=async function(){
    const client = new MongoClient(process.env.MONGO_URL)
    try{
        const db = client.db(process.env.MONGO_DB_NAME)
        const collection = db.collection(process.env.MONGO_COLLECTION_DEVICES)
        const filter ={
            Numero: { $gt: 0 }
        }
        const data = await collection.find(filter).toArray();
        return data
    }catch (error){
        console.log("No se pudo leer los datos: "+ error)
        return undefined
    }
}

exports.get_let_devices = async function (){
    const client = new MongoClient(process.env.MONGO_URL)
    try{
        const db = client.db(process.env.MONGO_DB_NAME)
        const collection = db.collection(process.env.MONGO_COLLECTION_NAME)
        const filter ={
            Estado_prestamo: { $eq: "Prestado" }
        }
        const data = await collection.find(filter).toArray();
        return data
    }catch (error){
        console.log("No se pudo leer los datos: "+ error)
        return undefined
    }
}