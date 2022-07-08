const express = require("express")
const Joi = require("joi")
const app = express()

//parse application/json
app.use(express.json())

const courses = [
    {id:1, name:'course1'},
    {id:2, name:'course2'},
    {id:3, name:'course3'}
]

function validateCourse(course){
    const schema = Joi.object({
        name:Joi.string().min(3).required()
    })

    return schema.validate(course)
}

/* Handles GET requests
 * the callback function is also called a route-handler
*/
app.get('/', (req, res) => {
    res.send('Hello World!!')
})

/* get all courses*/
app.get('/api/courses', (req, res) => {
    res.send(courses)
})

/* Route parameters - defined using a preceeding colon then you can
 * give it any name e.g :id, :courseID
 * We read the parameters using req.params = the result is a string containing the passed argument
 * You can have multiple parameters
 * You can also have query parameters. We read them using req.query
*/
app.get('/api/posts/:year/:month', (req, res) => {
    res.send(req.params)
    // console.log(req.params)
})

/* Return the course with a specified ID */
app.get('/api/courses/:id', (req, res) => {
    const result = courses.find(course => {
        return course.id === parseInt((req.params.id))//converting from string to int
    })

    if(!result){//if result is a falsy value, meaning it doesnt exist
        return res.status(404).send('The course with the specified ID does not exist.')
    }

    res.send(result)
})


app.post('/api/courses', (req, res) => {
    /* Always start with input validation */
    // const result = validateCourse(req.body)
    /* Object destructuring */
    const {error} = validateCourse(req.body)

    if(error){//if error exists
        return res.status(400).send(error.details[0].message)
    }

    const course = {
        id: courses.length + 1,
        name: req.body.name
    }

    courses.push(course)
    res.send(course)
})


/* Updating resources*/
app.put("/api/courses/:id", (req, res) => {
    /* Validation */
    const courseID = parseInt(req.params.id) //convert the ID into an integer for validation

    /* If course DOES NOT exist return 404*/
    const course = courses.find(element => element.id === courseID)
    if(!course){
        return res.status(404).send("Course with the specified ID not found")
    }    

    /* If the JSON body is invalid */
    const {error} = validateCourse(req.body)

    if(error){//if error exists
        return res.status(400).send(error.details[0].message)
    }
    // console.log("Success")
    course.name = req.body.name
    res.send(course)
})

/* Deleting a resource */
app.delete("/api/courses/:id", (req, res) => {
    const courseID = parseInt(req.params.id)
    const course = courses.find(c => c.id === courseID)
    /* If course DOES NOT exist return 404 */
    if(!course){
        return res.status(404).send("Course with the specified ID does not exist")
    } 
    
    courses.pop(course)
    res.send(course)
    
})


/* We need to use a non- hardcoded port for production i.e the port will not always be 3000
 * We use an environment variable called PORT
 * To read the value of PORT, we use process.env.PORT
*/
const port = process.env.PORT|| 3000
app.listen(3000, () => console.log(`Listening on port ${port }...`))

