import { registerHooks } from 'node:module';
import { resolve } from './alias-hooks.mjs';

process.env.NODE_ENV = 'test';
registerHooks({ resolve });
