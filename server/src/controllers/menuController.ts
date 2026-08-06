import { Request, Response } from 'express';
import Menu from '../models/Menu';
import { z } from 'zod';

const menuSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be positive'),
  image: z.string().url('Image must be a valid URL')
});

const updateMenuSchema = menuSchema.partial();

export const getMenuItems = async (req: Request, res: Response) => {
  try {
    const menuItems = await Menu.find({});
    res.status(200).json(menuItems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
};

export const getMenuItemById = async (req: Request, res: Response) => {
  try {
    const menuItem = await Menu.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.status(200).json(menuItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menu item' });
  }
};

export const createMenuItem = async (req: Request, res: Response) => {
  try {
    const validatedData = menuSchema.parse(req.body);
    const newMenuItem = new Menu(validatedData);
    const savedMenuItem = await newMenuItem.save();
    res.status(201).json(savedMenuItem);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(400).json({ error: 'Failed to create menu item' });
  }
};

export const updateMenuItem = async (req: Request, res: Response) => {
  try {
    const validatedData = updateMenuSchema.parse(req.body);
    const updatedMenuItem = await Menu.findByIdAndUpdate(
      req.params.id,
      validatedData,
      { returnDocument: 'after', runValidators: true }
    );
    
    if (!updatedMenuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    res.status(200).json(updatedMenuItem);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(400).json({ error: 'Failed to update menu item' });
  }
};

export const deleteMenuItem = async (req: Request, res: Response) => {
  try {
    const deletedMenuItem = await Menu.findByIdAndDelete(req.params.id);
    
    if (!deletedMenuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    res.status(200).json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
};
