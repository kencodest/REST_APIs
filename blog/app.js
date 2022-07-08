/* Load dependecies */
const fs = require("fs/promises")
const express = require("express")
const _ = require("lodash")
const { v4:uuid} = require("uuid")
const Joi = require("joi")

/* API logic - Create, Read, Update, Delete (CRUD)
 * Allow users to post a comment to the DB (will use file system for now) -  the comment contains thr date it was posted
 * Allow users to retrieve their comment based on their IDs - the comment conntains all info
 * Allow user to see ALL comments
 * Allow users to update their comment- the date changes
 * Allow users to delete the comment
*/

/* Instantiate app */
const app = express()

/* Enable parsing JSON in Express*/
app.use(express.json())


/* Input validation function */
function commentValidation(input){
    const schema = Joi.object({
        comment: Joi.string().required()
    })

    return schema.validate(input)
}


/* GET to retrieve all comments in the fs */
app.get("/api/comments", async (req, res) => {
    
    const folderContents = await fs.readdir("comments")

    /* Read each file */
    const fileContents = await Promise.all(folderContents.map(async (file) => {
        const content = await fs.readFile(`comments/${file}`, "utf-8")
        return {
            id: file.split(".txt")[0],
            comment:content
        }
    }))
    
    res.send(fileContents)
})


/* GET to retrieve a comment with a given ID */
app.get("/api/comments/:id", async (req, res) => {
    /* Get the ID from the URL */
    const id = req.params.id
    
    /* try-catch block for file existence validation */
    try {
        const content = await fs.readFile(`comments/${id}.txt`, "utf-8")
        res.json({
            id,
            comment:content
        })
    } catch(err){
        return res.status(404).send("File with the specified ID does not exist.")
    }
})



/* POST to create a new comment */
app.post("/api/comments/post", async (req, res) => {
    /* JSON body validation */
    const { error } = commentValidation(req.body)
    if(error){
        return res.status(400).send(error.details[0].message)
    }

    const id = uuid()
    const comment = req.body.comment
    /* Create folder */ 
    await fs.mkdir("comments", { recursive:true })

    /* Create a txt file and write into  it*/
    await fs.writeFile(`comments/${id}.txt`, comment)

    res.status(201).json(
        {
            id,
            comment
        })
})


/* PUT to update the comment with a given ID. */
app.put("/api/comments/update/:id", async (req, res) => {

    /* JSON body validation */
    const { error } = commentValidation(req.body)
    if(error){
        return res.send(400).send(error.details[0].message)
    }

    /* If comment with the ID DOES NOT exist - return 404 */
    const id = req.params.id
    const comment = await fs.readFile(`comments/${id}.txt`, "utf-8")
    if(!comment){
        res.status(404).send("Comment with the specified ID does not exist")
    }

    /* Update comment */
    const content = req.body.comment
    fs.writeFile(`comments/${id}.txt`, content)

    res.json({
        id,
        comment:content
    })
})


/* DELETE to delete a comment with a given ID */
app.delete("/api/comments/delete/:id", async (req, res) => {
    const id = req.params.id
     /* Validate the ID in the URL */
    try {
        await fs.unlink(`comments/${id}.txt`)
        res.send(`Deleted the comment with ID:${id}`)

    } catch(err){
        return res.status(404).send("Comment with the specified ID does not exist")
    }
})


/* listening port */
const port = 3000
app.listen(port, ()=> {
    console.log(`App is running on port ${port}...`)
})


