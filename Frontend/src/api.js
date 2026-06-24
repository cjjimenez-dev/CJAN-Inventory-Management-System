import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const api = {
  // Dashboard
  getDashboard: async () => {
    // 1. Total sales (sum of total_price in sales table)
    const { data: sales, error: salesErr } = await supabase.from('sales').select('total_price, product_id, quantity_sold');
    if (salesErr) throw salesErr;
    const total_sales = sales.reduce((sum, s) => sum + Number(s.total_price), 0);

    // 2. To get profit we fetch products to find the profit margin per product sold
    const { data: products, error: prodErr } = await supabase.from('products').select('*');
    if (prodErr) throw prodErr;

    let total_profit = 0;
    sales.forEach(sale => {
      const product = products.find(p => p.id === sale.product_id);
      if (product) {
         total_profit += Number(product.profit) * Number(sale.quantity_sold);
      }
    });

    const active_products = products.length;
    const low_stock_alerts = products.filter(p => p.quantity_in_stock < 10).length;

    return {
      total_sales,
      total_profit,
      total_products: active_products,
      low_stock_alerts
    };
  },

  // Categories
  getCategories: async () => {
    const { data, error } = await supabase.from('categories').select('*').order('id', { ascending: true });
    if (error) throw error;
    return data;
  },
  createCategory: async ({ name, description }) => {
    const { data, error } = await supabase.from('categories').insert([{ name, description }]).select();
    if (error) throw error;
    return data[0];
  },
  deleteCategory: async (id) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // Products
  getProducts: async () => {
    const { data, error } = await supabase.from('products').select(`*, categories(name)`).order('id', { ascending: false });
    if (error) throw error;
    // Map to match old API structure expected by components
    return data.map(p => ({
      ...p,
      category_name: p.categories?.name || null
    }));
  },
  createProduct: async (product) => {
    // Remove relational data and empty id to prevent integer parsing errors
    // eslint-disable-next-line no-unused-vars
    const { id, category_name, categories, ...newProduct } = product;
    
    // Ensure category_id is either a valid number or null
    if (!newProduct.category_id) newProduct.category_id = null;
    if (!newProduct.parent_id) newProduct.parent_id = null;
    if (!newProduct.pieces_per_parent) newProduct.pieces_per_parent = null;

    const { data, error } = await supabase.from('products').insert([newProduct]).select();
    if (error) throw error;
    return data[0];
  },
  updateProduct: async (product) => {
    // Remove relational data before updating
    // eslint-disable-next-line no-unused-vars
    const { id, category_name, categories, ...updateData } = product;
    
    // Ensure category_id is either a valid number or null
    if (!updateData.category_id) updateData.category_id = null;
    if (!updateData.parent_id) updateData.parent_id = null;
    if (!updateData.pieces_per_parent) updateData.pieces_per_parent = null;

    const { data, error } = await supabase.from('products').update(updateData).eq('id', id).select();
    if (error) throw error;
    return data[0];
  },
  deleteProduct: async (id) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // Sales
  getSales: async () => {
    const { data, error } = await supabase.from('sales').select(`*, products(name)`).order('sale_date', { ascending: false });
    if (error) throw error;
    return data.map(s => ({
      ...s,
      product_name: s.products?.name || null
    }));
  },
  recordSale: async (product_id, quantity_sold) => {
    // 1. Get product price and stock
    const { data: product, error: prodErr } = await supabase.from('products').select('base_price, profit, quantity_in_stock, parent_id, pieces_per_parent').eq('id', product_id).single();
    if (prodErr) throw prodErr;
    
    let current_stock = product.quantity_in_stock;

    // Auto-unpacking logic
    if (current_stock < quantity_sold && product.parent_id && product.pieces_per_parent) {
      const shortage = quantity_sold - current_stock;
      const packsNeeded = Math.ceil(shortage / product.pieces_per_parent);

      // Fetch parent product
      const { data: parentProduct, error: parentErr } = await supabase.from('products').select('quantity_in_stock').eq('id', product.parent_id).single();
      if (parentErr) throw parentErr;

      if (parentProduct.quantity_in_stock < packsNeeded) {
        throw new Error(`Not enough parent packs to open! You need ${packsNeeded} packs, but only have ${parentProduct.quantity_in_stock} in stock.`);
      }

      // Deduct from parent
      const { error: parentUpdateErr } = await supabase.from('products').update({
        quantity_in_stock: parentProduct.quantity_in_stock - packsNeeded
      }).eq('id', product.parent_id);
      if (parentUpdateErr) throw parentUpdateErr;

      // Add unpacked pieces to current stock count
      current_stock += (packsNeeded * product.pieces_per_parent);
    } else if (current_stock < quantity_sold) {
      throw new Error('Not enough stock available.');
    }

    const selling_price = Number(product.base_price) + Number(product.profit);
    const total_price = selling_price * quantity_sold;

    // 2. Insert sale
    const { error: saleErr } = await supabase.from('sales').insert([{
      product_id,
      quantity_sold,
      total_price
    }]);
    if (saleErr) throw saleErr;

    // 3. Update stock
    const { error: updateErr } = await supabase.from('products').update({
      quantity_in_stock: current_stock - quantity_sold
    }).eq('id', product_id);
    
    if (updateErr) throw updateErr;

    return { success: true };
  },

  // Users & Authentication
  authenticate: async (username, password) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();
    
    if (error) {
      throw new Error('Invalid username or password');
    }
    return data;
  },
  getUsers: async () => {
    const { data, error } = await supabase.from('users').select('*').order('id', { ascending: true });
    if (error) throw error;
    return data;
  },
  createUser: async ({ username, password, role }) => {
    const { data, error } = await supabase.from('users').insert([{ username, password, role }]).select();
    if (error) throw error;
    return data[0];
  },
  updateUser: async (id, { username, password, role }) => {
    const { data, error } = await supabase.from('users').update({ username, password, role }).eq('id', id).select();
    if (error) throw error;
    return data[0];
  },
  deleteUser: async (id) => {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
};
