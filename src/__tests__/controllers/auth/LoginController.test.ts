import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { type Request, type Response } from 'express';
import LoginController from '../../../controllers/auth/LoginController.js';
import User from '../../../models/User.js';
import jsonwebtoken from 'jsonwebtoken';

jest.mock('../../../models/User.js');
jest.mock('jsonwebtoken');

describe('LoginController', () => {
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
        process.env.JWT_SECRET = 'test_secret';
        jest.clearAllMocks();
    });

    it('should return 400 if body is invalid', async () => {
        mockRequest = {
            body: {
                email: 'not-an-email',
                password: '',
            },
        };

        await LoginController(mockRequest as Request, mockResponse as Response);

        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Validation error',
                errors: expect.any(Object),
            })
        );
    });

    it('should return 401 if user does not exist', async () => {
        mockRequest = {
            body: {
                email: 'nonexistent@example.com',
                password: 'password123',
            },
        };

        const findOneSpy = jest.spyOn(User, 'findOne').mockResolvedValue(null);

        await LoginController(mockRequest as Request, mockResponse as Response);

        expect(findOneSpy).toHaveBeenCalledWith({ email: 'nonexistent@example.com' });
        expect(statusMock).toHaveBeenCalledWith(401);
        expect(jsonMock).toHaveBeenCalledWith({ message: 'Invalid email or password' });
    });

    it('should return 401 if password check fails', async () => {
        mockRequest = {
            body: {
                email: 'user@example.com',
                password: 'wrongpassword',
            },
        };

        const mockUser = {
            _id: 'userid123',
            email: 'user@example.com',
            role: 'employee',
            comparePassword: jest.fn().mockResolvedValue(false as never),
        };

        jest.spyOn(User, 'findOne').mockResolvedValue(mockUser as any);

        await LoginController(mockRequest as Request, mockResponse as Response);

        expect(mockUser.comparePassword).toHaveBeenCalledWith('wrongpassword');
        expect(statusMock).toHaveBeenCalledWith(401);
        expect(jsonMock).toHaveBeenCalledWith({ message: 'Invalid email or password' });
    });

    it('should return 200 and a token upon successful authentication', async () => {
        mockRequest = {
            body: {
                email: 'user@example.com',
                password: 'correctpassword',
            },
        };

        const mockUser = {
            _id: 'userid123',
            email: 'user@example.com',
            role: 'admin',
            comparePassword: jest.fn().mockResolvedValue(true as never),
        };

        jest.spyOn(User, 'findOne').mockResolvedValue(mockUser as any);
        jest.spyOn(jsonwebtoken, 'sign').mockImplementation(() => 'mocked_jwt_token' as any);

        await LoginController(mockRequest as Request, mockResponse as Response);

        expect(mockUser.comparePassword).toHaveBeenCalledWith('correctpassword');
        expect(jsonwebtoken.sign).toHaveBeenCalledWith(
            { userId: 'userid123', email: 'user@example.com', role: 'admin' },
            'test_secret',
            { expiresIn: '1h' }
        );
        expect(statusMock).toHaveBeenCalledWith(200);
        expect(jsonMock).toHaveBeenCalledWith({
            message: 'Login successful',
            user: mockUser,
            token: 'mocked_jwt_token',
        });
    });

    it('should return 500 if an exception is thrown', async () => {
        mockRequest = {
            body: {
                email: 'user@example.com',
                password: 'password123',
            },
        };

        jest.spyOn(User, 'findOne').mockRejectedValue(new Error('Internal Server Failure') as never);

        await LoginController(mockRequest as Request, mockResponse as Response);

        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Server error',
                error: expect.any(Error),
            })
        );
    });
});