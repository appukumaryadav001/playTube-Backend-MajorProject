import mongoose, { disconnect }  from "mongoose";
import {Video} from "../models/video.model.js";
import {User} from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req,res)=>{
      
    const {page =1, limit=10,query, sortBy, sortType,userId} = req.query;

    //TODO : get all videos based on query , sort , pagination 
   //sirf published videos
   // search (title + description)
   // user ke videos
   // sort
   // pagination

   const filter = {};
   filter.isPublished=true;
   // user filter
   if(userId){
      filter.owner= new mongoose.Types.ObjectId(userId);
   }
   
//search
   if(query){
    filter.$or=[
        {title:{$regex:query, $options:"i"}},
        {description:{$regex:query, $options:"i"}}
    ]
   }

   //sort

   const sortOptions = {};
   if(sortBy){
        sortOptions[sortBy] = sortType==="asc"?1:-1;
   }else{
   sortOptions.createdAt = -1; // default newest
}
  
 


   const pageNum = parseInt(page);
   const limitNum = parseInt(limit);
   const skip = (pageNum-1)*limitNum;

   const videos = await Video.find(filter)
    .sort(sortOptions)
    .skip(skip)
    .limit(limitNum);

    return res
    .status(200)
    .json(new ApiResponse(200,videos,"videos fetched successfully"));
      
   
    
});

const publishAVideo = asyncHandler( async (req,res)=>{
    const {title,description} = req.body;

    //TODO : get video , upload to cloudinary , create video 

    //videoFile  (cloudinary url)
    //thumbnail  (cloudinary url)
    //title   (req.body)
    //description (req.body)
    //duration cloudinary response se
    //owner  req.user._id

    if(!title?.trim()||!description?.trim()){
        throw new ApiError(401,"title or description required")
    }

    const videoLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
    if(!videoLocalPath){
        throw new ApiError(400,"videoFile is required")
    }
    if(!thumbnailLocalPath){
        throw new ApiError(400,"thumbnail is required")
    }

    const videoUpload = await uploadOnCloudinary(videoLocalPath);
    const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath)

    if(!videoUpload?.url){
        throw new ApiError(500,"Error uploading video ");
    }

    if(!thumbnailUpload?.url){
        throw new ApiError(500,"Error uploading thumbnail")
    }

    const video = await Video.create({
        videoFile:videoUpload.url,
        thumbnail:thumbnailUpload.url,
        title,
        description,
        duration:videoUpload.duration || 0,
        owner:req.user?._id
    });

    return res
    .status(201)
    .json(new ApiResponse(201,video,"video published successfully"))

});

const getVideoById = asyncHandler (async(req,res)=>{
    const {videoId} = req.params;

    //TODO : get video by id.

  if(!mongoose.Types.ObjectId.isValid(videoId)){
              throw new ApiError(400, "Invalid video id")
  }


const video = await Video.findById(videoId);

if(!video){
    throw new ApiError(404, "video not found")
}

if(!video.isPublished){
    if(video.owner.toString()!==req.user?._id.toString()){
        throw new ApiError(403,"video is private")
    }
}


    return res
    .status(200)
    .json(new ApiResponse(200,video,"video fetched successfully"));

});

const updateVideo = asyncHandler( async(req,res)=>{
    const {videoId} = req.params;
   
    //TODO : update video details like title , description , thumbnail

     const {title,description} = req.body;
     if(!title||!description){
        throw new ApiError(400, "title or description required")
     }
  
    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid videoId")
    }

const video = await Video.findById(videoId);
if(!video){
    throw new ApiError(404,"video not found")
}
    const updateDetails = {title,description};

 if (req.file?.path) {
       const thumbnailUpload = await uploadOnCloudinary(req.file.path);

       if(!thumbnailUpload.url){
        throw new ApiError(500,"thumbanil is not found ")
       }

       updateDetails.thumbnail = thumbnailUpload.url;
    }

 

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:updateDetails
            
        },{
            new :true
        }
    );


    return res
    .status(200)
    .json(new ApiResponse(200,updatedVideo,"video update successfully"))
});

const deleteVideo = asyncHandler(async (req,res)=>{
    const {videoId} = req.params;
    //TODO : delete video 
  if(!mongoose.Types.ObjectId.isValid(videoId)){
    throw new ApiError(400, "Invalid video id ")
  }
  const video = await Video.findById(videoId);
  if(!video){
    throw new ApiError(404,"video is not found")
  }
 
  if(video.owner.toString()!==req.user?._id.toString()){
        throw new ApiError(403,"You are not owner of this video")

  }
  const deletedVideo = await Video.findByIdAndDelete(videoId);

  return res
  .status(200)
  .json(new ApiResponse(200,deletedVideo,"video delete successfully"))

});

const togglePublishStatus = asyncHandler (async (req, res)=>{
    const {videoId} = req.params;

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "Invalid video id ");
    }
      
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"video not found");
    }
    if(video.owner.toString()!==req.user?._id.toString()){
        throw new ApiError(403, "Unauthorized");
    }
    video.isPublished = !video.isPublished;
   await video.save({validateBeforeSave:false});

   return res
   .status(200)
   .json(new ApiResponse(200,video,"video toggle status change successfully"));
})


export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus
}