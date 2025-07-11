import { Hono } from 'hono';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMemoRoute } from './memo-route';
import { MemoService } from '../services/memo-service';
import { HonoVariables } from '../index';

describe('Memo Routes', () => {
  let app: Hono<{ Variables: HonoVariables }>;
  let mockMemoService: MemoService;

  beforeEach(() => {
    mockMemoService = {
      createMemo: vi.fn(),
      getMemoById: vi.fn(),
      getMemoByIdAndUserId: vi.fn(),
      getMemosByUserId: vi.fn(),
      updateMemo: vi.fn(),
      deleteMemo: vi.fn(),
    };
    vi.clearAllMocks();
    app = new Hono<{ Variables: HonoVariables }>();
    app.use('*', async (c, next) => {
      // Mock JWT payload for authenticated requests
      c.set('jwtPayload', { sub: 'test-user-id' });
      await next();
    });
    app.route('/memos', createMemoRoute(mockMemoService));
  });

  // Test cases for GET /memos
  it('should return all memos for an authenticated user', async () => {
    const mockMemos = [{ id: '1', content: 'Memo 1', userId: 'test-user-id' }];
    (mockMemoService.getMemosByUserId as vi.Mock).mockResolvedValue(mockMemos);

    const res = await app.request('/memos');
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual(mockMemos);
    expect(mockMemoService.getMemosByUserId).toHaveBeenCalledWith('test-user-id');
  });

  it('should return 401 if user is not authenticated for GET /memos', async () => {
    const unauthenticatedApp = new Hono<{ Variables: HonoVariables }>();
    unauthenticatedApp.route('/memos', createMemoRoute(mockMemoService));

    const res = await unauthenticatedApp.request('/memos');
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json).toEqual({ error: 'Unauthorized' });
    expect(mockMemoService.getMemosByUserId).not.toHaveBeenCalled();
  });

  // Test cases for GET /memos/:id
  it('should return a memo by id for an authenticated user who owns it', async () => {
    const mockMemo = { id: '1', content: 'Memo 1', userId: 'test-user-id' };
    (mockMemoService.getMemoByIdAndUserId as vi.Mock).mockResolvedValue(mockMemo);

    const res = await app.request('/memos/1');
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual(mockMemo);
    expect(mockMemoService.getMemoByIdAndUserId).toHaveBeenCalledWith('1', 'test-user-id');
  });

  it('should return 404 if memo not found or not owned by user for GET /memos/:id', async () => {
    (mockMemoService.getMemoByIdAndUserId as vi.Mock).mockResolvedValue(null);

    const res = await app.request('/memos/999');
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json).toEqual({ error: 'Memo not found or unauthorized' });
    expect(mockMemoService.getMemoByIdAndUserId).toHaveBeenCalledWith('999', 'test-user-id');
  });

  it('should return 401 if user is not authenticated for GET /memos/:id', async () => {
    const unauthenticatedApp = new Hono<{ Variables: HonoVariables }>();
    unauthenticatedApp.route('/memos', createMemoRoute(mockMemoService));

    const res = await unauthenticatedApp.request('/memos/1');
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json).toEqual({ error: 'Unauthorized' });
    expect(mockMemoService.getMemoByIdAndUserId).not.toHaveBeenCalled();
  });

  // Test cases for POST /memos
  it('should create a memo for an authenticated user', async () => {
    const newMemoInput = { content: 'New Memo' };
    const createdMemo = { id: '2', content: 'New Memo', userId: 'test-user-id' };
    (mockMemoService.createMemo as vi.Mock).mockResolvedValue(createdMemo);

    const res = await app.request('/memos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMemoInput),
    });
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json).toEqual(createdMemo);
    expect(mockMemoService.createMemo).toHaveBeenCalledWith({ content: 'New Memo', userId: 'test-user-id' });
  });

  it('should return 401 if user is not authenticated for POST /memos', async () => {
    const unauthenticatedApp = new Hono<{ Variables: HonoVariables }>();
    unauthenticatedApp.route('/memos', createMemoRoute(mockMemoService));

    const res = await unauthenticatedApp.request('/memos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'New Memo' }),
    });
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json).toEqual({ error: 'Unauthorized' });
    expect(mockMemoService.createMemo).not.toHaveBeenCalled();
  });

  // Test cases for PATCH /memos/:id
  it('should update a memo for an authenticated user who owns it', async () => {
    const updatedMemoInput = { content: 'Updated Memo' };
    const updatedMemo = { id: '1', content: 'Updated Memo', userId: 'test-user-id' };
    (mockMemoService.updateMemo as vi.Mock).mockResolvedValue(updatedMemo);

    const res = await app.request('/memos/1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedMemoInput),
    });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual(updatedMemo);
    expect(mockMemoService.updateMemo).toHaveBeenCalledWith('1', updatedMemoInput, 'test-user-id');
  });

  it('should return 404 if memo not found or not owned by user for PATCH /memos/:id', async () => {
    (mockMemoService.updateMemo as vi.Mock).mockResolvedValue(null);

    const res = await app.request('/memos/999', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Updated' }),
    });
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json).toEqual({ error: 'Memo not found or unauthorized to update' });
    expect(mockMemoService.updateMemo).toHaveBeenCalledWith('999', { content: 'Updated' }, 'test-user-id');
  });

  it('should return 401 if user is not authenticated for PATCH /memos/:id', async () => {
    const unauthenticatedApp = new Hono<{ Variables: HonoVariables }>();
    unauthenticatedApp.route('/memos', createMemoRoute(mockMemoService));

    const res = await unauthenticatedApp.request('/memos/1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Updated' }),
    });
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json).toEqual({ error: 'Unauthorized' });
    expect(mockMemoService.updateMemo).not.toHaveBeenCalled();
  });

  // Test cases for DELETE /memos/:id
  it('should delete a memo for an authenticated user who owns it', async () => {
    (mockMemoService.deleteMemo as vi.Mock).mockResolvedValue(true); // Indicate successful deletion

    const res = await app.request('/memos/1', {
      method: 'DELETE',
    });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ status: 'deleted' });
    expect(mockMemoService.deleteMemo).toHaveBeenCalledWith('1', 'test-user-id');
  });

  it('should return 404 if memo not found or not owned by user for DELETE /memos/:id', async () => {
    (mockMemoService.deleteMemo as vi.Mock).mockResolvedValue(null); // Indicate not found or unauthorized

    const res = await app.request('/memos/999', {
      method: 'DELETE',
    });
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json).toEqual({ error: 'Memo not found or unauthorized to delete' });
    expect(mockMemoService.deleteMemo).toHaveBeenCalledWith('999', 'test-user-id');
  });

  it('should return 401 if user is not authenticated for DELETE /memos/:id', async () => {
    const unauthenticatedApp = new Hono<{ Variables: HonoVariables }>();
    unauthenticatedApp.route('/memos', createMemoRoute(mockMemoService));

    const res = await unauthenticatedApp.request('/memos/1', {
      method: 'DELETE',
    });
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json).toEqual({ error: 'Unauthorized' });
    expect(mockMemoService.deleteMemo).not.toHaveBeenCalled();
  });
});
