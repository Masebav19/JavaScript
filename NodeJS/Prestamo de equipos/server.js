const express = require('express')
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

const app = express()

dotenv.config()

app.set('view engine','ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/',(req,res)=>{
    res.render('main.ejs')
})

app.post('/',(req,res)=>{
    const data = req.body.option;
    res.render(`${data}.ejs`,{data:{},state:false})
})

app.post('/prestamo',(req,res)=>{
    const {Name, mail, dev_model, dev_ip,  dev_st} = req.body;
    const date = new Date();
    const data={
        Nombre : Name,
        email : mail,
        Modelo: dev_model,
        Direccion_IP : dev_ip,
        Estado: dev_st,
        Estado_prestamo: "Prestado",
        Fecha : date.toUTCString()
    };
    require('./controllers/mongodb.js').write_mongo(data).then(response =>{
        if (response) {
            res.render('prestamo.ejs',{data : data, state : response})
        }else{
            res.render('prestamo.ejs',{data : {}, state : response})
        }
    }).catch(() =>{
        res.render('prestamo.ejs',{data : {}, state : false}) 
    });
})

app.post('/devolucion',(req,res)=>{
    const {mail,dev_model} = req.body;
    require('./controllers/mongodb.js').read_mongo(mail,dev_model).then(data=>{
        if (Boolean(data)){
            const Data = data;
            res.render('devolucion.ejs',{data:Data,state: true})
        }else{
            res.render('devolucion.ejs',{data:undefined,state: true})
        }
        
    }).catch(()=>{
        res.render('devolucion.ejs',{data:undefined,state: false})
    })
    
})

app.get('/devolucion_hecha',(req,res)=>{
    const id = req.query._id;
    require('./controllers/mongodb.js').change_data(id).then(state =>{
        if (state == "Actualizado"){
            res.render('devolucion_hecha.ejs',{state: state})
        }else{
            res.render('devolucion_hecha.ejs',{state: state})
        }
    }).catch(()=>{
        res.render('devolucion_hecha.ejs',{state: false})
    })

})

app.post('/mostrar_detalle',async (req,res)=>{
    const user = req.body.User;
    const password = req.body.Password;
    [state,User]=await require('./controllers/mongodb.js').check_user(user,password)
    if (state){
        res.render('mostrar_detalle.ejs',{data:false,user: User})
    }else{
        res.render('error.ejs')
    }

})

app.post('/mostrar_detalle2',async (req,res)=>{
    const Estado_prestamo = req.body.option;
    data=await require('./controllers/mongodb.js').read_mongo2(Estado_prestamo)
    res.render('mostrar_detalle.ejs',{data:data,user: ""})
    
})
app.listen(process.env.SERVER_PORT, ()=>{
    console.log(`Servidor escuchando en el puerto ${process.env.SERVER_PORT}`)
})
