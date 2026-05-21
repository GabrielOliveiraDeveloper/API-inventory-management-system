import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { type Request, type Response } from 'express';
import { CreateProduct, GetProducts, UpdateProduct, RemoveProduct } from '../../../controllers/products/ProductsController.js';
import Product from '../../../models/Product.js';

jest.mock('../../../models/Product.js');

describe('ProductsController', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let statusMock: any;
    let jsonMock: any;

    beforeEach(() => {
        statusMock = jest.fn().mockReturnThis();
        jsonMock = jest.fn();
        mockResponse = {
            status: statusMock,
            json: jsonMock,
        };
        jest.clearAllMocks();
    });

    describe('CreateProduct', () => {
        it('should return 400 if validation fails', async () => {
            mockRequest = {
                body: { name: '', sku: '' }
            };

            await CreateProduct(mockRequest as Request, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Validation error' })
            );
        });

        it('should return 400 if SKU is already in use', async () => {
            mockRequest = {
                body: {
                    name: 'Product A',
                    sku: 'SKU123',
                    category: 'Electronics',
                    costPrice: 10,
                    salePrice: 20,
                    quantityCurrent: 5,
                    quantityMin: 2
                }
            };

            jest.spyOn(Product, 'findOne').mockResolvedValue({ sku: 'SKU123' } as any);

            await CreateProduct(mockRequest as Request, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'SKU already in use' });
        });

        it('should create product successfully and return 201', async () => {
            mockRequest = {
                body: {
                    name: 'Product A',
                    sku: 'SKU123',
                    category: 'Electronics',
                    costPrice: 10,
                    salePrice: 20,
                    quantityCurrent: 5,
                    quantityMin: 2
                }
            };

            jest.spyOn(Product, 'findOne').mockResolvedValue(null);
            const saveMock = jest.fn().mockResolvedValue({ name: 'Product A', sku: 'SKU123' });
            jest.spyOn(Product.prototype, 'save').mockImplementation(saveMock as any);

            await CreateProduct(mockRequest as Request, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(201);
            expect(jsonMock).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Product created successfully' })
            );
        });
    });

    describe('GetProducts', () => {
        it('should return paginated products successfully', async () => {
            mockRequest = {
                query: { page: '1', limit: '10', search: 'test', category: 'tools' }
            };

            const findChain: any = {
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue([{ name: 'Product 1' }])
            };

            jest.spyOn(Product, 'find').mockReturnValue(findChain);
            jest.spyOn(Product, 'countDocuments').mockResolvedValue(1);

            await GetProducts(mockRequest as Request, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Products retrieved successfully' })
            );
        });
    });

    describe('UpdateProduct', () => {
        it('should return 404 if product not found', async () => {
            mockRequest = {
                params: { id: '60c72b2f9b1d8b2bad000001' },
                body: { name: 'Updated Name' }
            };

            jest.spyOn(Product, 'findById').mockResolvedValue(null);

            await UpdateProduct(mockRequest as Request, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(404);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'Product not found' });
        });

        it('should update product successfully', async () => {
            const validId = '60c72b2f9b1d8b2bad000001';
            mockRequest = {
                params: { id: validId },
                body: { name: 'Updated Name' }
            };

            const existingProduct = { id: validId, name: 'Old Name', sku: 'SKUOLD' };
            jest.spyOn(Product, 'findById').mockResolvedValue(existingProduct as any);
            jest.spyOn(Product, 'findByIdAndUpdate').mockResolvedValue({ id: validId, name: 'Updated Name' } as any);

            await UpdateProduct(mockRequest as Request, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Product updated successfully' })
            );
        });
    });

    describe('RemoveProduct', () => {
        it('should return 404 if product to remove does not exist', async () => {
            mockRequest = {
                params: { id: '60c72b2f9b1d8b2bad000001' }
            };

            jest.spyOn(Product, 'findByIdAndDelete').mockResolvedValue(null);

            await RemoveProduct(mockRequest as Request, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(404);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'Product not found' });
        });

        it('should remove product successfully', async () => {
            mockRequest = {
                params: { id: '60c72b2f9b1d8b2bad000001' }
            };

            jest.spyOn(Product, 'findByIdAndDelete').mockResolvedValue({ id: '60c72b2f9b1d8b2bad000001' } as any);

            await RemoveProduct(mockRequest as Request, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'Product removed successfully' });
        });
    });
});