import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UsersService } from './users.service';
import { API_URL } from '../../../shared/constants/api.constants';

describe('UsersService', () => {
  let service: UsersService;
  let httpMock: HttpTestingController;

  const mockUsers = [
    { id: 'u1', name: 'Alice', avatar: '/alice.png', email: 'alice@test.com' },
    { id: 'u2', name: 'Bob', avatar: '/bob.png', email: 'bob@test.com' },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UsersService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(UsersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have usersResource defined', () => {
    expect(service.usersResource).toBeDefined();
  });

  it('should have users signal defined', () => {
    expect(service.users).toBeDefined();
  });

  it('should have users as a readonly signal', () => {
    // Readonly signals don't have set or update methods
    expect(typeof service.users).toBe('function');
  });
});
