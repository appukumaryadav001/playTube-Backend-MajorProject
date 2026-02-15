import mongoose,{ isValidObjectId} from "mongoose";
import {Tweet} from "../models/tweet.model";
import {ApiError} from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

import {User} from "../models/user.model.js";


const createTweet = asyncHandler (async (req,res)=>{
   //TODO : create tweet
   const {content} = req.body;

   if(!content || content.trim()===""){
    throw new ApiError(400,"content required");
   }

   const tweet = await Tweet.create({
      content,
      owner:req.user._id
   });

   return res
   .status(201)
   .json(new ApiResponse(201,tweet,"tweet create successfully"));


});

const getUserTweets = asyncHandler(async (req,res)=>{
   //TODO : get user tweets

   const {userId} = req.params;

   if(!isValidObjectId(userId)){
      throw new ApiError(400,"Invalid userId");
   }

  
   const tweets = await Tweet.find({
               owner:userId
   });

   
   return res
   .status(200)
   .json(new ApiResponse(200,tweets,"tweets fetched successfully"));

});

const updateTweet = asyncHandler(async(req,res)=>{
   //TODO update tweet
   
   const {content} = req.body;
   const {tweetId} = req.params;

   if(!isValidObjectId(tweetId)){
      throw new ApiError(400," Invalid tweet Id ")
   }

   if(!content || content.trim()===""){
      throw new ApiError(400,"content required");
   }

   const updatedTweet = await Tweet.findOneAndUpdate(
      {
      _id:tweetId,
      owner:req.user._id
   },{
      $set:{content:content.trim()}
   },{
      new:true
   }
);

if(!updatedTweet){
   throw new ApiError(404,"Tweet not found or unauthorized")
}

return res
.status(200)
.json(new ApiResponse(200,updatedTweet,"tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req,res)=>{
     //TODO : delete tweet
     const {tweetId} = req.params;
     if(!isValidObjectId(tweetId)){
           throw new ApiError(400,"Invalid tweetId");
     }

     const deletedTweet = await Tweet.findOneAndDelete({
       _id:tweetId,
       owner:req.user._id
     });
   if(!deletedTweet){
      throw new ApiError(404,"tweet not found or unauthorized");
   }
     return res
     .status(204)
     .json(new ApiResponse(204,deletedTweet,"tweet deleted successfully"))
});
export {
   createTweet,
   getUserTweets,
   updateTweet,
   deleteTweet
}