import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  searchQuery: '',
  category: '',
  subcategory: '',
  sortBy: '',
  minPrice: '',
  maxPrice: '',
  products: [],
  loading: false,
  error: null,
  selectedProduct: null
};

const priceComparisonSlice = createSlice({
  name: 'priceComparison',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setCategory: (state, action) => {
      state.category = action.payload;
    },
    setSubcategory: (state, action) => {
      state.subcategory = action.payload;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    setMinPrice: (state, action) => {
      state.minPrice = action.payload;
    },
    setMaxPrice: (state, action) => {
      state.maxPrice = action.payload;
    },
    setProducts: (state, action) => {
      state.products = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },
    clearFilters: (state) => {
      state.searchQuery = '';
      state.category = '';
      state.subcategory = '';
      state.sortBy = '';
      state.minPrice = '';
      state.maxPrice = '';
    }
  }
});

export const {
  setSearchQuery,
  setCategory,
  setSubcategory,
  setSortBy,
  setMinPrice,
  setMaxPrice,
  setProducts,
  setLoading,
  setError,
  setSelectedProduct,
  clearFilters
} = priceComparisonSlice.actions;

export default priceComparisonSlice.reducer;


