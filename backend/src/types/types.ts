import { Request, Response, NextFunction } from "express";

export interface NewUserRequestBody {
  name: string;
  email: string;
  photo: string;
  gender: string;
  _id: string;
  dob: Date;
}
export interface NewProductRequestBody {
  name: string;
  category: string;
  price: number;
  stock: number;
}

export type controllerType = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response<any, Record<string, any>>>;

export type SearchRequestQuery = {
  search?: string;
  price?: string;
  category?: string;
  sort?: string;
  page?: string;
};

export interface BaseQuery {
  name?: {
    $regex: string;
    $options: string;
  };
  price?: { $lte: number };
  category?: string;
}

export interface invalidateCacheProps {
  product?: boolean;
  order?: boolean;
  admin?: boolean;
  userId?: string;
  orderId?: string;
  user?: boolean;
}

export interface orderItemType {
  name: string;
  photo: string;
  price: number;
  quantity: number;
  productId: string;
}

export interface newOrderRequestBody {
  shippingInfo: shippingInfoType;
  user: string;
  subtotal: number;
  tax: number;
  shippingCharges: number;
  discount: number;
  total: number;
  orderItems: orderItemType[];
}

export type shippingInfoType = {
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: number;
};
