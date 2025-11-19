// lib/types.ts
export type WCImage = {
  id: number;
  src: string;
  name: string;
  alt?: string;
};

export type WCPrice = string; // WooCommerce returns string numbers

export type WCProduct = {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  date_created?: string;
  type: string;
  status: string;
  featured: boolean;
  catalog_visibility?: string;
  description?: string;
  short_description?: string;
  sku?: string;
  price: WCPrice;
  regular_price?: WCPrice;
  sale_price?: WCPrice;
  on_sale?: boolean;
  images: WCImage[];
  categories?: { id: number; name: string; slug: string }[];
  stock_status?: "instock" | "outofstock" | "onbackorder";
  manage_stock?: boolean;
  stock_quantity?: number | null;
  total_sales?: number;
  average_rating?: string;
  rating_count?: number;
};

export type WCCategory = {
  id: number;
  name: string;
  slug: string;
  parent: number;
  image?: WCImage | null;
  count?: number;
};
