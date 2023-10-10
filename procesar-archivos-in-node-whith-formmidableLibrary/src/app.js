
import http from 'http'
import formidable,{errors as formidableErrors} from 'formidable'
import express from 'express'
import fs from 'fs'
import { error } from 'console'


const app = express()

// midleware cors
app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin', '*'); // Puedes cambiar '*' por un dominio específico

    // Configura los métodos HTTP permitidos
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  
    // Configura las cabeceras personalizadas permitidas
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
    // Habilita las credenciales (cookies y encabezados personalizados) si es necesario
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  
    // Continuar con la solicitud
    next();
})

app.get("/",(req,res)=>{

    res.send("Hola bienvenido a leyendo archivos y otros campos que envia por formdata with ")
})





app.post("/pruebafiles",async(req,res)=>{
    // carpeta donde se crearan las copias de los archivos temporales
    // posteriormente movelas a carpetas correspondientes
    const form = formidable({uploadDir:'./temporalfiles'})

    

    let fields;
    let files;

    try {
        [fields,files] = await form.parse(req)
        // res.send("leida del formdata exitosa")

        const tempFilePath = files.avatar[0].filepath
        const ruteToSaveFile = "./images/" + `${files.avatar[0].originalFilename}`

        console.log("RUTA TEMPORAL DONDE ESTA EL ARCHIVO A HACER MOVIDO",tempFilePath)
        console.log("FILES",files)
        

        fs.rename(tempFilePath,ruteToSaveFile,(error)=>{

            if (error) {
                console.log("error al mover el archivo recibido")
                // res.send("error interno ")
                console.log(error)
            }

        })
    
        

    } catch (error) {
        
        console.log("error",error)
    }

    // console.log("fiels",fields)
    // console.log("files",files)

    
})

// leyendo muchos archivos
app.post("/muchosfiles", async (req,res)=>{

    const form = formidable({uploadDir:'./temporalfiles'})

    const extenImageAllow = ["png","jpg"]

    try {
        const [fields,files] = await form.parse(req)
        // console.log("fields",fields)
        // console.log("files",files)

        // validando y guardando todos los archivos

        // recorremos todos los fiels
        for (const key in files) {
            if (Object.hasOwnProperty.call(files, key)) {

                const file = files[key][0];

                console.log("extencion de file",file.originalFilename.split(".")[1])
                

                // verificamos si es una imagen
                if(file.mimetype.includes("image") && extenImageAllow.includes(file.originalFilename.split(".")[1])){
                    

                    fs.rename(file.filepath,"./images/" + `${file.originalFilename}`,(error)=>{

                        if (error) {
                            console.log("error al mover el archivo recibido")
                            // res.send("error interno ")
                            console.log(error)
                        }
            
                    })
                }else{
                    console.log("error proporcione una imagen",file.originalFilename)
                    
                }

                
                
            }
        }


        // console.log("CANTIDAD DE ARCHIVOS RECIBIDOS",Object.keys(files))
    } catch (error) {
        console.log(error)
    }

})






const server = new http.createServer(app)


const port = process.env.PORT || 3000



server.listen(port,()=>{
    console.log(` Servidor on http://localhost:${port} `)
})