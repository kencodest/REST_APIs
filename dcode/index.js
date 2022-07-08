/* Load dependecies */
const fs = require("fs/promises") //File System package built-into Node and using the promises version
const express = require("express")
const cors  = require("cors") // Cross Origin Resource Sharing
const _ = require("lodash")
const { v4:uuid } = require("uuid")
const { keysIn } = require("lodash")

/* Setup the API server */
const app = express()

/* By default, express does not support sending or receiving json so we need to tell it to 
    support it */
app.use(express.json())

/* Return an outfit */
app.get("/outfit", (req, res) => {
    const tops = ["Black", "White", "Orange", "Navy"]
    const jeans = ["Grey", "Dark Grey", "Black", "Navy"]
    const shoes = ["White", "Grey", "Black"]

    res.json(
        {
            top: _.sample(tops), //sample function takes in an array and picks a random item
            jeans: _.sample(jeans),
            shoes: _.sample(shoes)
    })
})


/* Return a comment with a specified ID */
app.get("/comments/:id", async (req, res) => { 
    /* grab the ID from the URL */
    const id = req.params.id
    let content = ""

    try {
        content = await fs.readFile(`data/comments/${id}.txt`, "utf-8")
    } catch(err){
        return res.status(404).send("File with the specified ID does not exist")
    }

    /* object literal extension syntax */
    res.json({
        content
    })
})


/* Define the second endpoint - This is a POST endpoint 
    End point to add a new commwnt to the file system */
app.post("/comments/post", async (req, res) => {
    /* Generate new ID for the comment */
    const id = uuid()
    const content = req.body.comment // req.body allows us to access the JSON that was passed as a request to the API

    /* Validation */
    if(!content){
        return res.status(400).send("Valid comment is required!") // Youca n consider using joi for input validation
    }

    await fs.mkdir("data/comments", { recursive: true })
    await fs.writeFile(`data/comments/${id}.txt`, content)

    res.status(201).json({// The 201 response code means that the object was successfully created
        id,
        content
    })
})






/* Setup the port dynamically */
const port = process.env.PORT || 3000
app.listen(port, () => console.log(`API server running on port ${port}...`))

 