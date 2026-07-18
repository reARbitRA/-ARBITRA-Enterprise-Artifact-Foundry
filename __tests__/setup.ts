// FIX: Import Jest globals to provide type definitions for TypeScript.
import { jest, beforeAll, afterAll } from '@jest/globals';
// setup.ts (در پوشه __tests__)
import '@testing-library/jest-dom';

// مثال: تنظیم یک mock global
(globalThis as any).myGlobalMock = jest.fn();

// می‌توان همچنین اینجا متغیرهای محیطی یا سایر تنظیمات قبل از تست را مقدار‌دهی کرد
beforeAll(() => {
  // اقدامات اولیه قبل از اجرای همه تست‌ها
});

afterAll(() => {
  // پاکسازی یا بازگردانی وضعیت بعد از همه تست‌ها
});