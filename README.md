# Express.js Products API

RESTful API for managing products with CRUD operations.

## Setup

```bash
npm install
npm start
```

Server: http://localhost:3000

**API Key**: Protected routes require `x-api-key` header. Default: `your-secret-api-key` (for testing). To set custom key, create `.env` file with `API_KEY=your-custom-key`.

## API Endpoints

- `GET /api/products` - List products (supports ?category, ?q, ?page, ?limit)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product \*
- `PUT /api/products/:id` - Update product \*
- `DELETE /api/products/:id` - Delete product \*
- `GET /api/products/stats` - Product statistics

\* Requires `x-api-key` header

## Example

```bash
# List products
curl http://localhost:3000/api/products

# Create product
curl -H "x-api-key: your-secret-api-key" -H "Content-Type: application/json" \
  -d '{"name":"Test","description":"Test item","price":10,"category":"test"}' \
  http://localhost:3000/api/products
```

- Error responses use a consistent JSON shape with `error` metadata.

That's it — concise and ready to run.
"page": 1,
