
require('dotenv').config();
const express = require('express');
const path = require('path');
const routes = require('./routes');
const session = require('express-session');
const MongoStore = require('connect-mongo');
//const hbs = require('hbs');
const exphbs = require('express-handlebars');
const connectDB = require('./config/db');
const app = express();
const flash = require('connect-flash');
const methodOverride = require('method-override');
app.use(express.static(path.join(__dirname, 'public')));




//app.set('view engine', 'hbs');

/*
app.engine('handlebars', exphbs.engine({
  helpers: {
    section: function (name, options) {
      if (!this._sections) this._sections = {};
      this._sections[name] = options.fn(this);
      return null;
    }
  }
}));
*/

app.engine('handlebars', exphbs.engine({
  helpers: {
    section: function (name, options) {
      if (!this._sections) this._sections = {};
      this._sections[name] = options.fn(this);
      return null;
    },
    range: function (start, end) {
      const result = [];
      for (let i = start; i <= end; i++) {
        result.push(i);
      }
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
      if (Array.isArray(array)) {
        return array.includes(value.toString());
      }
      return false;
    },


    shortId: (id) => id?.toString().slice(0, 6) + '...' + id?.toString().slice(-4),
    formatIdDate: (id) => {
      if (!id) return 'ID';
      const str = id.toString();
      const timestampHex = str.substring(0, 8);
      const timestamp = parseInt(timestampHex, 16) * 1000;
      return new Date(timestamp).toLocaleString();
    },

    formatShortIdDate: (id) => {
      if (!id) return '';
      const timestamp = parseInt(id.toString().substring(0, 8), 16) * 1000;
      const date = new Date(timestamp);
      return date.toLocaleDateString(undefined, { year: '2-digit', month: '2-digit', day: '2-digit' }) +
            ' ' +
            date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
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


app.set('views', path.join(__dirname, 'views')); // Already set most likely
const port = 3000;

const mongoose = require('mongoose');

/*
//const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/express_auth')
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));
*/

connectDB();

const mongoClientPromise = new Promise((resolve) => {
  mongoose.connection.once('connected', () => {
    resolve(mongoose.connection.getClient());
  });
});


app.use(session({
  secret: process.env.SESSION_SECRET || 'NOuD-GSH32',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    clientPromise: mongoClientPromise,
    dbName: 'express_auth',
    collectionName: 'sessions',
    ttl: 30 * 24 * 60 * 60
  }),
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000
  }
}));





app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(methodOverride('_method'));

app.use(session({
  secret: process.env.SESSION_SECRET || 'NOuD-GSH32',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    client: mongoose.connection.getClient(),
    ttl: 30 * 24 * 60 * 60
  }),
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000
  }
}));

app.use(flash());
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
app.use(routes);

app.get('/', (req, res) => {
  res.send('Hello World from Express!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});




