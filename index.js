require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const exphbs = require('express-handlebars');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const routes = require('./routes');
const { connectDB } = require('./config/db');

const app = express();
const port = process.env.PORT || 3000;

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Handlebars setup with helpers
app.engine('handlebars', exphbs.engine({
  helpers: {
    section: function (name, options) {
      if (!this._sections) this._sections = {};
      this._sections[name] = options.fn(this);
      return null;
    },
    range: function (start, end) {
      const result = [];
      for (let i = start; i <= end; i++) result.push(i);
      return result;
    },
    ifEquals: function (a, b, options) {
      return a == b ? options.fn(this) : options.inverse(this);
    },
    typeof: function (value) {
      return typeof value;
    },
    notEquals: (a, b) => a?.toString() !== b?.toString(),
    includes: function (array, value) {
      if (Array.isArray(array)) return array.includes(value.toString());
      return false;
    },
    shortId: (id) => id?.toString().slice(0, 6) + '...' + id?.toString().slice(-4),
    formatIdDate: (id) => {
      if (!id) return 'ID';
      const timestamp = parseInt(id.toString().substring(0, 8), 16) * 1000;
      return new Date(timestamp).toLocaleString();
    },
    formatShortIdDate: (id) => {
      if (!id) return '';
      const timestamp = parseInt(id.toString().substring(0, 8), 16) * 1000;
      const date = new Date(timestamp);
      return date.toLocaleDateString(undefined, { year: '2-digit', month: '2-digit', day: '2-digit' }) +
        ' ' + date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    },
    ifBoth: function (a, b, options) {
      return a && b ? options.fn(this) : options.inverse(this);
    },
    toggleDir: (currentField, currentDir, targetField) => {
      if (currentField === targetField) {
        return currentDir === 'asc' ? 'desc' : 'asc';
      }
      return 'asc';
    }
  }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// DB connection
connectDB().then(() => {
  // Use `mongoUrl` (recommended over `client`)
  app.use(session({
    secret: process.env.SESSION_SECRET || 'NOuD-GSH32',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      dbName: 'express_auth',
      collectionName: 'sessions',
      ttl: 30 * 24 * 60 * 60 // 30 days
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production', // use secure cookies in production
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000
    }
  }));

  // Middlewares
  app.use(flash());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(methodOverride('_method'));

  // Flash messages to templates
  app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
  });

  // Logger
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });

  // Routes
  app.use(routes);

  // Root route
  app.get('/', (req, res) => {
    res.send('Hello World from Express!');
  });

  // Start server
  app.listen(port, () => {
    console.log(`🚀 Server is running at http://localhost:${port}`);
  });
}).catch((err) => {
  console.error('❌ Failed to connect to DB or start server:', err);
});
