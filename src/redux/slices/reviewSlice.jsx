import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Fetch reviews
export const fetchReviews = createAsyncThunk(
  'reviews/fetchReviews',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/reviews`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching reviews:', error);
      
      // Attempt to load from localStorage as fallback
      const savedReviews = localStorage.getItem('reviews');
      if (savedReviews) {
        return JSON.parse(savedReviews);
      }
      
      return rejectWithValue('Failed to fetch reviews');
    }
  }
);

// Add new review
export const addReview = createAsyncThunk(
  'reviews/addReview',
  async (review, { getState, rejectWithValue }) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/reviews`, review);
      const newReview = response.data.data;
      
      // Save to localStorage as backup
      const { reviews } = getState().review;
      localStorage.setItem('reviews', JSON.stringify([...reviews, newReview]));
      
      return newReview;
    } catch (error) {
      console.error('Error adding review:', error);
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  reviews: [],
  loading: false,
  error: null
};

const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    clearReviewError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch reviews
      .addCase(fetchReviews.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.reviews = action.payload;
        state.loading = false;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add review
      .addCase(addReview.pending, (state) => {
        state.loading = true;
      })
      .addCase(addReview.fulfilled, (state, action) => {
        state.reviews.push(action.payload);
        state.loading = false;
      })
      .addCase(addReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearReviewError } = reviewSlice.actions;
export default reviewSlice.reducer;