import React, { createContext, useEffect, useState } from 'react';
import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { toUserMessage } from '../utils/helpers';
import { useAuth } from './AuthContext';

export const PostContext = createContext(null);

export function PostProvider({ children }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
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
      comments: [],
      createdAt: serverTimestamp(),
    });
  };

  const addCommentAndRating = async (postId, comment) => {
    await updateDoc(doc(db, 'posts', postId), {
      comments: arrayUnion(comment),
    });
  };

  const deletePost = async (postId) => {
    await deleteDoc(doc(db, 'posts', postId));
  };

  return (
    <PostContext.Provider value={{ posts, loading, error, addPost, addCommentAndRating, deletePost }}>
      {children}
    </PostContext.Provider>
  );
}
