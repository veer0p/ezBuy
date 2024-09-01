import "mongoose";

// Augment Mongoose Document interface to include virtual properties
declare module "mongoose" {
  interface Document {
    age?: number;
  }
}
