const mongoose = require("mongoose");
// const mongooseHistory = require("mongoose-history");
// const { mongooseAuditOptions } = require("../config/mongoose.config");

const UserSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true
    },
    userId: {
      type: String,
      required: true,
      unique: true
    },
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: false
    },
    picture: {
      type: String,
      required: false
    },
    createdAt: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// UserSchema.plugin(mongooseHistory, mongooseAuditOptions);

/**
 * @typedef User
 */
module.exports = mongoose.model("User", UserSchema, "users");
