import React, { createContext, useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { toUserMessage } from '../utils/helpers';
import { useAuth } from './AuthContext';

export const PostContext = createContext(null);

export function PostProvider({ children }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [commentsByPost, setCommentsByPost] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      setPosts([]);
      setError('');
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      postsQuery,
      (snapshot) => {
        setPosts(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
        setError('');
        setLoading(false);
      },
      (err) => {
        console.error('İlanlar alınamadı:', err);
        setError(toUserMessage(err));
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!user) {
      setCommentsByPost({});
      return undefined;
    }

    const unsubscribe = onSnapshot(
      collectionGroup(db, 'comments'),
      (snapshot) => {
        const grouped = {};
        snapshot.forEach((item) => {
          const data = item.data();
          const postId = data.postId || item.ref.parent.parent?.id;
          if (!postId) return;
          if (!grouped[postId]) grouped[postId] = [];
          grouped[postId].push({ id: item.id, ...data });
        });
        setCommentsByPost(grouped);
      },
      (err) => {
        console.error('Yorumlar alınamadı:', err);
      }
    );

    return unsubscribe;
  }, [user]);

  const postsWithComments = posts.map((post) => {
    const stored = Array.isArray(post.comments) ? post.comments : [];
    const added = commentsByPost[post.id] || [];
    const byUser = new Map();
    [...stored, ...added].forEach((comment) => {
      const key = comment.userId || comment.id;
      if (key && !byUser.has(key)) byUser.set(key, comment);
    });
    return { ...post, comments: [...byUser.values()] };
  });

  const addPost = async (post) => {
    if (!user) throw new Error('İlan vermek için giriş yapmalısınız.');

    await addDoc(collection(db, 'posts'), {
      meal: post.meal,
      stock: post.stock,
      price: post.price,
      deliveryFee: post.deliveryFee,
      description: post.description || '',
      image: post.image || null,
      sellerId: user.uid,
      sellerName: post.sellerName || '',
      createdAt: serverTimestamp(),
    });
  };

  const addCommentAndRating = async (postId, comment) => {
    if (!user) throw new Error('Yorum için giriş yapmalısınız.');
    const rating = Number(comment.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new Error('Puan 1 ile 5 arasında bir tam sayı olmalı.');
    }

    await setDoc(doc(db, 'posts', postId, 'comments', user.uid), {
      userId: user.uid,
      user: String(comment.user || '').slice(0, 79),
      text: String(comment.text || '').trim(),
      rating,
      date: String(comment.date || '').slice(0, 39),
      postId,
    });
  };

  const deletePost = async (postId) => {
    await deleteDoc(doc(db, 'posts', postId));
  };

  return (
    <PostContext.Provider value={{ posts: postsWithComments, loading, error, addPost, addCommentAndRating, deletePost }}>
      {children}
    </PostContext.Provider>
  );
}
