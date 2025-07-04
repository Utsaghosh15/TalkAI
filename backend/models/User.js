import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Schema - Defines the structure for user data
 */
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: function() {
      // Password is required only if user is not using Google OAuth
      return !this.googleId;
    },
    minlength: [6, 'Password must be at least 6 characters long']
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows multiple null values
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  },
  profile: {
    name: {
      type: String,
      trim: true
    },
    picture: {
      type: String
    }
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

/**
 * Pre-save middleware to hash password
 */
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with salt rounds of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Instance method to compare password
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

/**
 * Instance method to get public profile (without sensitive data)
 */
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  
  delete userObject.password;
  delete userObject.verificationToken;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpires;
  
  return userObject;
};

/**
 * Static method to find user by email
 */
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

/**
 * Static method to find user by Google ID
 */
userSchema.statics.findByGoogleId = function(googleId) {
  return this.findOne({ googleId });
};

/**
 * Static method to find or create user by Google profile
 */
userSchema.statics.findOrCreateGoogleUser = async function(googleProfile) {
  const { id, emails, displayName, photos } = googleProfile;
  
  // Try to find existing user by Google ID
  let user = await this.findByGoogleId(id);
  
  if (user) {
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    return user;
  }
  
  // Try to find user by email
  if (emails && emails.length > 0) {
    user = await this.findByEmail(emails[0].value);
    
    if (user) {
      // Link Google account to existing email account
      user.googleId = id;
      user.isVerified = true; // Google accounts are pre-verified
      user.lastLogin = new Date();
      await user.save();
      return user;
    }
  }
  
  // Create new user
  user = new this({
    googleId: id,
    email: emails && emails.length > 0 ? emails[0].value : null,
    isVerified: true, // Google accounts are pre-verified
    profile: {
      name: displayName,
      picture: photos && photos.length > 0 ? photos[0].value : null
    }
  });
  
  await user.save();
  return user;
};

// Create and export the User model
const User = mongoose.model('User', userSchema);
export default User; 