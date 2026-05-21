import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { type Request, type Response } from 'express';
import RegisterController from '../../../controllers/auth/RegisterController.js';
import User from '../../../models/User.js';

jest.mock('../../../models/User.js');

describe('RegisterController', () => {
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

    it('should return 400 if validation fails', async () => {
        mockRequest = {
            body: {
                username: 'u',
                email: 'invalid-email',
                password: '123',
            },
        };

        await RegisterController(mockRequest as Request, mockResponse as Response);

        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Validation error',
                errors: expect.any(Object),
            })
        );
    });

    it('should return 400 if email is already in use', async () => {
        mockRequest = {
            body: {
                username: 'validuser',
                email: 'taken@example.com',
                password: 'password123',
            },
        };

        const findOneSpy = jest.spyOn(User, 'findOne').mockResolvedValue({ email: 'taken@example.com' } as any);

        await RegisterController(mockRequest as Request, mockResponse as Response);

        expect(findOneSpy).toHaveBeenCalledWith({ email: 'taken@example.com' });
        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({ message: 'Email already in use' });
    });

    it('should register user successfully and return 201', async () => {
        mockRequest = {
            body: {
                username: 'newuser',
                email: 'new@example.com',
                password: 'password123',
                role: 'employee',
            },
        };

        const findOneSpy = jest.spyOn(User, 'findOne').mockResolvedValue(null);
        
        const saveMock = jest.fn().mockResolvedValue({
            username: 'newuser',
            email: 'new@example.com',
            role: 'employee',
        });
        
        jest.spyOn(User.prototype, 'save').mockImplementation(saveMock as any);

        await RegisterController(mockRequest as Request, mockResponse as Response);

        expect(findOneSpy).toHaveBeenCalledWith({ email: 'new@example.com' });
        expect(saveMock).toHaveBeenCalled();
        expect(statusMock).toHaveBeenCalledWith(201);
        expect(jsonMock).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'User registered successfully',
                user: expect.any(Object),
            })
        );
    });

    it('should return 500 if an internal server error occurs', async () => {
        mockRequest = {
            body: {
                username: 'validuser',
                email: 'error@example.com',
                password: 'password123',
            },
        };

        jest.spyOn(User, 'findOne').mockRejectedValue(new Error('Database breakdown') as never);

        await RegisterController(mockRequest as Request, mockResponse as Response);

        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Server error',
                error: expect.any(Error),
            })
        );
    });
});