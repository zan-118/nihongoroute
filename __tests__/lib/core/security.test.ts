import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateAdminApiRequest } from '@/lib/core/admin-api-auth';

describe('Admin API Auth Security', () => {
  const SECRET = 'super-secret-key';
  
  beforeEach(() => {
    vi.stubEnv('ADMIN_API_SECRET', SECRET);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('harus memvalidasi permintaan yang sah dengan Bearer token', () => {
    const req = new Request('http://localhost', {
      headers: {
        'authorization': `Bearer ${SECRET}`
      }
    });
    
    const result = validateAdminApiRequest(req);
    expect(result.ok).toBe(true);
    expect(result.status).toBe(200);
  });

  it('harus memvalidasi permintaan yang sah dengan header x-admin-api-secret', () => {
    const req = new Request('http://localhost', {
      headers: {
        'x-admin-api-secret': SECRET
      }
    });
    
    const result = validateAdminApiRequest(req);
    expect(result.ok).toBe(true);
  });

  it('harus menolak permintaan tanpa token', () => {
    const req = new Request('http://localhost');
    const result = validateAdminApiRequest(req);
    expect(result.ok).toBe(false);
    expect(result.status).toBe(401);
  });

  it('harus menolak permintaan dengan token salah', () => {
    const req = new Request('http://localhost', {
      headers: {
        'authorization': 'Bearer wrong-secret'
      }
    });
    const result = validateAdminApiRequest(req);
    expect(result.ok).toBe(false);
    expect(result.status).toBe(401);
  });

  it('harus merespons 503 jika secret belum disetel di env', () => {
    vi.stubEnv('ADMIN_API_SECRET', '');
    const req = new Request('http://localhost', {
      headers: { 'authorization': `Bearer ${SECRET}` }
    });
    
    const result = validateAdminApiRequest(req);
    expect(result.ok).toBe(false);
    expect(result.status).toBe(503);
  });
});
