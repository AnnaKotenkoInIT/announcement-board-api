import { describe, expect, it } from 'vitest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

describe('Auth', () => {
  it('should hash password with bcrypt', async () => {
    const password = 'password123';

    const hashedPassword = await bcrypt.hash(password, 10);

    expect(hashedPassword).not.toBe(password);
    expect(hashedPassword).toMatch(/^\$2[aby]\$/);
  });

  it('should correctly compare password with bcrypt', async () => {
    const password = 'password123';

    const hashedPassword = await bcrypt.hash(password, 10);

    const validPassword = await bcrypt.compare(password, hashedPassword);
    const invalidPassword = await bcrypt.compare(
      'wrong-password',
      hashedPassword,
    );

    expect(validPassword).toBe(true);
    expect(invalidPassword).toBe(false);
  });

  it('should create and verify JWT token', () => {
    const secret = 'test-secret';
    const userId = 1;

    const token = jwt.sign({ sub: userId }, secret, { expiresIn: '15m' });

    const payload = jwt.verify(token, secret);

    expect(payload).toMatchObject({
      sub: userId,
    });
  });
});
