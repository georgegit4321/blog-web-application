import express from "express";
import bodyParser from "body-parser";
import fs from 'fs';
import { fileURLToPath } from 'url';
import {dirname} from 'path';

function loadData() {
    try {
        const filePath = "data/blogs.json";

        if (!fs.existsSync(filePath)) {
            return [];
        }

        const data = fs.readFileSync(filePath, "utf-8").trim();
        return data ? JSON.parse(data) : [];

    } catch (err) {
        console.error("Error loading data:", err);
        return [];
    }
}

const __dirname = dirname(fileURLToPath(import.meta.url));

const app=express();
const port=3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

app.get('/',(req,res)=>{
    /*
    let files = fs.readdirSync(__dirname+'/views/blogs'); 

    console.log(files);

    res.render('index.ejs',{files:files});
    */
    // const filePath = "data/blogs.json";

    // let blogs = [];
    // try{
    //     if (fs.existsSync(filePath)) {
    //         blogs = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    //     }
    // }
    // catch{
    //     blogs = [];
    // }
    let blogs=loadData();
    console.log(blogs);

    res.render("index.ejs", {blogs});
});

app.post('/save/:id',(req,res)=>{
    const id=req.params.id;
    let blogs=loadData();
    const index = blogs.findIndex(b => b.id == id);

    if (index === -1) {
        return res.status(404).send("Blog not found");
    }

    blogs[index] = {
        id: id, // keep same id
        heading: req.body.heading,
        sub: req.body.sub,
        content: req.body.content,
        createdAt: blogs[index].createdAt, // preserve original
        updatedAt: new Date().toISOString()
    };
    fs.writeFileSync("data/blogs.json", JSON.stringify(blogs, null, 2));
    
    return res.redirect("/");

});

app.post('/submit',(req,res)=>{
    try {
/*
        const heading=req.body.heading;
        const sub=req.body.sub;
        let content=req.body.content;
        content = req.body.content.replace(/\n/g, "<br>");
*/      
        let blogs=loadData();
        
        let exists = blogs.some(b => 
            b.heading.toLowerCase() === req.body.heading.toLowerCase()
        );

        if (exists) {
            //return res.status(400).send("Blog with this heading already exists");
            console.log('same heading');            
            return res.redirect('/?msg=same');
        }
        const blog = {
            id: Date.now(),
            heading: req.body.heading,
            sub: req.body.sub,
            content: req.body.content,
            createdAt: new Date().toISOString()
        };

        
        
        const filePath = "data/blogs.json";
        blogs.push(blog);
        fs.writeFileSync(filePath, JSON.stringify(blogs, null, 2));
        
        return res.redirect("/");
        //console.log(content);
        //console.log(heading,sub,content);
/*
        fs.writeFile(`views/blogs/${heading}_${sub}.ejs`,`<html>\n<body>\n<h1>${heading}</h1>\n<h2>${sub}</h2>\n<p>${content}</p>\n</body>\n</html>`,(err) => {
        if (err) throw err;
        console.log('The file has been saved!');
        });
        res.redirect("/");
*/

        // let files = fs.readdirSync(__dirname+'/views/blogs'); 

        // console.log(files);

        // res.render('index.ejs',{files:files}); 
        // return res.status(200);

    } catch (error) {
        return res.status(500);
    }
    
});

app.get("/blogs/:id", (req, res) => {
    //res.render("blogs/" + req.params.id);
    const id=req.params.id;
    let data=loadData()
    console.log(data);
    
    for (let index = 0; index < data.length; index++) {
        const element = data[index];
        if(element.id==id){
            var obj=element;
            break;
        }
    }

    console.log('object = ',obj);    
    res.render('view_blog_page.ejs',obj);
});

app.get("/blogs/delete/:id", (req, res) => {
    const id=req.params.id;
    try{
        const filePath = "data/blogs.json";
        let blogs = loadData();
        blogs = blogs.filter(blog => blog.id != id);
        console.log('helloooo ',blogs);
        
        fs.writeFileSync(filePath, JSON.stringify(blogs, null, 2));
    }
    catch(err){
        console.error(err);
        res.status(500).send("Failed to delete blog");
    }
    return res.redirect("/");
});

app.get('/blogs/edit/:id',(req,res)=>{

    const id=req.params.id;
    let blogs=loadData()
    console.log(blogs);
    
    for (let index = 0; index < blogs.length; index++) {
        const element = blogs[index];
        if(element.id==id){
            var obj=element;
            break;
        }
    }

    console.log('object = ',obj);    
    res.render('edit_page.ejs',{obj:obj,blogs:blogs});
});




app.listen(port,()=>{
    console.log("started listening on port ",port);
});