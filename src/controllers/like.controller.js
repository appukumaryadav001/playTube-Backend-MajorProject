
import mongoose, {isValidObjectId} from "mongoose";

import {Like} from "../models/like.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {Video} from "../models/video.model.js";
import {Comment} from "../models/comment.model.js";
import {Tweet} from "../models/tweet.model.js";

const toggleVideoLike = asyncHandler (async (req , res)=>{
    const {videoId} = req.params;
    //TODO : toggle like on video 
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"video not found");
    }
   
    const existLike = await Like.findOne({
        video:videoId,
        likedBy:req.user._id
    });
    
    let isLike;
    if(existLike){
        await Like.findByIdAndDelete(existLike._id);
        isLike = false;
    }else{
        await Like.create({
            video:videoId,
            likedBy:req.user._id
        })
        isLike= true;
    } 
 const totalLike = await Like.countDocuments({video:videoId})
    return res
    .status(200)
    .json(new ApiResponse(200,{isLike:isLike,
        totalLike:totalLike},
        "video like toggle successfully"
    )
);
});

const toggleCommentLike = asyncHandler (async (req,res)=>{
    const {commentId} = req.params;
    //TODO : toggle like on comment 

    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Invalid comment Id ");
    }

    const comment = await Comment.findById(commentId);
    if(!comment){
        throw new ApiError(404,"comment not found");
    }

    const existLike = await Like.findOne({
        comment:commentId,
        likedBy:req.user._id
    });

    let isLike;
    if(existLike){
      await Like.deleteOne({_id:existLike._id});
      isLike=false;
    }else{
        await Like.create({
            comment:commentId,
            likedBy:req.user._id
        });
        isLike = true;
    }

    const totalLike = await Like.countDocuments({comment:commentId});

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        {
        isLike:isLike,
        totalLike:totalLike
    },
    "toggle comment like successfully"
)
);
});

const toggleTweetLike = asyncHandler(async (req,res)=>{
    const {tweetId} = req.params;
    //TODO : toggle like on tweet
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid tweetId");
    }

    const tweet = await Tweet.findById(tweetId);
    if(!tweet){
        throw new ApiError(404,"tweet not found");
    }

    const existLike = await Like.findOne(
        {
            tweet:tweetId,
            likedBy:req.user._id
        }
    );
let isLike;
    if(existLike){
        await Like.deleteOne({_id:existLike._id});
        isLike=false;
    }else{
        await Like.create({
            tweet:tweetId,
            likedBy:req.user._id
        })

        isLike=true;
    }

    const totalLike = await Like.countDocuments({tweet:tweetId});
    return res
    .status(200)
    .json(new ApiResponse(200,{isLike:isLike,totalLike:totalLike},"toggle tweet like  successfully"));
   


});

const getLikedVideos = asyncHandler (async (req,res)=>{
    //TODO : get all liked videos
    
    const allLikedVideos = await Like.find(
        {
            video:{$ne:null},
            likedBy:req.user._id
        }
    ).populate("video");

    return res
    .status(200)
    .json(new ApiResponse(200,allLikedVideos,"allLikedVideos fetched successfully"));
});

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
}