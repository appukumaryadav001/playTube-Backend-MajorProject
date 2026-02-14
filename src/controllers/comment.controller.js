import { isValidObjectId } from "mongoose";
import mongoose from "mongoose";
import {Comment} from "../models/comment.model.js";
import {Video} from "../models/video.model.js";
import {ApiError} from "../utils/apiError.js";
import {ApiResponse} from "../utils/apiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";


const getVideoComments = asyncHandler(async (req,res)=>{
    //TODO : get all comments for a video 
    const {videoId} = req.params;
    const {page=1,limit=10} = req.query;
     
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video id");

    };
    
        const pageNum = Math.max(1, parseInt(page))
         const limitNum = Math.max(1, parseInt(limit));
          const skip = (pageNum-1)*limitNum;

    const comments = await Comment.find({video:videoId})
    .skip(skip)
    .limit(limitNum);

    if(comments.length===0){
        throw new ApiError(404,"comments not found")
    }
return res
.status(200)
.json(new ApiResponse(200,comments,"comments fetched successfully"));


});

const addComment = asyncHandler (async (req,res)=>{
    //TODO : add a commnet to a video 
    const {content} = req.body;
    const {videoId} = req.params;

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid videoid ");
    }

    if(!content || content.trim()===""){
        throw new ApiError(400,"content is required");
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404, "video not found");
    }

   

    const comment = await Comment.create({
        content:content,
        video:videoId,
        owner:req.user._id

    })

return res
.status(201)
.json(new ApiResponse(201,comment,"add comment successfully"));


});

const updateComment= asyncHandler( async (req,res)=>{
    //TODO :  update  a comment 
    const {content} = req.body;
    const {commentId} = req.params;

    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Invalid comment id");

    }

    if(!content || content.trim()===""){
        throw new ApiError(400,"content is require")
    }

    const updatedComment = await Comment.findOneAndUpdate(
        {
        _id:commentId,
        owner:req.user._id
        },
        {
            $set:{content:content.trim()}
        },{
            new:true
        }

    )

    if(!updatedComment){
        throw new ApiError(404,"comment not found");
    }
return res
.status(200)
.json(new ApiResponse(200,updatedComment,"comment updated successfully"));

});

const deleteComment = asyncHandler (async (req, res)=>{
    // TODO : delete a comment 

    const {commentId} =  req.params;

    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Invalid comment ID ");
    }

    const deletedComment = await Comment.findOneAndDelete({
        _id:commentId,
        owner:req.user._id,
    });
    if(!deletedComment){
        throw new ApiError(404,"comment not found");
    }

    return res
    .status(200)
    .json(new ApiResponse(200,deletedComment,"comment deleted successfully"));


})
export {
    getVideoComments,
    updateComment,
    addComment,
    deleteComment
}