const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const env = require('./config/env');
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/user.routes');
const productRoutes = require('./modules/products/product.routes');
const productAdminRoutes = require('./modules/products/product.admin.routes');
const categoryRoutes = require('./modules/categories/category.routes');
const categoryAdminRoutes = require('./modules/categories/category.admin.routes');
const cartRoutes = require('./modules/cart/cart.routes');
const wishlistRoutes = require('./modules/wishlist/wishlist.routes');
const deliveryRoutes = require('./modules/delivery/delivery.routes');
const deliveryAdminRoutes = require('./modules/delivery/delivery.admin.routes');
const orderRoutes = require('./modules/orders/order.routes');
const orderAdminRoutes = require('./modules/orders/order.admin.routes');
const customerAdminRoutes = require('./modules/customers/customer.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');
const paymentRoutes = require('./modules/payments/payment.routes');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// --- Core middleware ---
app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigins,
    credentials: true, // required so the refresh-token cookie is sent/received
  })
);
app.use(express.json({
  limit: '10mb',
  // Webhook signature verification (Paystack/Flutterwave) needs the exact
  // raw bytes that were sent, not the re-serialized parsed object — so we
  // stash the raw buffer alongside the parsed body instead of switching
  // that one route to a different body parser.
  verify: (req, res, buf) => {
    req.rawBody = buf;
  },
}));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));

// --- Health check (useful for uptime monitors / deployment platforms) ---
app.get('/health', (req, res) => res.json({ success: true, message: 'Arcvan Ghana Limited API is running' }));

// --- API routes ---
app.use(`${env.apiBasePath}/auth`, authRoutes);
app.use(`${env.apiBasePath}/users`, userRoutes);
app.use(`${env.apiBasePath}/products`, productRoutes);
app.use(`${env.apiBasePath}/admin/products`, productAdminRoutes);
app.use(`${env.apiBasePath}/categories`, categoryRoutes);
app.use(`${env.apiBasePath}/admin/categories`, categoryAdminRoutes);
app.use(`${env.apiBasePath}/cart`, cartRoutes);
app.use(`${env.apiBasePath}/wishlist`, wishlistRoutes);
app.use(`${env.apiBasePath}/delivery`, deliveryRoutes);
app.use(`${env.apiBasePath}/admin/delivery-zones`, deliveryAdminRoutes);
app.use(`${env.apiBasePath}/orders`, orderRoutes);
app.use(`${env.apiBasePath}/admin/orders`, orderAdminRoutes);
app.use(`${env.apiBasePath}/admin/customers`, customerAdminRoutes);
app.use(`${env.apiBasePath}/admin`, dashboardRoutes);
app.use(`${env.apiBasePath}/payments`, paymentRoutes);

// --- Fallback handlers ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
