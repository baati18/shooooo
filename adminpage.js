import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();

// ==================== CORS CONFIGURATION - UPDATED ====================
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'https://shooooo.vercel.app', // Vercel frontend
  process.env.FRONTEND_URL || 'https://shooooo.vercel.app'
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      console.log('CORS blocked origin:', origin);
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json());

// ==================== MONGODB CONNECTION ====================
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sales_db';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ==================== ADMIN SCHEMA ====================
const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username waa lagama maarmaan'],
    unique: true,
    trim: true,
    minlength: [3, 'Username waa inuu ka kooban yahay ugu yaraan 3 xaraf']
  },
  email: {
    type: String,
    required: [true, 'Email waa lagama maarmaan'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Fadlan geli email sax ah']
  },
  password: {
    type: String,
    required: [true, 'Password waa lagama maarmaan'],
    minlength: [6, 'Password waa inuu ka kooban yahay ugu yaraan 6 xaraf']
  },
  fullName: {
    type: String,
    required: [true, 'Magaca buuxa waa lagama maarmaan'],
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'superadmin'],
    default: 'admin'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const Admin = mongoose.model('Admin', adminSchema);

// ==================== EXISTING SCHEMAS with CREATED/UPDATED BY ====================
// 1. General Sales Schema
const generalSalesSchema = new mongoose.Schema({
  magaca: {
    type: String,
    required: [true, 'Magaca waa lagama maarmaan'],
    trim: true
  },
  time: {
    type: String,
    required: false,
    default: null
  },
  date: {
    type: Date,
    required: [true, 'Taariikhda waa lagama maarmaan'],
    default: Date.now
  },
  lacagta: {
    type: Number,
    required: [true, 'Lacagta waa lagama maarmaan'],
    min: [0, 'Lacagtu ma noqon karto wax ka yar 0']
  },
  description: {
    type: String,
    required: false,
    default: null,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  }
}, {
  timestamps: true
});

// 2. Daily Breakdown Schema
const dailyBreakdownSchema = new mongoose.Schema({
  magaca: {
    type: String,
    required: [true, 'Magaca waa lagama maarmaan'],
    trim: true
  },
  time: {
    type: String,
    required: false,
    default: null
  },
  date: {
    type: Date,
    required: [true, 'Taariikhda waa lagama maarmaan'],
    default: Date.now
  },
  lacagta: {
    type: Number,
    required: [true, 'Lacagta waa lagama maarmaan'],
    min: [0, 'Lacagtu ma noqon karto wax ka yar 0']
  },
  description: {
    type: String,
    required: false,
    default: null,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  }
}, {
  timestamps: true
});

// 3. Customer Credit Schema
const customerCreditSchema = new mongoose.Schema({
  magaca: {
    type: String,
    required: [true, 'Magaca macmiilka waa lagama maarmaan'],
    trim: true
  },
  time: {
    type: String,
    required: false,
    default: null
  },
  date: {
    type: Date,
    required: [true, 'Taariikhda waa lagama maarmaan'],
    default: Date.now
  },
  lacagta_uhartay: {
    type: Number,
    required: [true, 'Lacagta uhartay waa lagama maarmaan'],
    min: [0, 'Lacagtu ma noqon karto wax ka yar 0']
  },
  description: {
    type: String,
    required: false,
    default: null,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  }
}, {
  timestamps: true
});

// 4. Out of Stock Schema
const outOfStockSchema = new mongoose.Schema({
  magaca: {
    type: String,
    required: [true, 'Magaca sheyga waa lagama maarmaan'],
    trim: true
  },
  nooca: {
    type: String,
    required: [true, 'Nooca sheyga waa lagama maarmaan'],
    enum: {
      values: ['bur', 'sokor', 'shampoo', 'other'],
      message: 'Nooca waa inuu ahaadaa bur, sokor, shampoo, ama other'
    },
    default: 'other'
  },
  time: {
    type: String,
    required: false,
    default: null
  },
  date: {
    type: Date,
    required: [true, 'Taariikhda waa lagama maarmaan'],
    default: Date.now
  },
  qaangaadh: {
    type: String,
    default: 'Dhamaaday'
  },
  description: {
    type: String,
    required: false,
    default: null,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  }
}, {
  timestamps: true
});

// ==================== MODELS ====================
const GeneralSales = mongoose.model('GeneralSales', generalSalesSchema);
const DailyBreakdown = mongoose.model('DailyBreakdown', dailyBreakdownSchema);
const CustomerCredit = mongoose.model('CustomerCredit', customerCreditSchema);
const OutOfStock = mongoose.model('OutOfStock', outOfStockSchema);

// ==================== AUTHENTICATION MIDDLEWARE ====================
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const admin = await Admin.findById(decoded.id).select('-password');
    
    if (!admin || !admin.isActive) {
      throw new Error();
    }

    req.admin = admin;
    req.adminId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Fadlan gal (Please authenticate)'
    });
  }
};

// ==================== PUBLIC ROUTES ====================

// Root endpoint - UPDATED with more info
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Sales Management API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    endpoints: {
      health: '/health',
      auth: {
        register: '/api/admin/register',
        login: '/api/admin/login',
        profile: '/api/admin/profile',
        changePassword: '/api/admin/change-password',
        logout: '/api/admin/logout'
      },
      data: {
        stats: '/api/stats',
        generalSales: '/api/general-sales',
        dailyBreakdown: '/api/daily-breakdown',
        customerCredit: '/api/customer-credit',
        outOfStock: '/api/out-of-stock'
      }
    },
    documentation: 'https://github.com/yourusername/sales-management'
  });
});

// Health check endpoint - UPDATED with more details
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      state: mongoose.STATES[mongoose.connection.readyState]
    },
    memory: process.memoryUsage(),
    message: 'Server is running properly'
  });
});

// ==================== ADMIN ROUTES ====================

// Register new admin
app.post('/api/admin/register', async (req, res) => {
  try {
    const { username, email, password, fullName, role } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      $or: [{ email }, { username }]
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Username ama email horey ayaa loo isticmaalay'
      });
    }

    // Create new admin
    const admin = new Admin({
      username,
      email,
      password,
      fullName,
      role: role || 'admin'
    });

    await admin.save();

    // Create token
    const token = jwt.sign(
      { id: admin._id, username: admin.username, role: admin.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Admin successfully registered',
      data: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
        token
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error registering admin',
      error: error.message
    });
  }
});

// Login admin
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Fadlan geli username iyo password'
      });
    }

    // Find admin by username or email
    const admin = await Admin.findOne({
      $or: [
        { username: username },
        { email: username }
      ]
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Username ama password khalad'
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Akauntiga waa la joojiyay'
      });
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Username ama password khalad'
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Create token
    const token = jwt.sign(
      { id: admin._id, username: admin.username, role: admin.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Successfully logged in',
      data: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
        lastLogin: admin.lastLogin,
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
});

// Get current admin profile (protected)
app.get('/api/admin/profile', authenticateAdmin, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        id: req.admin._id,
        username: req.admin.username,
        email: req.admin.email,
        fullName: req.admin.fullName,
        role: req.admin.role,
        lastLogin: req.admin.lastLogin,
        createdAt: req.admin.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
});

// Change password (protected)
app.put('/api/admin/change-password', authenticateAdmin, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Fadlan geli current password iyo new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password cusub waa inuu ka kooban yahay ugu yaraan 6 xaraf'
      });
    }

    const admin = await Admin.findById(req.adminId);
    
    const isPasswordValid = await admin.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password waa khalad'
      });
    }

    admin.password = newPassword;
    await admin.save();

    res.json({
      success: true,
      message: 'Password successfully updated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message
    });
  }
});

// Logout
app.post('/api/admin/logout', authenticateAdmin, async (req, res) => {
  res.json({
    success: true,
    message: 'Successfully logged out'
  });
});

// ==================== HELPER FUNCTIONS ====================
const createSearchQuery = (model, searchTerm) => {
  if (!searchTerm) return {};
  
  const searchRegex = new RegExp(searchTerm, 'i');
  
  switch(model) {
    case 'generalSales':
    case 'dailyBreakdown':
      return {
        $or: [
          { magaca: searchRegex },
          { description: searchRegex },
          ...(!isNaN(searchTerm) ? [{ lacagta: parseInt(searchTerm) }] : [])
        ]
      };
    
    case 'customerCredit':
      return {
        $or: [
          { magaca: searchRegex },
          { description: searchRegex },
          ...(!isNaN(searchTerm) ? [{ lacagta_uhartay: parseInt(searchTerm) }] : [])
        ]
      };
    
    case 'outOfStock':
      return {
        $or: [
          { magaca: searchRegex },
          { nooca: searchRegex },
          { description: searchRegex }
        ]
      };
    
    default:
      return {};
  }
};

// ==================== CRUD ROUTES FACTORY ====================
const createCrudRoutes = (Model, modelName) => {
  const router = express.Router();

  // GET all with search (protected)
  router.get('/', authenticateAdmin, async (req, res) => {
    try {
      const { search } = req.query;
      const query = createSearchQuery(modelName, search);
      
      const items = await Model.find(query)
        .populate('createdBy', 'username fullName')
        .populate('updatedBy', 'username fullName')
        .sort({ date: -1, createdAt: -1 });
      
      res.json({
        success: true,
        count: items.length,
        data: items
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching items',
        error: error.message
      });
    }
  });

  // GET single item by ID (protected)
  router.get('/:id', authenticateAdmin, async (req, res) => {
    try {
      const item = await Model.findById(req.params.id)
        .populate('createdBy', 'username fullName')
        .populate('updatedBy', 'username fullName');
      
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }
      res.json({
        success: true,
        data: item
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching item',
        error: error.message
      });
    }
  });

  // POST create new item (protected)
  router.post('/', authenticateAdmin, async (req, res) => {
    try {
      // Validate only required fields
      const requiredFields = ['magaca', 'date'];
      
      if (modelName === 'customerCredit') {
        requiredFields.push('lacagta_uhartay');
      } else if (modelName === 'outOfStock') {
        requiredFields.push('nooca');
      } else {
        requiredFields.push('lacagta');
      }

      const missingFields = requiredFields.filter(field => !req.body[field]);
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`
        });
      }

      // If time is not provided, set it to null
      if (!req.body.time) {
        req.body.time = null;
      }

      // If description is not provided, set it to null
      if (!req.body.description) {
        req.body.description = null;
      }

      // Set createdBy and updatedBy to current admin
      req.body.createdBy = req.adminId;
      req.body.updatedBy = req.adminId;

      const newItem = new Model(req.body);
      const savedItem = await newItem.save();
      
      // Populate the admin info before sending response
      const populatedItem = await Model.findById(savedItem._id)
        .populate('createdBy', 'username fullName')
        .populate('updatedBy', 'username fullName');
      
      res.status(201).json({
        success: true,
        message: 'Item created successfully',
        data: populatedItem
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error creating item',
        error: error.message
      });
    }
  });

  // PUT update item (protected)
  router.put('/:id', authenticateAdmin, async (req, res) => {
    try {
      // If time is provided as empty string, set to null
      if (req.body.time === '') {
        req.body.time = null;
      }

      // If description is provided as empty string, set to null
      if (req.body.description === '') {
        req.body.description = null;
      }

      // Set updatedBy to current admin
      req.body.updatedBy = req.adminId;

      const updatedItem = await Model.findByIdAndUpdate(
        req.params.id,
        req.body,
        { 
          new: true, 
          runValidators: true
        }
      ).populate('createdBy', 'username fullName')
       .populate('updatedBy', 'username fullName');
      
      if (!updatedItem) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Item updated successfully',
        data: updatedItem
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error updating item',
        error: error.message
      });
    }
  });

  // DELETE item (protected)
  router.delete('/:id', authenticateAdmin, async (req, res) => {
    try {
      const deletedItem = await Model.findByIdAndDelete(req.params.id);
      
      if (!deletedItem) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Item deleted successfully',
        data: deletedItem
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting item',
        error: error.message
      });
    }
  });

  return router;
};

// ==================== ROUTES ====================
app.use('/api/general-sales', createCrudRoutes(GeneralSales, 'generalSales'));
app.use('/api/daily-breakdown', createCrudRoutes(DailyBreakdown, 'dailyBreakdown'));
app.use('/api/customer-credit', createCrudRoutes(CustomerCredit, 'customerCredit'));
app.use('/api/out-of-stock', createCrudRoutes(OutOfStock, 'outOfStock'));

// ==================== ADDITIONAL UTILITY ROUTES ====================

// Get stats for dashboard (protected)
app.get('/api/stats', authenticateAdmin, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalGeneralSales,
      totalDailyBreakdown,
      totalCustomerCredit,
      totalOutOfStock,
      todayGeneralSales,
      todayCustomerCredit
    ] = await Promise.all([
      GeneralSales.countDocuments(),
      DailyBreakdown.countDocuments(),
      CustomerCredit.countDocuments(),
      OutOfStock.countDocuments(),
      GeneralSales.countDocuments({ date: { $gte: today, $lt: tomorrow } }),
      CustomerCredit.aggregate([
        { $match: { date: { $gte: today, $lt: tomorrow } } },
        { $group: { _id: null, total: { $sum: '$lacagta_uhartay' } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalGeneralSales,
        totalDailyBreakdown,
        totalCustomerCredit,
        totalOutOfStock,
        todayGeneralSales,
        todayCustomerCreditTotal: todayCustomerCredit[0]?.total || 0,
        admin: {
          id: req.admin._id,
          name: req.admin.fullName,
          role: req.admin.role
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching stats',
      error: error.message
    });
  }
});

// ==================== 404 HANDLER ====================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      '/',
      '/health',
      '/api/admin/register',
      '/api/admin/login',
      '/api/admin/profile',
      '/api/admin/change-password',
      '/api/admin/logout',
      '/api/stats',
      '/api/general-sales',
      '/api/daily-breakdown',
      '/api/customer-credit',
      '/api/out-of-stock'
    ]
  });
});

// ==================== GLOBAL ERROR HANDLER ====================
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    timestamp: new Date().toISOString()
  });
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════════════╗
║     🚀 Server is running!                    ║
╠══════════════════════════════════════════════╣
║  Port: ${PORT}                                      ║
║  Environment: ${process.env.NODE_ENV || 'development'}                  ║
║  MongoDB: ${MONGODB_URI.replace(/:[^:]*@/, ':****@')}  ║
║  Status: ✅ Connected                         ║
║                                              ║
║  Frontend URLs:                              ║
║  • http://localhost:5173                     ║
║  • https://shooooo.vercel.app                 ║
║                                              ║
║  Test URLs:                                  ║
║  • https://shooooo.onrender.com/              ║
║  • https://shooooo.onrender.com/health        ║
║  • https://shooooo.onrender.com/api/stats     ║
╚══════════════════════════════════════════════╝
  `);
});
