import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const ReviewContext = createContext();

export function useReview() {
  return useContext(ReviewContext);
}

export function ReviewProvider({ children }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch reviews from the backend
  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/reviews`);
      setReviews(response.data.data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to fetch reviews');
      // Fallback to localStorage if API fails
      const savedReviews = localStorage.getItem('reviews');
      if (savedReviews) {
        setReviews(JSON.parse(savedReviews));
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch reviews when component mounts
  useEffect(() => {
    fetchReviews();
  }, []);

  // Save to both API and localStorage
  const addReview = async (review) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/reviews`, review);
      const newReview = response.data.data;
      setReviews(prevReviews => [...prevReviews, newReview]);
      
      // Backup to localStorage
      const updatedReviews = [...reviews, newReview];
      localStorage.setItem('reviews', JSON.stringify(updatedReviews));
      
      return { success: true };
    } catch (err) {
      console.error('Error adding review:', err);
      return { success: false, error: err.message };
    }
  };

  const value = {
    reviews,
    addReview,
    loading,
    error,
    refetchReviews: fetchReviews
  };

  return (
    <ReviewContext.Provider value={value}>
      {children}
    </ReviewContext.Provider>
  );
} 