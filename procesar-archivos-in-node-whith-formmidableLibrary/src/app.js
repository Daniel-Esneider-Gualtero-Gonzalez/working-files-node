
import http from 'http'
import formidable,{errors as formidableErrors} from 'formidable'
import express from 'express'
import {promises as fsPromises} from 'fs'

import path from 'path'
import { fileURLToPath } from 'url';
import { dirname } from 'path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);




// fs.unlink(deleteFile,(err)=>{
//     if(err){
//         console.log("error al eliminar el archivo",err)
//     }else{
//         console.log("EXITOS AL ELIMINAR EL FILE")
//     }
// })



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

    //  los archivos temporales se guardan por defecto en el disco C:
    // pero yo tengo el proyecto en d y hay problemas a accceder a ese recurso
    // entonces lo que se hace en asignarle una carpete en mi disco que cuando me envien archivos
    // cree una copia en mi proyecto para posteriormente procesarlos 

    // carpeta donde se crearan las copias de los archivos temporales
    // posteriormente movelas a carpetas correspondientes
    const form = formidable({uploadDir:'./temporalfiles',allowEmptyFiles:true})

    


    try {
        const [fields,files] = await form.parse(req)
        // res.send("leida del formdata exitosa")

        const tempFilePath = files.avatar[0].filepath
        const ruteToSaveFile = "./images/" + `${files.avatar[0].originalFilename}`

        console.log("RUTA TEMPORAL DONDE ESTA EL ARCHIVO A HACER MOVIDO",tempFilePath)
        console.log("FILES",files)
        

        // mueve el archivo que
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

   
    
})

// leyendo muchos archivos 
// NOTAAAAA AL INTENTAR ELIMINAR EL ARCHIVO EN LA CARPETA TEMPORAL DESPUES DE AVER COPIADO ESE ARCHIVO Y GUARDADO EN OTRA CARPETA 
// HAY COMO UN BUG , ME CAMBIA EL NOMBRE DEL ARCHIVO Y CUANDO INTENTO ELIMINARLO NO FUNCIONA
// POR LO DICHO
app.post("/muchosfiles", async (req,res)=>{

    //  los archivos temporales se guardan por defecto en el disco C:
    // pero yo tengo el proyecto en d y hay problemas a accceder a ese recurso
    // entonces lo que se hace en asignarle una carpete en mi disco que cuando me envien archivos
    // cree una copia en mi proyecto para posteriormente procesarlos 

    const form = formidable({uploadDir:'./temporalfiles',allowEmptyFiles:true,minFileSize:0})

    const extenImageAllow = ["png","jpg"]

    try {
        const [fields,files] = await form.parse(req)
        

        // validando y guardando todos los archivos

        // recorremos todos los fiels
        for (const key in files) {
            if (Object.hasOwnProperty.call(files, key)) {

                const file = files[key][0];

                
                

               if(file !== undefined || file !== null){
                

                // console.log("ruta de la imagen en temporal",file.filepath)
                   
                    // verificamos si es una imagen
                if(file.mimetype.includes("image") && extenImageAllow.includes(file.originalFilename.split(".")[1])){
                    console.log("file",file.filepath)


                    try {
                        let filePathToDelete = file.filepath.split("\\")

                         filePathToDelete[5] = filePathToDelete[5].slice(0,filePathToDelete[5].length -1) + "1"
                        // console.log("file separandolo por \\",filePathToDelete)
                        const filePathWithJoin = filePathToDelete.join("\\\\")
                        console.log("file UNIDOOOOOOOOOO por \\",filePathWithJoin)

                        const saveFileIn = path.join(__dirname,"images",file.originalFilename)

                        const uploadFile = await fsPromises.copyFile(file.filepath ,saveFileIn)
                        
                        const delFileTemp = await fsPromises.unlink(file.filepath) 
                        
                    } catch (error) {
                        console.log("error al mover el archivo recibido",error)
                    }
                    
                
                    
                }else{
                    console.log("error proporcione una imagen",file.originalFilename)
                } 

               }

                
                
            }
        }


        // console.log("CANTIDAD DE ARCHIVOS RECIBIDOS",Object.keys(files))
    } catch (error) {
        console.log(error)
    }

})



// ELIMINANDO EL CONTENIDO DE LA CARPETA TEMPORAL DESPUES DE PROCESAR LOS ARCHIVO GUARDADOS ES ESTAS

app.post("/filesDelfolder",async (req,res)=>{

    const form = formidable({uploadDir:'./temporalfiles',allowEmptyFiles:true,minFileSize:0})
    const filesTempDelete = path.join(__dirname,"temporalfiles")

    try {
        const [fields,files] = await form.parse(req)

        // guardar los archivos en otra carpeta

        for (const key in files) {
            if (Object.hasOwnProperty.call(files, key)) {
                const file = files[key][0];
                

                const ruteToSaveFile = "./images/" + `${file.originalFilename}`


                if(file !== undefined && file !== null && file.originalFilename !== ""){

                   try {
                    const saveFile = await fsPromises.rename(file.filepath,ruteToSaveFile)
                    await eliminarContenidoCarpeta(filesTempDelete)
                   } catch (error) {
                       console.log("error al guardar el archivo",error)
                   }


                }

                
            }
        } // for in files
        

        
    } catch (error) {
        console.log("errro interno al procesar el fomdata",error)
    }

})




async function eliminarContenidoCarpeta(carpeta) {

    console.log("ELIMINAOD ARCHIVOS DE TEMPORALFILES")
    try {
      // Lee el contenido de la carpeta
      const contenido = await fsPromises.readdir(carpeta);
      
  
      // Recorre los archivos y subcarpetas y elimínalos
      for (const elemento of contenido) {
        const rutaElemento = path.join(carpeta, elemento);
        const stats = await fsPromises.lstat(rutaElemento);
        console.log("stats",stats)
  
        if (stats.isDirectory()) {
          // Si es una subcarpeta, llamar recursivamente para eliminar su contenido
          await eliminarContenidoCarpeta(rutaElemento);
        } else {
          // Si es un archivo, elimínalo
          await fsPromises.unlink(rutaElemento);
        }
      }
    } catch (error) {
      console.error('Error al eliminar contenido de la carpeta', carpeta, error);
    }
  }
  



const server = new http.createServer(app)


const port = process.env.PORT || 3000



server.listen(port,()=>{
    console.log(` Servidor on http://localhost:${port} `)
})