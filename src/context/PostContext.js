import React, { createContext, useState } from 'react';

export const PostContext = createContext();

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);

  const addPost = (post) => {
    setPosts((prevPosts) => [post, ...prevPosts]);
  };

  const addCommentAndRating = (postIndex, comment, rating) => {
    setPosts((prevPosts) =>
      prevPosts.map((post, index) => {
        if (index === postIndex) {
          const updatedComments = post.comments ? [...post.comments, comment] : [comment];
          const updatedRatings = post.ratings ? [...post.ratings, rating] : [rating];
          return { ...post, comments: updatedComments, ratings: updatedRatings };
        }
        return post;
      })
    );
  };

  return (
    <PostContext.Provider value={{ posts, setPosts, addPost, addCommentAndRating }}>
      {children}
    </PostContext.Provider>
  );
};

