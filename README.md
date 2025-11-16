# PriceCompare - E-commerce Price Comparison Platform

A comprehensive price comparison platform that helps users find the best deals on clothing across multiple e-commerce platforms including Amazon, Flipkart, Myntra, Ajio, Nykaa, and Meesho.

## Features

- **Real-time Price Comparison**: Compare prices across multiple e-commerce platforms
- **Category-based Shopping**: Browse men's, women's, and kids' clothing
- **Advanced Search & Filters**: Find products with specific criteria
- **External Website Integration**: Direct links to purchase from original platforms
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

### Frontend
- React 18
- React Router DOM
- Redux Toolkit
- Tailwind CSS
- Lucide React (Icons)
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the server directory:
```env
MONGO_URI=mongodb://localhost:27017/pricecompare
PORT=5000
```

4. Start the server:
```bash
npm run dev
```

5. Seed the database with sample data:
```bash
node scripts/seed-data.js
```

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Products
- `GET /api/price-comparison/search` - Search products with filters
- `GET /api/price-comparison/product/:productId` - Get product details
- `GET /api/price-comparison/product/:productId/prices` - Refresh product prices
- `GET /api/price-comparison/categories` - Get available categories
- `POST /api/price-comparison/product` - Add new product (admin)

### Query Parameters for Search
- `query` - Search term
- `category` - Product category (men, women, kids)
- `subcategory` - Product subcategory
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `sortBy` - Sort options (price-low, price-high, rating)

## Usage

### For Users
1. **Search Products**: Use the search bar to find specific products
2. **Browse Categories**: Navigate through men's, women's, and kids' clothing
3. **Compare Prices**: View prices from multiple platforms side by side
4. **Purchase**: Click "Buy from [Platform]" to go directly to the e-commerce site

### For Developers
1. **Add New Products**: Use the API endpoint to add products to the database
2. **Integrate APIs**: Connect with real e-commerce APIs for live price updates
3. **Customize Filters**: Add new filter options based on your needs

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Redux store
│   │   └── ...
├── server/                 # Node.js backend
│   ├── controllers/        # Route controllers
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   └── scripts/           # Database scripts
└── README.md
```

## Key Components

### Frontend Components
- `PriceComparisonLayout` - Main layout wrapper
- `Header` - Navigation and search
- `ProductCard` - Product display card
- `Search` - Search and filter interface
- `ProductDetails` - Detailed product view

### Backend Models
- `Product` - Product schema with price comparisons

## Features Implemented

✅ **Price Comparison Interface**
- Clean, modern UI for comparing prices
- Category-based navigation (Men, Women, Kids)
- Advanced search and filtering

✅ **Real-time Price Updates**
- API integration for live price fetching
- Manual refresh functionality
- Price history tracking

✅ **External Website Integration**
- Direct links to purchase from original platforms
- Opens in new tabs for seamless shopping experience

✅ **Responsive Design**
- Mobile-first approach
- Works on all device sizes
- Touch-friendly interface

## Future Enhancements

- [ ] User authentication and wishlist
- [ ] Price alerts and notifications
- [ ] Product reviews and ratings
- [ ] Advanced analytics dashboard
- [ ] Mobile app development
- [ ] API rate limiting and caching
- [ ] Real-time notifications

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact us at support@pricecompare.com


