import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { type Response } from 'express';
import { type CustomRequest } from '../../../middlewares/AuthMiddleware.js';

const mockIncrease = jest.fn();
const mockDecrease = jest.fn();

jest.unstable_mockModule('../../../services/IncreaseProductInventory.js', () => ({
    __esModule: true,
    default: mockIncrease
}));

jest.unstable_mockModule('../../../services/DecreasesProductInventory.js', () => ({
    __esModule: true,
    default: mockDecrease
}));

jest.unstable_mockModule('../../../models/Movement.js', () => {
    function MockMovement() {}
    MockMovement.prototype.save = jest.fn();
    (MockMovement as any).find = jest.fn();
    (MockMovement as any).countDocuments = jest.fn();
    return {
        __esModule: true,
        default: MockMovement
    };
});

jest.unstable_mockModule('../../../models/Product.js', () => ({
    __esModule: true,
    default: {
        findById: jest.fn(),
        find: jest.fn(),
        countDocuments: jest.fn()
    }
}));

jest.unstable_mockModule('../../../models/User.js', () => ({
    __esModule: true,
    default: {
        findById: jest.fn()
    }
}));

const { RegisterMovement, GetMovements } = await import('../../../controllers/movements/MovementsController.js');
const { default: Movement } = await import('../../../models/Movement.js');
const { default: Product } = await import('../../../models/Product.js');
const { default: User } = await import('../../../models/User.js');

describe('MovementsController', () => {
    let mockRequest: Partial<CustomRequest>;
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

    describe('RegisterMovement', () => {
        it('should return 400 if validation fails', async () => {
            mockRequest = {
                params: { userId: 'invalid' },
                body: { type: 'in', quantity: -10, product: 'invalid' }
            };

            await RegisterMovement(mockRequest as CustomRequest, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Validation error' })
            );
        });

        it('should return 403 if non-admin tries to register type "in"', async () => {
            mockRequest = {
                params: { userId: '60c72b2f9b1d8b2bad000001' },
                body: { type: 'in', quantity: 10, product: '60c72b2f9b1d8b2bad000002' },
                userRole: 'employee'
            };

            await RegisterMovement(mockRequest as CustomRequest, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(403);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'Only admins can add stock' });
        });

        it('should return 404 if user does not exist', async () => {
            mockRequest = {
                params: { userId: '60c72b2f9b1d8b2bad000001' },
                body: { type: 'out', quantity: 5, product: '60c72b2f9b1d8b2bad000002' },
                userRole: 'employee'
            };

            (User.findById as any).mockResolvedValue(null);

            await RegisterMovement(mockRequest as CustomRequest, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(404);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'User not found' });
        });

        it('should return 404 if product does not exist', async () => {
            mockRequest = {
                params: { userId: '60c72b2f9b1d8b2bad000001' },
                body: { type: 'out', quantity: 5, product: '60c72b2f9b1d8b2bad000002' },
                userRole: 'employee'
            };

            (User.findById as any).mockResolvedValue({ id: '1' } as any);
            (Product.findById as any).mockResolvedValue(null);

            await RegisterMovement(mockRequest as CustomRequest, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(404);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'Product not found' });
        });

        it('should register movement successfully', async () => {
            mockRequest = {
                params: { userId: '60c72b2f9b1d8b2bad000001' },
                body: { type: 'in', quantity: 10, product: '60c72b2f9b1d8b2bad000002' },
                userRole: 'admin'
            };

            (User.findById as any).mockResolvedValue({ id: '1' } as any);
            (Product.findById as any).mockResolvedValue({ id: '2' } as any);
            
            mockIncrease.mockResolvedValue(true as never);
            mockDecrease.mockResolvedValue(true as never);

            (Movement.prototype.save as any).mockResolvedValue({});

            await RegisterMovement(mockRequest as CustomRequest, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(201);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'Movement registered successfully' });
        });
    });

    describe('GetMovements', () => {
        it('should return paginated movements successfully', async () => {
            mockRequest = {
                query: { page: '1', limit: '5' }
            };

            const findChain: any = {
                populate: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue([{ type: 'in', quantity: 10 }])
            };

            (Movement.find as any).mockReturnValue(findChain);
            (Movement.countDocuments as any).mockResolvedValue(1);

            await GetMovements(mockRequest as CustomRequest, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Movements retrieved successfully' })
            );
        });
    });
});