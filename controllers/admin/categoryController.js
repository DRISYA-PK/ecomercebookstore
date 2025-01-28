const Category=require("../../models/categorySchema")





const categoryInfo=async (req,res)=>{
    try {
        const page=parseInt(req.query.page)||1;
        console.log(page,"dssssssssssssssssssssssssssssssssssssss")
        const limit=6;
        const skip=(page-1)*limit;
        const categoryData=await Category.find({})
        .sort({createdAt:-1})
        .skip(skip)
        .limit(limit);
        const totalCategories=await Category.countDocuments();
        const totalPages=Math.ceil(totalCategories/limit);
        res.render("category",{
            cat:categoryData,
            currentPage:page,
            totalPages:totalPages,
            totalCategories:totalCategories

        })

    } catch (error) {
        console.log("error in cateory load",error)
        res.redirect("pageerror")
    }
}

const addCategory=async(req,res)=>{
   // console.log("addc ategory")
    const {name,description,categoryOffer}=req.body;
  //  console.log(req.body,"jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj");
  //  const categoryOffer=req.body.categoryOffer
 //   console.log(categoryOffer,"kjfffffffffjkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk");
    try {

        const exisstingCategory=await Category.findOne({name:name});
        
    
        if(exisstingCategory){
            console.log("category exists")
            return res.status(404).json({message:"Category already exists"})
        }
        else
        {
           
        const newCategory=new Category({
            name,
            description,
            categoryOffer
        })
      //  console.log(newCategory);
        await newCategory.save();

        
        return res.status(200).json({message:"Category added successfully"})
    }
        
    } catch (error) {
        console.log(error)
        return res.status(404).json({message:"Internal server error"})
    }
}

const getEditCategory=async(req,res)=>{
    try {
        const id=req.query.id;
        const category=await Category.findOne({_id:id})
        res.render("edit-category",{category:category})
    } catch (error) {
        console.log("error while editing the category");
        res.redirect("/pageerror")
    }
}
const mongoose = require('mongoose');

const editCategory=async(req,res)=>{
    try {
        let id=req.params.id;
       // id=mongoose.Types.ObjectId(id);
        const {categoryName,description,categoryOffer}=req.body;
       // console.log(categoryName,description,id)
        const existingCategory=await Category.findOne({name:categoryName});
        console.log(existingCategory)
        if(existingCategory){
           //
           //  return res.status(400).json({error:"Category exists,please choose another name"});

        }
        const updateCategory=await Category.findByIdAndUpdate(id,{
            name:categoryName,
            description:description
        },{new:true});
        if(updateCategory){
                res.redirect("/admin/category");
        }
        else{
            res.status(404).json({error:"Category not found"})
        }

    } catch (error) {
        console.log("error in category edit",error);
        res.status(500).json({error:"Internal server error"})
    }
}

const deleteCategory=async(req,res)=>{
    console.log("haiiii")
    const id=req.params.id;
   // const action=req.body.isdelete;
    const findCategory=await Category.findById(id);
    if(findCategory)
    {
        if(findCategory.isDeleted)
        {
            //res.status(404).json({error:"Category already deleted"})
            findCategory.isDeleted=false;
            await findCategory.save();
            res.redirect("/admin/category");
        }
        else{
            findCategory.isDeleted=true;
            await findCategory.save();
            res.redirect("/admin/category");
        }
    }
    else
    {
        res.status(404).json({error:"Category not found"})
    }
}

module.exports={categoryInfo,
    addCategory,getEditCategory,editCategory,deleteCategory
}