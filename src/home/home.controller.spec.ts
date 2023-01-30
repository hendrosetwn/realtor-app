import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PropertyType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';

const mockUser = {
  id: 53,
  name: 'Laith',
  email: 'laith@laith.com',
  phone: '555 555 5555',
};

const mockHome = {
  id: 1,
  address: '2345 William Str',
  city: 'Toronto',
  price: 1500000,
  image: 'img1',
  property_type: PropertyType.RESIDENTIAL,
  number_of_bedrooms: 3,
  number_of_bathrooms: 2.5,
};

describe('HomeController', () => {
  let controller: HomeController;
  let homeService: HomeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HomeController],
      providers: [
        {
          provide: HomeService,
          useValue: {
            getHomes: jest.fn().mockReturnValue([]),
            getRealtorByHomeId: jest.fn().mockReturnValue(mockUser),
            updateHomeById: jest.fn().mockReturnValue(mockHome),
          },
        },
        PrismaService,
      ],
    }).compile();

    controller = module.get<HomeController>(HomeController);
    homeService = module.get<HomeService>(HomeService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHomes', () => {
    it('should construct filter object correctly', async () => {
      const mockGetHomes = jest.fn().mockReturnValue([]);
      jest.spyOn(homeService, 'getHomes').mockImplementation(mockGetHomes);
      await controller.getHomes('Toronto', '1500000');

      expect(mockGetHomes).toBeCalledWith({
        city: 'Toronto',
        price: {
          gte: 1500000,
        },
      });
    });
  });

  describe('updateHome', () => {
    const mockUserInfo = {
      name: 'Laith',
      id: 30,
      iat: 1,
      exp: 2,
    };

    const mockCreateHomeParams = {
      address: '1111 Yellow Str',
      numberOfBedrooms: 2,
      numberOfBathrooms: 2,
      city: 'Vancouver',
      landSize: 4444,
      price: 3000000,
      propertyType: PropertyType.RESIDENTIAL,
    };

    it("throw should unauth error if realtor didn't crete home", async () => {
      await expect(
        controller.updateHome(5, mockCreateHomeParams, mockUserInfo),
      ).rejects.toThrowError(UnauthorizedException);
    });

    it('should update home if realtor id is valid', async () => {
      const mockUpdateHome = jest.fn().mockReturnValue(mockHome);

      jest
        .spyOn(homeService, 'updateHomeById')
        .mockImplementation(mockUpdateHome);

      await controller.updateHome(5, mockCreateHomeParams, {
        ...mockUserInfo,
        id: 53,
      });

      expect(mockUpdateHome).toBeCalled();
    });
  });
});
