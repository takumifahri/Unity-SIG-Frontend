import  { createContext, useContext, useState, useEffect } from 'react';

const ReviewContext = createContext();

export function useReview() {
  return useContext(ReviewContext);
}

export function ReviewProvider({ children }) {
  // Mengambil data dari localStorage jika ada
  const [reviews, setReviews] = useState(() => {
    const savedReviews = localStorage.getItem('reviews');
    return savedReviews ? JSON.parse(savedReviews) : [];
  });

  // Menyimpan reviews ke localStorage setiap kali ada perubahan
  useEffect(() => {
    localStorage.setItem('reviews', JSON.stringify(reviews));
  }, [reviews]);

  const addReview = (review) => {
    setReviews(prevReviews => [
      ...prevReviews,
      {
        ...review,
        id: Date.now(),
        date: new Date().toISOString()
      }
    ]);
  };

  const value = {
    reviews,
    addReview
  };

  return (
    <ReviewContext.Provider value={value}>
      {children}
    </ReviewContext.Provider>
  );
} 