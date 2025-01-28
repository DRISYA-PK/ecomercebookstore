const Product=require("../../models/productSchema");
const Category=require("../../models/categorySchema");
const User=require("../../models/userSchema")
const fs=require("fs");
const path=require("path");
const sharp=require("sharp");//resize the image
const { error } = require("console");


const getProductAddPage=async(req,res)=>{
    try {
        const category=await Category.find({isDeleted:false});

        res.render("product-add",{
            cat:category
        });
    } catch (error) {
        res.redirect("/pageerror")
    }
}





const addProducts=async(req,res)=>{
    try {
        const products=req.body;

      //  console.log(products);

        const productExists=await Product.findOne({
            Name:products.productName
        });
  //      console.log(productExists);
        if(!productExists)
        {
            const images=[];
            if(req.files && req.files.length>0){
                for(let i=0;i<req.files.length;i++)
                {
                    const originalImagePath=req.files[i].path;
                    const resizedImagePath=
                    path.join('public','uploads','product-images',req.files[i].filename);
                    await sharp(originalImagePath).resize({width:440,height:440}).toFile(resizedImagePath);
                    images.push(req.files[i].filename);

                }
            }
           // console.log("111111111111");
            const categoryId=await Category.findOne({name:products.category})
            if(!categoryId){
                return res.status(400).join("invalid category name");
            }
            let discounttotal=parseFloat(products.productOffer)+parseFloat(products.categorydiscount);
const newProducts=new Product({
    name:products.productName,
    description:products.description,
    author:products.author,
    language:products.language,
    categoryId:categoryId._id,
    regularPrice:products.regularPrice,
    discount:discounttotal,
    productDiscount:products.productOffer,
    categoryDiscount:products.categorydiscount,
    salePrice:products.salePrice,

    stock:products.quantity,
    coverImage:images,
    status:"Available"


});
await newProducts.save();
return res.redirect("/admin/addProducts");

        }
        else{
            return res.status(400).json("Product already exists,please try with another name");
        }
    } catch (error) {
        console.log("error while saving add product in database",error);
        res.redirect("/pageerror")
    }
}

const getAllProducts=async (req,res)=>{
    try {
        const search=req.query.search||"";
        const page=req.query.page ||1;
        const limit=10;
        const productData=await Product.find({
            name:{$regex:new RegExp(".*"+search+".*","i")}
      

        }).sort({ updatedAt: -1 }).
        limit(limit*1).skip((page-1)*limit)
        . populate('categoryId','name').exec();

        const category=await Category.find({});
        const count=await Product.find({
            name:{$regex:new RegExp(".*"+search+".*","i")}
      

        }).countDocuments();
       // console.log(productData);
        res.render("products",{
            data:productData,
            currentPage:page,
            totalPages:Math.ceil(count/limit),
            cat:category
        })

    } catch (error) {
        console.log("error while loading product page",error)
        res.redirect("/pageerror");
    }
}
const getEditProduct=async(req,res)=>{
    try {
       // console.log("editt,,,,,"  );
        const id=req.query.id;
        const product=await Product.findOne({_id:id});
        const category=await Category.find({});
        res.render("edit-product",{
            product:product,
            cat:category
        });
    } catch (error) {
        console.log("error editing product page",error)
        res.redirect("/pageerror");
    }
}

const editProduct=async(req,res)=>{
    try {
        const id=req.params.id;
        const product=await Product.findOne({_id:id})
        const data=req.body;
        const existingProduct = await Product.findOne({
            $and: [
                { name: data.productName },
                { author: data.author },
                { _id: { $ne: id } } // Place the _id condition inside the $and array
            ]
        });
   
        if(existingProduct){
            return res.status(400).json({error:"book with same author exists"});
        }
        const images=[];
    //    console.log(data)
        if(req.files && req.files.length>0){
            for(let i=0;i<req.files.length;i++)
            {
                images.push(req.files[i].filename)
            }
        }
        const updateFields={
            name:data.productName,
            description:data.descriptionData,
            language:data.language,
            categoryId:data.category,
            author:data.author,
            regularPrice:data.regularPrice,
            productDiscount:data.productOffer,
            categoryDiscount:data.categorydiscount,
            discount:data.totaldiscount,
            salePrice:data.salePrice,
            stock:data.quantity,
        }

      //  console.log(updateFields)
        if(req.files.length>0){
            updateFields.$push={coverImage:{$each:images}};
        }

       // const updatedProduct = await Product.findByIdAndUpdate(id, updateFields, { new: true });
        await Product.findByIdAndUpdate(id,updateFields,{new:true})
    res.redirect("/admin/products")
    } catch (error) {
        console.log(error);
        res.redirect("/admin/pageerror")
        
    }
}


const deleteSingleImage=async(req,res)=>{
    try {
       
        const {imageNameToServer,productIdToServer}=req.body;
     //   console.log(req.body)
      //  const product=await Product.findOneAndUpdate(productIdToServer,{$pull:{coverImage:imageNameToServer}});

      const product = await Product.findOneAndUpdate(
        { _id: productIdToServer }, // Use an object to specify the filter
        { $pull: { coverImage: imageNameToServer } } // Update operation
    );
    

        const imagePath=path.join("public","uploads","re-image",imageNameToServer)  ;
        if(fs.existsSync(imagePath)){
            await fs.unlinkSync(imagePath);
            console.log(`Image ${imageNameToServer} deleted successfully`);
        }    
        else
        {
            console.log(`Image ${imageNameToServer} not deleted`)
        }  
        res.send({status:true})
    } catch (error) {
        console.log(error);
        res.redirect("/admin/pageerror");
    }
}

const deleteProduct=async(req,res)=>{
  //  console.log("haiiii")
    const id=req.params.id;
    const isDeleted=await Product.findById(id);
    if(isDeleted)
    {
        if(isDeleted.isDeleted)
        {
            isDeleted.isDeleted=false;
            await isDeleted.save();
            res.redirect("/admin/products");
        }
        else{
            isDeleted.isDeleted=true;
            await isDeleted.save();
            res.redirect("/admin/products");
        }
    }
    else
    {
        res.status(404).json({error:"products not found"})
    }
}



 


















module.exports={
    getProductAddPage,addProducts,getAllProducts,getEditProduct,editProduct,deleteSingleImage,deleteProduct
}